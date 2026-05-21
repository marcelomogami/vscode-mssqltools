import path from "node:path";

export interface ProcedureId {
  schema: string;
  name: string;
}

const PROC_REGEX =
  /(?:CREATE|ALTER)\s+(?:OR\s+ALTER\s+)?PROCEDURE\s+(?:\[?(\w+)\]?\.)?\[?(\w+)\]?/i;

export function parseProcedure(
  content: string,
  filePath: string,
  defaultSchema: string,
): ProcedureId {
  const match = PROC_REGEX.exec(content);
  if (match) {
    return {
      schema: match[1] ?? defaultSchema,
      name: match[2]!,
    };
  }
  const normalizedPath = filePath.replace(/\\/g, "/");
  return {
    schema: defaultSchema,
    name: path.posix.basename(normalizedPath, path.posix.extname(normalizedPath)),
  };
}
