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

export function keys<T extends object>(object: T): ObjectKeys<T> {
  return Object.keys(object) as ObjectKeys<T>;
}

export function values<T extends object>(object: T): ObjectValues<T> {
  return Object.values(object);
}

export function lowercaseKeys<T extends object>(object: T): LowercaseObjectKeys<T> {
  return keys(object).map((it) => it.toString().toLowerCase()) as never;
}

export function withLowercaseKeys<T extends object>(object: T): LowercaseKeys<T> {
  return Object.fromEntries(entries(object).map((it) => it[0].toString().toLowerCase()) as never) as never;
}

export function entries<T extends object>(object: T): Array<[ObjectKey<T>, ObjectValue<T>]> {
  return Object.entries(object) as never;
}

export function jsonToString(json: object, pretty: boolean = true) {
  return pretty ? JSON.stringify(json, undefined, 2) : JSON.stringify(json);
}
