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

import { UserConfig } from "../user-config/loaders.js";

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface AppErrorData {
  cause?: Error;
  exitCode?: number;
  message: string;
  suggestions?: string[];
}

export interface ErrorJson {
  cause?: ErrorJson;
  exitCode?: number;
  message: string;
  suggestions?: string[];
}

export class ApplicationError extends Error {
  public data: AppErrorData;

  constructor(
    public message: string,
    data: Partial<AppErrorData> = {},
  ) {
    super(message, { cause: data.cause });
    this.data = {
      ...data,
      message,
    };
  }

  override toString() {
    if (UserConfig.global.trace) {
      // TODO(): figure out how I wanna show suggestions when stack tracing (if at all)
      return getFullStack(this);
    }

    const suggestions = this.data.suggestions?.join("\n");

    if (suggestions === undefined) {
      return this.message;
    }

    return `${this.message}\n${suggestions}`;
  }
}

export function errorToJson(error?: unknown): ErrorJson | undefined {
  if (error instanceof Error) {
    if (error instanceof ApplicationError) {
      return {
        cause: errorToJson(error.data.cause),
        exitCode: error.data?.exitCode,
        message: error.message,
        suggestions: error.data.suggestions,
      };
    }

    return {
      cause: errorToJson(error.cause),
      message: error.message,
    };
  }
}

export function extendIfNeeded(error: Error) {
  if (error instanceof ApplicationError) {
    return error;
  }

  return new ApplicationError(error.message, {
    cause: error,
  });
}

export async function wrapIfNeeded<T>(message: string, callback: () => Promise<T>) {
  return callback().catch((e) => {
    if (e instanceof ApplicationError) {
      throw e;
    }

    throw extendError(e, message);
  });
}

export function extendError(message: string, error: unknown, suggestions?: string[]) {
  if (error instanceof Error) {
    if (error instanceof ApplicationError) {
      return new ApplicationError(message, error.data);
    }

    return new ApplicationError(message, { cause: error });
  }

  const cause = new ApplicationError(`${error}`);
  return new ApplicationError(message, {
    cause,
    suggestions,
  });
}

export function getFullStack(error: Error): string {
  const stack = error.stack?.replace(/^Error: /, "");

  if (error.cause instanceof Error) {
    return `${stack}\nCaused by: ${getFullStack(error.cause)}`;
  }

  return `${stack}`;
}

export function instanceOfNodeError<T extends new (...args: any[]) => Error>(
  value: unknown,
  errorType?: T,
): value is InstanceType<T> & NodeJS.ErrnoException {
  if (errorType) {
    return value instanceof errorType;
  }

  return value instanceof Error;
}

export function toError(maybeError: unknown) {
  if (maybeError instanceof Error) {
    return maybeError;
  }
  return new Error(String(maybeError));
}

// export function exitWithError(error: unknown): never {
//   logError(error);
//   if (error instanceof SubprocessError) process.exit(error.exitCode);
//   process.exit(1);
// }
