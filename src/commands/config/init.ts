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
import { FlagBuilder } from "#src/util/flag-builder.js";
import { Flags } from "@oclif/core";

import ConfigCreateCommand from "./create.js";
import ConfigSchemaCommand from "./schema.js";

export default class ConfigInitCommand extends BaseCommand<typeof ConfigInitCommand> {
  static override description = `
Creates the config file and generates the json schema for autocompletion.

Effectively, this is the same as running the create and schema commands.
`.trim();

  static override enableJsonFlag = true;

  static override flags = {
    force: Flags.boolean({
      allowNo: true,
      char: "f",
      default: true,
      description: "Overwrite the existing config file, if one already exists.",
    }),
    path: Flags.string({
      description: "Path to save the config file to.",
      helpValue: "<path>",
    }),
    preset: Flags.boolean({
      allowNo: true,
      default: true,
      description: "Use your existing config to create a new prefilled one.",
    }),
  };

  static override summary = "Scaffold the schema and config file for the CLI.";

  public async run() {
    this.i("Initializing configuration files");

    const { config, force, preset } = this.flags;
    const path = this.flags.path ?? config;

    const createFlags = new FlagBuilder()
      .addNegatable("force", force)
      .addNegatable("preset", preset)
      .addValueIfPresent("path", path);

    this.v("Running create with arguments: %s", createFlags.unpack());

    await ConfigCreateCommand.run(createFlags.unpack(), this.config);
    await ConfigSchemaCommand.run([], this.config);

    return {
      configPath: path,
      message: "Config file and schema created.",
    };
  }
}
