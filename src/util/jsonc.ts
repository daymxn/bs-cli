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

import { ParseError, printParseErrorCode } from "jsonc-parser";

function offsetToLineColumn(
  fileContents: string,
  offset: number
): [line: number, column: number] {
  const lines = fileContents.slice(0, offset - 1).split("\n");

  const line = lines.length;
  const column = lines.at(-1)?.length ?? 0 + 1;

  return [line, column];
}

export function convertErrorToString(fileContents: string, error: ParseError) {
  const errorText = printParseErrorCode(error.error);
  const [line, column] = offsetToLineColumn(fileContents, error.offset);

  return `[${line}:${column}] ${errorText}`;
}

export function formatParsingErrors(
  fileContents: string,
  errors: ParseError[]
) {
  return errors.map((it) => convertErrorToString(fileContents, it));
}
