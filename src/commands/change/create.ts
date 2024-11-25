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
import { pnpm } from "#src/util/apps.js";

export default class ChangeCreateCommand extends BaseCommand<
  typeof ChangeCreateCommand
> {
  static override aliases = ["change:add"];

  static override enableJsonFlag = false;

  static override summary = "Create a changeset entry.";

  public async run() {
    this.i("Creating a changeset entry");

    await this.validatePackageInstalled("@changesets/cli");

    await pnpm(`exec changeset`, false);
  }
}
