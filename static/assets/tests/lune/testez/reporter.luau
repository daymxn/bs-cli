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

local util = require("../util")
local MarkdownBuilder = require("../util/markdown-builder")

--- @alias TestStatus "Success" | "Failure" | "Skipped"

--- @class TestResult
---
--- The mapped version of a `RunResult` from TestEZ.
--- Contains information relevant to the result of the test.
---
--- @field category string The category under which the test was run, seperated by periods.
--- @field result TestStatus Whether the test passes, failed, or was skipped.
--- @field error string The thrown error when the test failed. If the test didn't fail, this will be an empty string.
--- @field name string The phrase or "name" of the test itself.
export type TestResult = {
	category: string,
	result: string,
	error: string,
	name: string,
}

--- @class TestReport
---
--- Mapped data from a TestEZ `RunResults` into a more consumable format.
---
--- @field pass TestResult[] All the tests that passed.
--- @field fail TestResult[] All the tests that failed.
--- @field skip TestResult[] All the tests that were skipped.
export type TestReport = {
	pass: { TestResult },
	fail: { TestResult },
	skip: { TestResult },
}

--- Converts a `RunResult` from TestEZ into a `TestResult`.
---
--- Will recursively convert child nodes as well.
---
--- @param result table The `RunResult` to convert.
--- @param category string? The test category, used for nested test cases.
--- @return TestResult[] -- A list of formatted test results.
local function convertToTestResult(result, category)
	if result.planNode.type == "It" then
		return {
			{
				category = category,
				result = result.status,
				error = table.concat(result.errors, "\n"),
				name = result.planNode.phrase,
			},
		}
	end

	local cat = category and `{category}.{result.planNode.phrase}` or result.planNode.phrase

	local results = {}
	for _, child in result.children do
		local testResults = convertToTestResult(child, cat)
		util.insertArray(results, testResults)
	end

	return results
end

--- Generates a test report based on the provided test result from TestEZ.
---
--- @param result table The root test result from which to generate the report.
--- @return TestReport -- A structured test report containing passed, failed, and skipped tests.
local function GenerateTestReport(result)
	local passes = {}
	local fails = {}
	local skips = {}

	for _, child in convertToTestResult(result) do
		if child.result == "Success" then
			table.insert(passes, child)
		elseif child.result == "Failure" then
			table.insert(fails, child)
		else
			table.insert(skips, child)
		end
	end

	return {
		pass = passes,
		fail = fails,
		skip = skips,
	}
end

--- Converts a `TestReport` into a Markdown format.
---
--- @param report TestReport The structured test report.
--- @return string -- The generated Markdown content.
local function ReportToMarkdown(report)
	local builder = MarkdownBuilder.new()

	builder:Header("Test Report")

	local passes = #report.pass
	local failures = #report.fail
	local skips = #report.skip
	local total = passes + failures + skips

	builder:List({
		`[✔️] **Passed**: {passes}`,
		`[❌] **Failed**: {failures}`,
		`[⏯️] **Skipped**: {skips}`,
		`*Total: {total}*`,
	})

	if failures ~= 0 then
		builder:SubHeader("Failed")
		for _, result in report.fail do
			builder:SubHeader(result.name, 3)
			builder:ItalicLine(result.category)

			builder:WithSpoiler("Stack Trace", function()
				builder:CodeBlock("log", result.error)
			end)
		end
	end

	if skips ~= 0 then
		builder:SubHeader("Skipped")
		builder:List(util.mapTableValues(report.skip, function(result)
			return `_{result.category}._**{result.name}**`
		end))
	end

	return builder:Build()
end

return {
	GenerateTestReport = GenerateTestReport,
	ReportToMarkdown = ReportToMarkdown,
}
