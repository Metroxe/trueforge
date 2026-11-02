import { isMemoryOfferedToTenant } from '../../../src/memory/availability';

function memoryConfig({ enabled, allowlist }: { enabled: boolean; allowlist: string[] }) {
  return { TRUEFOUNDRY_MEMORY_ENABLED: enabled, TRUEFOUNDRY_MEMORY_TENANT_ALLOWLIST: allowlist };
}

describe('isMemoryOfferedToTenant', () => {
  it('offers nothing while TRUEFOUNDRY_MEMORY_ENABLED is off', () => {
    expect(
      isMemoryOfferedToTenant({ tenant_id: 'tenant-a', config: memoryConfig({ enabled: false, allowlist: [] }) }),
    ).toBe(false);
  });

  it('offers every tenant when the allowlist is empty', () => {
    expect(
      isMemoryOfferedToTenant({ tenant_id: 'tenant-a', config: memoryConfig({ enabled: true, allowlist: [] }) }),
    ).toBe(true);
  });

  it('offers only allowlisted tenants when the allowlist is set', () => {
    const config = memoryConfig({ enabled: true, allowlist: ['tenant-a'] });
    expect(isMemoryOfferedToTenant({ tenant_id: 'tenant-a', config })).toBe(true);
    expect(isMemoryOfferedToTenant({ tenant_id: 'tenant-b', config })).toBe(false);
  });
});
