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
import { pnpm, run } from "#src/util/apps.js";
import { extendError } from "#src/util/errors.js";
import { FlagBuilder } from "#src/util/flag-builder.js";
import { Flags } from "@oclif/core";

export default class ChangePublishCommand extends BaseCommand<
  typeof ChangePublishCommand
> {
  static override description =
    "Uses the `changeset publish` command to perform some automations during publishing (such as generating git tags).";

  static override enableJsonFlag = false;

  static override flags = {
    "git-tag": Flags.boolean({
      allowNo: true,
      description: "Create a git tag when publishing the package.",
    }),
    "push-tag": Flags.boolean({
      allowNo: true,
      description: "Automatically push git tags after publishing.",
    }),
    snapshot: Flags.boolean({
      allowNo: true,
      description: "Creates a snapshot release.",
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

  static override summary = "Publish the library to NPM.";

  public async run() {
    this.i("Publishing changes with changeset");

    await this.validatePackageInstalled("@changesets/cli");

    const gitTags = this.flags["git-tag"] ?? UserConfig.release.gitTags;
    const pushTags =
      gitTags && (this.flags["push-tag"] ?? UserConfig.release.autoPushTags);
    const tag = this.flags.tag ?? UserConfig.release.tag;
    const snapshot = this.flags.snapshot ?? UserConfig.release.snapshot;
    const snapshotTag = snapshot && tag ? tag : undefined;
    const { token } = this.flags;

    const flags = new FlagBuilder();

    if (!gitTags) {
      this.d("Not creating git tags");
      flags.add("no-git-tag");
    } else if (!pushTags) {
      this.d("Auto push git tags disabled");
    }

    if (token) {
      this.d("Using provided OTP token");
      flags.add("otp", token);
    }

    if (snapshot) {
      flags.add("snapshot");

      if (snapshotTag) {
        this.d("Publishing a snapshot release with the tag: %s", snapshotTag);
        flags.add("tag", snapshotTag);
      } else {
        this.d("Publishing a snapshot release");

        this.w(
          "You're publishing a snapshot release without a tag. This will update the latest tag to point to your snapshot release."
        );
      }
    } else if (tag) {
      this.d("Publishing a release with the tag: %s", tag);
      flags.add("tag", tag);
    }

    await pnpm(`exec changeset publish ${flags}`, false).catch((e) => {
      throw extendError("Failed to publish changes", e);
    });

    if (pushTags) {
      this.d("Pushing git tags");
      await run("git push --follow-tags");
    }
  }
}
