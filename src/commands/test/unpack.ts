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
import { UserConfig, updateConfig } from "#src/user-config/loaders.js";
import { createPath, resourceFile } from "#src/util/files.js";
import { Flags } from "@oclif/core";
import { mkdirp } from "fs-extra";
import { cp } from "node:fs/promises";

export default class TestUnpackCommand extends BaseCommand<typeof TestUnpackCommand> {
  static override aliases = ["test:download"];

  static override description = "Useful if you need to make changes to the test runner filers (eg; adding shims).";

  static override enableJsonFlag = true;

  static override flags = {
    output: Flags.string({
      char: "o",
      default: "./tests",
      description: "Where to save runner files to.",
      helpValue: "<path>",
    }),
    update: Flags.boolean({
      allowNo: true,
      default: true,
      description: "Update your config file to point to the unpacked test runner.",
    }),
  };

  static override summary =
    "Copy the test runner files to your local directory, and use those instead of the bundled ones.";

  public async run() {
    this.i("Unpacking test runner files");

    const { output, update } = this.flags;

    this.d("Unpacking to directory: %s", output);

    const sourceDir = resourceFile("tests");
    this.d("Copying from source directory: %s", sourceDir);

    this.v("Creating output directory");
    await mkdirp(output!);

    this.v("Copying files");
    await cp(sourceDir, output!, { recursive: true });

    if (update) {
      this.d("Updating config file to point to unpacked test runner");

      const newTestsPath = createPath(output!, "lune");

      updateConfig({
        tests: {
          rbxlOutputPath: createPath(newTestsPath, "test.rbxl"),
          testsPath: newTestsPath,
        },
      });

      this.v("New rbxlOutputPath: %s", UserConfig.tests.rbxlOutputPath);
      this.v("New testsPath: %s", UserConfig.tests.testsPath);

      await this.saveConfig();

      this.d("Config file updated");
    }

    return {
      message: "Test files unpacked.",
      output,
    };
  }
}
