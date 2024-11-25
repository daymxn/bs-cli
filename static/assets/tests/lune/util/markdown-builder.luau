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

---@class MarkdownBuilder : StringBuilder
--- A subclass of StringBuilder that helps in the construction of markdown content.

local StringBuilder = require("string-builder")

---@alias VoidCallback fun()
export type VoidCallback = () -> ()

export type MarkdownBuilder = {
  new: () -> MarkdownBuilder,
  Header: (self: MarkdownBuilder, header: string) -> MarkdownBuilder,
  SubHeader: (
    self: MarkdownBuilder,
    header: string,
    level: number?
  ) -> MarkdownBuilder,
  ItalicLine: (self: MarkdownBuilder, text: string) -> MarkdownBuilder,
  BoldLine: (self: MarkdownBuilder, text: string) -> MarkdownBuilder,
  WithSpoiler: (
    self: MarkdownBuilder,
    summary: string | VoidCallback,
    callback: VoidCallback
  ) -> MarkdownBuilder,
  WithBlock: (
    self: MarkdownBuilder,
    block: string,
    callback: VoidCallback
  ) -> MarkdownBuilder,
  WithCodeBlock: (
    self: MarkdownBuilder,
    language: string,
    callback: VoidCallback
  ) -> MarkdownBuilder,
  CodeBlock: (
    self: MarkdownBuilder,
    language: string,
    code: string?
  ) -> MarkdownBuilder,
  List: (self: MarkdownBuilder, elements: { string }) -> MarkdownBuilder,
}

local MarkdownBuilder: MarkdownBuilder = {}
MarkdownBuilder.__index = MarkdownBuilder
setmetatable(MarkdownBuilder, { __index = StringBuilder.class })

--- Creates a new instance of MarkdownBuilder.
---
--- @return MarkdownBuilder -- A new instance of the MarkdownBuilder class.
function MarkdownBuilder.new()
  local self = setmetatable(StringBuilder.new(), MarkdownBuilder)
  return self
end

--- Appends a header to the MarkdownBuilder.
---
--- @param header string The header text to append.
--- @return MarkdownBuilder -- The updated MarkdownBuilder instance.
function MarkdownBuilder:Header(header: string)
  return self:AppendDoubleLine(`# {header}`)
end

--- Appends a subheader to the MarkdownBuilder.
---
--- @param header string The subheader text to append.
--- @param level number | nil The level of the subheader, defaults to 2.
--- @return MarkdownBuilder -- The updated MarkdownBuilder instance.
function MarkdownBuilder:SubHeader(header: string, level: number | nil)
  local prefix = string.rep("#", level or 2)
  return self:AppendDoubleLine(`{prefix} {header}`)
end

--- Appends an italicized line to the MarkdownBuilder.
---
--- @param text string The text to italicize.
--- @return MarkdownBuilder -- The updated MarkdownBuilder instance.
function MarkdownBuilder:ItalicLine(text: string)
  return self:AppendLine(`_{text}_`)
end

--- Appends a bolded line to the MarkdownBuilder.
---
--- @param text string The text to bold.
--- @return MarkdownBuilder -- The updated MarkdownBuilder instance.
function MarkdownBuilder:BoldLine(text: string)
  return self:AppendLine(`**{text}**`)
end

--- Wraps content within a spoiler block.
---
--- @param summary string | VoidCallback A string summary or a callback function.
--- @param callback VoidCallback The callback to execute within the spoiler block.
--- @return MarkdownBuilder -- The updated MarkdownBuilder instance.
function MarkdownBuilder:WithSpoiler(
  summary: string | VoidCallback,
  callback: VoidCallback
)
  return self:WithBlock("details", function()
    if type(summary) == "string" then
      self:AppendDoubleLine(`<summary>{summary}</summary>`)
      callback()
    else
      summary()
    end
  end)
end

--- Wraps content within a block element.
---
--- @param block string The type of block element.
--- @param callback VoidCallback The callback to execute within the block.
--- @return MarkdownBuilder -- The updated MarkdownBuilder instance.
function MarkdownBuilder:WithBlock(block: string, callback: VoidCallback)
  self:AppendLine(`<{block}>`)
  callback()
  return self:AppendDoubleLine(`</{block}>`)
end

--- Wraps content within a code block.
---
--- @param language string The programming language of the code block.
--- @param callback VoidCallback The callback to execute within the code block.
--- @return MarkdownBuilder -- The updated MarkdownBuilder instance.
function MarkdownBuilder:WithCodeBlock(language: string, callback: VoidCallback)
  self:Append("```")
  if type(language) == "string" then
    self:AppendLine(language)
    callback()
  else
    self:NewLine()
    language()
  end
  return self:AppendDoubleLine("```")
end

--- Appends a code block with the given language and code.
---
--- @param language string The programming language of the code block.
--- @param code string | nil The code to include within the block.
--- @return MarkdownBuilder -- The updated MarkdownBuilder instance.
function MarkdownBuilder:CodeBlock(language: string, code: string | nil)
  if code then
    return self:WithCodeBlock(language, function()
      self:AppendLine(code)
    end)
  else
    return self:WithCodeBlock(function()
      self:AppendLine(code)
    end)
  end
end

--- Appends a list of elements to the MarkdownBuilder.
---
--- @param elements string[] The list of elements to append.
--- @return MarkdownBuilder -- The updated MarkdownBuilder instance.
function MarkdownBuilder:List(elements: { string })
  for _, element in elements do
    self:AppendLine(`* {element}`)
  end
  return self:NewLine()
end

return table.freeze({
  new = MarkdownBuilder.new,
})
