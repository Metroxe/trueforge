---
'@truefoundry/trueforge-core': patch
'@truefoundry/trueforge': patch
'@truefoundry/trueforge-assistant-ui-runtime': patch
'@truefoundry/trueforge-ui': patch
'@truefoundry/trueforge-sdk': patch
---

Add `config.memory.enabled` on agent specs so builders can opt an agent into long-term memory.

Add a tenant-wide memory switch to `/api/v1/settings/configuration` and a Memory settings section. While it is off, capabilities report memory as unavailable and saving a spec that turns `config.memory` on is rejected with 422.

Memory is offered only with `TRUEFOUNDRY_MEMORY_ENABLED=true`, to tenants in `TRUEFOUNDRY_MEMORY_TENANT_ALLOWLIST` (unset or empty: every tenant). When it is not offered, capabilities omit `memory` and the UI hides every memory setting.
