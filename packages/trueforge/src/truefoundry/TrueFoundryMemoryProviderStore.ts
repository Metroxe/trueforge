import configuration, { isTrueFoundryModeEnabled, type DistributedServerConfiguration } from '../config';
import type { IMemoryProviderStore, MemoryProviderRecord, UpsertMemoryProviderInput } from '../db/memoryProviderStore';
import { trueFoundryManaged } from './errors';

export type TrueFoundryMemoryEnv = Pick<
  DistributedServerConfiguration,
  | 'TRUEFOUNDRY_MEMORY_ENABLED'
  | 'TRUEFOUNDRY_MEMORY_PROVIDER'
  | 'TRUEFOUNDRY_MEMORY_API_KEY'
  | 'TRUEFOUNDRY_MEMORY_SERVER_URL'
  | 'TRUEFOUNDRY_MEMORY_TENANT_ALLOWLIST'
>;

/** The platform's Zep, for tenants `TRUEFOUNDRY_MEMORY_TENANT_ALLOWLIST` admits (all when it is empty). */
function synthesizeZepRecord({
  tenantId,
  env,
}: {
  tenantId: string;
  env: TrueFoundryMemoryEnv;
}): MemoryProviderRecord | undefined {
  if (!env.TRUEFOUNDRY_MEMORY_ENABLED || env.TRUEFOUNDRY_MEMORY_PROVIDER !== 'zep') {
    return undefined;
  }
  const apiKey = env.TRUEFOUNDRY_MEMORY_API_KEY;
  if (apiKey === undefined) {
    return undefined;
  }
  const allowlist = env.TRUEFOUNDRY_MEMORY_TENANT_ALLOWLIST;
  if (allowlist.length > 0 && !allowlist.includes(tenantId)) {
    return undefined;
  }
  const serverUrl = env.TRUEFOUNDRY_MEMORY_SERVER_URL;
  const now = new Date().toISOString();
  return {
    tenant_id: tenantId,
    manifest: {
      type: 'zep',
      ...(serverUrl === undefined ? {} : { server_url: serverUrl }),
      auth: { api_key: apiKey },
    },
    created_at: now,
    updated_at: now,
  };
}

export class TrueFoundryMemoryProviderStore<TTransaction = never> implements IMemoryProviderStore<TTransaction> {
  readonly #env: TrueFoundryMemoryEnv | undefined;

  constructor(
    env: TrueFoundryMemoryEnv | undefined = isTrueFoundryModeEnabled(configuration) ? configuration : undefined,
  ) {
    this.#env = env;
  }

  getProvider(tenantId: string, transaction?: TTransaction): Promise<MemoryProviderRecord | undefined> {
    void transaction;
    return Promise.resolve(this.#env === undefined ? undefined : synthesizeZepRecord({ tenantId, env: this.#env }));
  }

  upsertProvider(input: UpsertMemoryProviderInput, transaction?: TTransaction): Promise<MemoryProviderRecord> {
    void input;
    void transaction;
    return trueFoundryManaged();
  }
}
