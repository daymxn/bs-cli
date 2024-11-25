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
import { pnpm, pnpmJson } from "#src/util/apps.js";
import { makeUrl } from "#src/util/strings.js";
import { Flags } from "@oclif/core";
import { ProcessDescription } from "pm2";

export default class RegistryStartCommand extends BaseCommand<
  typeof RegistryStartCommand
> {
  static override aliases = [
    "registry:startup",
    "registry:spawn",
    "registry:restart",
    "registry:refresh",
  ];

  static override description =
    "When ran without the `--local` flag, this will use the pm2 library to spawn a background service for the server.";

  static override enableJsonFlag = true;

  static override flags = {
    local: Flags.boolean({
      allowNo: true,
      description: "Start the server locally instead of through pm2.",
    }),
    name: Flags.string({
      char: "n",
      description: "Name to use for the pm2 app.",
      helpValue: "<string>",
    }),
  };

  static override summary = "Start the local verdaccio server.";

  public async run() {
    this.i("Starting the verdaccio server");

    const { global } = UserConfig.registry;
    const local = this.flags.local ?? UserConfig.registry.local;
    const name = this.flags.name ?? UserConfig.registry.name;

    await this.validatePackageInstalled("verdaccio");

    if (local) {
      this.d("Starting a local server");

      await pnpm("exec verdaccio");
    } else {
      this.d("Starting a server through pm2");

      await this.validatePackageInstalled("pm2");

      const { host, port } = UserConfig.registry;

      const webpanel = `${host}:${port}`;

      const activeApps = await pnpmJson<ProcessDescription[]>(
        "exec pm2 jlist",
        true
      );
      const app = activeApps.filter((it) => it.name === name);
      if (app.length > 0) {
        if (app.length > 1) {
          this.w(
            "You have multiple apps in pm2 named %s. You may want to run `pm2 delete` to delete some of them.",
            name
          );
        }

        this.d("pm2 app already created, restarting it instead.");

        await pnpm(`exec pm2 restart ${name}`);

        this.i("Server restarted with the name: %s", name);

        this.i("Webpanel should be accessible at: %s", makeUrl(webpanel));

        return {
          message: "Server restarted",
          webpanel,
        };
      }

      this.d("Getting pnpm root");
      const path = await pnpm(`root ${global ? "-g" : ""}`);
      this.v("pnpm root found: %s", path);

      const verdaccioPath = `${path}/verdaccio/build/lib/cli`;
      await pnpm(["exec", "pm2", "start", verdaccioPath, "--name", name]);

      this.i("Server started with the name: %s", name);

      this.i("Webpanel should be accessible at: %s", makeUrl(webpanel));

      return {
        message: "Server started",
        webpanel,
      };
    }

    return {
      message: "Server stopped.",
    };
  }
}
