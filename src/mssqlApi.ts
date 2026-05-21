import * as vscode from "vscode";
import type { IExtension, IConnectionInfo, IScriptingObject } from "vscode-mssql";

const MSSQL_EXTENSION_ID = "ms-mssql.mssql";

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

export async function connect(connectionInfo: IConnectionInfo): Promise<string> {
  const api = getApi();
  return api.connect(connectionInfo, false);
}

// ScriptOperation.Create = 1 (stable enum value from vscode-mssql d.ts)
const SCRIPT_CREATE = 1 as unknown as import("vscode-mssql").ScriptOperation;

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
  const api = getApi();
  api.connectionSharing.disconnect(connectionUri);
}
