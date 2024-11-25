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
  UserConfig,
  loadConfig,
  saveConfig,
  updateConfig,
} from "#src/user-config/loaders.js";
import { UserTheme, UserThemeSchema } from "#src/user-theme/schema.js";
import {
  ApplicationError,
  LogLevel,
  errorToJson,
  extendIfNeeded,
  fetchDependencies,
  inlineCode,
  logLevelIsGreater,
  pnpm,
  reduceSubWarning,
  withColors,
} from "#src/util/index.js";
import { byLazyAsync } from "#src/util/lazy.js";
import { Command, Flags, Interfaces, loadHelpClass, ux } from "@oclif/core";
import { Theme } from "@oclif/core/interfaces";
import { format } from "node:util";
import stripAnsi from "strip-ansi";
import { setGracefulCleanup } from "tmp-promise";

setGracefulCleanup();

/**
 * Type representing the flags for a command, including base flags.
 *
 * @typeParam T - The command class.
 */
export type Flags<T extends typeof Command> = Interfaces.InferredFlags<
  (typeof BaseCommand)["baseFlags"] & T["flags"]
>;

/**
 * Type representing the arguments for a command.
 *
 * @typeParam T - The command class.
 */
export type Args<T extends typeof Command> = Interfaces.InferredArgs<T["args"]>;

/**
 * Makes all properties of T optional if they are not already optional.
 *
 * @typeParam T - The type to optionalize.
 */
type OptionalizeFlags<T> = {
  [K in keyof T]: undefined extends T[K] ? T[K] : T[K] | undefined;
};

/**
 * Base class for all commands, providing common functionality and configurations.
 *
 * @typeParam T - The command class.
 */
export abstract class BaseCommand<T extends typeof Command> extends Command {
  /**
   * Base flags available to all commands.
   */
  static baseFlags = {
    build: Flags.boolean({
      allowNo: true,
      helpGroup: "GLOBAL",
      summary: "Toggle build related tasks.",
    }),
    config: Flags.string({
      helpGroup: "GLOBAL",
      helpValue: "<path>",
      summary: "Path to the bs config file.",
    }),
    dev: Flags.boolean({
      helpGroup: "GLOBAL",
      summary: "Use the dev build of your library.",
    }),
    docs: Flags.boolean({
      allowNo: true,
      helpGroup: "GLOBAL",
      summary: "Toggle jsdoc/wiki related tasks.",
    }),
    loglevel: Flags.option({
      aliases: ["log-level"],
      helpGroup: "GLOBAL",
      options: LogLevel.options,
      summary: "Set the minimum log level to log.",
    })(),
    noBuildOrRollup: Flags.boolean({
      aliases: ["nbr", "no-build-or-rollup"],
      helpGroup: "GLOBAL",
      summary: "Disable build and rollup related tasks",
    }),
    prod: Flags.boolean({
      exclusive: ["dev"],
      helpGroup: "GLOBAL",
      summary: "Use the prod build of your library.",
    }),
    rollup: Flags.boolean({
      allowNo: true,
      helpGroup: "GLOBAL",
      summary: "Toggle rollup related tasks.",
    }),
    silence: Flags.boolean({
      aliases: ["silent"],
      allowNo: true,
      helpGroup: "GLOBAL",
      summary: "Disable logging from external tooling.",
    }),
    stacktrace: Flags.boolean({
      aliases: ["trace"],
      allowNo: true,
      helpGroup: "GLOBAL",
      summary: "Toggle stack trace logging for errors.",
    }),
    tty: Flags.boolean({
      allowNo: true,
      helpGroup: "GLOBAL",
      summary: "Force toggle TTY exclusive behaviors.",
    }),
  };

  /**
   * Lazily fetched dependencies.
   */
  public static dependencies = byLazyAsync(fetchDependencies);

  /**
   * Indicates if the JSON flag is enabled.
   */
  static enableJsonFlag = true;

  /**
   * Indicates if the init method has been run.
   */
  protected static initRan = false;

  /**
   * Parsed arguments for the command.
   */
  protected args!: Args<T>;

  /**
   * Logs a debug message.
   *
   * @param message - The message to log.
   * @param args - Additional arguments for formatting.
   *
   * @returns void
   */
  public d = (message: string, ...args: unknown[]) => {
    this.sendLine("debug", message, ...args);
  };

  /**
   * Logs an error message.
   *
   * @param message - The message to log.
   * @param args - Additional arguments for formatting.
   *
   * @returns void
   */
  public e = (message: string, ...args: unknown[]) => {
    this.sendLine("error", message, ...args);
  };

  /**
   * Parsed flags for the command.
   */
  protected flags!: OptionalizeFlags<Flags<T>>;

  /**
   * Logs an info message.
   *
   * @param message - The message to log.
   * @param args - Additional arguments for formatting.
   *
   * @returns void
   */
  public i = (message: string, ...args: unknown[]) => {
    this.sendLine("info", message, ...args);
  };

  /**
   * Indicates if the command is a subcommand.
   */
  protected isSubCommand: boolean = BaseCommand.initRan;

