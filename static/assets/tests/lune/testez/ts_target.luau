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

local ReplicatedStorage = game:GetService("ReplicatedStorage")

local TS = require(
  ReplicatedStorage:WaitForChild("rbxts_include"):WaitForChild("RuntimeLib")
)

local TestEZ = TS.import(
  script,
  ReplicatedStorage,
  "rbxts_include",
  "node_modules",
  "@rbxts",
  "testez",
  "src"
)

local Runner = {}

Runner.RunTests = function(testPath)
  return TestEZ.TestBootstrap:run({ testPath })
end

return Runner
