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
import { pnpm } from "#src/util/apps.js";
import { tempFile } from "#src/util/files.js";
import { FlagBuilder } from "#src/util/flag-builder.js";
import { Flags } from "@oclif/core";
import { readFile } from "node:fs/promises";

export default class ChangeStatusCommand extends BaseCommand<typeof ChangeStatusCommand> {
  static override aliases = ["change:info", "change:dump"];

  static override enableJsonFlag = true;

  static override flags = {
    output: Flags.string({
      char: "o",
      description: "Save pending changes to a JSON file.",
      helpValue: "<path>",
    }),
    since: Flags.string({
      description: "Only display information about changes since a specific branch or git tag.",
      helpValue: "<string>",
    }),
    verbose: Flags.boolean({
      char: "v",
      description: "Get information about the new versions and include a link to matching changeset files.",
    }),
  };

  static override summary = "Get information about pending changes for the next release";

  public async run() {
    this.i("Getting changeset status");

    await this.validatePackageInstalled("@changesets/cli");

    const { output, since, verbose } = this.flags;

    const flags = new FlagBuilder();

    flags.addIfPresent("verbose", verbose);

    if (since) {
      this.d("Getting changes since: %s", since);
      flags.add("since", since);
    }

    if (output) {
      this.d("Saving status report to file: %s", output);
      flags.add("output", output);
    }

    if (!output && this.jsonEnabled()) {
      const jsonFilePath = await tempFile();

      flags.add("output", `${jsonFilePath}`);
      await pnpm(["exec", "changeset", "status", ...flags.unpack()]);

      return readFile(jsonFilePath, "utf8").then((it) => JSON.parse(it));
    }

    await pnpm(`exec changeset status ${flags}`, false);

    return {
      message: "Changeset report generated.",
      reportFile: output,
    };
  }
}
