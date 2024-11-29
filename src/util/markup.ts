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

import { slug } from "github-slugger";
import { format } from "node:util";

export function codeBlock(code: string, language: string = "") {
  const ticks = "```";
  return `${ticks}${language}\n${code}\n${ticks}`;
}

export function inlineCode(code: string) {
  return `\`${code}\``;
}

export function link(displayName: string, link: string = slug(displayName)) {
  if (link.startsWith("http")) {
    return `[${displayName}](${link})`;
  }

  return format("[%s](#%s)", displayName, link);
}
