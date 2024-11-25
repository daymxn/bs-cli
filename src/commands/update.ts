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

import { BaseCommand } from "./base-command.js";

// TODO(): implement this after I've pushed it to github and can test it
export default class UpdateCommand extends BaseCommand<typeof UpdateCommand> {
  public static description =
    "Since bs isn't published to any registry, you can use this command to automatically update your github repo dependency.";

  public static summary = "Update your CLI to the latest version.";

  public async run() {
    await this.showHelp();
  }
}
