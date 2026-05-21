import * as vscode from "vscode";
import type { ConnectionEntry } from "./config.ts";

export async function pickEnvironment(
  connections: ConnectionEntry[],
  defaultEnvironment?: string,
): Promise<ConnectionEntry | undefined> {
  const items = connections.map((c) => c.name);
  const activeItem = defaultEnvironment && items.includes(defaultEnvironment)
    ? defaultEnvironment
    : undefined;

  const picked = await vscode.window.showQuickPick(items, {
    placeHolder: "Select SQL Server environment",
    ...(activeItem ? { activeItem } : {}),
  });

  if (!picked) return undefined;
  return connections.find((c) => c.name === picked);
}
