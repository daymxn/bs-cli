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

import { DEFAULT_CONFIG_LOCATION } from "#src/util/constants.js";
import { merge } from "lodash-es";
import { readFileSync } from "node:fs";
import { writeFile } from "node:fs/promises";
import { zodToJsonSchema } from "zod-to-json-schema";

import {
  ApplicationError,
  extendError,
  instanceOfNodeError,
} from "../util/errors.js";
import { byProxy } from "../util/lazy.js";
import { formatErrors } from "../util/zod.js";
import { Config, ConfigSchema } from "./schema.js";

function loadConfigFile(path: string) {
  try {
    return readFileSync(path, "utf8");
  } catch (e) {
    if (instanceOfNodeError(e) && e.code === "ENOENT") return;

    throw extendError(`Failed to load config file at path: ${path}`, e);
  }
}

function decodeConfigFile(fileContents: string) {
  try {
    return JSON.parse(fileContents);
  } catch (e) {
    throw extendError(
      "Failed to decode config file to JSON. Is the syntax correct?",
      e
    );
  }
}

function validateConfig(json: object) {
  const result = ConfigSchema.safeParse(json);
  if (result.success) return result.data;
  throw extendError(
    `Config failed validation:\n${formatErrors(result.error)}`,
    result.error
  );
}

export function loadConfig(path?: string) {
  const targetPath = path ?? DEFAULT_CONFIG_LOCATION;
  const fileContents = loadConfigFile(targetPath);

  if (!fileContents) {
    if (path !== undefined)
      throw new ApplicationError(`Invalid config file path specified: ${path}`);
    return ConfigSchema.parse({});
  }

  const configJson = decodeConfigFile(fileContents);
  const validated = validateConfig(configJson);

  if (path) {
    UserConfig.__replace_proxy_value(validated);
  }

  return validated;
}

type RecursivePartial<T> = {
  [P in keyof T]?: RecursivePartial<T[P]>;
};

export function updateConfig(newConfig: RecursivePartial<Config>) {
  const updatedConfig = merge({}, UserConfig.__proxy_value, newConfig);
  UserConfig.__replace_proxy_value(updatedConfig);
  return updatedConfig;
}

export async function saveConfig(path: string = DEFAULT_CONFIG_LOCATION) {
  return writeFile(path, JSON.stringify(UserConfig.__proxy_value, null, 2));
}

export async function dumpSchema(path: string) {
  return writeFile(
    path,
    JSON.stringify(zodToJsonSchema(ConfigSchema, "Config"), null, 2)
  );
}

export const UserConfig = byProxy(loadConfig);
