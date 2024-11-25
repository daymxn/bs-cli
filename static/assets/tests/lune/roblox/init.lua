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

--- @class RobloxGame
--- Wrapper around (loaded) `.RBXL` files.
---
--- Also hooks up shims for common roblox APIs.
local luau = require("@lune/luau")
local roblox = require("@lune/roblox")
local util = require("../util")
local task = require("@lune/task")
local shims = require("shims")

export type ScriptType = "Script" | "LocalScript" | "ModuleScript"

export type RobloxGame = {
	new: (RBXLContents: string) -> RobloxGame,
	Log: (message: string) -> (),
	SetLogging: (logging: boolean) -> (),
	UpdateShimConfig: (config: { [string]: any }) -> (),
	LoadScript: (script: LuaSourceContainer) -> () -> any,
	RunScript: (script: LuaSourceContainer) -> any,
	Require: (script: ModuleScript) -> any,
	InjectScript: (
		source: string,
		name: string,
		scriptType: ScriptType,
		parent: Instance
	) -> LuaSourceContainer,
}

local RobloxGame: RobloxGame = {}
RobloxGame.__index = RobloxGame

--- Creates a new instance of RobloxGame.
---
--- @param RBLXContents string The contents of the RBXL file to load from.
--- @return RobloxGame -- A new instance of the RobloxGame class.
function RobloxGame.new(RBLXContents)
	local self = setmetatable({}, RobloxGame)

	self.world = roblox.deserializePlace(RBLXContents)
	self._logging = true
	self._requireCache = {}

	return self
end

--- Logs a message to the console if logging is enabled.
---
--- @param message string The message to log.
function RobloxGame:Log(message)
	if self._logging then
		print(message)
	end
end

--- Enables or disables logging for the RobloxGame instance and updates the shim configuration.
---
--- @param logging boolean Whether to enable or disable logging.
function RobloxGame:SetLogging(logging)
	self._logging = logging
	self:UpdateShimConfig({
		TestError = logging,
	})
end

--- Updates the configuration for the shims.
---
--- @param config table The configuration to set for the shims.
function RobloxGame:UpdateShimConfig(config)
	shims.UpdateConfig(config)
end

--- Loads and compiles a Lua script from a Roblox LuaSourceContainer.
---
--- The script is returned as a callable function.
---
--- @param script LuaSourceContainer The LuaSourceContainer containing the script.
--- @return function -- The compiled Lua function ready to be executed.
function RobloxGame:LoadScript(script)
	return luau.load(luau.compile(script.Source), {
		debugName = script:GetFullName(),
		environment = util.mergeTables(roblox, {
			game = self.world,
			script = script,
			require = function(...)
				return self:Require(...)
			end,
			tick = os.clock,
			task = task,
			print = function(...)
				return self:Log(...)
			end,
		}),
	})
end

--- Injects a new script into the game world.
---
--- @param source string The source code of the script.
--- @param name string The name of the script.
--- @param scriptType "Script" | "LocalScript" | "ModuleScript" The type of script.
--- @param parent Instance The parent instance of the script.
--- @return LuaSourceContainer -- The newly created script.
function RobloxGame:InjectScript(source, name, scriptType, parent)
	local script = roblox.Instance.new(scriptType)
	script.Source = source
	script.Name = name
	script.Parent = parent

	return script
end

--- Runs a loaded LuaSourceContainer script.
---
--- @param script LuaSourceContainer The script to run.
--- @return any -- The return value of the executed script.
function RobloxGame:RunScript(script)
	return self:LoadScript(script)()
end

--- Requires a ModuleScript, caching the result for future calls.
---
--- @param script ModuleScript The ModuleScript to require.
--- @return any -- The return value of the required script.
function RobloxGame:Require(script)
	local path = script:GetFullName()

	if not self._requireCache[path] then
		self._requireCache[path] = table.pack(self:RunScript(script))
	end

	return table.unpack(self._requireCache[path])
end

setmetatable(RobloxGame, {
	__index = function(_, key)
		error(`Attempted to get RobloxGame::{key} (which is not a valid member)`, 2)
	end,
	__newindex = function(_, key, _)
		error(`Attempted to set RobloxGame::{key} (which is not a valid member)`, 2)
	end,
})

return table.freeze({
	new = RobloxGame.new,
})