  /**
   * Logs a trace message.
   *
   * @param message - The message to log.
   * @param args - Additional arguments for formatting.
   *
   * @returns void
   */
  public t = (message: string, ...args: unknown[]) => {
    this.sendLine("trace", message, ...args);
  };

  /**
   * The theme configuration for the command.
   */
  protected theme!: Theme & UserTheme;

  /**
   * Alias for trace logging.
   */
  public v = this.t;

  /**
   * Logs a warning message.
   *
   * @param message - The message to log.
   * @param args - Additional arguments for formatting.
   *
   * @returns void
   */
  public w = (message: string, ...args: unknown[]) => {
    this.sendLine("warning", message, ...args);
  };

  /**
   * Indicates if the build task has ran already.
   */
  private static buildTaskRan = false;

  /**
   * Finds a dependency by name.
   *
   * @param name - The name of the dependency to find.
   * @returns A promise that resolves to the found dependencies.
   */
  public static async findDependency(name: string) {
    const dependencies = await this.dependencies.get();

    return dependencies.filter((it) => it.name === name);
  }

  /**
   * Builds the library, either in dev or prod mode based on configuration.
   *
   * @param forceRun - If true, forces the build to run even if it has already run.
   *
   * @returns void
   */
  public async build(forceRun?: boolean) {
    if (UserConfig.global.dev) {
      return this.buildDev(forceRun);
    }

    return this.buildProd(forceRun);
  }

  /**
   * Builds the library in development mode.
   *
   * @param forceRun - If true, forces the build to run even if it has already run.
   *
   * @returns void
   */
  public async buildDev(forceRun?: boolean) {
    this.t("Building dev library");

    await this.runBuild(forceRun, ":dev");

    this.t("Dev library built");
  }

  /**
   * Builds the library in production mode.
   *
   * @param forceRun - If true, forces the build to run even if it has already run.
   *
   * @returns void
   */
  public async buildProd(forceRun?: boolean) {
    this.t("Building library");

    await this.runBuild(forceRun);

    this.t("Library built");
  }

  /**
   * Handles errors thrown during command execution.
   *
   * @param err - The error that was thrown.
   * @returns A promise that resolves when error handling is complete.
   */
  protected async catch(err: Error): Promise<unknown> {
    const appError = extendIfNeeded(err);

    if (this.jsonEnabled()) {
      this.sendRawErr(this.colorizeJson(errorToJson(appError)));
    } else {
      this.e(String(appError));
    }

    this.exit(appError.data.exitCode ?? 1);
  }

  /**
   * Colorizes JSON output based on the theme.
   *
   * @param json - The JSON object to colorize.
   * @returns The colorized JSON string.
   */
  protected colorizeJson(json: unknown) {
    return ux.colorizeJson(json, { pretty: true, theme: this.theme.json });
  }

  /**
   * Initializes the command, parsing arguments and flags.
   *
   * @returns void
   */
  public async init(): Promise<void> {
    BaseCommand.initRan = true;

    await super.init();

    this.theme = UserThemeSchema.parse(this.config.theme) as never;
    const { args, flags } = await this.parse({
      args: this.ctor.args,
      baseFlags: (super.ctor as typeof BaseCommand).baseFlags,
      enableJsonFlag: this.ctor.enableJsonFlag,
      flags: this.ctor.flags,
      strict: this.ctor.strict,
    });
    this.flags = flags as Flags<T>;
    this.args = args as Args<T>;

    if (this.isSubCommand) return;

    loadConfig(this.flags.config);

    updateConfig({
      global: {
        build: this.flags.build,
        dev: this.flags.dev,
        json: this.flags.json,
        rollup: this.flags.rollup,
        silence: this.flags.silence,
        trace: this.flags.stacktrace,
        tty: this.flags.tty,
      },
    });

    if (this.flags.prod) {
      updateConfig({
        global: {
          dev: false,
        },
      });
    }
  }

  /**
   * Determines if JSON output is enabled.
   *
   * @returns True if JSON output is enabled; otherwise, false.
   */
  override jsonEnabled(): boolean {
    if (!this.ctor.enableJsonFlag) return false;
    if (this.config.scopedEnvVar?.("CONTENT_TYPE")?.toLowerCase() === "json")
      return true;

    return UserConfig.global.json ?? super.jsonEnabled();
  }

  /**
   * Logs a message to stdout unless JSON output is enabled.
   *
   * @param message - The message to log.
   * @param args - Additional arguments for formatting.
   *
   * @returns void
   */
  override log(message?: string, ...args: unknown[]) {
    if (this.jsonEnabled()) return;

    this.sendRaw(format(message, ...args));
  }

  /**
   * Logs a message to stderr unless JSON output is enabled.
   *
   * @param message - The message to log.
   * @param args - Additional arguments for formatting.
   *
   * @returns void
   */
  override logToStderr(message?: string, ...args: unknown[]): void {
    if (this.jsonEnabled()) return;

    this.sendRawErr(format(message, ...args));
  }

  /**
   * Gets the name of the command with bin prefix.
   *
   * @param command - The command class.
   * @returns The formatted command name.
   */
  public nameOf<T extends typeof Command>(command: T) {
    return inlineCode(`${this.config.bin} ${command.id}`);
  }

