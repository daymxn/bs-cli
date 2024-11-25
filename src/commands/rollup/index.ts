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

import RollupFixCommand from "./fix.js";
import RollupGenerateCommand from "./generate.js";

export default class RollupCommands extends BaseCommand<typeof RollupCommands> {
  static override description =
    "Running this directly uses tsup to generate a rollup file and applies various fixes to the output.";

  static override enableJsonFlag = true;

  static override summary = "Commands handling rollup files.";

  public async run() {
    if (!UserConfig.global.rollup) {
      this.d("Rollups are disabled, so we're skipping rollup related tasks.");
      return { message: "Rollups are disabled." };
    }

    await RollupGenerateCommand.run([], this.config);
    await RollupFixCommand.run([], this.config);

    return {
      message: "Rollup file created and fixed.",
      rollupFilePath: UserConfig.api.rollup,
    };
  }
}
