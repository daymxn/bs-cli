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
import { FlagBuilder } from "#src/util/flag-builder.js";
import { Flags } from "@oclif/core";

export default class ApiExportCommand extends BaseCommand<
  typeof ApiExportCommand
> {
  static override aliases = ["api:extract", "api:create"];

  static override description =
    "Uses `api-extractor` to extract the public API.";

  static override enableJsonFlag = true;

  static override flags = {
    verbose: Flags.boolean({
      char: "v",
      description: "Enable verbose logging for api-extractor.",
    }),
  };

  static override summary = "Export the public API to a single `api.md` file.";

  public async run() {
    this.i("Exporting public API");

    const runFlags = new FlagBuilder(["local"]);

    if (this.flags.verbose) {
      this.d("Enabling verbose logging for api-extractor");
      runFlags.add("verbose");
    }

    await this.validatePackageInstalled("@microsoft/api-extractor");

    await pnpm(`api-extractor run ${runFlags}`);

    return {
      message: "Public API exported.",
    };
  }
}
