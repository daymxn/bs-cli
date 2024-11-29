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

import { clamp } from "lodash-es";
import { z } from "zod";

export const LogLevel = z.enum(["trace", "debug", "info", "warning", "error"] as const);

export type LogLevel = z.infer<typeof LogLevel>;

export const LogLevelMapping: Record<LogLevel, number> = Object.fromEntries(
  LogLevel.options.map((level, index) => [level, index]),
) as Record<LogLevel, number>;

export function logLevelIsGreater(source: LogLevel, target: LogLevel) {
  return LogLevelMapping[source] > LogLevelMapping[target];
}

export function coerceLevelNumber(level: number) {
  return LogLevel.options.at(clamp(level, 0, LogLevel.options.length))!;
}

export function reduceSubWarning(level: LogLevel) {
  if (LogLevelMapping[level] >= LogLevelMapping.warning) return level;

  return coerceLevelNumber(LogLevelMapping[level] - 1);
}
