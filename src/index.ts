import minimatch from 'minimatch'
import { getQuery } from './query'
import https from 'https'

type NodeList<T> = {
  pageInfo: {
    hasNextPage: boolean
  }
  totalCount: number
  nodes: T[]
}

type RequestTouchingPrsResponse = {
  data: {
    repository: {
      pullRequests: NodeList<PullRequest>
    }
  }
}

type PullRequest = {
  author: {
    login: string
  }
  updatedAt: string
  title: string
  permalink: string
  files: NodeList<PullRequestChangedFile>
}

type PullRequestChangedFile = {
  path: string
}

export function requestTouchingPrs(owner: string, repo: string, ghToken: string): Promise<RequestTouchingPrsResponse> {
  const req = https.request('https://api.github.com/graphql', {
    headers: {
      'authorization': `bearer ${ghToken}`,
      'content-type': 'application/json',
      'user-agent': 'prs-touching-these-files'
    },
    method: 'POST'
  })

  return (new Promise((resolve, reject) => {
    req.on('error', reject)

    req.write(JSON.stringify({ query: getQuery(owner, repo, 100) }))

    req.on('response', (res) => {
      let text = ''
      res.on('data', (buf) => {
        text += buf.toString()
      })
      res.on('end', () => { resolve(text) })
      res.on('error', reject)
    })

    req.end()
  }) as Promise<string>)
  .then(JSON.parse)
}

type TouchingPr = {
  title: string
  permalink: string
  author: string
  updatedAt: Date
  conflicts: ConflictingFile[]
}

type ConflictingFile = {
  matchedPath: string
  prPath: string
}

export function getTouchingPrs(owner: string, repo: string, ghToken: string, patterns: string[]): Promise<TouchingPr[]> {
  return requestTouchingPrs(owner, repo, ghToken)
  .then((prs) => {
    console.log(JSON.stringify(prs.data, null, 2))

    const touchingPrs: TouchingPr[] = []

    for(const i in prs.data.repository.pullRequests.nodes) {
      const pr = prs.data.repository.pullRequests.nodes[i]

      const touchingPr: TouchingPr = {
        title: pr.title,
        permalink: pr.permalink,
        author: pr.author.login,
        updatedAt: new Date(pr.updatedAt),
        conflicts: []
      }

      for (const j in pr.files.nodes) {
        const file = pr.files.nodes[j]

        patterns.forEach(pattern => {
          if(minimatch(file.path, pattern)) {
            touchingPr.conflicts.push({ matchedPath: pattern, prPath: file.path})
          }
        })
      }

      if (touchingPr.conflicts.length) {
        touchingPrs.push(touchingPr)
      }
    }

    console.log(JSON.stringify(touchingPrs, null, 2))

    return touchingPrs
  })
}
