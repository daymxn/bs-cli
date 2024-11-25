@echo off

node --inspect=9229 --loader ts-node/esm --no-warnings=ExperimentalWarning "%~dp0\dev" %*
