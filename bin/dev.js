#!/usr/bin/env -S node --inspect=9229 --loader ts-node/esm --disable-warning=ExperimentalWarning

// eslint-disable-next-line n/shebang
import { execute } from "@oclif/core";

await execute({ development: true, dir: import.meta.url });
