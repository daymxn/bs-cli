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

--- @class TestEZ
--- Wrapper around a TestEZ runner.
---
--- Provides methods to run tests, generate reports, and manage test scripts.
local fs = require("@lune/fs")
local util = require("../util")

local reporter = require("reporter")
local net = require("@lune/net")

--- @class TestEZConstructorParams
---
--- Parameters for constructing a TestEZ instance.
---
--- @field game any A RobloxGame instance to run on.
--- @field logging boolean? Toggle logging behavior for test runs. Defaults to `false`.
--- @field autoInject boolean? Automatically call `:Inject` whenever `:Run` is called (if it hasn't been called yet). Defaults to `true`.
--- @field testEzPath Instance? The TestEZ script in the game world. If this is _not_ specified, it's assumed your project is TypeScript based,
--- and it will look for TestEZ in your `node_modules`.
export type TestEZConstructorParams = {
	game: any,
	logging: boolean?,
	autoInject: boolean?,
	testEzPath: Instance?,
}

export type TestEZ = {
	new: (params: TestEZConstructorParams) -> TestEZ,
	SetLogging: (self: TestEZ, logging: boolean) -> (),
	Run: (self: TestEZ, testPath: Instance?) -> any,
	GenerateReport: (self: TestEZ, resultsOverride: any?) -> string,
	ExportReportJSON: (self: TestEZ, dest: string, resultsOverride: any?) -> (),
	ExportReportMarkdown: (self: TestEZ, dest: string, resultsOverride: any?) -> (),
	UseCustomInjectScript: (self: TestEZ, source: string) -> (),
	UseExistingScript: (self: TestEZ, script: LuaSourceContainer) -> (),
	Inject: (self: TestEZ) -> (),
	getResults: (self: TestEZ, override: any?) -> any,
}

local TestEZ: TestEZ = {}
TestEZ.__index = TestEZ

--- Creates a new instance of TestEZ.
---
--- @param params TestEZConstructorParams The parameters to initialize the TestEZ instance.
--- @return TestEZ -- A new instance of the TestEZ class.
function TestEZ.new(params: TestEZConstructorParams)
	local self = setmetatable({}, TestEZ)
	self._game = params.game
	self._logging = false
	self._script = nil
	self._autoInject = true
	self._recentResults = nil
	self._testEzPath = params.testEzPath

	if params.logging ~= nil then
		self._logging = params.logging
	end
	if params.autoInject ~= nil then
		self._autoInject = params.autoInject
	end

	self._game:SetLogging(self._logging)

	if self._testEzPath then
		self._injectScript = fs.readFile(`{util.getDir()}/lua_target.luau`)
	else
		self._injectScript = fs.readFile(`{util.getDir()}/ts_target.luau`)
	end

	return self
end

--- Sets the logging behavior for TestEZ.
---
--- This toggles normal _all_ logging- including logs from `TestService`.
---
--- @param logging boolean Whether to enable or disable logging.
function TestEZ:SetLogging(logging: boolean)
	self._logging = logging
	self._game:SetLogging(logging)
end

--- Runs the TestEZ tests and returns the results.
---
--- @param testPath Instance? The path to run the tests from. Defaults to `ReplicatedStorage` if not provided.
--- @return any -- The results of the test run.
function TestEZ:Run(testPath: Instance?)
	if not self._script then
		if not self._autoInject then
			error("[TestEZ::Run]: Didn't find a script to run. Have you called ::Inject yet?")
		else
			self:Inject()
		end
	end

	local path = testPath or self._game.world.ReplicatedStorage
	local script = self._game:RunScript(self._script)

	if self._testEzPath then
		self._recentResults = script.RunTests(self._testEzPath, path)
	else
		self._recentResults = script.RunTests(path)
	end

	return self._recentResults
end

--- Generates a test report from the most recent test run.
---
--- @param resultsOverride any? Optional results to override the recent test results.
--- @return any -- The generated test report.
function TestEZ:GenerateReport(resultsOverride)
	return reporter.GenerateTestReport(self:getResults(resultsOverride))
end

--- Exports the test report as a JSON file.
---
--- @param dest string The destination file path to write the JSON report.
--- @param resultsOverride any? Optional results to override the recent test results.
function TestEZ:ExportReportJSON(dest: string, resultsOverride)
	local results = self:getResults(resultsOverride)
	local report = self:GenerateReport(results)

	util.createDirForPath(dest)
	fs.writeFile(dest, net.jsonEncode(report))
end

--- Exports the test report as a Markdown file.
---
--- @param dest string The destination file path to write the Markdown report.
--- @param resultsOverride any? Optional results to override the recent test results.
function TestEZ:ExportReportMarkdown(dest: string, resultsOverride)
	local results = self:getResults(resultsOverride)
	local report = self:GenerateReport(results)

	util.createDirForPath(dest)
	fs.writeFile(dest, reporter.ReportToMarkdown(report))
end

--- Sets a custom script source for injection.
---
--- It's expected that the source returns a table
--- with a method `RunTests` that takes in two parameters:
--- the path to the TestEZ script, and the path to which
--- directory to run tests under.
---
--- @param source string The custom script source to inject.
function TestEZ:UseCustomInjectScript(source: string)
	self._injectScript = source
end

--- Uses an existing script as the test runner.
---
--- It's expected that the script returns a table
--- with a method `RunTests` that takes in two parameters:
--- the path to the TestEZ script, and the path to which
--- directory to run tests under.
---
--- @param script LuaSourceContainer The script to use as the test runner.
function TestEZ:UseExistingScript(script: LuaSourceContainer)
	self._script = script
end

--- Injects the default or custom script into the game world.
---
--- The script is injected as a `ModuleScript` under `world` and
--- with the name `__TestEZRunner`.
function TestEZ:Inject()
	self._script = self._game:InjectScript(self._injectScript, "__TestEZRunner", "ModuleScript", self._game.world)
end

--- Retrieves the recent test results or runs the tests if not available.
---
--- Helper method for getting test results in various methods, with fallbacks
--- as needed.
---
--- @param override any? Optional override for the recent results.
--- @return any -- The test results.
function TestEZ:getResults(override)
	return override or self._recentResults or self:Run()
end

return TestEZ
