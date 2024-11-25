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

--[[
  Lune script for running TestEZ unit tests from the command line.

  By providing a compiled `.RBXL` file of your library, this script
  can inject a TestEZ runner and generate a test report from it.

  Arguments:
    - <RBXLPath>: string -- A required string pointing to the compiled `.RBXL` file.

  Flags:
    - `--json` -- Export a copy of the test report as a `.json` file to `temp/report.json`.
    - `--markdown` -- Export a copy of the test report as a `.md` file to `temp/report.md`.
    - `--exit` -- If there are any failures, exit with a non zero status.
    - `--redirect-output` -- Redirect all the logs/errors from TestEZ to STDOUT/STDERR.
]]

-- TODO(https://github.com/lune-org/lune/issues/236): Remove when fixed
pcall(function()
	return require("@lune/roblox").Instance.new("DataModel").FakeProperty
end)
local fs = require("@lune/fs")
local process = require("@lune/process")
local RobloxGame = require("roblox")
local TestEZ = require("testez")
local stdio = require("@lune/stdio")
local Regex = require("@lune/regex")

type Arguments = {
	rblxFilePath: string,
	reportJson: string?,
	reportMarkdown: string?,
	exitOnFailures: boolean,
	redirectOutput: boolean,
}

local argumentMap = {
	["json"] = "reportJson",
	["markdown"] = "reportMarkdown",
	["exit"] = "exitOnFailures",
	["redirect-output"] = "redirectOutput",
}

local argReg = Regex.new("--(?<command>[^=]+)=?(?<value>.+)?")

local function ParseArguments(args: { any }): Arguments
	local robloxPlace = args[1]
	if not robloxPlace then
		error("Missing RBLX file path. It should be the first argument to this script.")
	elseif not fs.isFile(robloxPlace) then
		error(`RBLX file not found at the specified path: {robloxPlace}`)
	end

	local arguments = {
		rblxFilePath = robloxPlace,
		reportJson = nil,
		reportMarkdown = nil,
		exitOnFailures = false,
		redirectOutput = false,
	}

	for index = 2, #args do
		local current = args[index]
		local match = argReg:captures(current)
		assert(match ~= nil, `Invalid argument: {current}`)

		local command = match:group("command")
		local value = match:group("value")

		if command and argumentMap[command.text] then
			if value then
				arguments[argumentMap[command.text]] = value.text
			else
				arguments[argumentMap[command.text]] = true
			end
		else
			warn(`Unrecognized argument: {current}`)
		end
	end

	return arguments
end

local args = ParseArguments(process.args)

local game = RobloxGame.new(fs.readFile(args.rblxFilePath))
local tests = TestEZ.new({ game = game })

tests:SetLogging(args.redirectOutput)

local results = tests:Run()

if args.reportMarkdown ~= nil then
	tests:ExportReportMarkdown(args.reportMarkdown)
end
if args.reportJson ~= nil then
	tests:ExportReportJSON(args.reportJson)
end

if args.exitOnFailures and results.failureCount ~= 0 then
	stdio.ewrite(`There were {results.failureCount} failures`)
	process.exit(1)
end
