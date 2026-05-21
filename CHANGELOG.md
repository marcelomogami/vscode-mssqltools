# Changelog

## [0.1.1] - 2026-05-21

### Fixed
- Diff now shows local file on the left and remote procedure on the right

## [0.1.0] - 2026-05-21

### Added
- `MSSQL Tools: Diff Procedure` (`Ctrl+Alt+M`) — side-by-side diff between the local `.sql` file and the remote procedure DDL from the selected environment
- `MSSQL Tools: Open Procedure from Environment` — opens the remote procedure DDL in a read-only tab
- `MSSQL Tools: Open Config` — creates `.vscode/mssqltools.json` with a template
- Procedure auto-detection from file content (`CREATE / ALTER / CREATE OR ALTER PROCEDURE`), with filename fallback
- Multi-environment support via Quick Pick (DEV, HOM, PROD or any profile configured in the SQL Server panel)
- Reuses existing mssql extension connections — no extra credentials needed
- UTF-8 BOM on temp files to ensure correct encoding of accented characters in VSCode diff
