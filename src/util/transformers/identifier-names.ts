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
  Node,
  SourceFile,
  factory,
  isDeclarationStatement,
  isExportDeclaration,
  isInterfaceDeclaration,
  isNamedExports,
  isTypeAliasDeclaration,
} from "typescript";

import { recursivelyVisit } from "./util.js";

function renameDeclarations(node: Node, renamedMap: Map<string, string>): Node {
  if (!isDeclarationStatement(node)) return node;
  if (!node.name?.text.includes("$")) return node;

  const newName = node.name.text.replace(/\$\d+$/, "");

  renamedMap.set(node.name.text, newName);

  if (isTypeAliasDeclaration(node)) {
    return factory.updateTypeAliasDeclaration(
      node,
      node.modifiers,
      factory.createIdentifier(newName),
      node.typeParameters,
      node.type,
    );
  }

  if (isInterfaceDeclaration(node)) {
    return factory.updateInterfaceDeclaration(
      node,
      node.modifiers,
      factory.createIdentifier(newName),
      node.typeParameters,
      node.heritageClauses,
      node.members,
    );
  }

  return node;
}

function updateExports(node: Node, renamedMap: Map<string, string>): Node | undefined {
  if (!isExportDeclaration(node)) return node;
  if (!node.exportClause) return node;
  if (!isNamedExports(node.exportClause)) return node;

  const updatedElements = node.exportClause.elements.map((element) => {
    const oldName = element.propertyName?.text ?? element.name.text;
    const renamedName = renamedMap.get(oldName);

    if (renamedName) {
      return factory.updateExportSpecifier(
        element,
        element.isTypeOnly,
        undefined,
        factory.createIdentifier(renamedName),
      );
    }

    return element;
  });

  return factory.updateExportDeclaration(
    node,
    node.modifiers,
    node.isTypeOnly,
    node.exportClause ? factory.updateNamedExports(node.exportClause, updatedElements) : undefined,
    node.moduleSpecifier,
    node.attributes,
  );
}

export function transformIdentifierNames(source: Node) {
  const renamedMap: Map<string, string> = new Map();

  const root = recursivelyVisit(source, (node) => renameDeclarations(node, renamedMap));

  return recursivelyVisit(root, (node) => updateExports(node, renamedMap)) as SourceFile;
}
