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

import {
  LogLevel,
  defaultNull,
  resourceFile,
  withDefaults,
} from "#src/util/index.js";
import { z } from "zod";

const transformersSchema = z
  .object({
    combineModuleAugmentations: z
      .oboolean()
      .default(true)
      .describe("Combine module augmentations under the same namespace."),
    fixIdentifierNames: z
      .oboolean()
      .default(true)
      .describe("Remove the leading `$` from identifier names when present."),
    packageDocs: z
      .oboolean()
      .default(true)
      .describe(
        "Prepend the package documentation from the index file to the rollup file."
      ),
  })
  .describe("Configuration for rollup transformers.");

const apiSchema = z
  .object({
    apiDir: z
      .ostring()
      .default("./api")
      .describe("Directory where <project>.api.md files will be stored."),
    apiFile: defaultNull(z.string()).describe(
      "Explicit path to an .api.md file to use."
    ),
    report: z
      .ostring()
      .default("./api-diff.txt")
      .describe("File to save API reports to."),
    rollup: z
      .ostring()
      .default("./dist/index.d.ts")
      .describe("Path to the generated rollup."),
    source: z
      .ostring()
      .default("./src/index.ts")
      .describe("Root index file for the library."),
    transformers: withDefaults(transformersSchema),
  })
  .describe("Configuration for API related commands.");

const lintSchema = z
  .object({
    cache: z.oboolean().default(false).describe("Only check changed files."),
    config: defaultNull(z.string()).describe("Path to the eslint config file."),
    patterns: z
      .optional(z.array(z.string()))
      .default(["."])
      .describe("Pattern to use in finding files to run against."),
  })
  .describe("Configuration for lint related commands.");

const registrySchema = z
  .object({
    global: z
      .oboolean()
      .default(true)
      .describe(
        "Install and manage packages verdaccio/pm2 in the global space."
      ),
    host: z
      .ostring()
      .default("0.0.0.0")
      .describe("The host address to use for verdaccio."),
    local: z
      .oboolean()
      .default(false)
      .describe("Start the server locally instead of through pm2."),
    name: z
      .ostring()
      .default("verdaccio")
      .describe("Name to use for the pm2 app."),
    pm2: z.oboolean().default(true).describe("Install pm2 with pnpm."),
    port: z
      .onumber()
      .default(4873)
      .describe("The port number to use for verdaccio."),
    scope: z
      .ostring()
      .default("@rbxts")
      .describe("Only route for packages under a specific scope."),
    verdaccio: z
      .oboolean()
      .default(true)
      .describe("Install verdaccio with pnpm."),
  })
  .describe("Configuration for the local registry and related commands.");

const releaseSchema = z
  .object({
    autoPushTags: z
      .oboolean()
      .default(false)
      .describe("Automatically push git tags after publishing."),
    gitTags: z
      .oboolean()
      .default(true)
      .describe("Create a git tag when publishing the package."),
    ignorePackage: defaultNull(z.string()).describe(
      "Ignore changes from a specific package."
    ),
    local: z
      .oboolean()
      .default(false)
      .describe(
        "Publish to the local registry instead of the remote npm registry."
      ),
    snapshot: z
      .oboolean()
      .default(false)
      .describe("Create a snapshot release."),
    tag: defaultNull(z.string()).describe(
      "NPM tag to use when publishing the package."
    ),
  })
  .describe("Configuration for release commands.");

const docsSchema = z
  .object({
    apiFolder: z
      .ostring()
      .default("./dist")
      .describe("Folder containing *.api.json files from api-extractor."),
    output: z
      .ostring()
      .default("./dist/docs")
      .describe("Folder to store generated markdown files to."),
    wikiPath: z
      .ostring()
      .default("./wiki/docs/api")
      .describe(
        "Path to the docs section of the wiki where API files are stored."
      ),
  })
  .describe("Configuration for wiki related commands.");

const testsSchema = z
  .object({
    console: z
      .oboolean()
      .default(true)
      .describe("Log the result of the tests to the console."),
    jsonReportPath: z
      .ostring()
      .default("./report.json")
      .describe("Export a copy of the test report as a json file."),
    markdownReportPath: z
      .ostring()
      .default("./report.md")
      .describe("Export a copy of the test report as a markdown file."),
    rbxlOutputPath: z
      .ostring()
      .default(resourceFile("tests/test.rbxl"))
      .describe("Where to save the rbxl file generated from rojo to."),
    rebuild: z
      .oboolean()
      .default(true)
      .describe("Rebuild the test files before running tests."),
    rojoProject: z
      .ostring()
      .default("./test.project.json")
      .describe("Rojo project.json file to build with."),
    showPass: z
      .oboolean()
      .default(true)
      .describe("Show passed tests in the console output."),
    showSkip: z
      .oboolean()
      .default(true)
      .describe("Show skipped tests in the console output."),
    testsPath: z
      .ostring()
      .default(resourceFile("tests/lune"))
      .describe("Directory with a lune script to invoke."),
    trim: z
      .oboolean()
      .default(true)
      .describe(
        "If all tests share a common category, trim it from the output."
      ),
  })
  .describe("Configuration for test related commands.");

const globalSchema = z
  .object({
    build: z.oboolean().default(true).describe("Toggle build related tasks."),
    dev: z
      .oboolean()
      .default(false)
      .describe("Use the dev build of your library."),
    docs: z
      .oboolean()
      .default(true)
      .describe("Toggle jsdoc/wiki related tasks."),
    json: defaultNull(z.boolean()).describe("Toggle JSON only responses."),
    logLevel: z
      .optional(LogLevel)
      .default("trace")
      .describe("Set the minimum log level to log."),
    rollup: z.oboolean().default(true).describe("Toggle rollup related tasks."),
    silence: z
      .oboolean()
      .default(true)
      .describe("Disable logging from external tooling."),
    trace: z
      .oboolean()
      .default(false)
      .describe("Toggle stack trace logging for errors."),
    tty: defaultNull(z.boolean()).describe(
      "Force toggle TTY exclusive behaviors."
    ),
  })
  .describe("Configuration for global flags.");

export const ConfigSchema = z
  .object({
    api: withDefaults(apiSchema),
    docs: withDefaults(docsSchema),
    global: withDefaults(globalSchema),
    lint: withDefaults(lintSchema),
    registry: withDefaults(registrySchema),
    release: withDefaults(releaseSchema),
    tests: withDefaults(testsSchema),
  })
  .describe("Configuration for the bs cli.");

export type Config = z.infer<typeof ConfigSchema>;
