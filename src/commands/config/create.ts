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
import { ConfigSchema } from "#src/user-config/schema.js";
import { DEFAULT_CONFIG_LOCATION } from "#src/util/constants.js";
import { ApplicationError } from "#src/util/errors.js";
import { writeFileSafe } from "#src/util/files.js";
import { Flags } from "@oclif/core";
import { mkdirp } from "fs-extra";
import { dirname } from "node:path";

export default class ConfigCreateCommand extends BaseCommand<
  typeof ConfigCreateCommand
> {
  static override description =
    "The config file provides configurable default values for various command.";

  static override enableJsonFlag = true;

  static override flags = {
    exit: Flags.boolean({
      allowNo: true,
      default: true,
      description: "Throw an error if the config file already exists",
      exclusive: ["force"],
    }),
    force: Flags.boolean({
      allowNo: true,
      char: "f",
      description: "Overwrite the existing config file, if one already exists.",
    }),
    path: Flags.string({
      default: DEFAULT_CONFIG_LOCATION,
      description: "Path to save the config file to.",
      helpValue: "<path>",
    }),
    preset: Flags.boolean({
      allowNo: true,
      description: "Use your existing config to create a new prefilled one.",
    }),
  };

  static override summary = "Create a config file for the CLI.";

  public async run() {
    this.i("Creating a config file");

    const { exit, force, path, preset } = this.flags;

    const directory = dirname(path!);

    this.v("Creating directory: %s", directory);

    await mkdirp(directory);

    const config = preset ? UserConfig.__proxy_value : ConfigSchema.parse({});

    const data = JSON.stringify(config, null, 2);

    const written = await writeFileSafe(path!, data, force);

    if (!written) {
      if (exit) {
        throw new ApplicationError(
          `Config file already exists at path: ${path}`,
          {
            suggestions: ["Run with the -f flag to overwrite the config file."],
          }
        );
      } else {
        this.d("Config file already exists at path: %s", path);

        return {
          message: "Config file already exists",
        };
      }
    }

    this.d("Config file created: %s", path);

    return {
      message: "Config file created",
      path,
    };
  }
}
