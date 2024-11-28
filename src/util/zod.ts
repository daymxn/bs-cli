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

import { ZodError, ZodObject, ZodRawShape, ZodSchema, preprocess } from "zod";

export function withDefaults<T extends ZodObject<ZodRawShape>>(schema: T) {
  return preprocess((value) => (value === undefined ? schema.parse({}) : value), schema);
}

export function defaultNull<T>(schema: ZodSchema<T>) {
  // eslint-disable-next-line unicorn/no-null
  return schema.nullish().default(null);
}

export function formatErrors(e: ZodError) {
  const issues = e.issues.map((it) => `${it.path.join(".")}: ${it.message}`);
  return issues.join("\n");
}
