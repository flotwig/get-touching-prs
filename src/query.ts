export function getQuery(owner: string, repo: string, first: number) {
  return `query {
    repository(name: "${repo}", owner: "${owner}") {
      pullRequests(first: ${first}, states: OPEN, orderBy: { field: UPDATED_AT, direction: DESC } ) {
        nodes {
          author {
            login
          }
          updatedAt
          title
          permalink
          files(first: 100) {
            nodes {
              path
            }
            pageInfo {
              hasNextPage
            }
            totalCount
          }
        }
        pageInfo {
          hasNextPage
        }
        totalCount
      }
    }
  }`
}
