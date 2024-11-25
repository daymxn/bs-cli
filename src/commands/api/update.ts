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

import RollupCommands from "../rollup/index.js";
import ApiExportCommand from "./export.js";

export default class ApiUpdateCommand extends BaseCommand<
  typeof ApiUpdateCommand
> {
  static override aliases = ["api:refresh", "api:save"];

  static override description =
    "Generates the rollup file and runs `bs api export`.";

  static override enableJsonFlag = true;

  static override summary = "Update the public api file.";

  public async run() {
    this.i("Updating public API file");

    await this.buildProd();
    await RollupCommands.run([], this.config);
    await ApiExportCommand.run([], this.config);

    return {
      message: "Public API file updated.",
    };
  }
}
