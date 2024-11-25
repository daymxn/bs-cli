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
import { ApplicationError } from "#src/util/errors.js";
import { readFileSafe } from "#src/util/files.js";
import {
  Transformer,
  transformCombineAugmentations,
  transformIdentifierNames,
} from "#src/util/index.js";
import { Flags } from "@oclif/core";
import { writeFile } from "node:fs/promises";
import {
  Node,
  ScriptTarget,
  createPrinter,
  createSourceFile,
  isJSDoc,
} from "typescript";

export default class RollupFixCommand extends BaseCommand<
  typeof RollupFixCommand
> {
  static override description =
    "Useful for fixing open bugs in tsup, or covering features not normally desired outside the rbxts ecosystem.";

  static override enableJsonFlag = true;

  static override flags = {
    combineAugmentations: Flags.boolean({
      allowNo: true,
      default: true,
      description: "Combine module augmentations under the same namespace.",
    }),
    identifierNames: Flags.boolean({
      allowNo: true,
      default: true,
      description: "Remove the leading `$` from identifier names when present.",
    }),
    input: Flags.string({
      description: "Path to the generated rollup file.",
      helpValue: "<path>",
    }),
    packageDocs: Flags.boolean({
      allowNo: true,
      default: true,
      description:
        "Prepend the package documentation from the index file to the rollup file.",
    }),
    source: Flags.string({
      description: "Path to the root index.ts file.",
      helpValue: "<path>",
    }),
  };

  static override summary = "Apply various fixes to the generated rollup file.";

  public async run() {
    if (!UserConfig.global.rollup) {
      this.d("Rollups are disabled, so we're skipped the rollup fix step");
      return { message: "Rollups are disabled." };
    }

    this.i("Fixing API rollup");

    await this.build();

    const source = this.flags.source ?? UserConfig.api.source;
    const rollup = this.flags.input ?? UserConfig.api.rollup;

    const identifierNames =
      this.flags.identifierNames ??
      UserConfig.api.transformers.fixIdentifierNames;

    const moduleAugmentation =
      this.flags.combineAugmentations ??
      UserConfig.api.transformers.combineModuleAugmentations;

    const packageDocs =
      this.flags.packageDocs ?? UserConfig.api.transformers.packageDocs;

    this.v("Using source file: %s", source);
    this.v("Using rollup file: %s", rollup);

    const sourceContents = await readFileSafe(source);
    if (sourceContents === undefined) {
      throw new ApplicationError(
        `Source file doesn't exist at path: ${source}`,
        {
          suggestions: ["This should point to the root index.ts file."],
        }
      );
    }

    this.d("Loaded source file contents");

    const rollupContents = await readFileSafe(rollup);
    if (rollupContents === undefined) {
      throw new ApplicationError(
        `Rollup file doesn't exist at path: ${rollup}`,
        {
          suggestions: ["You might need to run `bs rollup generate` first."],
        }
      );
    }

    this.d("Loaded rollup file contents");

    const sourceFile = createSourceFile(
      source,
      sourceContents,
      ScriptTarget.Latest,
      true
    );
    const rollupFile = createSourceFile(
      rollup,
      rollupContents,
      ScriptTarget.Latest,
      true
    );

    const transformers: Transformer[] = [];

    if (identifierNames) {
      transformers.push((it) => {
        this.d("Fixing identifier names");
        return transformIdentifierNames(it);
      });
    }

    if (moduleAugmentation) {
      transformers.push((it) => {
        this.d("Combining duplicate module augmentations");
        return transformCombineAugmentations(it);
      });
    }

    const result = transformers.reduceRight(
      (node, transform) => transform(node),
      rollupFile
    );

    this.d("Creating output content");
    let outputContent = createPrinter().printFile(result);

    if (packageDocs) {
      this.d("Getting package docs");

      const docs = getPackageDocs(sourceFile);
      if (docs === undefined) {
        throw new ApplicationError(
          `Missing package docs for source file: ${source}`,
          {
            suggestions: [
              "Add a `@packageDocumentation` to the root index.ts file describing your library.",
              "Disable package doc prepending in your config to avoid this behavior.",
              "https://tsdoc.org/pages/tags/packagedocumentation/",
            ],
          }
        );
      }

      if (outputContent.includes(docs)) {
        this.d("Package docs already present, no need to add them");
      } else {
        outputContent = `${docs}\n${outputContent}`;
      }
    }

    this.d("Updating rollup file with fixed content");

    await writeFile(rollup, outputContent, "utf8");

    this.d("Rollup file updated: %s", rollup);

    return {
      message: "Rollup file fixed.",
      rollupFilePath: rollup,
    };
  }
}

function getPackageDocs(node: Node): string | undefined {
  if (
    isJSDoc(node) &&
    node.tags?.some((tag) => tag.tagName.text === "packageDocumentation")
  ) {
    return node.getText();
  }

  return node.getChildren().map(getPackageDocs).find(Boolean);
}
