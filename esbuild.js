import * as esbuild from "esbuild";

const dev = process.argv.includes("--dev");

await esbuild.build({
  entryPoints: ["src/extension.ts"],
  bundle: true,
  platform: "node",
  format: "cjs",
  external: ["vscode", "vscode-mssql"],
  outfile: "dist/extension.cjs",
  sourcemap: dev ? "inline" : false,
  minify: !dev,
  tsconfig: "tsconfig.json",
  logLevel: "info",
});
