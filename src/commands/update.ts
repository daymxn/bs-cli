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

import { pnpm } from "#src/util/apps.js";
import { inlineCode } from "#src/util/markup.js";
import { Flags } from "@oclif/core";

import { BaseCommand } from "./base-command.js";

export default class UpdateCommand extends BaseCommand<typeof UpdateCommand> {
  public static description = `
Since bs isn't published to any registry, you can use this command to automatically update your github repo dependency.

If this command isn't working for some reason, you can manually run ${inlineCode("pnpm add daymxn/bs-cli")}, and pnpm will pull the latest version.
`.trim();

  static override flags = {
    branch: Flags.string({
      default: "main",
      description: "Github branch to pull the update from",
    }),
  };

  public static summary = "Update your CLI to the latest version.";

  public async run() {
    this.i("Updating CLI");

    const { branch } = this.flags;

    this.d("Pulling from branch: %s", branch);

    await pnpm(`pnpm add daymxn/bs-cli#${branch}`);

    this.d("CLI updated");

    return {
      message: "CLI updated",
    };
  }
}
