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
import { ApplicationError } from "#src/util/errors.js";
import { Flags } from "@oclif/core";
import { ESLint, Linter } from "eslint";
import { partition, sumBy } from "lodash-es";
import { cwd } from "node:process";

export default class LintCheckCommand extends BaseCommand<
  typeof LintCheckCommand
> {
  static override aliases = ["lint:validate"];

  static override enableJsonFlag = true;

  static override flags = {
    cache: Flags.boolean({
      allowNo: true,
      description: "Only check changed files.",
    }),
    eslint: Flags.string({
      char: "e",
      description: "Path to the eslint config file.",
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
    this.i("Checking source files with eslint");

    await this.validatePackageInstalled("eslint");

    const patterns = this.flags.pattern ?? UserConfig.lint.patterns;
    const configPath = this.flags.eslint ?? UserConfig.lint.config;
    const cache = this.flags.cache ?? UserConfig.lint.cache;

    const eslint = new ESLint({
      cache,
      fix: this.flags.fix,
      overrideConfigFile: configPath ?? undefined,
    });

    if (patterns.length === 0) {
      this.d("No pattern specified, running against all files instead");

      patterns.push(".");
    } else {
      this.d("Using patterns: %s", patterns);
    }

    if (configPath) this.d("Using eslint config file: %s", configPath);
    if (cache) this.d("Only checking changed files");
    if (this.flags.fix) this.d("Fixing any fixable issues");

    this.v("Running eslint");
    const results = await eslint.lintFiles(patterns);
    this.v("Processed %d files, checking for issues", results.length);

    const issueCount = sumBy(results, (it) => it.errorCount + it.warningCount);
    this.v(`Found %d issues`, issueCount);

    if (this.flags.fix) {
      this.v("Saving fixes for issues that can be auto-fixed");
      await ESLint.outputFixes(results);
    }

    if (issueCount === 0) {
      this.i("No remaining eslint issues to report.");

      return {
        message: "No issues to report.",
      };
    }

    const message = this.flags.fix
      ? "There are issues that couldn't be automatically fixed"
      : "There are issues found by eslint that need fixing";

    if (this.jsonEnabled()) {
      const issues = results.flatMap((it) => this.mapResult(it));
      const [errors, warnings] = partition(issues, (it) => it.type === "error");

      return {
        errors,
        message,
        warnings,
      };
    }

    const formatter = await eslint.loadFormatter();
    const resultText = await formatter.format(results, {
      cwd: cwd(),
      rulesMeta: eslint.getRulesMetaForResults(results),
    });

    this.w(resultText);

    throw new ApplicationError(message, {
      suggestions: this.flags.fix ? [] : ["Try running `bs lint fix`"],
    });
  }

  private mapMessage(file: string, message: Linter.LintMessage) {
    return {
      column: message.column,
      file,
      fixable: message.fix !== undefined,
      id: message.ruleId,
      line: message.line,
      message: message.message,
      type: message.severity === 1 ? "warning" : "error",
    };
  }

  private mapResult(result: ESLint.LintResult) {
    return result.messages.map((it) => this.mapMessage(result.filePath, it));
  }
}
