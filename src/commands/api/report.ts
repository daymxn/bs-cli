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

import ApiDiffCommand from "./diff.js";

export default class ApiReportCommand extends BaseCommand<typeof ApiReportCommand> {
  static override description = "Shorthand for calling `api diff` with preconfigured flags.";

  static override enableJsonFlag = true;

  static override flags = {
    exit: Flags.boolean({
      char: "e",
      description: "Exit with a non zero status whenever there's a diff.",
    }),
  };

  static override summary = "Generate a report file dictating any pending public API changes.";

  public async run() {
    this.i("Checking the public API for changes");

    const builder = new FlagBuilder(["report", "no-print"]);

    if (this.flags.exit) {
      builder.add("exit");
    }

    const result = await ApiDiffCommand.run(builder.unpack(), this.config);

    if (result.reportFile !== undefined) {
      this.w("API report file: %s", result.reportFile);
    }
  }
}
