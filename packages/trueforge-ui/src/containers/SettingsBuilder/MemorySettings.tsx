'use client';

import { useEffect, useState } from 'react';

import { useTrackAnalytics } from '@/analytics/AnalyticsProvider.js';
import { AnalyticsEvents } from '@/analytics/events.js';
import { Switch } from '../../atoms/primitives/Switch.js';
import { useOptionalConfigurationServer } from '../../server/ServerContext.js';
import { getErrorMessage } from '../../utils/getErrorMessage.js';
import { useToasterOptional } from '../ToasterContainer.js';

const MemorySettings = () => {
  const configuration = useOptionalConfigurationServer();
  const toaster = useToasterOptional();
  const track = useTrackAnalytics();

  // `null` until the tenant switch loads, so the control is not rendered half-known.
  const [tenantEnabled, setTenantEnabled] = useState<boolean | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!configuration) return;
    let cancelled = false;
    void configuration
      .getConfiguration()
      .then(loaded => {
        if (!cancelled) setTenantEnabled(loaded.memory.enabled);
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(getErrorMessage(err, 'Failed to load the memory setting'));
      });
    return () => {
      cancelled = true;
    };
  }, [configuration]);

  if (configuration == null) {
    return <p className="text-sm text-text-secondary">Memory settings are not available.</p>;
  }

  const handleToggle = async (next: boolean) => {
    setBusy(true);
    setError(null);
    try {
      const saved = await configuration.updateConfiguration({ memory: { enabled: next } });
      setTenantEnabled(saved.memory.enabled);
      toaster?.showSuccess({ title: saved.memory.enabled ? 'Memory turned on' : 'Memory turned off' });
      track(AnalyticsEvents.Settings.MEMORY_TENANT_TOGGLED, { enabled: saved.memory.enabled });
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to save the memory setting'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <h3 className="text-xl font-semibold tracking-tight text-text-primary">Memory</h3>
      <p className="mt-1 text-sm text-text-secondary">
        Choose whether agents in this tenant may remember details from past chats.
      </p>

      {error ? (
        <p className="mt-3 rounded-md border border-failure-bg/30 bg-failure-bg/10 px-3 py-2 text-sm text-failure-bg">
          {error}
        </p>
      ) : null}

      {tenantEnabled !== null ? (
        <div className="mt-4 flex items-center justify-between gap-4 rounded-xl border border-border bg-card-bg p-3">
          <div className="min-w-0">
            <h4 className="text-sm font-medium text-text-primary">Allow memory</h4>
            <p className="mt-0.5 text-xs text-text-secondary">
              {tenantEnabled
                ? 'Agents with memory turned on remember details from past chats.'
                : 'No agent remembers details from past chats.'}
            </p>
          </div>
          <Switch
            checked={tenantEnabled}
            disabled={busy}
            aria-label="Allow memory"
            onCheckedChange={next => {
              void handleToggle(next);
            }}
          />
        </div>
      ) : null}
    </>
  );
};

export default MemorySettings;
