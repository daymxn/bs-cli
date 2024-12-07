# @daymxn/bs

## 0.2.0

### Minor Changes

- 8b7b869: Added the format command group, which runs prettier to format issues.
- 22d9334: Added the `publish:tag` command for generating and pushing git tags after a release.

### Patch Changes

- 0a2c876: Fix issue with docs being disabled and still running.
- 3c5e915: Fix bug with update command + luarc path

## 0.1.0

### Minor Changes

- 092d847: Add the "ci" gloabl flag.

### Patch Changes

- ccb0195: Use spread args for running lune.
- f2f60fb: Use spread args for all external runs. This should fix various CI issues.
- ccb0195: Fix resource path resolution.

## 0.0.3

### Patch Changes

- d9102b1: Use args spread on git diff. Should fix CI issues with api:diff.
- 3a9f67e: Create directory before running rojo.

## 0.0.2

### Patch Changes

- 68e6280: Migrate to eslint 9.
