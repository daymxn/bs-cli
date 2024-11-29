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

export default class ConfigUpdateCommand extends BaseCommand<typeof ConfigUpdateCommand> {
  static override description =
    "Useful when you want to quickly update your config file via global flags, or you've recently updated the CLI and want to also update your schema/config file";

  static override enableJsonFlag = true;

  static override flags = {
    "update-config": Flags.boolean({
      allowNo: true,
      default: true,
      description: "Update your config file with the current values, without overwriting unchanged values.",
    }),
    "update-schema": Flags.boolean({
      allowNo: true,
      default: true,
      description:
        "Update the schema with any changes. Only really applicable when you've just updated the CLI and there's configuration changes.",
    }),
  };

  static override summary = "Update your config file and the bs config json schema.";

  public async run() {
    this.i("Updating configuration files");

    const { config, "update-config": updateConfig, "update-schema": updateSchema } = this.flags;

    if (updateConfig) {
      this.d("Updating config file");

      const createFlags = new FlagBuilder(["force", "preset"]).addValueIfPresent("path", config);

      await ConfigCreateCommand.run(createFlags.unpack(), this.config);
    } else {
      this.d("Skipping config file update");
    }

    if (updateSchema) {
      this.d("Updating schema file");

      await ConfigSchemaCommand.run([], this.config);
    } else {
      this.d("Skiping schema file update");
    }

    return {
      message: "Configuration files updated.",
    };
  }
}
