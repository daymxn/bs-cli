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
import { FlagBuilder } from "#src/util/flag-builder.js";
import { Flags } from "@oclif/core";

import ChangeStatusCommand from "./status.js";

export default class ChangeExportCommand extends BaseCommand<typeof ChangeExportCommand> {
  static override aliases = ["change:save", "change:report"];
  static override description = "Shorthand for calling the status command with an output file.";

  static override enableJsonFlag = true;

  static override flags = {
    output: Flags.string({
      char: "o",
      default: "./changes.json",
      description: "File to save the pending changes to",
      helpValue: "<path>",
    }),
    since: Flags.string({
      description: "Limit changes to those since a specific branch or git tag.",
      helpValue: "<string>",
    }),
  };

  static override summary = "Export unreleased changes to a json file.";

  public async run() {
    this.i("Exporting unreleased changes");

    await this.validatePackageInstalled("@changesets/cli");

    const { output, since } = this.flags;

    const flags = new FlagBuilder();

    flags.addIfPresent("since", since);
    flags.add("output", output!);

    return ChangeStatusCommand.run(flags.unpack(), this.config);
  }
}
