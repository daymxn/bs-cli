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

import { withDefaults } from "#src/util/zod.js";
import { z } from "zod";

const LoggingSchema = z.object({
  debug: z.ostring().default("#238a51"),
  error: z.ostring().default("redBright"),
  info: z.ostring().default("#4cc6ff"),
  symbols: z.ostring().default("#727272"),
  trace: z.ostring().default("#a3a3a3"),
  warning: z.ostring().default("#e4bc50"),
});

const prefix = (color: string, bg: string) =>
  withDefaults(
    z.object({
      background: z.ostring().default(bg),
      color: z.ostring().default(color),
    })
  );

const TestsSchema = z.object({
  prefix: withDefaults(
    z.object({
      fail: prefix("white", "bgRed"),
      pass: prefix("#000000", "bgGreen"),
      skip: prefix("white", "bgYellow"),
    })
  ),
  text: withDefaults(
    z.object({
      fail: z.ostring().default("red"),
      pass: z.ostring().default("green"),
      skip: z.ostring().default("blue"),
    })
  ),
});

export const UserThemeSchema = z
  .object({
    logging: withDefaults(LoggingSchema),
    tests: withDefaults(TestsSchema),
  })
  .passthrough();

export type UserTheme = z.infer<typeof UserThemeSchema>;
