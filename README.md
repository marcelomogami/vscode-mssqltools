# MSSQL Tools

Compare stored procedures across SQL Server environments directly from VSCode, using your existing [SQL Server (mssql)](https://marketplace.visualstudio.com/items?itemName=ms-mssql.mssql) extension connections.

Open a local `.sql` file and diff it against the live procedure on DEV, HOM, or PROD — no SSMS required.

---

## Features

- **Diff Procedure** — side-by-side diff between the local `.sql` file and the remote procedure DDL
- **Open Procedure** — open the remote procedure in a read-only tab for inspection
- **Multi-environment** — pick DEV, HOM, PROD (or any environment) at runtime via Quick Pick
- **Zero extra credentials** — reuses the connections already configured in the MSSQL extension (passwords stay in the OS keychain)
- **Procedure auto-detection** — parses `CREATE / ALTER / CREATE OR ALTER PROCEDURE` from the file content; falls back to the filename
- **Per-connection database override** — each entry in `mssqltools.json` can target a different database

---

## Getting Started

**1.** Install [SQL Server (mssql)](https://marketplace.visualstudio.com/items?itemName=ms-mssql.mssql) and add your connections in the **SQL Server** panel. Note the profile names you use (e.g. `DEV`, `HOM`, `PROD`).

**2.** Open a workspace in VSCode.

**3.** Run `MSSQL Tools: Open Config` from the Command Palette (`Ctrl+Shift+P`). This creates `.vscode/mssqltools.json` with a template.

**4.** Fill in your environments, using the same names as in the SQL Server panel:

```json
{
  "connections": [
    { "name": "DEV", "database": "MyDatabase" },
    { "name": "HOM", "database": "MyDatabase" },
    { "name": "PROD", "database": "MyDatabase" }
  ],
  "defaultSchema": "dbo",
  "defaultDatabase": "MyDatabase"
}
```

**5.** Open a `.sql` file containing a stored procedure and press `Ctrl+Alt+M`. Pick an environment — the diff opens immediately.

---

## Configuration

`.vscode/mssqltools.json`

### `connections` entries

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | yes | Must match the profile name in the SQL Server panel exactly (case-insensitive) |
| `database` | string | no | Target database for this environment; overrides `defaultDatabase` |

### Global fields

| Field | Type | Default | Description |
|---|---|---|---|
| `defaultSchema` | string | `"dbo"` | Schema used when the procedure definition has no explicit schema |
| `defaultDatabase` | string | — | Fallback database when a connection entry has no `database` field |

---

## Commands

| Command | Keybinding | Description |
|---|---|---|
| `MSSQL Tools: Diff Procedure` | `Ctrl+Alt+M` | Diff the active `.sql` file against the selected environment |
| `MSSQL Tools: Open Procedure from Environment` | — | Open the remote procedure DDL in a read-only tab |
| `MSSQL Tools: Open Config` | — | Create or open `.vscode/mssqltools.json` |

Commands are also available in the editor context menu when a `.sql` file is open.

---

## Procedure Detection

The extension identifies which procedure to fetch in two steps:

1. **Parse the file content** — looks for `CREATE`, `ALTER`, or `CREATE OR ALTER PROCEDURE [schema].[name]` (case-insensitive, brackets optional).
2. **Fallback to filename** — if no match is found, uses the filename (without extension) as the procedure name and `defaultSchema` as the schema.

---

## Requirements

- VSCode `^1.85.0`
- [SQL Server (mssql)](https://marketplace.visualstudio.com/items?itemName=ms-mssql.mssql) extension installed and active
- At least one connection configured in the SQL Server panel with a profile name matching an entry in `mssqltools.json`
