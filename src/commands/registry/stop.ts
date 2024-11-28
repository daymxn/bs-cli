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

export default class RegistryStopCommand extends BaseCommand<typeof RegistryStopCommand> {
  static override aliases = ["registry:kill", "registry:despawn", "registry:shutdown"];

  static override description = "Only applies to servers started with pm2 (without the --local flag).";

  static override enableJsonFlag = true;

  static override flags = {
    name: Flags.string({
      char: "n",
      description: "Name that the pm2 app is under.",
      helpValue: "<string>",
    }),
  };

  static override summary = "Stop the local verdaccio server.";

  public async run() {
    this.i("Stopping the verdaccio server");

    const name = this.flags.name ?? UserConfig.registry.name;

    await this.validatePackageInstalled("pm2");

    await pnpm(`exec pm2 stop ${name}`);

    return {
      message: "Server stopped.",
    };
  }
}
