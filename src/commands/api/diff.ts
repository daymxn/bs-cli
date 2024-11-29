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
import { run } from "#src/util/apps.js";
import { ApplicationError, extendError } from "#src/util/errors.js";
import { backupFile, existsAsync, restoreFile } from "#src/util/files.js";
import { codeBlock, inlineCode } from "#src/util/markup.js";
import { Command, Flags } from "@oclif/core";
import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";

import RollupCommands from "../rollup/index.js";
import ApiExportCommand from "./export.js";

type Flags<T extends typeof Command> = T["flags"];

export default class ApiDiffCommand extends BaseCommand<typeof ApiDiffCommand> {
  static override aliases = ["api:changes"];

  static override description = "Generates the current public API and compares it to the saved `.api.md` file.";

  static override enableJsonFlag = true;

  static override flags = {
    exit: Flags.boolean({
      char: "e",
      description: "Exit with a non zero status whenever there's a diff.",
    }),
    input: Flags.string({
      char: "i",
      description: "Path to the current `api.md` file.",
      helpValue: "<path>",
    }),
    output: Flags.string({
      char: "o",
      description: "Save diff output to a file.",
      helpValue: "<path>",
    }),
    print: Flags.boolean({
      allowNo: true,
      default: true,
      description: "Print the diff to the console.",
    }),
    report: Flags.boolean({
      description: "Generate an API report, suitable for a GitHub comment, instead of a basic diff.",
    }),
  };

  static override summary = "Generate a diff of the current public API.";

  public async run() {
    this.i("Generating public API diff");

    await this.buildProd();
    await RollupCommands.run([], this.config);

    const input = await this.getInput(this.flags.input ?? UserConfig.api.apiFile);
    this.d("Using API file: %s", input);

    this.v("Creating backup file");
    const backup = await backupFile(input);
    this.v("Backup file created: %s", backup);

    const isOutput = this.flags.output || this.flags.report;

    const outputFile = this.flags.output ?? UserConfig.api.report;

    try {
      await ApiExportCommand.run([], this.config);

      const diff = await this.generateDiff(backup, input).then((diff) =>
        this.flags.report ? this.generateReport(diff) : diff,
      );

      if (diff === "") {
        this.i("API is up-to-date, no diff found.");

        return {
          message: "API is up-to-date, no diff found.",
        };
      }

      if (isOutput) {
        this.d("Writing API diff to file: %s", outputFile);
        await writeFile(outputFile, diff);
      }

      if (this.flags.print) {
        this.w("API changes were found\n%s", diff);
      }

      if (this.flags.exit) {
        throw new ApplicationError("There are pending API changes.", {
          suggestions: [`If these changes are expected, run ${inlineCode("bs api:update")} to update the API.`],
        });
      }

      return {
        message: "There are pending API changes.",
        reportFile: isOutput ? outputFile : undefined,
      };
    } finally {
      this.v("Restoring backup file");

      await restoreFile(backup, input);

      this.v("Backup file restored");
    }
  }

  private async generateDiff(oldFile: string, newFile: string) {
    this.d("Finding diff between APIs");

    return run("git", ["diff", "--no-index", oldFile, newFile]).catch((e) => {
      // remove everything before the diff message (like ts exception message)
      if (e?.exitCode === 1) return (e.message as string).replace(/([^]*?)^(?=diff)/m, "");

      throw extendError("Failed to run `git diff` to compare the APIs", e);
    });
  }

  private async generateReport(diff: string) {
    this.d("Creating API report");

    if (diff === "") {
      this.d("Diff is empty, no need to create a report");
      return "";
    }

    return `Your change includes changes that impact the public API.
  
  Please run ${inlineCode("bs api:update")} to update the public API file.
  
  **API Diff**
  ${codeBlock(diff, "diff")}
  `;
  }

  private async getInput(maybeInput: null | string): Promise<string> {
    this.d("Getting current API file");

    if (maybeInput) {
      if (!(await existsAsync(maybeInput)))
        throw new ApplicationError(`API file does not exist at the provided path: ${maybeInput}`);

      this.v("Using provided API file: %s", maybeInput);
      return maybeInput;
    }

    const { apiDir } = UserConfig.api;

    this.v("No input file provided, searching for api file in dir: %s", apiDir);
    const files = await readdir(apiDir, { withFileTypes: true });

    for (const file of files) {
      if (file.name.endsWith(".api.md")) {
        const apiPath = path.resolve(file.parentPath, file.name);
        this.v("Found api file: %s", apiPath);

        return apiPath;
      }

      this.v("File does not end with `.api.md`: %s", file.name);
    }

    throw new ApplicationError("Could not find an API file to diff against.", {
      suggestions: [
        `Run ${inlineCode("bs api:export")} to create one.`,
        "You can manually provide a path to an api file with the --input flag.",
      ],
    });
  }
}
