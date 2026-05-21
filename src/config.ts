import fs from "node:fs/promises";
import path from "node:path";

export interface ConnectionEntry {
  name: string;
  database?: string;
}

export interface MssqlToolsConfig {
  connections: ConnectionEntry[];
  defaultSchema: string;
  defaultDatabase?: string;
}

function parseConfig(raw: unknown): MssqlToolsConfig {
  if (typeof raw !== "object" || raw === null) {
    throw new Error("Config must be a JSON object");
  }
  const obj = raw as Record<string, unknown>;

  if (!Array.isArray(obj["connections"]) || obj["connections"].length === 0) {
    throw new Error("Config must have at least one entry in 'connections'");
  }

  const connections: ConnectionEntry[] = (obj["connections"] as unknown[]).map(
    (entry, i) => {
      if (typeof entry !== "object" || entry === null) {
        throw new Error(`connections[${i}] must be an object`);
      }
      const e = entry as Record<string, unknown>;
      if (typeof e["name"] !== "string" || !e["name"]) {
        throw new Error(`connections[${i}] is missing required field: name`);
      }
      return {
        name: e["name"],
        database: typeof e["database"] === "string" ? e["database"] : undefined,
      };
    },
  );

  return {
    connections,
    defaultSchema:
      typeof obj["defaultSchema"] === "string" ? obj["defaultSchema"] : "dbo",
    defaultDatabase:
      typeof obj["defaultDatabase"] === "string"
        ? obj["defaultDatabase"]
        : undefined,
  };
}

export async function readConfig(workspacePath: string): Promise<MssqlToolsConfig> {
  const configPath = path.join(workspacePath, ".vscode", "mssqltools.json");
  let raw: string;
  try {
    raw = await fs.readFile(configPath, "utf8");
  } catch {
    throw new Error(
      `mssqltools.json not found at ${configPath}. Run "MSSQL Tools: Open Config" to create it.`,
    );
  }
  return parseConfig(JSON.parse(raw));
}
