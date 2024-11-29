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
  ModuleBlock,
  Node,
  SourceFile,
  TypeElement,
  factory,
  isInterfaceDeclaration,
  isModuleBlock,
  isModuleDeclaration,
  isStatement,
  visitEachChild,
  visitNodes,
} from "typescript";

function populateInterfaces(root: Node, interfaces: Record<string, TypeElement[]>) {
  return visitEachChild(
    root,
    (node) => {
      if (!isInterfaceDeclaration(node)) return node;

      const membersMap = interfaces[node.name.text];

      if (!membersMap) return node;

      return factory.updateInterfaceDeclaration(
        node,
        node.modifiers,
        node.name,
        node.typeParameters,
        node.heritageClauses,
        factory.createNodeArray([...node.members, ...membersMap]),
      );
    },

    undefined,
  );
}

function processModuleDeclarationBody(body: ModuleBlock, interfaces: Record<string, TypeElement[]>) {
  return visitNodes(
    body.statements,
    (node) => {
      if (isInterfaceDeclaration(node)) {
        const interfaceName = node.name.text;

        if (interfaces[interfaceName]) {
          interfaces[interfaceName].push(...node.members);
        } else {
          interfaces[interfaceName] = [...node.members];
        }

        return;
      }

      return node;
    },
    isStatement,
  );
}

function processModuleDeclaration(node: Node, interfaces: Record<string, TypeElement[]>) {
  if (!isModuleDeclaration(node)) return node;
  if (!node.body || !isModuleBlock(node.body)) return node;

  const remainingNodes = processModuleDeclarationBody(node.body, interfaces);
  if (remainingNodes.length === 0) return;

  factory.updateModuleBlock(node.body, remainingNodes);
  return node;
}

function collectAugmentedModules(source: Node, interfaces: Record<string, TypeElement[]>) {
  return visitEachChild(
    source,
    (node) => processModuleDeclaration(node, interfaces),

    undefined,
  );
}

export function transformCombineAugmentations(source: Node) {
  const interfaceMap: Record<string, TypeElement[]> = {};

  const root = collectAugmentedModules(source, interfaceMap);

  return populateInterfaces(root, interfaceMap) as SourceFile;
}
