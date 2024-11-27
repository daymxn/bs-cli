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

import { BaseCommand } from "#src/commands/base-command.js";
import { UserConfig } from "#src/user-config/loaders.js";
import { withAsyncIterable } from "#src/util/async-collecter.js";
import { extendError, instanceOfNodeError } from "#src/util/errors.js";
import { inlineCode } from "#src/util/markup.js";
import { Flags } from "@oclif/core";
import { Dirent, createReadStream } from "node:fs";
import { mkdir, readdir, writeFile } from "node:fs/promises";
import { parse, resolve } from "node:path";
import { createInterface } from "node:readline/promises";

export default class DocsFixCommand extends BaseCommand<typeof DocsFixCommand> {
  static override description =
    "Markdown files generated from `api-documenter` have various issues that cause rendering issues in docusaurus.";

  static override enableJsonFlag = true;

  static override flags = {
    input: Flags.string({
      char: "i",
      description: "Folder containing the generated markdown files to process.",
      helpValue: "<path>",
    }),
    output: Flags.string({
      char: "o",
      description: "Folder to export the fixed markdown files to.",
      helpValue: "<path>",
    }),
  };

  static override summary =
    "Perform various fixes on the generated markdown files so that they can be used with docusaurus.";

  public async run() {
    if (!UserConfig.docs) {
      this.d("Skipping doc fixing since docs are disabled.");
      return { message: "Docs are disabled." };
    }

    this.i("Fixing markdown issues in docs for public API");

    const input = this.flags.input ?? UserConfig.docs.output;
    const output = this.flags.output ?? UserConfig.docs.wikiPath;

    this.d("Loading files in input directory: %s", input);

    const files = await readdir(input, { withFileTypes: true }).catch((e) => {
      if (instanceOfNodeError(e) && e.code === "ENOENT") {
        throw extendError(`Input directory doesn't exist: ${input}`, e, [
          `Make sure to run ${inlineCode("bs docs:generate")} first.`,
        ]);
      }

      throw extendError(`Failed to read input file directory: ${input}`, e);
    });

    await Promise.all(files.map((it) => this.processFile(it, output)));

    return {
      fixedFolder: output,
      message: "Markdown issues fixed in public API docs.",
    };
  }

  private async processFile(targetFile: Dirent, outputDir: string) {
    const fullPath = resolve(targetFile.parentPath, targetFile.name);

    const { ext, name } = parse(fullPath);

    if (ext !== ".md") {
      this.v("Skipping non markdown file: %s", fullPath);
      return;
    }

    this.v("Processing file: %s", fullPath);

    const lines = createInterface({
      crlfDelay: Number.POSITIVE_INFINITY,
      input: createReadStream(fullPath),
    });

    let title = "";

    const output = await withAsyncIterable(lines)
      .map((it) => processLine(it, name))
      .filterUndefined()
      .onEach((it) => {
        if (!title) {
          title = extractTitle(it) || title;
        }
      })
      .collect();

    lines.close();

    const header = [
      "---",
      `id: ${name}`,
      `title: ${title}`,
      `hide_title: true`,
      "---",
    ];

    await mkdir(outputDir, { recursive: true });

    const outputPath = resolve(outputDir, targetFile.name);

    this.v("Saving file: %s", outputPath);
    await writeFile(outputPath, [...header, ...output].join("\n"));

    this.v("File updated: %s => %s", fullPath, outputPath);
  }
}

// https://github.com/microsoft/rushstack/issues/2986
function fixMarkdown(line: string): string {
  return line.replaceAll(/(\\(\*))|(\\(_))/g, "$2$4");
}

function fixLinks(line: string): string {
  return line.replaceAll(/\\\[(.*?)\\]\((https?:\/\/.*?)\\?\)/g, "[$1]($2)");
}

function fixMarkdownHeaders(line: string): string {
  return line.replaceAll(/(\\#+)/g, (match) => match.replaceAll("\\", ""));
}

function fixTables(line: string): string {
  return line.startsWith("|") ? line.replaceAll("\\|", "&#124;") : line;
}

function fixMarkdownLists(line: string): string {
  return line.replaceAll(/(\d+\.\s+.+?)(?=\s*\d+\.|$)/g, "$1\n");
}

function extractTitle(line: string): string | undefined {
  const match = line.match(/## (.*)/);
  return match?.[1];
}

function processLine(line: string, name: string): string | undefined {
  if (line.startsWith("<!--")) return undefined;

  const fixedLine = fixTables(
    fixMarkdownLists(fixMarkdownHeaders(fixLinks(fixMarkdown(line))))
  );

  const homeLinkMatch = fixedLine.match(/\[Home]\(.\/index\.md\) &gt; (.*)/);
  if (homeLinkMatch && homeLinkMatch[0]) {
    return name === "expect" ? undefined : homeLinkMatch[1];
  }

  return fixedLine;
}
