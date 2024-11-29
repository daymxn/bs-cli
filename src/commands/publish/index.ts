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
import { FlagBuilder } from "#src/util/flag-builder.js";
import { Flags } from "@oclif/core";

import ChangePublishCommand from "../change/publish.js";
import PublishLocalCommand from "./local.js";

export default class PublishCommands extends BaseCommand<typeof PublishCommands> {
  static override description = "Running this directly will publish the library.";

  static override enableJsonFlag = true;

  static override flags = {
    "dry-run": Flags.boolean({
      dependsOn: ["local"],
      description: "Perform a test publish without actually pushing the artifacts.",
    }),
    local: Flags.boolean({
      allowNo: true,
      description: "Publish the library to the local repository.",
    }),
    snapshot: Flags.boolean({
      allowNo: true,
      description: "Creates a snapshot release.",
      exclusive: ["local"],
    }),
    tag: Flags.string({
      char: "t",
      description: "NPM tag to use when publishing the package.",
      helpValue: "<string>",
    }),
    token: Flags.string({
      aliases: ["otp"],
      description: "NPM one-time password token.",
      helpValue: "<string>",
    }),
  };

  static override summary = "Commands for handling the publishing of the library.";

  public async run() {
    this.i("Publishing library");
    await this.buildProd();

    const local = this.flags.local ?? UserConfig.release.local;
    const tag = this.flags.tag ?? UserConfig.release.tag;
    const snapshot = this.flags.snapshot ?? UserConfig.release.snapshot;
    const dryRun = this.flags["dry-run"];

    const flags = new FlagBuilder();

    if (tag) {
      flags.add("tag", tag);
    }

    flags.addIfPresent("dry-run", dryRun);

    if (local) {
      return PublishLocalCommand.run(flags.unpack(), this.config);
    }

    if (snapshot !== undefined) {
      if (snapshot) {
        flags.add("snapshot");
      } else {
        flags.add("no-snapshot");
      }
    }

    return ChangePublishCommand.run(flags.unpack(), this.config);
  }
}
