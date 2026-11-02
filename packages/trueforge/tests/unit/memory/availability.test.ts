import type { ServerConfiguration } from '../../../src/config';
import { isMemoryEnabledForTenant } from '../../../src/memory/availability';

function config(overrides: Record<string, unknown>): ServerConfiguration {
  return {
    STANDALONE: false,
    TRUEFOUNDRY_SERVICEFOUNDRY_SERVER_URL: 'https://sf.example',
    MEMORY_ENABLED: true,
    MEMORY_TENANT_ALLOWLIST: ['acme'],
    ...overrides,
  } as ServerConfiguration;
}

describe('isMemoryEnabledForTenant', () => {
  it('is on for an allowlisted tenant in TrueFoundry mode with MEMORY_ENABLED', () => {
    expect(isMemoryEnabledForTenant('acme', config({}))).toBe(true);
  });

  it.each([
    ['the tenant is not allowlisted', 'globex', {}],
    ['the allowlist is empty', 'acme', { MEMORY_TENANT_ALLOWLIST: [] }],
    ['MEMORY_ENABLED is off', 'acme', { MEMORY_ENABLED: false }],
    ['TrueFoundry mode is off', 'acme', { TRUEFOUNDRY_SERVICEFOUNDRY_SERVER_URL: undefined }],
    ['the server is standalone', 'acme', { STANDALONE: true }],
  ])('is off when %s', (_label, tenantId, overrides) => {
    expect(isMemoryEnabledForTenant(tenantId, config(overrides))).toBe(false);
  });
});
