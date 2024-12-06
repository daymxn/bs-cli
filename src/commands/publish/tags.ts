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
import { Flags } from "@oclif/core";

import { pnpm, run } from "#src/util/apps.js";

export default class PublishTagsCommand extends BaseCommand<typeof PublishTagsCommand> {
  static override enableJsonFlag = true;

  static override flags = {
    push: Flags.boolean({
      allowNo: true,
      description: "Push the tags to github.",
    }),
  };

  static override summary = "Manually generate and push git tags for the current release.";

  public async run() {
    this.i("Generating git tags");

    await pnpm("exec changeset tag");

    this.d("Git tags created");

    if (this.flags.push) {
      this.d("Pushing git tags");

      await run(`git push --follow-tags`);

      this.i("Git tags pushed");

      return {
        message: "Git tags generated and pushed",
      };
    }

    return {
      message: "Git tags generated",
    };
  }
}
