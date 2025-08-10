# `complete-cli`

[![npm version](https://img.shields.io/npm/v/complete-cli.svg)](https://www.npmjs.com/package/complete-cli)

This package contains a CLI tool that helps you bootstrap [TypeScript](https://www.typescriptlang.org/) projects.

## Commands

### `check`

Checks the current project for out-of-date files that came from the initial bootstrap.

### `init`

Initializes a new TypeScript project. For a list of all the files that we include in a new project, see [below](#files).

(This is the main command that most people will use this tool for.)

### `metadata`

Creates a [`package-metadata.json`](#package-metadatajson) file to document locked dependencies. (The "update" command will respect the contents of this file.)

### `nuke`

Deletes the "node_modules" directory and the package lock file, then reinstalls the dependencies for the project.

This kind of thing is helpful if you use the [npm](https://docs.npmjs.com/cli/v11/commands/npm) package manager, since changing your dependencies can often result in a corrupted "node_modules" directory.

### `publish`

Bumps the version & publishes a new release.

Specifically, this will:

- Run `git pull`.
- Run `git push`.
- Update dependencies.
- Increment the version.
- Ensure that the project builds.
- Ensure that the project lints.
- Commit the version change.
- Run `npm publish`.

### `update`

Invokes [`npm-check-updates`](https://github.com/raineorshine/npm-check-updates) to update the dependencies inside of the "package.json" file and then installs them.

## Files

### [`.gitattributes`](https://github.com/complete-ts/complete/blob/main/packages/complete-cli/file-templates/static/_gitattributes)

This contains specific Git attributes that should be applied to this Git repository, if present. It contains a lot of good defaults to prevent common Git pitfalls.

### [`.github`](https://github.com/complete-ts/complete/tree/main/packages/complete-cli/file-templates/static/.github)

This directory contains files related to [GitHub](https://github.com/). If you do not use GitHub, feel free to delete this directory.

### [`.github/workflows/ci.yml`](https://github.com/complete-ts/complete/blob/main/packages/complete-cli/file-templates/static/.github/workflows/ci.yml)

This directory contains the file for [GitHub Actions](https://github.com/features/actions) (i.e. [continuous integration](https://en.wikipedia.org/wiki/Continuous_integration)).

By default, it contains a job to build the project and lint the project. (It is also common to test the project in CI, but that is not included by default.)

Additionally, it includes a Discord failure notification. If you do not use Discord, feel free to delete this block. Otherwise, you need to set a "DISCORD_WEBHOOK" secret on your repository. Specifically:

- Right click on a channel in Discord and select "Edit Channel".
- Click on "Integrations" on the left menu.
- Click on the "Create Webhook" button.
- Click on the box for the new webhook that was created.
- Change the name to "GitHub".
- Change the image to [the GitHub icon](https://raw.githubusercontent.com/complete-ts/complete/main/misc/github.png).
- Click on the "Save Changes" button at the bottom.
- Click on the "Copy Webhook URL" button.
- Go to the main page for your repository on GitHub.
- Click on the "Settings" tab near the top.
- Click on "Secrets and variables" in the left menu.
- Click on "Actions" from the dropdown list.
- Click on the "New repository secret" button in the top right.
- For the "Name" box, use "DISCORD_WEBHOOK" (without the quotes).
- For the "Secret" box, paste in the URL that was copied in the "Copy Webhook URL" step. (The pasted URL should not have a "/github" suffix.)
- Click on the "Add secret" button.

### [`.github/workflows/setup/action.yml`](https://github.com/complete-ts/complete/blob/main/packages/complete-cli/file-templates/dynamic/.github/workflows/setup/action.yml)

This contains a composite job that is used by the `.github/workflows/ci.yml` file.

### [`.gitignore`](https://github.com/complete-ts/complete/blob/main/packages/complete-cli/file-templates/dynamic/_gitignore)

This contains a list of files that should not be added to a Git repository, if present. It contains a lot of good defaults to prevent common Git pitfalls.

If you have a private file that you do not want to be committed to the repository, you can edit this file and add it.

### .npmrc

This contains good defaults for the `npm` command. It will only be installed if your package manager is `npm`.

(`pnpm` also uses settings from this file by default, so it will also be installed if your package manager is `pnpm`.)

### [`.prettierignore`](https://github.com/complete-ts/complete/blob/main/packages/complete-cli/file-templates/static/.prettierignore)

This contains a list of files that should not be automatically formatted by [Prettier](https://prettier.io/). It contains a lot of good defaults to prevent common Prettier pitfalls.

### [`.vscode`](https://github.com/complete-ts/complete/tree/main/packages/complete-cli/file-templates/static/.vscode)

This directory contains files related to [VSCode](https://code.visualstudio.com/), considered to be the best code editor for TypeScript. If you do not use VSCode, feel free to delete this directory.

### [`.vscode/extensions.json`](https://github.com/complete-ts/complete/blob/main/packages/complete-cli/file-templates/static/.vscode/extensions.json)

This contains VSCode settings that will apply to anyone opening your project. It contains a lot of good defaults to prevent common VSCode pitfalls.

### [`.vscode/settings.json`](https://github.com/complete-ts/complete/blob/main/packages/complete-cli/file-templates/static/.vscode/settings.json)

This contains a list of VSCode extensions that are needed for the squiggly lines in the editor to work properly. If your project is opened by someone who does not have these extensions installed, a helpful popup will appear and recommend that they be installed.

### [`cspell.config.jsonc`](https://github.com/complete-ts/complete/blob/main/packages/complete-cli/file-templates/static/_cspell.config.jsonc)

This is the configuration file for [CSpell](https://cspell.org/), a spell-checker for code. It contains a lot of good defaults to prevent common CSpell pitfalls.

If VSCode incorrectly reports that a file is misspelled, you can right-click on the word and say "Add Words to CSpell Configuration". Then, the word will then be recorded in this file and the squiggly line will go away.

### `dist`

This is the directory that contains the compiled output of the program. When the program is built, the TypeScript files in the "src" directory will be converted to JavaScript files in the "dist" directory. It will not exist unless you have built the program at least once.

In JavaScript/TypeScript, "dist" [is](https://www.typescriptlang.org/docs/handbook/declaration-files/publishing.html) [the](https://docs.npmjs.com/cli/v9/configuring-npm/package-json#directories) [idiomatic](https://webpack.js.org/configuration/output/) [name](https://cli.vuejs.org/config/#outputdir) for this.

### [`eslint.config.mjs`](https://github.com/complete-ts/complete/blob/main/packages/complete-cli/file-templates/static/eslint.config.mjs)

This is the configuration file for [ESLint](https://eslint.org/), the TypeScript linter. By default, it includes the standard linting config from [eslint-config-complete](eslint-config-complete.md).

You can edit this file if you need to disable a specific linting rule.

### [`knip.config.js`](https://github.com/complete-ts/complete/blob/main/packages/complete-cli/file-templates/static/knip.config.js)

This is the configuration file for [Knip](https://knip.dev/), a tool that checks for unused files, exports, and dependencies. By default, it suppresses warnings for the [complete-lint](complete-lint.md) meta package.

### [`LICENSE`](https://github.com/complete-ts/complete/blob/main/packages/complete-cli/file-templates/static/LICENSE)

This is [the idiomatic name for a license file on GitHub](https://docs.github.com/en/communities/setting-up-your-project-for-healthy-contributions/adding-a-license-to-a-repository). By default, we will install [the MIT license](https://opensource.org/license/mit), but feel free to replace it with one that is appropriate for your project. ([GPLv3](https://www.gnu.org/licenses/gpl-3.0.en.html) is the other most common choice for open-source software.)

### `node_modules`

This directory contains the dependencies for the project that were specified in the "package.json" file. By default, this will be TypeScript, ESLint, Prettier, and so on.

More info:

- The "node_modules" directory is generated when you type `npm install` in a directory with a "package.json" file in it.
- `complete-cli init` automatically creates a "package.json" file for you and does an `npm install` when you initialize a new project.
- This directory will contain a lot of files and is usually 100+ megabytes in size.
- The "node_modules" directory is listed inside of the ".gitignore" file generated by `complete-cli init`. That way, it is [correctly excluded from being tracked in a Git repository](https://old.reddit.com/r/webdev/comments/pdz3oi/should_i_gitignore_node_modules/). (The directory size is too big.)

### [`package.json`](https://github.com/complete-ts/complete/blob/main/packages/complete-cli/file-templates/dynamic/package.json)

This is the configuration file for [npm](https://docs.npmjs.com/cli/v11/commands/npm), the [Node.js](https://nodejs.org/en) package manager. It contains a description of your project and all of its dependencies. If you add a new dependency (with e.g. `npm install react --save`), then npm would automatically edit the "package.json" file accordingly.

By default, `complete-cli init` includes the following dependencies:

- `complete-cli` - Helpful for updating dependencies and keeping the template files up to date.
- `complete-lint` - Necessary to format and lint the project.
- `complete-node` - Necessary for the build and lint scripts that are installed by default. (They are written in TypeScript instead of e.g. Bash).
- `typescript` - Provides the ability to type-check and compile TypeScript code.

### `package-lock.json`

By default, `complete-cli init` will use the npm package manager to install the dependencies for the project. When npm does this, it creates [this lock file](https://docs.npmjs.com/cli/v9/configuring-npm/package-lock-json) so that the "node_modules" directory can be exactly reproduced. You are not supposed to edit this file; just leave it in place so that npm can function correctly.

### `package-metadata.json`

This file is only inserted in your project if one of the dependencies needs to be held back from the latest version. For example, it is common to have the latest version of TypeScript not be compatible with the latest version of [typescript-eslint](https://typescript-eslint.io/).

The format of this file is something like the following:

```json
{
  "dependencies": {
    "typescript": {
      "lock-version": true,
      "lock-reason": "https://github.com/typescript-eslint/typescript-eslint/issues/10884"
    }
  }
}
```

### [`prettier.config.mjs`](https://github.com/complete-ts/complete/blob/main/packages/complete-cli/file-templates/static/prettier.config.mjs)

This is the configuration file for [Prettier](https://prettier.io/), the formatter. If you need to modify a specific option of Prettier, you can edit this file.

### [`README.md`](https://github.com/complete-ts/complete/blob/main/packages/complete-cli/file-templates/dynamic/README.md)

This is [the idiomatic name for a README file on GitHub](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes). You should edit to to contain a brief description of your project. It uses [Markdown](https://www.markdownguide.org/), which is the standard format for README files.

### [`scripts`](https://github.com/complete-ts/complete/tree/main/packages/complete-cli/file-templates/static/scripts)

This directory contains TypeScript scripts that are listed in the "package.json" file. (It is more maintainable to have project scripts be written in TypeScript than e.g. Bash or Python.)

### [`scripts/build.ts`](https://github.com/complete-ts/complete/blob/main/packages/complete-cli/file-templates/static/scripts/build.ts)

By default, the build script will remove the "dist" directory (if it exists) and then use the TypeScript compiler to convert the TypeScript files in the "src" directory to JavaScript files in the "dist" directory.

You can edit this file if you want to use a different bundler such as [esbuild](https://esbuild.github.io/) or if you need to perform other tasks in addition to invoking `tsc`.

### [`scripts/lint.ts`](https://github.com/complete-ts/complete/blob/main/packages/complete-cli/file-templates/static/scripts/lint.ts)

By default, the lint script performs [these steps](complete-lint.md#step-5---create-a-lint-script). Edit this file if a certain type of check does not make sense for your specific project or if you want to add more checks.

### [`scripts/tsconfig.json`](https://github.com/complete-ts/complete/blob/main/packages/complete-cli/file-templates/static/scripts/tsconfig.json)

The "scripts" directory needs its own TypeScript config file because we want the scripts to be linted in the same way as all of the other files in the "src" directory, but we do not want them inserted into the compiled output. (Furthermore, if the main project is targeted at browsers, then the scripts folder needs to be targeted at Node.js.)

### [`src`](https://github.com/complete-ts/complete/tree/main/packages/complete-cli/file-templates/static/src)

This is the TypeScript source directory. All of the TypeScript files for the project should live in here. When the program is built, the TypeScript files in the "src" directory will be converted to JavaScript files in the "dist" directory.

### [`src/main.ts`](https://github.com/complete-ts/complete/blob/main/packages/complete-cli/file-templates/static/src/main.ts)

A "hello world" file that is intended to be replaced with your code. By default, this is linked to the "start" script in the "package.json" file.

### [`tsconfig.json`](https://github.com/complete-ts/complete/blob/main/packages/complete-cli/file-templates/static/tsconfig.json)

These are the configuration files for the TypeScript programming language.

By default, `complete-cli` will install a configuration for a [Node.js](https://nodejs.org/en) program. If you are writing a web application instead, then you should change "tsconfig.node.json" to "tsconfig.browser.json".

You can also edit this file if you need to add or remove a particular compiler flag.
