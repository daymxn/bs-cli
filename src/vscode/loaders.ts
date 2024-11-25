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

import { formatParsingErrors } from "#src/util/jsonc.js";
import { ParseError, applyEdits, modify, parse } from "jsonc-parser";

import { ApplicationError } from "../util/errors.js";
import { VSCodeSettings, VSCodeSettingsSchema } from "./schema.js";

export async function parseVSCodeSettings(fileContents: string) {
  const errors: ParseError[] = [];
  const parsedSettings = parse(fileContents, errors, {
    allowEmptyContent: true,
    allowTrailingComma: true,
    disallowComments: false,
  });

  if (errors.length > 0) {
    throw new ApplicationError(`Failed to parse VSCode settings file.`, {
      suggestions: formatParsingErrors(fileContents, errors),
    });
  }

  return VSCodeSettingsSchema.parse(parsedSettings);
}

export function updateSettings(
  originalContent: string,
  updatedSettings: VSCodeSettings
) {
  const edits = modify(originalContent, [], updatedSettings, {
    formattingOptions: { insertSpaces: true, tabSize: 2 },
  });

  return applyEdits(originalContent, edits);
}
