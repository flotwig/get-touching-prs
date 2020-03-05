# get-touching-prs

[![Gitlab pipeline status (self-hosted)][ci-badge]][ci]
[![npm bundle size][size-badge]][npm]
[![npm][npm-badge]][npm]

[`get-touching-prs`][npm] is a module + CLI tool that helps you find open GitHub pull requests that modify certain files.

## Installation

```shell
npm i -g get-touching-prs
## or
yarn global add get-touching-prs
```

## Usage (CLI)

Ensure that the `GITHUB_TOKEN` environment variable contains a valid GitHub Personal Access Token. Then, run:

```shell
get-touching-prs --owner <owner> --repo <repo> glob1 [glob2...]
```

A list of matching open PRs and conflicting files will be returned.

For example, to get a list of all currently modified `.coffee` files in `cypress-io/cypress`, you could run:

```shell
get-touching-prs --owner cypress-io --repo cypress '**/*.coffee'
```

Excerpt from output:

```
39 PRs touching the supplied patterns were found in cypress-io/cypress:
 - render ansi colors for file:preprocessor error message - @Bkucera - https://github.com/cypress-io/cypress/pull/6535
   Potentially conflicting files: 2
    - packages/server/lib/plugins/preprocessor.coffee differs, matching glob **/*.coffee
    - packages/server/test/unit/plugins/preprocessor_spec.coffee differs, matching glob **/*.coffee
...
```

## Usage (module)

```js
const { getTouchingPrs } = require('get-touching-prs')

// see src/index.ts for types
getTouchingPrs(owner, repo, ghToken, patterns)
```

[ci-badge]: https://img.shields.io/gitlab/pipeline/flotwig/get-touching-prs?gitlab_url=https%3A%2F%2Fci.chary.us
[ci]: https://ci.chary.us/flotwig/get-touching-prs/pipelines
[size-badge]: https://img.shields.io/bundlephobia/min/get-touching-prs
[npm-badge]: https://img.shields.io/npm/v/get-touching-prs
[npm]: https://www.npmjs.com/package/get-touching-prs
