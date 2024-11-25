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
import { FlagBuilder } from "#src/util/flag-builder.js";
import { Flags } from "@oclif/core";

export default class RegistryUpstreamCommand extends BaseCommand<
  typeof RegistryUpstreamCommand
> {
  static override aliases = ["registry:sync"];

  static override description =
    "You need to change the registry that pnpm points to if you want to use it with pnpm.";

  static override enableJsonFlag = true;

  static override examples = [
    "<%= config.bin %> <%= command.id %>",
    {
      command: `<%= config.bin %> <%= command.id %> --reset"`,
      description: "Reset the registry to the default (npm)",
    },
  ];

  static override flags = {
    global: Flags.boolean({
      allowNo: true,
      char: "g",
      description: "Modify the global pnpm config.",
    }),
    host: Flags.string({
      char: "h",
      description: "The host address that verdaccio is using.",
      helpValue: "<string>",
    }),
    port: Flags.integer({
      char: "p",
      description: "The port number that verdaccio is using.",
      helpValue: "<number>",
      max: 65_535,
      min: 0,
    }),
    reset: Flags.boolean({
      description: "Reset the registry to its default.",
    }),
    scope: Flags.string({
      description: "Only route for packages under a specific scope.",
      helpValue: "<string>",
    }),
  };

  static override summary = "Change the registry that pnpm points to.";

  public async run() {
    this.i("Configuring the upstream registry");

    const host = this.flags.host ?? UserConfig.registry.host;
    const port = this.flags.port ?? UserConfig.registry.port;
    const scope = this.flags.scope ?? UserConfig.registry.scope;
    const global = this.flags.global ?? UserConfig.registry.global;

    const flags = new FlagBuilder();

    if (global) {
      this.d("Configuring global pnpm config");
      flags.add("global");
    } else {
      this.d("Configuring local pnpm config");
    }

    if (this.flags.reset) {
      if (scope) {
        this.d("Resetting upstream registry for scope: %s", scope);
        await pnpm(`config delete ${scope}:registry ${flags}`);
      } else {
        this.d("Resetting default upstream registry");
        await pnpm(`config delete registry ${flags}`);
      }

      this.i("Registry updated");

      return {
        message: "Registry updated",
      };
    }

    this.d("Using host: %s", host);
    this.d("Using port: %d", port);

    this.d("Generating fake credentials");
    await pnpm(`config set //${host}:${port}/:_authToken fakeToken ${flags}`);

    if (scope) {
      this.d("Updating upstream registry for scope: %s", scope);
      await pnpm(
        `config set "${scope}:registry" http://${host}:${port}/ ${flags}`
      );
    } else {
      this.d("Updating default upstream registry");
      await pnpm(`config set registry http://${host}:${port}/ ${flags}`);
    }

    return {
      message: "Upstream registry updated",
    };
  }
}
