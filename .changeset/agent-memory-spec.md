---
'@truefoundry/trueforge-core': patch
'@truefoundry/trueforge': patch
'@truefoundry/trueforge-assistant-ui-runtime': patch
'@truefoundry/trueforge-ui': patch
'@truefoundry/trueforge-sdk': patch
---

Add `config.memory.enabled` on agent specs so builders can opt an agent into long-term memory. Memory is offered only in TrueFoundry mode with `MEMORY_ENABLED`, for tenants in `MEMORY_TENANT_ALLOWLIST`: the capabilities response reports `memory.enabled`, the Memory toggle shows only then, and saving `config.memory.enabled: true` otherwise returns 422.
