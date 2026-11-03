import type { ExpressionBuilder, Kysely, Transaction } from 'kysely';
import { parseStoredConfigurationManifest, type ConfigurationManifest } from '../../../schemas/configuration';
import type {
  ConfigurationRecord,
  GetOrCreateConfigurationInput,
  IConfigurationStore,
  UpsertConfigurationInput,
} from '../../configurationStore';
import { jsonbBind, jsonText, nowIso } from '../sqlExpressions';
import type { Database } from '../types';

/** Projects JSONB manifest via JSON_RESULT_COLUMNS. */
function recordColumns(eb: ExpressionBuilder<Database, 'configuration'>) {
  return [
    'tenant_id' as const,
    jsonText<ConfigurationManifest>(eb.ref('manifest')).as('manifest'),
    'updated_at' as const,
  ];
}

function toRecord(row: ConfigurationRecord): ConfigurationRecord {
  return { ...row, manifest: parseStoredConfigurationManifest(row.manifest) };
}

export class SqliteConfigurationStore implements IConfigurationStore<Transaction<Database>> {
  readonly #db: Kysely<Database>;

  constructor(db: Kysely<Database>) {
    this.#db = db;
  }

  async getConfiguration(
    tenantId: string,
    transaction?: Transaction<Database>,
  ): Promise<ConfigurationRecord | undefined> {
    const db = transaction ?? this.#db;
    const row = await db
      .selectFrom('configuration')
      .select(recordColumns)
      .where('tenant_id', '=', tenantId)
      .executeTakeFirst();
    return row === undefined ? undefined : toRecord(row);
  }

  async upsertConfiguration(
    input: UpsertConfigurationInput,
    transaction?: Transaction<Database>,
  ): Promise<ConfigurationRecord> {
    const db = transaction ?? this.#db;
    const timestamp = nowIso();
    const row = await db
      .insertInto('configuration')
      .values({
        tenant_id: input.tenant_id,
        manifest: jsonbBind(input.manifest),
        updated_at: timestamp,
      })
      .onConflict(oc =>
        oc.column('tenant_id').doUpdateSet({
          manifest: jsonbBind(input.manifest),
          updated_at: timestamp,
        }),
      )
      .returning(recordColumns)
      .executeTakeFirstOrThrow();
    return toRecord(row);
  }

  async getOrCreateConfiguration(
    input: GetOrCreateConfigurationInput,
    transaction?: Transaction<Database>,
  ): Promise<ConfigurationRecord> {
    const db = transaction ?? this.#db;
    const inserted = await db
      .insertInto('configuration')
      .values({
        tenant_id: input.tenant_id,
        manifest: jsonbBind(input.default_manifest),
        updated_at: nowIso(),
      })
      .onConflict(oc => oc.column('tenant_id').doNothing())
      .returning(recordColumns)
      .executeTakeFirst();
    if (inserted !== undefined) {
      return toRecord(inserted);
    }
    // Lost the insert race: the row another writer stored wins.
    const existing = await db
      .selectFrom('configuration')
      .select(recordColumns)
      .where('tenant_id', '=', input.tenant_id)
      .executeTakeFirstOrThrow();
    return toRecord(existing);
  }
}
