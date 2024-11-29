/**
 * @license
 * Copyright 2024 Daymon Littrell-Reyes
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { BaseCommand } from "#src/commands/base-command.js";
import { UserConfig } from "#src/user-config/loaders.js";
import { pnpm } from "#src/util/apps.js";
import path from "node:path";

export default class RollupGenerateCommand extends BaseCommand<typeof RollupGenerateCommand> {
  static override aliases = ["rollup:create", "rollup:run"];

  static override description = "Uses `tsup` to generate the rollup.";

  static override enableJsonFlag = true;

  static override summary = "Generate a single `.d.ts` file representing the API.";

  public async run() {
    if (!UserConfig.global.rollup) {
      this.d("Rollups are disabled, so we're skipping rollup generation");
      return { message: "Rollups are disabled." };
    }

    this.i("Generating API rollup");

    await this.build();

    this.d("Running tsup");
    await pnpm(`exec tsup`);

    return {
      message: "Rollup generated.",
      rollupFilePath: path.resolve(UserConfig.api.rollup),
    };
  }
}
