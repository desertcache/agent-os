# Project Mapping Examples

How to configure `agent-os.config.json` for different project structures.

## Single Project

```json
{
  "projects": [
    {
      "name": "my-app",
      "codebase": "/home/user/code/my-app",
      "vault": "Projects/my-app"
    }
  ]
}
```

## Monorepo with Multiple Apps

```json
{
  "projects": [
    {
      "name": "api",
      "codebase": "/home/user/code/monorepo/apps/api",
      "vault": "Projects/api"
    },
    {
      "name": "web",
      "codebase": "/home/user/code/monorepo/apps/web",
      "vault": "Projects/web"
    },
    {
      "name": "mobile",
      "codebase": "/home/user/code/monorepo/apps/mobile",
      "vault": "Projects/mobile"
    },
    {
      "name": "monorepo",
      "codebase": "/home/user/code/monorepo",
      "vault": null
    }
  ]
}
```

Note: List specific app paths before the monorepo root. The preloader matches the first project whose codebase path is a prefix of the current directory. More specific paths should come first.

The monorepo root entry with `"vault": null` catches cases where you're in the monorepo but not in a specific app.

## Multiple Independent Repos

```json
{
  "projects": [
    {
      "name": "client-portal",
      "codebase": "/home/user/work/client-portal",
      "vault": "Projects/client-portal"
    },
    {
      "name": "data-pipeline",
      "codebase": "/home/user/work/data-pipeline",
      "vault": "Projects/data-pipeline"
    },
    {
      "name": "side-project",
      "codebase": "/home/user/personal/side-project",
      "vault": "Projects/side-project"
    }
  ]
}
```

## Corresponding CLAUDE.md Table

Your CLAUDE.md should have a matching table:

```markdown
## PROJECT-CODEBASE MAPPING

| Vault Folder | Codebase |
|--------------|----------|
| `Projects/api/` | `/home/user/code/monorepo/apps/api/` |
| `Projects/web/` | `/home/user/code/monorepo/apps/web/` |
| `Projects/mobile/` | `/home/user/code/monorepo/apps/mobile/` |
```

This table is used by skills that need to resolve project names to paths. The config file is used by hooks. Keep them in sync — `/audit-instructions` will flag any mismatches.

## Corresponding Vault Structure

```
<vault>/
├── Projects/
│   ├── api/
│   │   └── README.md
│   ├── web/
│   │   └── README.md
│   └── mobile/
│       └── README.md
├── Sessions/
├── Reference/
└── Planning/
```

Each project folder should have at minimum a `README.md` with the project's current status.
