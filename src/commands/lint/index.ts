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

import LintFixCommand from "./fix.js";

// TODO(): add proper logging support for nested commands.
// currently, we downgrade them. But if I run `bs lint`, I expect to see the info logs from `fix -> check`.
// but ONLY if I ran `bs lint`. If I ran `bs someOtherCommand` that ran `bs lint`, then I shouldn't see those as info; they should be downgraded.
export default class LintCommands extends BaseCommand<typeof LintCommands> {
  static override description = "Running this directly will call the fix command.";

  static override enableJsonFlag = false;

  static override summary = "Commands for handling eslint.";

  public async run() {
    return LintFixCommand.run([], this.config);
  }
}
