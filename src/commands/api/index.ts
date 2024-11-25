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

import DocsCommands from "../docs/index.js";
import ApiUpdateCommand from "./update.js";

export default class APICommands extends BaseCommand<typeof APICommands> {
  static override description =
    "Running this directly will update the public API file and the API docs in the wiki.";

  static override enableJsonFlag = true;

  static override summary = "Commands for handling the public API file.";

  public async run() {
    await ApiUpdateCommand.run([], this.config);
    await DocsCommands.run([], this.config);

    return {
      message: "Public API and API docs updated.",
    };
  }
}
