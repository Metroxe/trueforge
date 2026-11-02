import type { IMemoryProviderStore } from '../db/memoryProviderStore';

/** Whether the tenant has a memory provider: saved in settings, or supplied by the platform. */
export async function hasConfiguredMemoryProvider({
  tenant_id,
  store,
}: {
  tenant_id: string;
  store: IMemoryProviderStore;
}): Promise<boolean> {
  const record = await store.getProvider(tenant_id);
  return record !== undefined;
}
