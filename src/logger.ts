import * as vscode from "vscode";

let channel: vscode.OutputChannel | undefined;

export function initLogger(context: vscode.ExtensionContext): void {
  channel = vscode.window.createOutputChannel("MSSQL Tools");
  context.subscriptions.push(channel);
}

export function log(message: string): void {
  channel?.appendLine(`[${new Date().toISOString()}] ${message}`);
}

export function logError(label: string, err: unknown): void {
  log(`${label}: ${err instanceof Error ? err.message : String(err)}`);
}
