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

--- @class StringBuilder
--- Helper builder for creating strings.

export type StringBuilder = {
  new: () -> StringBuilder,
  Append: (self: StringBuilder, str: string) -> StringBuilder,
  AppendLine: (self: StringBuilder, line: string) -> StringBuilder,
  AppendDoubleLine: (self: StringBuilder, line: string) -> StringBuilder,
  NewLine: (self: StringBuilder) -> StringBuilder,
  Build: (self: StringBuilder) -> string,
  ToString: (self: StringBuilder) -> string,
}

local StringBuilder: StringBuilder = {}
StringBuilder.__index = StringBuilder

--- Creates a new instance of StringBuilder.
---
--- @return StringBuilder -- A new instance of the StringBuilder class.
function StringBuilder.new()
  local self = setmetatable({}, StringBuilder)

  self._text = ""
  self.__tostring = self.ToString

  return self
end

--- Appends a string to the StringBuilder.
---
--- @param str string The string to append.
--- @return StringBuilder -- This instance, for chaining.
function StringBuilder:Append(str: string)
  self._text = `{self._text}{str}`

  return self
end

--- Appends a line with a newline character to the StringBuilder.
---
--- @param line string The line to append.
--- @return StringBuilder -- This instance, for chaining.
function StringBuilder:AppendLine(line: string)
  return self:Append(`{line}\n`)
end

--- Appends a line with two newline characters to the StringBuilder.
---
--- @param line string The line to append.
--- @return StringBuilder -- This instance, for chaining.
function StringBuilder:AppendDoubleLine(line: string)
  return self:Append(`{line}\n\n`)
end

--- Appends a newline character to the StringBuilder.
---
--- @return StringBuilder -- This instance, for chaining.
function StringBuilder:NewLine()
  return self:AppendLine("")
end

--- Builds the string from the accumulated text.
---
--- @return string -- The built string.
function StringBuilder:Build()
  return self._text
end

--- Converts the StringBuilder to its string representation.
---
--- @return string -- The string representation of the StringBuilder.
function StringBuilder:ToString()
  return self:Build()
end

setmetatable(StringBuilder, {
  __index = function(_, key)
    error(
      `Attempted to get StringBuilder::{key} (which is not a valid member)`,
      2
    )
  end,
  __newindex = function(_, key, _)
    error(
      `Attempted to set StringBuilder::{key} (which is not a valid member)`,
      2
    )
  end,
})

return table.freeze({
  new = StringBuilder.new,
  class = StringBuilder,
})
