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
import { UserConfig } from "#src/user-config/loaders.js";
import { pnpm } from "#src/util/apps.js";
import { FlagBuilder } from "#src/util/flag-builder.js";
import { Flags } from "@oclif/core";

export default class DocsGenerateCommand extends BaseCommand<typeof DocsGenerateCommand> {
  static override aliases = ["docs:extract", "docs:create"];

  static override description = "Uses `api-documenter` to generate the markdown files.";

  static override enableJsonFlag = true;

  static override flags = {
    input: Flags.string({
      char: "i",
      description: "Folder containing *.api.json files to process.",
      helpValue: "<path>",
    }),
    output: Flags.string({
      char: "o",
      description: "Folder to export the markdown files to.",
      helpValue: "<path>",
    }),
  };

  static override summary = "Export the public API as markdown files for use in the wiki.";

  public async run() {
    if (!UserConfig.global.docs) {
      this.d("Skipping public API doc generation since docs are disabled.");
      return { message: "Docs are disabled." };
    }

    this.i("Generating docs for public API");

    const input = this.flags.input ?? UserConfig.docs.apiFolder;
    const output = this.flags.output ?? UserConfig.docs.output;

    this.d("Using input files from: %s", input);
    this.d("Exporting markdown files to: %s", output);

    const builder = new FlagBuilder().add("input-folder", input).add("output-folder", output);

    await this.validatePackageInstalled("@microsoft/api-documenter");

    await pnpm(`api-documenter markdown ${builder}`);

    return {
      docsFolder: output,
      message: "API docs generated.",
    };
  }
}
