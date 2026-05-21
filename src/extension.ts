import * as vscode from "vscode";
import path from "node:path";
import os from "node:os";
import fs from "node:fs/promises";
import { readConfig } from "./config.ts";
import { parseProcedure } from "./procedureParser.ts";
import { resolveConnectionId } from "./profileResolver.ts";
import { pickEnvironment } from "./envPicker.ts";
import { connect, scriptProcedure, disconnect } from "./mssqlApi.ts";
import { initLogger, log, logError } from "./logger.ts";

const diffTempDirs = new Set<string>();

function workspacePath(): string | undefined {
  return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
}

async function withProgress<T>(
  title: string,
  fn: (report: (msg: string) => void) => Promise<T>,
): Promise<T> {
  return vscode.window.withProgress(
    { location: vscode.ProgressLocation.Notification, title, cancellable: false },
    (progress) => fn((msg) => progress.report({ message: msg })),
  );
}

async function commandDiffProcedure(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor || path.extname(editor.document.uri.fsPath).toLowerCase() !== ".sql") {
    vscode.window.showErrorMessage("MSSQL Tools: Open a .sql file first.");
    return;
  }
  const ws = workspacePath();
  if (!ws) {
    vscode.window.showErrorMessage("MSSQL Tools: Open a workspace first.");
    return;
  }
  try {
    const cfg = await readConfig(ws);
    const proc = parseProcedure(
      editor.document.getText(),
      editor.document.uri.fsPath,
      cfg.defaultSchema,
    );

    const env = await pickEnvironment(cfg.connections, cfg.connections[0]?.name);
    if (!env) return;

    const database = env.database ?? cfg.defaultDatabase;
    const resolved = resolveConnectionId(env.name, database);

    let connectionUri: string | undefined;
    const ddl = await withProgress(`Fetching [${proc.schema}].[${proc.name}] from ${env.name}`, async (report) => {
      report(`Connecting to ${env.name}…`);
      connectionUri = await connect(resolved.connectionId, resolved.database);
      report(`Scripting procedure…`);
      return scriptProcedure(connectionUri, proc.schema, proc.name);
    });

    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "mssqltools-diff-"));
    diffTempDirs.add(tmpDir);
    const tmpFile = path.join(tmpDir, `${proc.name}.sql`);
    await fs.writeFile(tmpFile, "﻿" + ddl, "utf8");

    const remoteUri = vscode.Uri.file(tmpFile);
    const title = `${proc.name} (${env.name}: remote ↔ local)`;
    await vscode.commands.executeCommand("vscode.diff", remoteUri, editor.document.uri, title);
    log(`Diff opened: [${proc.schema}].[${proc.name}] from ${env.name}`);
  } catch (err) {
    logError("Diff failed", err);
    vscode.window.showErrorMessage(
      `MSSQL Tools: Diff failed — ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

async function commandOpenProcedure(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor || path.extname(editor.document.uri.fsPath).toLowerCase() !== ".sql") {
    vscode.window.showErrorMessage("MSSQL Tools: Open a .sql file first.");
    return;
  }
  const ws = workspacePath();
  if (!ws) {
    vscode.window.showErrorMessage("MSSQL Tools: Open a workspace first.");
    return;
  }
  try {
    const cfg = await readConfig(ws);
    const proc = parseProcedure(
      editor.document.getText(),
      editor.document.uri.fsPath,
      cfg.defaultSchema,
    );

    const env = await pickEnvironment(cfg.connections, cfg.connections[0]?.name);
    if (!env) return;

    const database = env.database ?? cfg.defaultDatabase;
    const resolved = resolveConnectionId(env.name, database);

    let connectionUri: string | undefined;
    const ddl = await withProgress(`Fetching [${proc.schema}].[${proc.name}] from ${env.name}`, async (report) => {
      report(`Connecting to ${env.name}…`);
      connectionUri = await connect(resolved.connectionId, resolved.database);
      report(`Scripting procedure…`);
      return scriptProcedure(connectionUri, proc.schema, proc.name);
    });

    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "mssqltools-open-"));
    diffTempDirs.add(tmpDir);
    const tmpFile = path.join(tmpDir, `${proc.name}_${env.name}.sql`);
    await fs.writeFile(tmpFile, "﻿" + ddl, "utf8");

    const doc = await vscode.workspace.openTextDocument(vscode.Uri.file(tmpFile));
    await vscode.window.showTextDocument(doc, { preview: true });
    log(`Opened [${proc.schema}].[${proc.name}] from ${env.name}`);
  } catch (err) {
    logError("Open procedure failed", err);
    vscode.window.showErrorMessage(
      `MSSQL Tools: Open failed — ${err instanceof Error ? err.message : String(err)}`,
    );
  }
}

async function commandOpenConfig(): Promise<void> {
  const ws = workspacePath();
  if (!ws) {
    vscode.window.showErrorMessage("MSSQL Tools: Open a workspace first.");
    return;
  }
  const configPath = path.join(ws, ".vscode", "mssqltools.json");
  const uri = vscode.Uri.file(configPath);
  try {
    await vscode.workspace.fs.stat(uri);
  } catch {
    const template = {
      connections: [
        { name: "DEV", database: "MyDatabase" },
        { name: "HOM", database: "MyDatabase" },
        { name: "PROD", database: "MyDatabase" },
      ],
      defaultSchema: "dbo",
      defaultDatabase: "MyDatabase",
    };
    const bytes = Buffer.from(JSON.stringify(template, null, 2), "utf8");
    await vscode.workspace.fs.writeFile(uri, bytes);
  }
  await vscode.window.showTextDocument(uri);
}

export function activate(context: vscode.ExtensionContext): void {
  initLogger(context);
  log("MSSQL Tools extension activated");

  context.subscriptions.push(
    vscode.commands.registerCommand("mssqltools.diffProcedure", commandDiffProcedure),
    vscode.commands.registerCommand("mssqltools.openProcedure", commandOpenProcedure),
    vscode.commands.registerCommand("mssqltools.openConfig", commandOpenConfig),
  );
}

export async function deactivate(): Promise<void> {
  for (const tmpDir of diffTempDirs) {
    await fs.rm(tmpDir, { recursive: true, force: true });
  }
  diffTempDirs.clear();
}
