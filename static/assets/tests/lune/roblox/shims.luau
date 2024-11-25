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
  Shims for the roblox API.

  Lune (by default) doesn't provide a lot of the methods that are needed when using the roblox API.
  The purpose of this module is to implement those methods (atleast, as they're needed).
]]
local roblox = require("@lune/roblox")
local stdio = require("@lune/stdio")
local net = require("@lune/net")
local util = require("../util")

local config = {
	IsRunning = true,
	IsClient = false,
	IsServer = true,
	TestError = true,
}

local function UpdateConfig(newConfig: typeof(config))
	for key, value in newConfig do
		config[key] = value
	end
end

roblox.implementMethod("Instance", "WaitForChild", function(self, childName, timeout)
	local startTime = os.clock()

	while not self:FindFirstChild(childName) do
		if timeout and os.clock() - startTime >= timeout then
			error("WaitForChild timed out: " .. childName)
		end
		task.wait()
	end

	return self:FindFirstChild(childName)
end)

roblox.implementMethod("TestService", "Error", function(_, description: string)
	if config.TestError then
		stdio.ewrite(`{description}\n`)
	end
end)

--[[
  Uses `net.jsonEncode`, but also aligns the output to be more akin to `HttpService:JSONEncode`.
  More specifically, it translates `userdata` and `function` types to JSON `null` values.
]]
roblox.implementMethod("HttpService", "JSONEncode", function(_, other)
	local NULL_VALUES = { "userdata", "function" }
	local JSON_NULL = "__JSON_NULL"

	local function replaceUnsupportedTypes(value)
		if table.find(NULL_VALUES, type(value)) then
			return JSON_NULL
		end

		if type(value) == "table" then
			return util.mapTableValues(value, replaceUnsupportedTypes)
		end

		return value
	end

	local filteredOther = replaceUnsupportedTypes(other)

	return net.jsonEncode(filteredOther):gsub(`"{JSON_NULL}"`, "null")
end)

roblox.implementProperty("RunService", "Heartbeat", function()
	return {}
end, function() end)

roblox.implementMethod("RunService", "IsRunning", function()
	return config.IsRunning
end)

roblox.implementMethod("RunService", "IsClient", function()
	return config.IsClient
end)

roblox.implementMethod("RunService", "IsServer", function()
	return config.IsServer
end)

return {
	UpdateConfig = UpdateConfig,
}
