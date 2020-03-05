#!/usr/bin/env node

import c from 'chalk'
import minimist from 'minimist'
import { getTouchingPrs } from './'

const log = console.log

const { owner, repo, _: varArgs } = minimist(process.argv, {
  string: ['owner', 'repo'],
})

const ghToken = process.env.GITHUB_TOKEN

const patterns = varArgs.slice(2).map(s => s.replace(/^['"]([^'"]*)['"]$/, '$1'))

const printUsage = () => {
  log('Outputs a list of PRs with changed files matching the passed globs.')
  log('')
  log('Usage: get-touching-prs --owner <owner> --repo <repo> glob1 [glob2...]')
  log('')
  log('GITHUB_TOKEN should be set to a GitHub Personal Access Token.')
}

if (!owner && !repo && !patterns.length) {
  printUsage()
  process.exit(1)
}

Promise.resolve()
.then(() => {
  if (!owner) {
    throw new Error('--owner was not passed.')
  }

  if (!repo) {
    throw new Error('--repo was not passed.')
  }

  if (!patterns.length) {
    throw new Error('At least 1 glob pattern must be passed.')
  }

  if (!ghToken) {
    throw new Error('GITHUB_TOKEN is not set.')
  }

  return getTouchingPrs(owner, repo, ghToken, patterns)
})
.then(touchingPrs => {
  if (!touchingPrs.length) {
    log(c.greenBright(`No PRs were found in ${owner}/${repo} matching these globs:`))
    patterns.forEach(pattern => {
      log(` - ${pattern}`)
    })
    return
  }

  log(`${touchingPrs.length} PRs touching the supplied patterns were found in ${owner}/${repo}:`)
  touchingPrs.forEach(({ title, conflicts, author, permalink }) => {
    log(` - ${title} - @${author} - ${c.blue(permalink)}`)
    log(`   Potentially conflicting files: ${conflicts.length}`)
    conflicts.forEach(({ matchedPath, prPath }) => {
      log(`    - ${c.green(prPath)} differs, matching glob ${c.magenta(matchedPath)}`)
    })
  })
})
.catch((err) => {
  console.error(err.message)

  printUsage()
  process.exit(1)
})
