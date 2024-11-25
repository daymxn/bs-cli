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

export default class ChangeVersionCommand extends BaseCommand<
  typeof ChangeVersionCommand
> {
  static override aliases = ["change:bump", "change:collect"];

  static override description =
    "This should run before the actual publishing of any packages.";

  static override enableJsonFlag = true;

  static override examples = [
    "<%= config.bin %> <%= command.id %>",
    {
      command: `<%= config.bin %> <%= command.id %> --snapshot -t "nightly"`,
      description: "Create a snapshot release",
    },
  ];

  static override flags = {
    ignore: Flags.string({
      description: "Ignore changes from a specific package.",
      helpValue: "<string>",
    }),
    snapshot: Flags.boolean({
      description: "Create a snapshot release.",
    }),
    tag: Flags.string({
      aliases: ["prefix"],
      char: "t",
      dependsOn: ["snapshot"],
      description: "Snapshot tag to use.",
      helpValue: "<string>",
    }),
  };

  static override summary =
    "Consume changelog files to determine (and update) the version of releasing packages.";

  public async run() {
    this.i("Bumping versions for packages releasing");

    await this.validatePackageInstalled("@changesets/cli");

    const ignore = this.flags.ignore ?? UserConfig.release.ignorePackage;
    const snapshot = this.flags.snapshot ?? UserConfig.release.snapshot;
    const tag = this.flags.tag ?? UserConfig.release.tag;

    const flags = new FlagBuilder();

    if (ignore) {
      this.d("Ignoring changes from package: %s", ignore);
      flags.add("ignore", ignore);
    }

    if (snapshot) {
      if (tag) {
        this.d("Bumping for a snapshot release with the tag: %s", tag);
        flags.add("snapshot", tag);
      } else {
        this.d("Bumping for a snapshot release");
        flags.add("snapshot");
      }
    }

    this.v("Running changeset version");
    await pnpm(`exec changeset version ${flags}`);

    return {
      message: "Versions bumped.",
    };
  }
}
