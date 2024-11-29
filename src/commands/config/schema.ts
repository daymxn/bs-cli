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
import { dumpSchema } from "#src/user-config/loaders.js";
import { DEFAULT_CONFIG_LOCATION } from "#src/util/constants.js";
import { createPath, readFileSafe, unixPath } from "#src/util/files.js";
import { parseVSCodeSettings, updateSettings } from "#src/vscode/loaders.js";
import { Flags } from "@oclif/core";
import { writeFile } from "node:fs/promises";
import path from "node:path";

const SCHEMA_FILE = "bs-config-schema.json";

export default class ConfigSchemaCommand extends BaseCommand<typeof ConfigSchemaCommand> {
  static override description =
    "The json schema provides autocomplete and documentation in most IDEs while you're using the config file, which makes it easier to edit.";

  static override enableJsonFlag = true;

  static override flags = {
    output: Flags.string({
      char: "o",
      default: ".vscode",
      description: "Output directory to save the schema file to.",
      helpValue: "<path>",
    }),
    settings: Flags.string({
      default: ".vscode/settings.json",
      description: "Path to the VSCode workspace settings.",
      helpValue: "<path>",
    }),
    "update-vscode": Flags.boolean({
      allowNo: true,
      default: true,
      description: "Add the json schema to your VSCode workspace settings.",
    }),
  };

  static override summary = "Save a local json schema of the config file.";

  public async run() {
    this.i("Saving json schema for config");

    const { output, settings, "update-vscode": updateVscode } = this.flags;
    const fullPath = path.resolve(createPath(output!, SCHEMA_FILE));

    this.v("Saving schema to file: %s", fullPath);

    await dumpSchema(fullPath);

    if (!updateVscode) {
      return {
        message: "Schema saved.",
        path: fullPath,
      };
    }

    this.d("Updating local VSCode settings");

    const configFileName = this.findConfigFileName();

    const originalSettings = await readFileSafe(settings!).then((it) => it ?? "{}");
    const vscode = await parseVSCodeSettings(originalSettings);

    const relativePath = unixPath(path.relative(".", fullPath));

    const existingSchema = vscode["json.schemas"].find((it) => it.fileMatch.some((it) => it.includes(configFileName)));

    if (existingSchema) {
      this.v("Found existing schema: %j", existingSchema);

      existingSchema.url = relativePath;
    } else {
      this.v("No existing schema found, creating one");

      vscode["json.schemas"].push({
        fileMatch: [`/${configFileName}`],
        url: relativePath,
      });
    }

    this.d("Saving updated vscode settings");

    const updatedContent = updateSettings(originalSettings, vscode);

    await writeFile(settings!, updatedContent);

    return {
      message: "Schema saved.",
      path: fullPath,
    };
  }

  private findConfigFileName() {
    const configPath = this.flags.config;
    if (!configPath) {
      return DEFAULT_CONFIG_LOCATION;
    }

    return path.parse(configPath).base;
  }
}
