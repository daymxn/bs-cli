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
import { existsAsync } from "#src/util/files.js";
import { codeBlock, inlineCode, link } from "#src/util/markup.js";
import { commandUsage, filterCommands, getCommandStrategy, getCommandTarget, hasDependency } from "#src/util/oclif.js";
import { Command, CommandHelp, Config, Flags, Interfaces } from "@oclif/core";
import { render } from "ejs";
import { slug } from "github-slugger";
import { compact, map } from "lodash-es";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { format } from "node:util";
import normalize from "normalize-package-data";
import stripAnsi from "strip-ansi";

export default class ReadmeCommand extends BaseCommand<typeof ReadmeCommand> {
  public static description = "This is an internal plugin only intended to be used on the bs repo itself.";

  public static flags = {
    output: Flags.string({
      default: "./commands.md",
      description: "Markdown file to save the command list to.",
      helpValue: "<path>",
    }),
  };

  public static hidden: boolean = true;

  public static summary = "Generates the command list for the readme.";

  public async run() {
    this.i("Generating readme commands");

    const { output } = this.flags;

    this.v("Saving commands to file: %s", output);

    const commands = filterCommands(this.config.commands);

    const results = await Promise.all(commands.map((it) => ReadmeGenerator.from(it, this.config).run()));

    const content = map(results, "content").join("\n\n").trim();

    const globalFlagsHeader = {
      name: "Global Flags",
      anchor: slug("Global Flags"),
    };

    const toc = [globalFlagsHeader, ...results].map(({ name, anchor }) => `- ${link(name, anchor)}`).join("\n");

    const globalFlags = [`## ${link(globalFlagsHeader.name, globalFlagsHeader.anchor)}`, this.getGlobalFlags()];

    const text = compact(["# Commands", toc, ...globalFlags, content]).join("\n\n");

    await writeFile(output!, `${text}\n`);

    this.i("Readme commands updated");

    return {
      message: "Readme commands updated",
      path: output,
    };
  }

  /**
   * Generates a section for showcasing the global flags.
   *
   * @returns A codeblock of the global flags.
   */
  protected getGlobalFlags() {
    const command = this.config.findCommand(BaseCommand.id!, { must: true });

    const help = new CommandHelp(command, this.config, {
      maxWidth: 120,
      respectNoCacheDefault: true,
      stripAnsi: true,
      sections: ["flags"],
    });

    return codeBlock(help.generate().split("\n").slice(1).join("\n"), "text");
  }
}

/**
 * Helper class for generating the commands part of the readme.
 *
 * We use this instead of oclif's readme generator so that we can
 * fix certain bugs, and provide certain styling I want.
 */
class ReadmeGenerator extends CommandHelp {
  public static from(command: Command.Loadable, config: Config) {
    return new ReadmeGenerator(command, config, {
      hideCommandSummaryInDescription: true,
      maxWidth: 120,
      respectNoCacheDefault: true,
      stripAnsi: true,
    });
  }

  protected computeName() {
    const { command, config } = this;
    const usage = commandUsage(command, config);

    return format("%s %s", config.bin, usage || "").trim();
  }

  /**
   * Create a link to this command's source code.
   *
   * @returns A markdown link to the command's source code.
   */
  protected async createLink() {
    const { command, config } = this;

    const name = command.pluginName;
    if (!name) return;

    const plugin = config.plugins.get(name);
    if (!plugin) return;

    const commandPath = await this.makeCommandPath(plugin);
    if (!commandPath) return;

    const repo = this.findRepo(plugin);
    const isLocal = config.name === name;

    // if it's in our package, then use the path instead of plugin name
    const label = isLocal ? commandPath : name;

    // use local path if its in our package but we dont have a repo set
    const repoPath = isLocal && !repo ? undefined : "/blob/main/";

    const template = plugin.pjson.oclif.repositoryPrefix ?? "<%- repo %><%- repoPath %><%- commandPath %>";

    const rendered = render(template, {
      c: command,
      commandPath,
      config,
      repo,
      repoPath,
      version: plugin.version,
    });

    return format("_See code: [%s](%s)_", label, rendered);
  }

