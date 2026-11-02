import { isMemoryOfferedToTenant } from '../../../src/memory/availability';

function distributed({ enabled, allowlist }: { enabled: boolean; allowlist: string[] }): {
  STANDALONE: false;
  TRUEFOUNDRY_MEMORY_ENABLED: boolean;
  TRUEFOUNDRY_MEMORY_TENANT_ALLOWLIST: string[];
} {
  return {
    STANDALONE: false,
    TRUEFOUNDRY_MEMORY_ENABLED: enabled,
    TRUEFOUNDRY_MEMORY_TENANT_ALLOWLIST: allowlist,
  };
}

describe('isMemoryOfferedToTenant', () => {
  it('never offers memory in standalone mode', () => {
    expect(isMemoryOfferedToTenant({ tenant_id: 'tenant-a', config: { STANDALONE: true } })).toBe(false);
  });

  it('offers nothing while TRUEFOUNDRY_MEMORY_ENABLED is off', () => {
    expect(
      isMemoryOfferedToTenant({ tenant_id: 'tenant-a', config: distributed({ enabled: false, allowlist: [] }) }),
    ).toBe(false);
  });

  it('offers every tenant when the allowlist is empty', () => {
    expect(
      isMemoryOfferedToTenant({ tenant_id: 'tenant-a', config: distributed({ enabled: true, allowlist: [] }) }),
    ).toBe(true);
  });

  it('offers only allowlisted tenants when the allowlist is set', () => {
    const config = distributed({ enabled: true, allowlist: ['tenant-a'] });
    expect(isMemoryOfferedToTenant({ tenant_id: 'tenant-a', config })).toBe(true);
    expect(isMemoryOfferedToTenant({ tenant_id: 'tenant-b', config })).toBe(false);
  });
});
