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

export class LazyValue<T> {
  private _value: T | undefined;

  constructor(private initValue: () => T) {}

  public get() {
    if (!this._value) {
      this._value = this.initValue();
    }

    return this._value;
  }

  public set(value: T) {
    this._value = value;
  }
}

export class LazyValueAsync<T> {
  private _value: T | undefined;

  constructor(private initValue: () => Promise<T>) {}

  public async get() {
    if (!this._value) {
      this._value = await this.initValue();
    }

    return this._value;
  }

  public set(value: T) {
    this._value = value;
  }
}

export function byLazy<T>(initValue: () => T) {
  return new LazyValue(initValue);
}

export function byLazyAsync<T>(initValue: () => Promise<T>) {
  return new LazyValueAsync(initValue);
}

export type ProxyWrapped<T extends object> = {
  __proxy_value: T;
  __replace_proxy_value: (newValue: T) => T;
} & T;

export function byProxy<T extends object>(initValue: () => T) {
  const value = byLazy(initValue);
  return new Proxy<T>({} as T, {
    get(thisArg, prop) {
      if (prop === "__proxy_value") return value.get();
      if (prop === "__replace_proxy_value")
        return (newValue: T) => {
          value.set(newValue);
          return thisArg;
        };

      return value.get()[prop as keyof T];
    },
  }) as ProxyWrapped<T>;
}
