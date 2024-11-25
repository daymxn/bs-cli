--[[
  Copyright 2024 Daymon Littrell-Reyes

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
]]

local process = require("@lune/process")
local fs = require("@lune/fs")

export type Table<K, V> = { [K]: V }

--- Merges multiple tables into a single table.
---
--- If multiple tables have the same keys, those later on
--- in the sequence take priority.
---
--- @vararg table<any, any> The tables to merge.
--- @return table<any, any> -- The resulting merged table.
local function mergeTables(...)
	local result = {}
	for i = 1, select("#", ...) do
		for k, v in select(i, ...) do
			result[k] = v
		end
	end
	return result
end

--- Inserts all elements from the source array into the destination array.
---
--- This is a mutable change.
---
--- @generic T
--- @param dest T The destination array.
--- @param src T The source array.
--- @return T -- The destination array, for chaining.
local function insertArray<T>(dest: { T }, src: { T })
	for _, v in src do
		table.insert(dest, v)
	end

	return dest
end

--- Invokes the callback for each entry in the table, and returns the new table.
---
--- The callback function returns the new "value" to use for the given key.
---
--- @generic K, V, R
--- @param self table<K, V> The table to map over.
--- @param callback fun(k: K, v: V): R The function to apply to each key-value pair.
--- @return table<K, R> -- A new table with the results of the mapping.
local function mapTable<K, V, R>(self: Table<K, V>, callback: (k: K, v: V) -> R): Table<K, R>
	local newTable = {}

	for key, value in pairs(self) do
		newTable[key] = callback(key, value)
	end

	return newTable
end

--- Invokes the callback for each value in the table, and returns the new table.
---
--- The callback function returns the new "value" to use for the given key.
---
--- @generic K, V, R
--- @param self table<K, V> The table to map over.
--- @param callback fun(v: V): R The function to apply to each value.
--- @return table<K, R> -- A new table with the results of the mapping.
local function mapTableValues<K, V, R>(self: Table<K, V>, callback: (v: V) -> R): Table<K, R>
	local newTable = {}

	for key, value in self do
		newTable[key] = callback(value)
	end

	return newTable
end

--- Creates a directory for a given file path if it doesn't already exist.
---
--- The provided path is expected to be a path to a file that you intend to create,
--- _not_ a directory. The directory for said file is parsed from the path.
---
--- @param path string The file path for which the directory should be created.
--- @error If the path exists, but points to a non directory file.
local function createDirForPath(path: string)
	local dir, found = path:gsub("\\", "/"):gsub("/[^/]+$", "")
	if found == 0 then
		return
	end

	if fs.isDir(dir) then
		return
	end
	if fs.isFile(dir) then
		error(`Can't create the directory as it already exists as an actual file: {dir}`)
	end

	fs.writeDir(dir)
end

--- Retrieves the current directory based on the calling script.
---
--- The current directory is where the script file itself is defined.
---
--- @return string -- The current directory.
local function getDir()
	--- local cwd = process.cwd:gsub("\\", "/"):gsub("/$", "")

	local path =
		string.match(debug.info(2, "s"), '%[string "([^"]*)"%]'):gsub("\\", "/"):gsub("^%./", ""):gsub("/[^/]+$", "")

	--- relative path
	--- return `{cwd}/{path}`
	--- absolute
	return path
end

return {
	mergeTables = mergeTables,
	mapTable = mapTable,
	mapTableValues = mapTableValues,
	getDir = getDir,
	insertArray = insertArray,
	createDirForPath = createDirForPath,
}
