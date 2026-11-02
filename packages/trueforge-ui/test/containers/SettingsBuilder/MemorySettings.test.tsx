// @vitest-environment jsdom
import { render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import MemorySettings from '@/containers/SettingsBuilder/MemorySettings.js';
import { ServerProvider } from '@/server/ServerContext.js';
import type { ConfigurationServer } from '@/server/types.js';
import { createMockAgentUIServer, createMockCatalog } from '../../server/mockServer.js';

async function unavailable(): Promise<never> {
  throw new Error('Unexpected memory settings call');
}

function renderSettings(configuration: ConfigurationServer | undefined) {
  const server = createMockAgentUIServer({
    catalog: createMockCatalog({}),
    ...(configuration ? { configuration } : {}),
  });
  return render(
    <ServerProvider server={server}>
      <MemorySettings />
    </ServerProvider>,
  );
}

describe('MemorySettings tenant switch', () => {
  it('shows the stored value', async () => {
    renderSettings({
      getConfiguration: async () => ({ webSearch: { enabled: true }, memory: { enabled: false } }),
      updateConfiguration: unavailable,
    });

    const toggle = await screen.findByRole('switch', { name: 'Allow memory' });
    expect(toggle).toHaveAttribute('aria-checked', 'false');
    expect(screen.getByText('No agent remembers details from past chats.')).toBeInTheDocument();
  });

  it('saves only the memory switch and re-renders from the response', async () => {
    const updateConfiguration = vi.fn(async () => ({ webSearch: { enabled: true }, memory: { enabled: false } }));
    renderSettings({
      getConfiguration: async () => ({ webSearch: { enabled: true }, memory: { enabled: true } }),
      updateConfiguration,
    });

    const toggle = await screen.findByRole('switch', { name: 'Allow memory' });
    toggle.click();

    await waitFor(() => {
      expect(updateConfiguration).toHaveBeenCalledWith({ memory: { enabled: false } });
    });
    await waitFor(() => {
      expect(screen.getByRole('switch', { name: 'Allow memory' })).toHaveAttribute('aria-checked', 'false');
    });
  });

  it('says the setting is unavailable when the host has no configuration port', () => {
    renderSettings(undefined);

    expect(screen.getByText('Memory settings are not available.')).toBeInTheDocument();
    expect(screen.queryByRole('switch', { name: 'Allow memory' })).not.toBeInTheDocument();
  });
});
