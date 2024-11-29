# Commands

- [Global Flags](#global-flags)
- [`bs api`](#bs-api)
- [`bs api:check`](#bs-apicheck)
- [`bs api:diff`](#bs-apidiff)
- [`bs api:export`](#bs-apiexport)
- [`bs api:report`](#bs-apireport)
- [`bs api:update`](#bs-apiupdate)
- [`bs change`](#bs-change)
- [`bs change:create`](#bs-changecreate)
- [`bs change:export`](#bs-changeexport)
- [`bs change:publish`](#bs-changepublish)
- [`bs change:status`](#bs-changestatus)
- [`bs change:version`](#bs-changeversion)
- [`bs config`](#bs-config)
- [`bs config:create`](#bs-configcreate)
- [`bs config:init`](#bs-configinit)
- [`bs config:reset`](#bs-configreset)
- [`bs config:schema`](#bs-configschema)
- [`bs config:update`](#bs-configupdate)
- [`bs docs`](#bs-docs)
- [`bs docs:fix`](#bs-docsfix)
- [`bs docs:generate`](#bs-docsgenerate)
- [`bs lint`](#bs-lint)
- [`bs lint:check`](#bs-lintcheck)
- [`bs lint:fix`](#bs-lintfix)
- [`bs publish`](#bs-publish)
- [`bs publish:local`](#bs-publishlocal)
- [`bs registry`](#bs-registry)
- [`bs registry:clean`](#bs-registryclean)
- [`bs registry:setup`](#bs-registrysetup)
- [`bs registry:start`](#bs-registrystart)
- [`bs registry:stop`](#bs-registrystop)
- [`bs registry:upstream`](#bs-registryupstream)
- [`bs rollup`](#bs-rollup)
- [`bs rollup:fix`](#bs-rollupfix)
- [`bs rollup:generate`](#bs-rollupgenerate)
- [`bs semver`](#bs-semver)
- [`bs test`](#bs-test)
- [`bs test:build`](#bs-testbuild)
- [`bs test:report`](#bs-testreport)
- [`bs test:run`](#bs-testrun)
- [`bs test:unpack`](#bs-testunpack)
- [`bs update`](#bs-update)
- [`bs wiki`](#bs-wiki)
- [`bs help [COMMAND]`](#bs-help-command)
- [`bs plugins`](#bs-plugins)
- [`bs plugins:inspect PLUGIN...`](#bs-pluginsinspect-plugin)
- [`bs plugins:install PLUGIN`](#bs-pluginsinstall-plugin)
- [`bs plugins:link PATH`](#bs-pluginslink-path)
- [`bs plugins:reset`](#bs-pluginsreset)
- [`bs plugins:uninstall [PLUGIN]`](#bs-pluginsuninstall-plugin)
- [`bs plugins:update`](#bs-pluginsupdate)

## [Global Flags](#global-flags)

```text
  -B, --[no-]build         Toggle build related tasks.
  -C, --config=<path>      Path to the bs config file.
      --[no-]ci            Enable more verbose debug facilities, appropriate for CI usage.
      --dev                Use the dev build of your library.
      --[no-]docs          Toggle jsdoc/wiki related tasks.
      --json               Format output as json.
      --loglevel=<option>  Set the minimum log level to log.
                           <options: trace|debug|info|warning|error>
      --noBuildOrRollup    Disable build and rollup related tasks
      --prod               Use the prod build of your library.
      --[no-]rollup        Toggle rollup related tasks.
      --[no-]silence       Disable logging from external tooling.
      --[no-]stacktrace    Toggle stack trace logging for errors.
      --[no-]tty           Force toggle TTY exclusive behaviors.
```

## [`bs api`](#bs-api)

Commands for handling the public API file.

```text
USAGE
  $ bs api

DESCRIPTION
  Running this directly will update the public API file and the API docs in the wiki.
```

_See code: [src/commands/api/index.ts](https://github.com/daymxn/bs-cli/blob/main/src/commands/api/index.ts)_

## [`bs api:check`](#bs-apicheck)

Throws an error if there's any pending changes to the public API.

```text
USAGE
  $ bs api:check

DESCRIPTION
  Shorthand for calling `api diff` with the exit flag.

ALIASES
  $ bs api:validate
```

_See code: [src/commands/api/check.ts](https://github.com/daymxn/bs-cli/blob/main/src/commands/api/check.ts)_

## [`bs api:diff`](#bs-apidiff)

Generate a diff of the current public API.

```text
USAGE
  $ bs api:diff [-e] [-i <path>] [-o <path>] [--print]
    [--report]

FLAGS
  -e, --exit           Exit with a non zero status whenever there's a diff.
  -i, --input=<path>   Path to the current `api.md` file.
  -o, --output=<path>  Save diff output to a file.
      --[no-]print     Print the diff to the console.
      --report         Generate an API report, suitable for a GitHub comment, instead of a basic diff.

DESCRIPTION
  Generates the current public API and compares it to the saved `.api.md` file.

ALIASES
  $ bs api:changes
```

_See code: [src/commands/api/diff.ts](https://github.com/daymxn/bs-cli/blob/main/src/commands/api/diff.ts)_

## [`bs api:export`](#bs-apiexport)

Export the public API to a single `api.md` file.

```text
USAGE
  $ bs api:export [-v]

FLAGS
  -v, --verbose  Enable verbose logging for api-extractor.

DESCRIPTION
  Uses `api-extractor` to extract the public API.

ALIASES
  $ bs api:extract
  $ bs api:create
```

_See code: [src/commands/api/export.ts](https://github.com/daymxn/bs-cli/blob/main/src/commands/api/export.ts)_

## [`bs api:report`](#bs-apireport)

Generate a report file dictating any pending public API changes.

```text
USAGE
  $ bs api:report [-e]

FLAGS
  -e, --exit  Exit with a non zero status whenever there's a diff.

DESCRIPTION
  Shorthand for calling `api diff` with preconfigured flags.
```

_See code: [src/commands/api/report.ts](https://github.com/daymxn/bs-cli/blob/main/src/commands/api/report.ts)_

## [`bs api:update`](#bs-apiupdate)

Update the public api file.

```text
USAGE
  $ bs api:update

DESCRIPTION
  Generates the rollup file and runs `bs api export`.

ALIASES
  $ bs api:refresh
  $ bs api:save
```

_See code: [src/commands/api/update.ts](https://github.com/daymxn/bs-cli/blob/main/src/commands/api/update.ts)_

## [`bs change`](#bs-change)

Commands for handling changeset files.

```text
USAGE
  $ bs change

DESCRIPTION
  Running this directly will call the create command.
```

_See code: [src/commands/change/index.ts](https://github.com/daymxn/bs-cli/blob/main/src/commands/change/index.ts)_

## [`bs change:create`](#bs-changecreate)

Create a changeset entry.

```text
USAGE
  $ bs change:create

ALIASES
  $ bs change:add
```

_See code: [src/commands/change/create.ts](https://github.com/daymxn/bs-cli/blob/main/src/commands/change/create.ts)_

## [`bs change:export`](#bs-changeexport)

Export unreleased changes to a json file.

```text
USAGE
  $ bs change:export [-o <path>] [--since <string>]

FLAGS
  -o, --output=<path>   [default: ./changes.json] File to save the pending changes to
      --since=<string>  Limit changes to those since a specific branch or git tag.

DESCRIPTION
  Shorthand for calling the status command with an output file.

ALIASES
  $ bs change:save
  $ bs change:report
```

_See code: [src/commands/change/export.ts](https://github.com/daymxn/bs-cli/blob/main/src/commands/change/export.ts)_

## [`bs change:publish`](#bs-changepublish)

Publish the library to NPM.

```text
USAGE
  $ bs change:publish [--git-tag] [--push-tag] [--snapshot] [-t
    <string>] [--token <string>]

FLAGS
  -t, --tag=<string>    NPM tag to use when publishing the package.
      --[no-]git-tag    Create a git tag when publishing the package.
      --[no-]push-tag   Automatically push git tags after publishing.
      --[no-]snapshot   Creates a snapshot release.
      --token=<string>  NPM one-time password token.

DESCRIPTION
  Uses the `changeset publish` command to perform some automations during publishing (such as generating git tags).
```

_See code: [src/commands/change/publish.ts](https://github.com/daymxn/bs-cli/blob/main/src/commands/change/publish.ts)_

## [`bs change:status`](#bs-changestatus)

Get information about pending changes for the next release

```text
USAGE
  $ bs change:status [-o <path>] [--since <string>] [-v]

FLAGS
  -o, --output=<path>   Save pending changes to a JSON file.
  -v, --verbose         Get information about the new versions and include a link to matching changeset files.
      --since=<string>  Only display information about changes since a specific branch or git tag.

ALIASES
  $ bs change:info
  $ bs change:dump
```

_See code: [src/commands/change/status.ts](https://github.com/daymxn/bs-cli/blob/main/src/commands/change/status.ts)_

## [`bs change:version`](#bs-changeversion)

Consume changelog files to determine (and update) the version of releasing packages.

```text
USAGE
  $ bs change:version [--ignore <string>] [-t <string>
    --snapshot]

FLAGS
  -t, --tag=<string>     Snapshot tag to use.
      --ignore=<string>  Ignore changes from a specific package.
      --snapshot         Create a snapshot release.

DESCRIPTION
  This should run before the actual publishing of any packages.

ALIASES
  $ bs change:bump
  $ bs change:collect

EXAMPLES
  $ bs change:version

  Create a snapshot release

    $ bs change:version --snapshot -t "nightly"
```

_See code: [src/commands/change/version.ts](https://github.com/daymxn/bs-cli/blob/main/src/commands/change/version.ts)_

## [`bs config`](#bs-config)

Commands for handling the config file for the CLI.

```text
USAGE
  $ bs config
```

_See code: [src/commands/config/index.ts](https://github.com/daymxn/bs-cli/blob/main/src/commands/config/index.ts)_

## [`bs config:create`](#bs-configcreate)

Create a config file for the CLI.

```text
USAGE
  $ bs config:create [--exit | -f] [--path <path>] [--preset]

FLAGS
  -f, --[no-]force   Overwrite the existing config file, if one already exists.
      --[no-]exit    Throw an error if the config file already exists
      --path=<path>  [default: bs.config.json] Path to save the config file to.
      --[no-]preset  Use your existing config to create a new prefilled one.

DESCRIPTION
  The config file provides configurable default values for various command.
```

_See code: [src/commands/config/create.ts](https://github.com/daymxn/bs-cli/blob/main/src/commands/config/create.ts)_

## [`bs config:init`](#bs-configinit)

Scaffold the schema and config file for the CLI.

```text
USAGE
  $ bs config:init [-f] [--path <path>] [--preset]

FLAGS
  -f, --[no-]force   Overwrite the existing config file, if one already exists.
      --path=<path>  Path to save the config file to.
      --[no-]preset  Use your existing config to create a new prefilled one.

DESCRIPTION
  Creates the config file and generates the json schema for autocompletion.

  Effectively, this is the same as running the create and schema commands.
```

_See code: [src/commands/config/init.ts](https://github.com/daymxn/bs-cli/blob/main/src/commands/config/init.ts)_

## [`bs config:reset`](#bs-configreset)

Reset the config file to the default setting.

```text
USAGE
  $ bs config:reset [--path <path>]

FLAGS
  --path=<path>  [default: bs.config.json] Path to the config file.
```

_See code: [src/commands/config/reset.ts](https://github.com/daymxn/bs-cli/blob/main/src/commands/config/reset.ts)_

## [`bs config:schema`](#bs-configschema)

Save a local json schema of the config file.

```text
USAGE
  $ bs config:schema [-o <path>] [--settings <path>]
    [--update-vscode]

FLAGS
  -o, --output=<path>       [default: .vscode] Output directory to save the schema file to.
      --settings=<path>     [default: .vscode/settings.json] Path to the VSCode workspace settings.
      --[no-]update-vscode  Add the json schema to your VSCode workspace settings.

DESCRIPTION
  The json schema provides autocomplete and documentation in most IDEs while you're using the config file, which makes
  it easier to edit.
```

_See code: [src/commands/config/schema.ts](https://github.com/daymxn/bs-cli/blob/main/src/commands/config/schema.ts)_

## [`bs config:update`](#bs-configupdate)

Update your config file and the bs config json schema.

```text
USAGE
  $ bs config:update [--update-config] [--update-schema]

FLAGS
  --[no-]update-config  Update your config file with the current values, without overwriting unchanged values.
  --[no-]update-schema  Update the schema with any changes. Only really applicable when you've just updated the CLI and
                        there's configuration changes.

DESCRIPTION
  Useful when you want to quickly update your config file via global flags, or you've recently updated the CLI and want
  to also update your schema/config file
```

_See code: [src/commands/config/update.ts](https://github.com/daymxn/bs-cli/blob/main/src/commands/config/update.ts)_

## [`bs docs`](#bs-docs)

Commands for handling the wiki files.

```text
USAGE
  $ bs docs [-i <path>] [-o <path>]

FLAGS
  -i, --input=<path>   Folder containing *.api.json files to process.
  -o, --output=<path>  Folder to export the fixed markdown files to.

DESCRIPTION
  Running this directly will generate markdown files for the JSDoc public API and export them to the wiki for
  docusaurus.
```

_See code: [src/commands/docs/index.ts](https://github.com/daymxn/bs-cli/blob/main/src/commands/docs/index.ts)_

## [`bs docs:fix`](#bs-docsfix)

Perform various fixes on the generated markdown files so that they can be used with docusaurus.

```text
USAGE
  $ bs docs:fix [-i <path>] [-o <path>]

FLAGS
  -i, --input=<path>   Folder containing the generated markdown files to process.
  -o, --output=<path>  Folder to export the fixed markdown files to.

DESCRIPTION
  Markdown files generated from `api-documenter` have various issues that cause rendering issues in docusaurus.
```

_See code: [src/commands/docs/fix.ts](https://github.com/daymxn/bs-cli/blob/main/src/commands/docs/fix.ts)_

## [`bs docs:generate`](#bs-docsgenerate)

Export the public API as markdown files for use in the wiki.

```text
USAGE
  $ bs docs:generate [-i <path>] [-o <path>]

FLAGS
  -i, --input=<path>   Folder containing *.api.json files to process.
  -o, --output=<path>  Folder to export the markdown files to.

DESCRIPTION
  Uses `api-documenter` to generate the markdown files.

ALIASES
  $ bs docs:extract
  $ bs docs:create
```

_See code: [src/commands/docs/generate.ts](https://github.com/daymxn/bs-cli/blob/main/src/commands/docs/generate.ts)_

## [`bs lint`](#bs-lint)

Commands for handling eslint.

```text
USAGE
  $ bs lint

DESCRIPTION
  Running this directly will call the fix command.
```

_See code: [src/commands/lint/index.ts](https://github.com/daymxn/bs-cli/blob/main/src/commands/lint/index.ts)_

## [`bs lint:check`](#bs-lintcheck)

Run eslint and output any issues.

```text
USAGE
  $ bs lint:check [--cache] [-e <path>] [-p <string>...]

FLAGS
  -e, --eslint=<path>        Path to the eslint config file.
  -p, --pattern=<string>...  Pattern to use in finding files to run against.
      --[no-]cache           Only check changed files.

ALIASES
  $ bs lint:validate
```

_See code: [src/commands/lint/check.ts](https://github.com/daymxn/bs-cli/blob/main/src/commands/lint/check.ts)_

## [`bs lint:fix`](#bs-lintfix)

Run eslint and fix any fixable issues.

```text
USAGE
  $ bs lint:fix
```

_See code: [src/commands/lint/fix.ts](https://github.com/daymxn/bs-cli/blob/main/src/commands/lint/fix.ts)_

## [`bs publish`](#bs-publish)

Commands for handling the publishing of the library.

```text
USAGE
  $ bs publish [--dry-run --local] [--snapshot | ] [-t
    <string>] [--token <string>]

FLAGS
  -t, --tag=<string>    NPM tag to use when publishing the package.
      --dry-run         Perform a test publish without actually pushing the artifacts.
      --[no-]local      Publish the library to the local repository.
      --[no-]snapshot   Creates a snapshot release.
      --token=<string>  NPM one-time password token.

DESCRIPTION
  Running this directly will publish the library.
```

_See code: [src/commands/publish/index.ts](https://github.com/daymxn/bs-cli/blob/main/src/commands/publish/index.ts)_

## [`bs publish:local`](#bs-publishlocal)

Publish the library to the local repository.

```text
USAGE
  $ bs publish:local [--dry-run] [-t <string>]

FLAGS
  -t, --tag=<string>  NPM tag to use when publishing the package.
      --dry-run       Perform a test publish without actually pushing the artifacts.

DESCRIPTION
  The local copy is published under the assumption you're using verdaccio.
  If you need help setting up a server, you can use the `bs registry` subcommands.
```

_See code: [src/commands/publish/local.ts](https://github.com/daymxn/bs-cli/blob/main/src/commands/publish/local.ts)_

## [`bs registry`](#bs-registry)

Commands for hosting a local registry with verdaccio.

```text
USAGE
  $ bs registry

DESCRIPTION
  A local registry can be used inplace of npm for testing packages in a local environment before publishing them.

  We use verdaccio as the local registry, and pm2 to host the registry in the background.

EXAMPLES
  Setup a local registry

    $ bs registry setup

  Point your pnpm registry to your local registry

    $ bs registry sync

  Start the server for your local registry

    $ bs registry start
```

_See code: [src/commands/registry/index.ts](https://github.com/daymxn/bs-cli/blob/main/src/commands/registry/index.ts)_

## [`bs registry:clean`](#bs-registryclean)

Remove the local verdaccio repo, or delete published packages.

```text
USAGE
  $ bs registry:clean [-g] [--scope <string> --storage]

FLAGS
  -g, --[no-]global     Uninstall verdaccio globally.
      --scope=<string>  Specify a scope to remove, instead of removing all of them.
      --[no-]storage    Only remove published packages, instead of uninstalling verdaccio as a whole.

DESCRIPTION
  Will automatically stop the server before uninstalling.
  Note: This will NOT uninstall pm2, as you may be using that for other things.

ALIASES
  $ bs registry:delete
  $ bs registry:uninstall
  $ bs registry:remove
```

_See code: [src/commands/registry/clean.ts](https://github.com/daymxn/bs-cli/blob/main/src/commands/registry/clean.ts)_

## [`bs registry:setup`](#bs-registrysetup)

Setup a local registry with verdaccio/pm2.

```text
USAGE
  $ bs registry:setup [-g] [-h <string>] [--pm2] [-p <number>]
    [--verdaccio]

FLAGS
  -g, --[no-]global     Install packages in the global space.
  -h, --host=<string>   The host address to use for verdaccio.
  -p, --port=<number>   The port number to use for verdaccio.
      --[no-]pm2        Install pm2 with pnpm.
      --[no-]verdaccio  Install verdaccio with pnpm.

DESCRIPTION
  Installs verdaccio to host the registry, pm2 to run it in the background, and updates the verdaccio config to allow
  fake authorization access.

ALIASES
  $ bs registry:create
  $ bs registry:install
  $ bs registry:init
```

_See code: [src/commands/registry/setup.ts](https://github.com/daymxn/bs-cli/blob/main/src/commands/registry/setup.ts)_

## [`bs registry:start`](#bs-registrystart)

Start the local verdaccio server.

```text
USAGE
  $ bs registry:start [--local] [-n <string>]

FLAGS
  -n, --name=<string>  Name to use for the pm2 app.
      --[no-]local     Start the server locally instead of through pm2.

DESCRIPTION
  When ran without the `--local` flag, this will use the pm2 library to spawn a background service for the server.

ALIASES
  $ bs registry:startup
  $ bs registry:spawn
  $ bs registry:restart
  $ bs registry:refresh
```

_See code: [src/commands/registry/start.ts](https://github.com/daymxn/bs-cli/blob/main/src/commands/registry/start.ts)_

## [`bs registry:stop`](#bs-registrystop)

Stop the local verdaccio server.

```text
USAGE
  $ bs registry:stop [-n <string>]

FLAGS
  -n, --name=<string>  Name that the pm2 app is under.

DESCRIPTION
  Only applies to servers started with pm2 (without the --local flag).

ALIASES
  $ bs registry:kill
  $ bs registry:despawn
  $ bs registry:shutdown
```

_See code: [src/commands/registry/stop.ts](https://github.com/daymxn/bs-cli/blob/main/src/commands/registry/stop.ts)_

## [`bs registry:upstream`](#bs-registryupstream)

Change the registry that pnpm points to.

```text
USAGE
  $ bs registry:upstream [-g] [-h <string>] [-p <number>] [--reset]
    [--scope <string>]

FLAGS
  -g, --[no-]global     Modify the global pnpm config.
  -h, --host=<string>   The host address that verdaccio is using.
  -p, --port=<number>   The port number that verdaccio is using.
      --reset           Reset the registry to its default.
      --scope=<string>  Only route for packages under a specific scope.

DESCRIPTION
  You need to change the registry that pnpm points to if you want to use it with pnpm.

ALIASES
  $ bs registry:sync

EXAMPLES
  $ bs registry:upstream

  Reset the registry to the default (npm)

    $ bs registry:upstream --reset"
```

_See code: [src/commands/registry/upstream.ts](https://github.com/daymxn/bs-cli/blob/main/src/commands/registry/upstream.ts)_

## [`bs rollup`](#bs-rollup)

Commands handling rollup files.

```text
USAGE
  $ bs rollup

DESCRIPTION
  Running this directly uses tsup to generate a rollup file and applies various fixes to the output.
```

_See code: [src/commands/rollup/index.ts](https://github.com/daymxn/bs-cli/blob/main/src/commands/rollup/index.ts)_

## [`bs rollup:fix`](#bs-rollupfix)

Apply various fixes to the generated rollup file.

```text
USAGE
  $ bs rollup:fix [--combineAugmentations] [--identifierNames]
    [--input <path>] [--packageDocs] [--source <path>]

FLAGS
  --[no-]combineAugmentations  Combine module augmentations under the same namespace.
  --[no-]identifierNames       Remove the leading `$` from identifier names when present.
  --input=<path>               Path to the generated rollup file.
  --[no-]packageDocs           Prepend the package documentation from the index file to the rollup file.
  --source=<path>              Path to the root index.ts file.

DESCRIPTION
  Useful for fixing open bugs in tsup, or covering features not normally desired outside the rbxts ecosystem.
```

_See code: [src/commands/rollup/fix.ts](https://github.com/daymxn/bs-cli/blob/main/src/commands/rollup/fix.ts)_

## [`bs rollup:generate`](#bs-rollupgenerate)

Generate a single `.d.ts` file representing the API.

```text
USAGE
  $ bs rollup:generate

DESCRIPTION
  Uses `tsup` to generate the rollup.

ALIASES
  $ bs rollup:create
  $ bs rollup:run
```

_See code: [src/commands/rollup/generate.ts](https://github.com/daymxn/bs-cli/blob/main/src/commands/rollup/generate.ts)_

## [`bs semver`](#bs-semver)

Commands for handling semver related issues in changesets.

```text
USAGE
  $ bs semver

DESCRIPTION
  This is not implemented yet.
```

_See code: [src/commands/semver/index.ts](https://github.com/daymxn/bs-cli/blob/main/src/commands/semver/index.ts)_

## [`bs test`](#bs-test)

Commands for running unit tests locally with lune.

```text
USAGE
  $ bs test

DESCRIPTION
  Running this directly will run the `run` command.

ALIASES
  $ bs tests
```

_See code: [src/commands/test/index.ts](https://github.com/daymxn/bs-cli/blob/main/src/commands/test/index.ts)_

## [`bs test:build`](#bs-testbuild)

Build a rbxl file of your library (to use for testing).

```text
USAGE
  $ bs test:build [-o <path>] [--project <path>]

FLAGS
  -o, --output=<path>   Where to save the rbxl file to.
      --project=<path>  Rojo project.json file to build with.

DESCRIPTION
  Uses `rojo build` to create the rbxl file.

ALIASES
  $ bs test:export
```

_See code: [src/commands/test/build.ts](https://github.com/daymxn/bs-cli/blob/main/src/commands/test/build.ts)_

## [`bs test:report`](#bs-testreport)

Generate json and markdown files reporting unit test results.

```text
USAGE
  $ bs test:report

DESCRIPTION
  Shorthand for calling run with prefilled arguments.
```

_See code: [src/commands/test/report.ts](https://github.com/daymxn/bs-cli/blob/main/src/commands/test/report.ts)_

## [`bs test:run`](#bs-testrun)

Run unit tests locally with lune.

```text
USAGE
  $ bs test:run [--console] [--dir <path>] [--exit]
    [--jsonPath <path>] [--markdownPath <path>] [--pass] [--rbxl <path>] [--rebuild] [--report] [--skip] [--trim]

FLAGS
  --[no-]console         Log the result of the tests to the console.
  --dir=<path>           Directory with a lune script to invoke.
  --[no-]exit            If there are any failures, exit with a non zero status.
  --jsonPath=<path>      Export a copy of the test report as a json file.
  --markdownPath=<path>  Export a copy of the test report as a markdown file.
  --[no-]pass            Show passed tests in the console output.
  --rbxl=<path>          Path to the rbxl file to use during testing.
  --[no-]rebuild         Rebuild the test files before running tests.
  --[no-]report          Generate test report files.
  --[no-]skip            Show skipped tests in the console output.
  --[no-]trim            If all tests share a common category, trim it from the output.

ALIASES
  $ bs test:start
```

_See code: [src/commands/test/run.ts](https://github.com/daymxn/bs-cli/blob/main/src/commands/test/run.ts)_

## [`bs test:unpack`](#bs-testunpack)

Copy the test runner files to your local directory, and use those instead of the bundled ones.

```text
USAGE
  $ bs test:unpack [-o <path>] [--update]

FLAGS
  -o, --output=<path>  [default: ./tests] Where to save runner files to.
      --[no-]update    Update your config file to point to the unpacked test runner.

DESCRIPTION
  Useful if you need to make changes to the test runner filers (eg; adding shims).

ALIASES
  $ bs test:download
```

_See code: [src/commands/test/unpack.ts](https://github.com/daymxn/bs-cli/blob/main/src/commands/test/unpack.ts)_

## [`bs update`](#bs-update)

Update your CLI to the latest version.

```text
USAGE
  $ bs update [--branch <value>]

FLAGS
  --branch=<value>  [default: main] Github branch to pull the update from

DESCRIPTION
  Since bs isn't published to any registry, you can use this command to automatically update your github repo
  dependency.

  If this command isn't working for some reason, you can manually run `pnpm add daymxn/bs-cli`, and pnpm will pull the
  latest version.
```

_See code: [src/commands/update.ts](https://github.com/daymxn/bs-cli/blob/main/src/commands/update.ts)_

## [`bs wiki`](#bs-wiki)

Commands for handling the wiki files.

```text
USAGE
  $ bs wiki

DESCRIPTION
  This is not implemented yet.
```

_See code: [src/commands/wiki/index.ts](https://github.com/daymxn/bs-cli/blob/main/src/commands/wiki/index.ts)_

## [`bs help [COMMAND]`](#bs-help-command)

Display help for bs.

```text
USAGE
  $ bs help [COMMAND...] [-n]

ARGUMENTS
  COMMAND...  Command to show help for.

FLAGS
  -n, --nested-commands  Include all nested commands in the output.
```

_See code: [@oclif/plugin-help](https://github.com/oclif/plugin-help/blob/main/src/commands/help.ts)_

## [`bs plugins`](#bs-plugins)

List installed plugins.

```text
USAGE
  $ bs plugins [--core]

FLAGS
  --core  Show core plugins.

EXAMPLES
  $ bs plugins
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/main/src/commands/plugins/index.ts)_

## [`bs plugins:inspect PLUGIN...`](#bs-pluginsinspect-plugin)

Displays installation properties of a plugin.

```text
USAGE
  $ bs plugins:inspect PLUGIN...

ARGUMENTS
  PLUGIN...  [default: .] Plugin to inspect.

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

EXAMPLES
  $ bs plugins:inspect myplugin 
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/main/src/commands/plugins/inspect.ts)_

## [`bs plugins:install PLUGIN`](#bs-pluginsinstall-plugin)

Installs a plugin into bs.

```text
USAGE
  $ bs plugins:install PLUGIN... [-f] [-h] [-s | -v]

ARGUMENTS
  PLUGIN...  Plugin to install.

FLAGS
  -f, --force    Force npm to fetch remote resources even if a local copy exists on disk.
  -h, --help     Show CLI help.
  -s, --silent   Silences npm output.
  -v, --verbose  Show verbose npm output.

DESCRIPTION
  Uses npm to install plugins.

  Installation of a user-installed plugin will override a core plugin.

  Use the BS_NPM_LOG_LEVEL environment variable to set the npm loglevel.
  Use the BS_NPM_REGISTRY environment variable to set the npm registry.

ALIASES
  $ bs plugins:add

EXAMPLES
  Install a plugin from npm registry.

    $ bs plugins:install myplugin

  Install a plugin from a github url.

    $ bs plugins:install https://github.com/someuser/someplugin

  Install a plugin from a github slug.

    $ bs plugins:install someuser/someplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/main/src/commands/plugins/install.ts)_

## [`bs plugins:link PATH`](#bs-pluginslink-path)

Links a plugin into the CLI for development.

```text
USAGE
  $ bs plugins:link PATH [-h] [--install] [-v]

ARGUMENTS
  PATH  [default: .] path to plugin

FLAGS
  -h, --help          Show CLI help.
  -v, --verbose
      --[no-]install  Install dependencies after linking the plugin.

DESCRIPTION
  Installation of a linked plugin will override a user-installed or core plugin.

  e.g. If you have a user-installed or core plugin that has a 'hello' command, installing a linked plugin with a 'hello'
  command will override the user-installed or core plugin implementation. This is useful for development work.


EXAMPLES
  $ bs plugins:link myplugin 
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/main/src/commands/plugins/link.ts)_

## [`bs plugins:reset`](#bs-pluginsreset)

Remove all user-installed and linked plugins.

```text
USAGE
  $ bs plugins:reset [--hard] [--reinstall]

FLAGS
  --hard       Delete node_modules and package manager related files in addition to uninstalling plugins.
  --reinstall  Reinstall all plugins after uninstalling.
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/main/src/commands/plugins/reset.ts)_

## [`bs plugins:uninstall [PLUGIN]`](#bs-pluginsuninstall-plugin)

Removes a plugin from the CLI.

```text
USAGE
  $ bs plugins:uninstall [PLUGIN...] [-h] [-v]

ARGUMENTS
  PLUGIN...  plugin to uninstall

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose

ALIASES
  $ bs plugins:unlink
  $ bs plugins:remove

EXAMPLES
  $ bs plugins:uninstall myplugin
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/main/src/commands/plugins/uninstall.ts)_

## [`bs plugins:update`](#bs-pluginsupdate)

Update installed plugins.

```text
USAGE
  $ bs plugins:update [-h] [-v]

FLAGS
  -h, --help     Show CLI help.
  -v, --verbose
```

_See code: [@oclif/plugin-plugins](https://github.com/oclif/plugin-plugins/blob/main/src/commands/plugins/update.ts)_
