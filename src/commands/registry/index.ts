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

export default class RegistryCommands extends BaseCommand<
  typeof RegistryCommands
> {
  static override description = `
A local registry can be used inplace of npm for testing packages in a local environment before publishing them.

We use verdaccio as the local registry, and pm2 to host the registry in the background.
`.trim();

  static override enableJsonFlag = true;

  static override examples = [
    {
      command: `<%= config.bin %> <%= command.id %> setup`,
      description: "Setup a local registry",
    },
    {
      command: `<%= config.bin %> <%= command.id %> sync`,
      description: "Point your pnpm registry to your local registry",
    },
    {
      command: `<%= config.bin %> <%= command.id %> start`,
      description: "Start the server for your local registry",
    },
  ];

  static override summary =
    "Commands for hosting a local registry with verdaccio.";

  public async run() {
    await this.showHelp();
  }
}
