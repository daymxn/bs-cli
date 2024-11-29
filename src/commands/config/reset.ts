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
import { DEFAULT_CONFIG_LOCATION } from "#src/util/constants.js";
import { FlagBuilder } from "#src/util/flag-builder.js";
import { Flags } from "@oclif/core";

import ConfigCreateCommand from "./create.js";

export default class ConfigResetCommand extends BaseCommand<typeof ConfigResetCommand> {
  static override enableJsonFlag = true;

  static override flags = {
    path: Flags.string({
      default: DEFAULT_CONFIG_LOCATION,
      description: "Path to the config file.",
      helpValue: "<path>",
    }),
  };

  static override summary = "Reset the config file to the default setting.";

  public async run() {
    this.i("Resetting the config file to the default setting");

    const { path } = this.flags;

    const flags = new FlagBuilder(["force"]).add("path", path);

    await ConfigCreateCommand.run(flags.unpack(), this.config);

    this.d("Config file reset: %s", path);

    return {
      message: "Config file reset",
      path,
    };
  }
}