  /**
   * Saves the current user configuration.
   *
   * @returns void
   */
  public async saveConfig() {
    return saveConfig(this.flags.config);
  }

  /**
   * Sends a log message at the specified log level.
   *
   * @remarks
   * If this command is a sub-command, the level will be
   * reduced by one if the level is less than warning.
   * For example, debug logs become verbose.
   *
   * @param level - The log level.
   * @param message - The message to log.
   * @param args - Additional arguments for formatting.
   *
   * @returns void
   */
  public send(level: LogLevel, message: string, ...args: unknown[]) {
    const target = this.isSubCommand ? reduceSubWarning(level) : level;
    if (logLevelIsGreater(UserConfig.global.logLevel, target)) return;

    const coloredMessage = this.formatMessage(target, format(message, ...args));

    if (logLevelIsGreater(target, "info")) {
      this.logToStderr(coloredMessage);
    } else {
      this.log(coloredMessage);
    }
  }

  /**
   * Sends a log message with a newline at the specified log level.
   *
   * @param level - The log level.
   * @param message - The message to log.
   * @param args - Additional arguments for formatting.
   *
   * @returns void
   */
  public sendLine(level: LogLevel, message: string, ...args: unknown[]) {
    this.send(level, `${message}\n`, ...args);
  }

  /**
   * Sends a raw message to stdout.
   *
   * @param message - The message to send.
   *
   * @returns void
   */
  protected sendRaw(message: string) {
    this.writeMessage(message, process.stdout);
  }

  /**
   * Sends a message to stderr.
   *
   * @param message - The message to send.
   *
   * @returns void
   */
  protected sendRawErr(message: string) {
    this.writeMessage(message, process.stderr);
  }

  /**
   * Displays the help message for the command.
   *
   * @returns void
   */
  public async showHelp() {
    const Help = await loadHelpClass(this.config);
    await new Help(this.config).showHelp([this.ctor.id]);
  }

  /**
   * Validates that a package is installed.
   *
   * @param target - The name of the package to validate.
   * @throws ApplicationError if the package is not installed.
   *
   * @returns void
   */
  protected async validatePackageInstalled(target: string) {
    const deps = await BaseCommand.findDependency(target);

    if (deps.length === 0)
      throw new ApplicationError(`Missing required package: ${target}`, {
        suggestions: [
          `Run ${inlineCode(`pnpm add ${target}`)} to install the package`,
        ],
      });
  }

  /**
   * Logs a warning message unless JSON output is enabled.
   *
   * @remarks
   * Mainly here as an override for existing oclif warn usage.
   * You typically want to use {@link BaseCommand.w | w} instead.
   *
   * @param input - The warning message or error.
   * @returns The input message or error.
   */
  override warn(input: Error | string): Error | string {
    if (!this.jsonEnabled()) {
      const str = input instanceof Error ? extendIfNeeded(input) : input;
      this.logToStderr(this.formatMessage("warning", String(str)));
    }

    return input;
  }

  /**
   * Writes a message to a stream, handling TTY checks.
   *
   * @param message - The message to write.
   * @param stream - The stream to write to.
   *
   * @returns void
   */
  protected writeMessage(message: string, stream: NodeJS.WriteStream) {
    const finalMessage = this.checkTTY(stream) ? message : stripAnsi(message);

    stream.write(finalMessage);
  }

  /**
   * Runs the command, initializing if necessary.
   *
   * @remarks
   * Correctly handles subcommands such that process.args doesn't
   * overlap, and init isn't ran again.
   *
   * @returns A promise that resolves with the command result.
   */
  override async _run<T>(): Promise<T> {
    if (!this.isSubCommand) return super._run();

    await this.init();
    return this.run();
  }

  /**
   * Checks if TTY is enabled.
   *
   * @param stream - The stream to check.
   * @returns True if TTY is enabled; otherwise, false.
   */
  private checkTTY(stream: { isTTY?: boolean }) {
    return UserConfig.global.tty ?? stream?.isTTY;
  }

  /**
   * Formats a message with colors and symbols based on log level.
   *
   * @param level - The log level.
   * @param message - The message to format.
   * @returns The formatted message.
   */
  private formatMessage(level: LogLevel, message: string) {
    const color = withColors(this.theme.logging[level]);
    const symbol = withColors(this.theme.logging.symbols);

    return symbol(format("[%s]: %s", color(level), color(message)));
  }

  /**
   * Runs the build process.
   *
   * @param forceRun - If true, forces the build to run even if it has already run.
   * @param variant - The build variant (e.g., ":dev").
   *
   * @returns void
   */
  private async runBuild(forceRun?: boolean, variant: string = "") {
    if (!UserConfig.global.build) {
      return this.d("Skipping build step since builds are disabled");
    }

    if (!forceRun && BaseCommand.buildTaskRan) {
      return this.d("Skipping build step since library was already built");
    }

    await pnpm(`build${variant}`);
    BaseCommand.buildTaskRan = true;
  }
}
