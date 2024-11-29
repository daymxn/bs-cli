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

import { access, copyFile, readFile, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { cwd } from "node:process";
import { fileURLToPath } from "node:url";
import { file } from "tmp-promise";

import { extendError, instanceOfNodeError } from "./errors.js";

interface Env {
  npm_package_homepage?: string;
  npm_package_name?: string;
}

function isLocal() {
  const env = process.env as Env;
  return env.npm_package_name === "@daymxn/bs" && env.npm_package_homepage === "https://github.com/daymxn/bs-cli";
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distFolder = path.resolve(__dirname, "..");
const localPath = "node_modules/@daymxn/bs/dist";
const fallbackResourcePath = isLocal() ? distFolder : localPath;

const resoucePath = (process.env.BS_RESOURCE_PATH ?? fallbackResourcePath) as string;

export function resourceFile(subpath: string) {
  return `${resoucePath}/assets/${subpath}`.replaceAll("\\", "/");
}

/**
 * Safe version of {@link readFile} that catches non existent files.
 *
 * @param path - Path to the file to read from.
 * @returns The file contents or undefined if the file doesn't exist.
 */
export async function readFileSafe(path: string): Promise<string | undefined> {
  return readFile(path, "utf8").catch((e) => {
    if (instanceOfNodeError(e) && e.code === "ENOENT") return undefined;

    throw extendError(`Failed to read file at path: ${path}`, e);
  });
}

export async function existsAsync(path: string): Promise<boolean> {
  return access(path)
    .then(() => true)
    .catch((e) => {
      if (instanceOfNodeError(e) && e.code === "ENOENT") return false;

      throw extendError(`Failed to access file at path: ${path}`, e);
    });
}

export async function backupFile(path: string) {
  const backup = `${path}.backup`;

  return copyFile(path, backup).then(() => backup);
}

export async function restoreFile(backup: string, original: string) {
  await copyFile(backup, original);
  await unlink(backup);
}

/**
 * Create a temp file under the current drive, as a relative path.
 *
 * @remarks
 * Some apps don't support absolute paths. By using a relative path,
 * we can retain support for temp files and still utilize said
 * apps.
 *
 * Furthermore, since relative paths can not cross drives (without symlinks),
 * we need to create a temp file under the same drive we'll be using it from.
 *
 * Since this method returns the path, it's expected that you're
 * calling {@link setGracefulCleanup} somewhere in your code.
 *
 * @returns Relative path to the created temp file.
 */
export async function tempFile() {
  const currentDir = cwd();
  const drive = path.parse(currentDir).root;

  const { path: jsonFilePath } = await file({
    prefix: "bs-cli",
    tmpdir: drive,
  });

  const relativePath = path.relative(currentDir, jsonFilePath);

  return relativePath;
}

export async function writeFileSafe(path: string, content: string, overwrite: boolean = false): Promise<boolean> {
  return writeFile(path, content, {
    encoding: "utf8",
    flag: overwrite ? "w" : "wx",
  })
    .then(() => true)
    .catch((e) => {
      if (instanceOfNodeError(e) && e.code === "EEXIST") return false;

      throw extendError(`Failed to write to file: ${path}`, e);
    });
}

export function unixPath(str: string) {
  return str.replaceAll("\\", "/");
}

export function createPath(basePath: string, ...segments: string[]) {
  if (path.isAbsolute(basePath)) {
    return unixPath(path.resolve(basePath, ...segments));
  }

  return unixPath(path.relative("", path.resolve(basePath, ...segments)));
}
