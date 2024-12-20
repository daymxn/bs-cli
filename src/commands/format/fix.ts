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

import PrettierCheckCommand from "./check.js";

export default class FormatFixCommand extends BaseCommand<typeof FormatFixCommand> {
  static override enableJsonFlag = true;

  static override summary = "Run prettier and fix any fixable issues.";

  public async run() {
    this.i("Fixing any formatting issues");

    const result = await PrettierCheckCommand.run(["--fix"], this.config);
    this.i(result.message);

    return result;
  }
}
