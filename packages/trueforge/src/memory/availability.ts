import configuration, { type DistributedServerConfiguration } from '../config';

type MemoryAvailabilityConfig =
  | { STANDALONE: true }
  | Pick<
      DistributedServerConfiguration,
      'STANDALONE' | 'TRUEFOUNDRY_MEMORY_ENABLED' | 'TRUEFOUNDRY_MEMORY_TENANT_ALLOWLIST'
    >;

/**
 * Whether this deployment offers memory to the tenant: TrueFoundry mode with
 * `TRUEFOUNDRY_MEMORY_ENABLED`, and the tenant is allowlisted or the allowlist is empty.
 * The tenant's own memory switch applies on top of this.
 */
export function isMemoryOfferedToTenant({
  tenant_id,
  config = configuration,
}: {
  tenant_id: string;
  config?: MemoryAvailabilityConfig;
}): boolean {
  if (config.STANDALONE || !config.TRUEFOUNDRY_MEMORY_ENABLED) {
    return false;
  }
  const allowlist = config.TRUEFOUNDRY_MEMORY_TENANT_ALLOWLIST;
  return allowlist.length === 0 || allowlist.includes(tenant_id);
}
