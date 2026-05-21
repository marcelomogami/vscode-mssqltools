import * as vscode from "vscode";

interface MssqlProfile {
  id?: string;
  profileName?: string;
  database?: string;
  [key: string]: unknown;
}

export interface ResolvedConnection {
  connectionId: string;
  database?: string;
}

export function resolveConnectionId(
  connectionName: string,
  database?: string,
): ResolvedConnection {
  const profiles = vscode.workspace
    .getConfiguration("mssql")
    .get<MssqlProfile[]>("connections") ?? [];

  const profile = profiles.find(
    (p) => p.profileName?.toLowerCase() === connectionName.toLowerCase(),
  );

  if (!profile) {
    throw new Error(
      `MSSQL connection "${connectionName}" not found. Check your mssql connections in VS Code settings.`,
    );
  }

  if (!profile.id) {
    throw new Error(
      `MSSQL connection "${connectionName}" has no id. Try removing and re-adding the connection in the SQL Server panel.`,
    );
  }

  return {
    connectionId: profile.id,
    database: database ?? profile.database,
  };
}
