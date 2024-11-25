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
import { ApplicationError } from "#src/util/errors.js";
import { existsAsync } from "#src/util/files.js";
import { Flags } from "@oclif/core";
import { findConfigFile } from "@verdaccio/config";
import { readdir, rm } from "node:fs/promises";
import { dirname, isAbsolute, resolve } from "node:path";
import { parseConfigFile } from "verdaccio";

import RegistryStopCommand from "./stop.js";
import RegistryUpstreamCommand from "./upstream.js";

export default class RegistryCleanCommand extends BaseCommand<
  typeof RegistryCleanCommand
> {
  static override aliases = [
    "registry:delete",
    "registry:uninstall",
    "registry:remove",
  ];

  static override description = `
Will automatically stop the server before uninstalling.
Note: This will NOT uninstall pm2, as you may be using that for other things.`.trim();

  static override enableJsonFlag = true;

  static override flags = {
    global: Flags.boolean({
      allowNo: true,
      char: "g",
      description: "Uninstall verdaccio globally.",
    }),
    scope: Flags.string({
      dependsOn: ["storage"],
      description:
        "Specify a scope to remove, instead of removing all of them.",
      helpValue: "<string>",
    }),
    storage: Flags.boolean({
      allowNo: true,
      description:
        "Only remove published packages, instead of uninstalling verdaccio as a whole.",
    }),
  };

  static override summary =
    "Remove the local verdaccio repo, or delete published packages.";

  public async run() {
    this.i("Cleaning up verdaccio");

    const global = this.flags.global ?? UserConfig.registry.global;
    const scope = this.flags.scope ?? UserConfig.registry.scope;
    const { storage } = this.flags;

    if (storage) {
      this.d("Only removing packages");

      if (scope) {
        this.d("Only removing packages for the scope: %s", scope);
      } else {
        this.d("Removing all packages");
      }

      await this.removePackages(scope);

      return {
        message: "Packages removed",
      };
    }

    this.d("Stopping server");

    await RegistryStopCommand.run([], this.config);

    this.d("Resetting upstream");

    await RegistryUpstreamCommand.run(["--reset"], this.config);

    if (global) {
      this.d("Uninstalling verdaccio globally");
      await pnpm("uninstall -g verdaccio");
    } else {
      this.d("Uninstalling verdaccio locally");
      await pnpm("uninstall verdaccio");
    }

    return {
      message: "Verdaccio uninstalled.",
    };
  }

  private getStoragePath(configPath: string, storagePath: string) {
    if (isAbsolute(storagePath)) return storagePath;
    return resolve(dirname(configPath), storagePath);
  }

  private async removePackages(scope?: string) {
    this.d("Loading verdaccio config");

    const configFilePath = findConfigFile();
    const verdConfig = parseConfigFile(configFilePath);

    this.v("Verdaccio config file found: %s", configFilePath);

    if (!verdConfig.storage) {
      throw new ApplicationError(
        "Verdaccio config doesn't have a storage set. We can't determine where the packages are stored.",
        {
          suggestions: ["You may have to manually delete the packages."],
        }
      );
    }

    const storagePath = this.getStoragePath(configFilePath, verdConfig.storage);
    this.v("Storage file path: %s", storagePath);

    if (!(await existsAsync(storagePath))) {
      this.d("Storage already deleted.");
      return;
    }

    const files = await readdir(storagePath, { withFileTypes: true });
    const deleteFiles = files
      .filter((file) => {
        if (!file.isDirectory()) {
          this.v("Skipping non directory file: %s", file.name);
          return false;
        }

        if (scope !== undefined && file.name !== scope) {
          this.v(
            "Skipping directory as it has a different scope: %s",
            file.name
          );
          return false;
        }

        return true;
      })
      .map((file) => {
        this.v("Deleting packages for: %s", file.name);
        const fullPath = resolve(storagePath, file.name);
        this.v(`Full path: %s`, fullPath);
        return rm(resolve(storagePath, file.name), {
          force: true,
          recursive: true,
        });
      });

    await Promise.all(deleteFiles);

    this.d("Packages removed");
  }
}
