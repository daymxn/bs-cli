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
import { Flags } from "@oclif/core";

import DocsFixCommand from "./fix.js";
import DocsGenerateCommand from "./generate.js";

// TODO(): how will I differ this from the wiki commands I'm planning?
export default class DocsCommands extends BaseCommand<typeof DocsCommands> {
  static override description =
    "Running this directly will generate markdown files for the JSDoc public API and export them to the wiki for docusaurus.";

  static override enableJsonFlag = true;

  static override flags = {
    input: Flags.string({
      char: "i",
      description: "Folder containing *.api.json files to process.",
      helpValue: "<path>",
    }),
    output: Flags.string({
      char: "o",
      description: "Folder to export the fixed markdown files to.",
      helpValue: "<path>",
    }),
  };

  static override summary = "Commands for handling the wiki files.";

  public async run() {
    if (!UserConfig.global.docs) {
      this.d("Skipping wiki doc generation since docs are disabled.");
      return { message: "Docs are disabled." };
    }

    const input = this.flags.input ?? UserConfig.docs.apiFolder;
    const output = this.flags.output ?? UserConfig.docs.wikiPath;

    await DocsGenerateCommand.run([`--input=${input}`], this.config);
    await DocsFixCommand.run([`--output=${output}`], this.config);

    return {
      folder: output,
      message: "Public API wiki docs have been generated and exported.",
    };
  }
}
