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

export class AsyncCollector<T> {
  constructor(public iterable: AsyncIterable<T>) {}

  public build() {
    return this.iterable;
  }

  public async collect(): Promise<T[]> {
    const arr: T[] = [];
    for await (const item of this.iterable) {
      arr.push(item);
    }

    return arr;
  }

  public filter(condition: (item: T) => Promise<boolean> | boolean): AsyncCollector<T> {
    return new AsyncCollector(filterAsync(this.iterable, condition));
  }

  public filterUndefined(): AsyncCollector<NonNullable<T>> {
    return this.filter((it) => it !== undefined) as never;
  }

  public map<R>(callback: (item: T) => Promise<R> | R): AsyncCollector<R> {
    return new AsyncCollector(mapAsync(this.iterable, callback));
  }

  public onEach(callback: (item: T) => Promise<unknown> | unknown) {
    return new AsyncCollector(
      filterAsync(this.iterable, async (item) => {
        await callback(item);
        return true;
      }),
    );
  }
}

export function withAsyncIterable<T>(iterable: AsyncIterable<T>) {
  return new AsyncCollector(iterable);
}

async function* mapAsync<T, U>(iterable: AsyncIterable<T>, mapper: (item: T) => Promise<U> | U): AsyncIterable<U> {
  for await (const item of iterable) {
    yield await mapper(item);
  }
}

async function* filterAsync<T>(
  iterable: AsyncIterable<T>,
  predicate: (item: T) => Promise<boolean> | boolean,
): AsyncIterable<T> {
  for await (const item of iterable) {
    if (await predicate(item)) {
      yield item;
    }
  }
}
