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

export default class PublishLocalCommand extends BaseCommand<typeof PublishLocalCommand> {
  static override description = `The local copy is published under the assumption you're using verdaccio.
If you need help setting up a server, you can use the \`bs registry\` subcommands.`;

  static override enableJsonFlag = true;

  static override flags = {
    "dry-run": Flags.boolean({
      description: "Perform a test publish without actually pushing the artifacts.",
    }),
    tag: Flags.string({
      char: "t",
      description: "NPM tag to use when publishing the package.",
      helpValue: "<string>",
    }),
  };

  static override summary = "Publish the library to the local repository.";

  public async run() {
    this.i("Publishing library locally");

    const tag = this.flags.tag ?? UserConfig.release.tag;
    const dryRun = this.flags["dry-run"];

    const flags = new FlagBuilder(["no-git-checks"]);

    if (tag) {
      this.d("Publishing under the tag: %s", tag);
      flags.add("tag", tag);
    }

    if (dryRun) {
      this.d("Performing a dry run");
      flags.add("dry-run");
    }

    const { host, port } = UserConfig.registry;
    const registry = `http://${host}:${port}`;

    this.d("Publishing to registry: %s", registry);
    flags.add("registry", registry);

    await pnpm(["publish", ...flags.unpack()], false);

    this.i("Package published");

    return {
      message: "Library published.",
    };
  }
}
