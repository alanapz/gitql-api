# gitql-api

NestJS GraphQL front-end to low-level Git objects.

- GitHub: https://github.com/alanapz/gitql-api
- Framework: NestJS w/ GraphQL schema-first (https://nestjs.com/)
- Schema: https://raw.githubusercontent.com/alanapz/gitql/develop/gitql-api/schema/schema.graphqls

## Why ?

- To become more familiar with the lower-level "plumbing" commands

Git-QL uses _only_ the low-level "plumbing" commands of Git (eg: git cat-file, git update-index, git hash-object).
It notably does _not_ use the higher-level "porcelain" commands (eg: git show, git log, etc).

Useful guide: https://git-scm.com/book/en/v2/Git-Internals-Git-Objects

- To become more familiar with the NestJS GraphQL architecture

Happily enough, the NestJS framework was a real joy to use.

GraphQL quickstart: https://docs.nestjs.com/graphql/quick-start

Query resolver: https://github.com/alanapz/gitql/blob/develop/gitql-api/src/query/repository/RepositoryResolver.ts

## How To Run

The easiest way is via the predefined Docker Compose:

```
curl https://raw.githubusercontent.com/alanapz/gitql/main/ci/docker-compose.yaml | docker-compose -f - up
```

The GraphQL playground should be available at: http://localhost:3000/graphql

(The "ts-node src/generate-typings" is used to create the corresponding TypeScript classes from the GraphQL schema)

## Example Queries

All queries are performed via the excellent GraphQL Playground (http://localhost:3000/graphql)

We use "../" as the repository path to mean the GitQL repository itself.

You can replace it with, for example, `path: "c:\path\to\git\repo"` to work on a different repository.

- Get all blobs (managed data objects) in a repository:

```
query {
  repository(path: "../") {
    blobs { id, size, value }
  }
}
```

- Get all trees (hierarchical data structures used to store blobs and subtrees) and their contents in a repository:

```
query {
  repository(path: "../") {
    trees { id, items { name, type, id, mode}}
  }
}
```

- Walk tree hierachy (replace HEAD by `git cat-file -p $(git rev-parse head) | grep -oP "(tree\s+)\K(.*)"`)

```
query {
  repository(path: "../") {
    tree(id: "a6e6de841a27ce1f957b54cf07f21ebd61e8cd32") {
      item(name: "gitql-api/schema/schema.graphqls") { blob { value }} 
    }
  }
}
```

- Show all commits and their ancestors (all previous commits reachable from a commit)

```
query {
  repository(path: "..") {
    commits { message, ancestors { id, message } }
  }
}
```