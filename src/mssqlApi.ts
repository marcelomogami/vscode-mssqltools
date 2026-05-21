import * as vscode from "vscode";
import type { IExtension, IScriptingObject } from "vscode-mssql";

const MSSQL_EXTENSION_ID = "ms-mssql.mssql";
const OUR_EXTENSION_ID = "marcelomogami.vscode-mssqltools";

// ScriptOperation.Create = 1 (stable enum value from vscode-mssql d.ts)
const SCRIPT_CREATE = 1 as unknown as import("vscode-mssql").ScriptOperation;

function getApi(): IExtension {
  const ext = vscode.extensions.getExtension<IExtension>(MSSQL_EXTENSION_ID);
  if (!ext) {
    throw new Error("MSSQL extension (ms-mssql.mssql) is not installed.");
  }
  if (!ext.isActive) {
    throw new Error("MSSQL extension is not active. Open a SQL file or connection first.");
  }
  return ext.exports;
}

export async function connect(
  connectionId: string,
  database?: string,
): Promise<string> {
  const api = getApi();
  const uri = await api.connectionSharing.connect(OUR_EXTENSION_ID, connectionId, database);
  if (!uri) {
    throw new Error("Failed to establish connection. Make sure the connection is active in the SQL Server panel.");
  }
  return uri;
}

export async function scriptProcedure(
  connectionUri: string,
  schema: string,
  name: string,
): Promise<string> {
  const api = getApi();
  const scriptingObject: IScriptingObject = {
    type: "StoredProcedure",
    schema,
    name,
  };
  const result = await api.connectionSharing.scriptObject(
    connectionUri,
    SCRIPT_CREATE,
    scriptingObject,
  );
  if (!result) {
    throw new Error(`Procedure [${schema}].[${name}] not found in this environment.`);
  }
  return result;
}

export function disconnect(connectionUri: string): void {
  try {
    getApi().connectionSharing.disconnect(connectionUri);
  } catch {
    // best-effort cleanup
  }
}