  /**
   * Removes the global flags from the command's flags.
   *
   * This is style choice to not show global flags in
   * the flags section of the help- as every command shares them.
   *
   * @returns void
   */
  protected filterGlobalFlags() {
    this.command.flags = Object.fromEntries(
      Object.entries(this.command.flags).filter(([_, value]) => value.helpGroup !== "GLOBAL"),
    );
  }

  /**
   * Creates a url to the repository that has source code for this command.
   *
   * @param plugin - The plugin associated with this command.
   *
   * @returns A string representing the repository url
   * @returns undefined if the plugin doesn't have a repository
   */
  protected findRepo(plugin: Interfaces.Plugin) {
    const pjson = { ...plugin.pjson };
    normalize(pjson);

    const repo = pjson.repository?.url;
    if (!repo) return;

    const { hostname, pathname } = new URL(repo);

    return `https://${hostname}${pathname.replace(/\.git$/, "")}`;
  }

  /**
   * Adds a newline character to the start of the description.
   *
   * This works around a bug in oclif.
   *
   * @privateRemarks
   *
   * TODO(https://github.com/oclif/core/issues/1243): Remove when fixed
   *
   * @returns void
   */
  protected fixDescription() {
    this.command.description = this.command.description?.replace(/^/, "\n");
  }

  /**
   * Creates a path to the command's source file, relative to its root in a repository.
   *
   * @remarks
   * If the plugin uses typescript, we adjust the path to be under `src` and with the `ts`
   * suffix. Although, this means we can't support raw js files that are used in ts projects.
   *
   * If the plugin doesn't use typescript, we keep whatever base directory it had.
   *
   * @param plugin - The plugin for this command
   *
   * @returns Path to the command's source file, relative to the repository
   * @returns undefined if the command's source file couldn't be found
   */
  protected async makeCommandPath(plugin: Interfaces.Plugin) {
    // we can't (reliably) find source files for explicit plugins
    if (getCommandStrategy(plugin) === "explicit") return;

    const commandsDir = getCommandTarget(plugin);
    const hasTypescript = hasDependency(plugin, "typescript");
    const commandSegments = this.command.id.split(":");
    const pluginRoot = plugin.root;

    const commandPath = path.join(pluginRoot, commandsDir, ...commandSegments);
    const indexPath = path.join(commandPath, "index.js");
    const filePath = `${commandPath}.js`;

    let fullPath: string;

    if (await existsAsync(filePath)) {
      fullPath = filePath;
    } else if (await existsAsync(indexPath)) {
      fullPath = indexPath;
    } else return;

    let relativePath = path.relative(pluginRoot, fullPath);

    if (hasTypescript) {
      const pathWithoutRoot = relativePath.split(path.sep).slice(1);
      const srcPath = path.join("src", ...pathWithoutRoot);
      relativePath = srcPath.replace(/\.js$/, ".ts");
    }

    return relativePath.replaceAll("\\", "/");
  }

  /**
   * Removes the description if there's not a summary.
   *
   * @remarks
   * Since we add the description in place of the summary
   * above the codeblock, we don't want to repeat ourselves
   * in the codeblock.
   *
   * @returns void
   */
  protected prepareDescription() {
    if (!this.command.summary) {
      this.command.description = "";
    }
  }

  public async run() {
    const { command, config } = this;
    const name = this.computeName();
    const displayName = inlineCode(name);
    const anchor = slug(name);

    this.filterGlobalFlags();
    this.fixDescription();

    const header = `## ${link(displayName, anchor)}`;
    const text = render(command.summary ?? command.description ?? "", {
      command,
      config,
    });

    this.prepareDescription();

    const body = codeBlock(stripAnsi(this.generate()), "text");
    const sourceLink = await this.createLink();

    const sections = compact([header, text?.trim(), body, sourceLink]);

    return {
      anchor,
      content: sections.join("\n\n"),
      name: displayName,
    };
  }
}
