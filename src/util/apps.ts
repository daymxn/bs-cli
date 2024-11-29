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

import { UserConfig } from "#src/user-config/loaders.js";
import { execa } from "execa";

import { ApplicationError } from "./errors.js";

const defaultConfig = {
  windowsVerbatimArguments: true,
};

const pipeConfig = {
  ...defaultConfig,
  stderr: ["pipe", "inherit"],
  stdin: ["pipe", "inherit"],
  stdout: ["pipe", "inherit"],
};

async function execute(command: string, args: string[], silence: boolean) {
  const isSilent = silence || UserConfig.global.json;
  const config = isSilent ? defaultConfig : pipeConfig;

  return execa(command, args, config);
}

export async function run(command: string, silence?: boolean): Promise<string>;
export async function run(command: string, args: string[], silence?: boolean): Promise<string>;

export async function run(command: string, arg2?: boolean | string[], arg3?: boolean): Promise<string> {
  let args: string[];
  let silence: boolean | undefined;

  if (typeof arg2 === "object") {
    args = arg2;
    silence = arg3;
  } else {
    args = [];
    silence = arg2;
  }

  const { stderr, stdout, ...result } = await execute(command, args, silence ?? UserConfig.global.silence);

  if (result.exitCode && result.exitCode !== 0) {
    throw new ApplicationError(stderr || stdout, {
      cause: result.cause,
      exitCode: result.exitCode,
    });
  }

  return stdout || stderr;
}

export async function pnpm(args: string, silence?: boolean): Promise<string>;
export async function pnpm(args: string[], silence?: boolean): Promise<string>;

export async function pnpm(arg1: string | string[], silence?: boolean): Promise<string> {
  if (typeof arg1 === "string") {
    const args = arg1.trim().split(" ");

    return run("pnpm", args, silence);
  }

  return run("pnpm", arg1, silence);
}

export async function pnpmJson<T>(command: string, silence: boolean = UserConfig.global.silence): Promise<T> {
  return pnpm(command, silence).then((it) => JSON.parse(it));
}

export interface Dependency {
  name: string;
  path: string;
  version: string;
}

type ListedDependency = {
  path: string;
  version: string;
};

type ListResult = {
  dependencies?: Record<string, ListedDependency>;
  devDependencies?: Record<string, ListedDependency>;
};

function mapDependency(dep: [string, ListedDependency]): Dependency {
  const [name, info] = dep;
  return {
    name,
    path: info.path,
    version: info.version,
  };
}

function mapDependencyList(deps?: Record<string, ListedDependency>) {
  if (!deps) return [];
  return Object.entries(deps).map(mapDependency);
}

function mapListResult(list: ListResult) {
  return [...mapDependencyList(list.dependencies), ...mapDependencyList(list.devDependencies)];
}

export async function fetchDependencies() {
  const localDeps = await pnpmJson<ListResult[]>("list --json", true).then((list) => mapListResult(list[0]));
  const globalDeps = await pnpmJson<ListResult[]>("list --json -g", true).then((list) => mapListResult(list[0]));

  return [...localDeps, ...globalDeps] as Dependency[];
}
