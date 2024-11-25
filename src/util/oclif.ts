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

import { Command } from "@oclif/core";
import { Config, Plugin } from "@oclif/core/interfaces";
import { render } from "ejs";
import { castArray, compact } from "lodash-es";

export function getCommandStrategy(plugin: Plugin) {
  const commands = plugin.pjson.oclif?.commands;
  if (!commands) return "pattern";

  if (!commands || typeof commands === "string") {
    return commands;
  }

  return commands.strategy;
}

export function getCommandTarget(plugin: Plugin) {
  const commands = plugin.pjson.oclif?.commands;
  if (!commands) {
    return "./dist/commands";
  }

  if (typeof commands === "string") {
    return commands;
  }

  return commands.target;
}

export function hasDependency(plugin: Plugin, dependency: string) {
  const dep =
    plugin.pjson.dependencies?.[dependency] ??
    plugin.pjson.devDependencies?.[dependency];

  return dep !== undefined;
}

const isAlias = (command: Command.Loadable) =>
  command.aliases.includes(command.id);
const isHidden = (command: Command.Loadable) => command.hidden;
const isUndocumented = (command: Command.Loadable) =>
  ["base-command", "readme"].includes(command.id);

/**
 * Filter our command list to only contain commands
 * that should be documented.
 *
 * @param command - List of commands to filter
 * @returns A list of commands that are safe to report
 */
export function filterCommands(command: Command.Loadable[]) {
  return command.filter(
    (it) => !(isAlias(it) || isHidden(it) || isUndocumented(it))
  );
}

export function argToStr(arg: Command.Arg.Any) {
  const name = arg.name.toUpperCase();
  return arg.required ? name : `[${name}]`;
}

export function visibleArgs(command: Command.Cached) {
  return Object.values(command.args).filter((it) => !it.hidden);
}

export function defaultUsage(command: Command.Cached) {
  const allArgs = visibleArgs(command).map(argToStr).join(" ");
  return `${command.id} ${allArgs}`.trim();
}

export function commandUsage(command: Command.Cached, config: Config) {
  const usages = compact(castArray(command.usage));
  const target = usages.length === 0 ? defaultUsage(command) : usages[0];

  return render(target, {
    command,
    config,
  });
}
