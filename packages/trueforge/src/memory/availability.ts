import configuration, { isTrueFoundryModeEnabled, type ServerConfiguration } from '../config';

/**
 * Whether agents of this tenant can turn on `config.memory`: TrueFoundry mode with `MEMORY_ENABLED`,
 * and the tenant listed in `MEMORY_TENANT_ALLOWLIST`.
 */
export function isMemoryEnabledForTenant(tenantId: string, config: ServerConfiguration = configuration): boolean {
  return isTrueFoundryModeEnabled(config) && config.MEMORY_ENABLED && config.MEMORY_TENANT_ALLOWLIST.includes(tenantId);
}
