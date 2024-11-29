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

declare type ObjectKey<T extends object> = keyof T;
declare type ObjectValue<T extends object> = T[ObjectKey<T>];
declare type ObjectValues<T extends object> = Array<ObjectValue<T>>;
declare type LowercaseKeys<T extends object> = {
  [K in keyof T as K extends string ? Lowercase<K> : never]: T[K];
};
declare type ObjectKeys<T extends object> = Array<ObjectKey<T>>;
declare type LowercaseObjectKeys<T extends object> = ObjectKeys<LowercaseKeys<T>>;

declare type InferArrayType<T extends unknown[]> = T extends (infer V)[] ? V : never;
