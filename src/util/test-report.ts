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

import { UserTheme } from "#src/user-theme/schema.js";
import { readFile } from "node:fs/promises";

import { withColors } from "./colors.js";

export type TestStatus = "Failure" | "Skipped" | "Success";

export type TestType = "category" | "node";

export interface TestResult {
  category: string;
  error: string;
  name: string;
  result: TestStatus;
}

export interface TestReport {
  fail: TestResult[];
  pass: TestResult[];
  skip: TestResult[];
}

export async function parseFromJson(file: string): Promise<TestReport> {
  const contents = await readFile(file, "utf8");

  const parsed = JSON.parse(contents) as TestReport;

  if (!Array.isArray(parsed.pass)) parsed.pass = [];
  if (!Array.isArray(parsed.fail)) parsed.fail = [];
  if (!Array.isArray(parsed.skip)) parsed.skip = [];

  return parsed;
}

export function createColors(theme: UserTheme) {
  const colors = theme.tests;
  const prefixColors = colors.prefix;
  const textColors = colors.text;

  const prefix = {
    Failure: withColors("bold", prefixColors.fail.background, prefixColors.fail.color)(" FAIL "),
    Skipped: withColors("bold", prefixColors.skip.background, prefixColors.skip.color)(" SKIP "),
    Success: withColors("bold", prefixColors.pass.background, prefixColors.pass.color)(" PASS "),
  };

  const names = {
    Failure: withColors(textColors.fail),
    Skipped: withColors(textColors.skip),
    Success: withColors(textColors.pass),
  };

  return {
    names,
    prefix,
  };
}

type ColorPanel = ReturnType<typeof createColors>;

export abstract class Tree {
  constructor(
    public result: TestStatus,
    public name: string,
    public colors: ColorPanel,
    public parent?: Tree,
    public children: Map<string, Tree> = new Map(),
  ) {}

  public static fromTestResults(tests: TestResult[], colors: ColorPanel) {
    const tree = new CategoryTree("Results", colors);
    for (const it of tests) tree.addTest(it);
    tree.updateResult();

    return tree;
  }

  public get coloredName() {
    return this.colors.names[this.result](this.name);
  }

  public addChild(node: Tree) {
    node.parent = this;
    this.children.set(node.name, node);

    return node;
  }

  public addTest(test: TestResult) {
    const categoryParts = test.category.split(".");
    const finalCategory = categoryParts.reduce<Tree>((parent, current) => {
      const maybeCurrent = parent.children.get(current);
      if (maybeCurrent) return maybeCurrent;

      const category = new CategoryTree(current, this.colors);
      parent.addChild(category);

      return category;
    }, this);

    finalCategory.addChild(new NodeTree(test, test.name, this.colors, test.result));
  }

  public filterForStatus(status: TestStatus[]) {
    for (const [name, node] of this.children.entries()) {
      if (status.includes(node.result)) {
        node.filterForStatus(status);
      } else {
        this.children.delete(name);
      }
    }
  }

  protected indentStr(indent: number) {
    return " ".repeat(indent);
  }

  public removeCommonPrefix(): Tree {
    if (this.children.size !== 1) return this;

    const child = [...this.children.values()][0];
    if (child instanceof NodeTree) return this;

    return child.removeCommonPrefix();
  }

  public toString(indent: number = 0): string {
    if (this.children.size === 0) return "";

    const childrenStrings = [...this.children.values()]
      .map((child) => child.toString(indent + 1))
      .filter((str) => str !== "")
      .join("\n");

    return `${this.indentStr(indent)}${this.coloredName}\n${childrenStrings}`;
  }

  abstract updateResult(): TestStatus;
}

export class CategoryTree extends Tree {
  constructor(
    name: string,
    public colors: ColorPanel,
    result: TestStatus = "Success",
    parent?: Tree,
  ) {
    super(result, name, colors, parent);
  }

  updateResult() {
    const results = new Set([...this.children.values()].map((child) => child.updateResult()));
    if (results.has("Failure")) return (this.result = "Failure");
    if (results.has("Skipped")) return (this.result = "Skipped");
    return (this.result = "Success");
  }
}

export class NodeTree extends Tree {
  constructor(
    public data: TestResult,
    public name: string,
    colors: ColorPanel,
    result: TestStatus,
    parent?: Tree,
  ) {
    super(result, name, colors, parent);
  }

  toString(indent: number = 0) {
    const indentStr = this.indentStr(indent);
    const resultText = `${indentStr}${this.colors.prefix[this.result]} ${this.coloredName}`;

    if (this.data.error.length === 0) {
      return resultText;
    }

    return `${resultText}\n${this.data.error}`;
  }

  updateResult() {
    return this.result;
  }
}
