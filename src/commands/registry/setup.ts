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

import type { ConfigYaml } from "@verdaccio/types";

import { BaseCommand } from "#src/commands/base-command.js";
import { UserConfig } from "#src/user-config/loaders.js";
import { pnpm } from "#src/util/apps.js";
import { ApplicationError } from "#src/util/errors.js";
import { inlineCode } from "#src/util/markup.js";
import { Flags } from "@oclif/core";
import { DEFAULT_UPLINK, PACKAGE_ACCESS, ROLES, findConfigFile, fromJStoYAML } from "@verdaccio/config";
import { writeFile } from "node:fs/promises";
import { parseConfigFile } from "verdaccio";

const HOST = "__BS_HOST_PLACEHOLDER__";
const PORT = "__BS_PORT_PLACEHOLDER__";

export default class RegistrySetupCommand extends BaseCommand<typeof RegistrySetupCommand> {
  static override aliases = ["registry:create", "registry:install", "registry:init"];

  static override description = `Installs verdaccio to host the registry, pm2 to run it in the background, and updates the verdaccio config to allow fake authorization access.`;

  static override enableJsonFlag = true;

  static override flags = {
    global: Flags.boolean({
      allowNo: true,
      char: "g",
      description: "Install packages in the global space.",
    }),
    host: Flags.string({
      char: "h",
      description: "The host address to use for verdaccio.",
      helpValue: "<string>",
    }),
    pm2: Flags.boolean({
      allowNo: true,
      description: "Install pm2 with pnpm.",
    }),
    port: Flags.integer({
      char: "p",
      description: "The port number to use for verdaccio.",
      helpValue: "<number>",
      max: 65_535,
      min: 0,
    }),
    verdaccio: Flags.boolean({
      allowNo: true,
      description: "Install verdaccio with pnpm.",
    }),
  };

  static override summary = "Setup a local registry with verdaccio/pm2.";

  public async run() {
    this.i("Setting up a local registry");

    const host = this.flags.host ?? UserConfig.registry.host;
    const port = this.flags.port ?? UserConfig.registry.port;
    const verdaccio = this.flags.verdaccio ?? UserConfig.registry.verdaccio;
    const global = this.flags.global ?? UserConfig.registry.global;
    const pm2 = this.flags.pm2 ?? UserConfig.registry.pm2;

    const packages = [];
    if (verdaccio) {
      this.d("Installing verdaccio");
      packages.push("verdaccio");
    }

    if (pm2) {
      this.d("Installing pm2");
      packages.push("pm2");
    }

    if (packages.length > 0) {
      const str = packages.join(" ");
      if (global) {
        this.d("Installing packages globally");
        await pnpm(`add -g ${str}`);
      } else {
        this.d("Installing packages locally");
        await pnpm(`add -D ${str}`);
      }
    } else {
      this.d("Skipping installation of verdaccio and pm2");
    }

    this.d("Loading verdaccio config");
    const verdConfig = parseConfigFile(findConfigFile());

    this.v("Found verdaccio config: %s", verdConfig.configPath);

    this.updateVerdaccioConfig(verdConfig);

    this.d("Converting verdaccio config to a yaml string");
    const str = fromJStoYAML(verdConfig);
    if (!str) {
      this.v("Verdaccio config: %s", JSON.stringify(verdConfig, undefined, 2));

      throw new ApplicationError("Failed to convert verdaccio config to a yaml string.", {
        suggestions: [`Run with ${inlineCode(`--loglevel="trace"`)} to see a stringified version of the config.`],
      });
    }

    this.v("Using host: %s", host);
    this.v("Using port: %d", port);

    const fixedStr = str.replace(`${HOST}: ${PORT}`, `${host}:${port}`);

    this.d("Saving verdaccio config");

    await writeFile(verdConfig.configPath, fixedStr, "utf8");

    this.i("Local registry setup! Run `%s` to start the server.", "pnpm bs registry start");

    return {
      message: "Local registry setup.",
    };
  }

  private updateVerdaccioConfig(config: ConfigYaml) {
    this.d("Updating verdaccio config");

    // allow publishing when the server is offline
    config.publish = {
      allow_offline: true,
    };

    // disable auth, since we're just using it for local testing
    config.packages = {
      ...config.packages,
      [PACKAGE_ACCESS.ALL]: {
        access: [ROLES.$ALL],
        proxy: [DEFAULT_UPLINK],
        publish: [ROLES.$ALL],
      },
      [PACKAGE_ACCESS.SCOPE]: {
        access: [ROLES.$ALL],
        proxy: [DEFAULT_UPLINK],
        publish: [ROLES.$ALL],
      },
    };

    // YAML.dump doesn't propogate this correctly, so we need to fix it after building the string
    config.listen = {
      [HOST]: PORT,
    };
  }
}
