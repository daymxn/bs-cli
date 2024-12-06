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
import { ApplicationError } from "#src/util/errors.js";
import { FlagBuilder } from "#src/util/flag-builder.js";
import { Flags } from "@oclif/core";

export default class PrettierCheckCommand extends BaseCommand<typeof PrettierCheckCommand> {
  static override aliases = ["format:validate"];

  static override enableJsonFlag = true;

  static override flags = {
    cache: Flags.boolean({
      allowNo: true,
      description: "Only check changed files.",
    }),
    prettier: Flags.string({
      description: "Path to the prettier config file.",
      helpValue: "<path>",
    }),
    fix: Flags.boolean({
      description: "Automatically fix any any issues.",
      hidden: true,
    }),
    pattern: Flags.string({
      char: "p",
      description: "Pattern to use in finding files to run against.",
      helpValue: "<string>",
      multiple: true,
    }),
  };

  static override summary = "Run eslint and output any issues.";

  public async run() {
    this.i("Checking source files with prettier");

    await this.validatePackageInstalled("prettier");

    const patterns = this.flags.pattern ?? UserConfig.format.patterns;
    const configPath = this.flags.prettier ?? UserConfig.format.config;
    const cache = this.flags.cache ?? UserConfig.format.cache;
    const isFix = this.flags.fix;

    const flags = new FlagBuilder(["list-different"]);

    if (patterns.length === 0) {
      this.d("No pattern specified, running against all files instead");

      patterns.push(".");
    } else {
      this.d("Using patterns: %s", patterns);
    }

    if (configPath) {
      this.d("Using config file: %s", configPath);
      flags.add("config", configPath);
    }

    if (cache) {
      this.d("Only checking changed files");
      flags.add("cache");
    }

    if (isFix) {
      this.d("Fixing any formatting issues");
      flags.add("write");
    }

    const result = await pnpm(`prettier ${patterns.join(" ")} ${flags}`).catch((e) => {
      if (e instanceof ApplicationError && e.data?.exitCode == 1) return e.message;
      throw e;
    });

    const files = result.split("\n");

    if (files.length === 0) {
      this.i("All files are properly formatted");

      return {
        message: "All files are properly formatted",
      };
    }

    if (isFix) {
      for (const file of files) {
        this.d("Formatted file: %s", file);
      }

      this.i("Formatted %d file(s)", files.length);

      return {
        message: `Formatted ${files.length} file(s)`,
        files,
      };
    }

    if (this.jsonEnabled()) {
      return {
        message: "There are files that need formatting",
        files,
      };
    }

    for (const file of files) {
      this.w(file);
    }

    throw new ApplicationError(`There are ${files.length} file(s) that need formatting`);
  }
}
