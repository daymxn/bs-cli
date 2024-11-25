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
import { Flags } from "@oclif/core";

export default class TestBuildCommand extends BaseCommand<
  typeof TestBuildCommand
> {
  static override aliases = ["test:export"];

  static override description = "Uses `rojo build` to create the rbxl file.";

  static override enableJsonFlag = true;

  static override flags = {
    output: Flags.string({
      char: "o",
      description: "Where to save the rbxl file to.",
      helpValue: "<path>",
    }),
    project: Flags.string({
      description: "Rojo project.json file to build with.",
      helpValue: "<path>",
    }),
  };

  static override summary =
    "Build a rbxl file of your library (to use for testing).";

  public async run() {
    this.i("Building rbxl file for testing");

    await this.buildDev();

    const project = this.flags.project ?? UserConfig.tests.rojoProject;
    const output = this.flags.output ?? UserConfig.tests.rbxlOutputPath;

    this.v("Using rojo project: %s", project);
    this.v("Building rbxl file to output: %s", output);

    await pnpm(`rojo build ${project} -o ${output}`);

    return {
      message: "Built rbxl file.",
      path: output,
    };
  }
}
