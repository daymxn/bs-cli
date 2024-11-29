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
import { ApplicationError } from "#src/util/errors.js";
import { FlagBuilder } from "#src/util/flag-builder.js";
import { TestReport, TestStatus, Tree, createColors, parseFromJson } from "#src/util/test-report.js";
import { Flags } from "@oclif/core";
import { copyFile } from "node:fs/promises";
import { file } from "tmp-promise";

import TestBuildCommand from "./build.js";

export default class TestRunCommand extends BaseCommand<typeof TestRunCommand> {
  static override aliases = ["test:start"];

  static override enableJsonFlag = true;

  static override flags = {
    console: Flags.boolean({
      allowNo: true,
      description: "Log the result of the tests to the console.",
    }),
    dir: Flags.string({
      description: "Directory with a lune script to invoke.",
      helpValue: "<path>",
    }),
    exit: Flags.boolean({
      allowNo: true,
      description: "If there are any failures, exit with a non zero status.",
    }),
    jsonPath: Flags.string({
      description: "Export a copy of the test report as a json file.",
      helpValue: "<path>",
    }),
    markdownPath: Flags.string({
      description: "Export a copy of the test report as a markdown file.",
      helpValue: "<path>",
    }),
    pass: Flags.boolean({
      allowNo: true,
      description: "Show passed tests in the console output.",
    }),
    rbxl: Flags.string({
      description: "Path to the rbxl file to use during testing.",
      helpValue: "<path>",
    }),
    rebuild: Flags.boolean({
      allowNo: true,
      description: "Rebuild the test files before running tests.",
    }),
    report: Flags.boolean({
      allowNo: true,
      description: "Generate test report files.",
    }),
    skip: Flags.boolean({
      allowNo: true,
      description: "Show skipped tests in the console output.",
    }),
    trim: Flags.boolean({
      allowNo: true,
      description: "If all tests share a common category, trim it from the output.",
    }),
  };

  static override summary = "Run unit tests locally with lune.";

  public async run() {
    this.i("Running unit tests");

    const console = this.flags.console ?? UserConfig.tests.console;
    const dir = this.flags.dir ?? UserConfig.tests.testsPath;
    const rebuild = this.flags.rebuild ?? UserConfig.tests.rebuild;
    const rbxl = this.flags.rbxl ?? UserConfig.tests.rbxlOutputPath;
    const jsonPath = this.flags.jsonPath ?? UserConfig.tests.jsonReportPath;
    const markdownPath = this.flags.markdownPath ?? UserConfig.tests.markdownReportPath;
    const { exit, report } = this.flags;

    const flags = new FlagBuilder();

    this.v("Using lune directory: %s", dir);
    this.v("Using rbxl file: %s", rbxl);

    const { path: tempJson } = await file();
    const { path: tempMarkdown } = await file();

    this.v("Temporary json file: %s", tempJson);
    this.v("Temporary markdown file: %s", tempMarkdown);

    flags.add("json", tempJson);
    flags.add("markdown", tempMarkdown);

    if (rebuild) {
      await TestBuildCommand.run([], this.config);
    }

    await run("lune", ["run", dir, rbxl, "--", ...flags.unpack()]);

    if (report && jsonPath) {
      this.d("Exporting a copy of the test report as JSON: %s", jsonPath);
      await copyFile(tempJson, jsonPath);
    }

    if (report && markdownPath) {
      this.d("Exporting a copy of the test report as markdown: %s", markdownPath);
      await copyFile(tempMarkdown, markdownPath);
    }

    const result = await parseFromJson(tempJson);

    if (console) {
      this.log(await this.formatReport(result));
    }

    if (exit && result.fail.length > 0) {
      throw new ApplicationError(`There were ${result.fail.length} test failures.`);
    }

    return result;
  }

  private async formatReport(report: TestReport) {
    const allCases = [...report.fail, ...report.pass, ...report.skip];
    const colors = createColors(this.theme);
    const tree = Tree.fromTestResults(allCases, colors);

    const showPass = this.flags.pass ?? UserConfig.tests.showPass;
    const showSkip = this.flags.skip ?? UserConfig.tests.showSkip;
    const trim = this.flags.trim ?? UserConfig.tests.trim;

    const statusesToPrint: TestStatus[] = ["Failure"];
    if (showPass) statusesToPrint.push("Success");
    if (showSkip) statusesToPrint.push("Skipped");

    tree.filterForStatus(statusesToPrint);

    const reportStr = trim ? tree.removeCommonPrefix().toString() : tree.toString();

    return `${reportStr}\n

Pass: ${colors.names.Success(report.pass.length)}
Skip: ${colors.names.Skipped(report.skip.length)}
Fail: ${colors.names.Failure(report.fail.length)}

`;
  }
}
