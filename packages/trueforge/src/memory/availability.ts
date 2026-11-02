import configuration, { type SharedServerConfiguration } from '../config';

/**
 * Whether this deployment offers memory to the tenant: `TRUEFOUNDRY_MEMORY_ENABLED`, and the
 * tenant is allowlisted or the allowlist is empty. The tenant's own memory switch applies on top.
 */
export function isMemoryOfferedToTenant({
  tenant_id,
  config = configuration,
}: {
  tenant_id: string;
  config?: Pick<SharedServerConfiguration, 'TRUEFOUNDRY_MEMORY_ENABLED' | 'TRUEFOUNDRY_MEMORY_TENANT_ALLOWLIST'>;
}): boolean {
  if (!config.TRUEFOUNDRY_MEMORY_ENABLED) {
    return false;
  }
  const allowlist = config.TRUEFOUNDRY_MEMORY_TENANT_ALLOWLIST;
  return allowlist.length === 0 || allowlist.includes(tenant_id);
}
