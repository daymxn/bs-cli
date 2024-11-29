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

import ApiDiffCommand from "./diff.js";

export default class ApiCheckCommand extends BaseCommand<typeof ApiCheckCommand> {
  static override aliases = ["api:validate"];

  static override description = "Shorthand for calling `api diff` with the exit flag.";

  static override enableJsonFlag = true;

  static override summary = "Throws an error if there's any pending changes to the public API.";

  public async run() {
    this.i("Checking the public API for changes");

    return ApiDiffCommand.run(["-e"], this.config);
  }
}
