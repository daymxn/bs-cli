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

// TODO(): refactor to be... better?
export class FlagBuilder {
  private flags: string[];
  private options: [string, unknown][] = [];
  constructor(startingFlags: string[] = []) {
    this.flags = [...startingFlags];
  }

  public add(flag: string, value?: unknown) {
    if (value === undefined) {
      this.flags.push(flag);
    } else {
      this.options.push([flag, value]);
    }

    return this;
  }

  public addIfPresent(flag: string, value: unknown) {
    if (value !== undefined) {
      this.add(flag);
    }
  }

  public addNegatable(flag: string, value?: boolean) {
    if (value === undefined) return this;

    const name = value ? flag : `no-${flag}`;

    return this.add(name);
  }

  public addValueIfPresent(flag: string, value: unknown) {
    if (value !== undefined) {
      return this.add(flag, value);
    }

    return this;
  }

  public build() {
    return this.toString();
  }

  public buildFlags() {
    return this.flags.map((it) => `--${it}`);
  }

  public buildOptions() {
    return this.options.map(([key, value]) => `--${key}=${value}`);
  }

  public toString() {
    return `${this.buildOptions().join(" ")} ${this.buildFlags().join(" ")}`.trim();
  }

  public unpack() {
    return [...this.buildFlags(), ...this.buildOptions()];
  }
}
