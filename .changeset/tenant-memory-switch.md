---
'@truefoundry/trueforge': patch
'@truefoundry/trueforge-assistant-ui-runtime': patch
'@truefoundry/trueforge-ui': patch
'@truefoundry/trueforge-sdk': patch
---

Add a tenant-wide memory switch to `/api/v1/settings/configurations` and a Memory settings section. While it is off, capabilities report memory as unavailable and saving a spec that turns `config.memory` on is rejected with 422.
