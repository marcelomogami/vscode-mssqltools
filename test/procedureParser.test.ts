import { test } from "node:test";
import assert from "node:assert/strict";
import { parseProcedure } from "../src/procedureParser.ts";

// --- CREATE PROCEDURE ---

test("CREATE PROCEDURE with schema", () => {
  const result = parseProcedure("CREATE PROCEDURE dbo.MyProc\nAS BEGIN END", "/w/MyProc.sql", "dbo");
  assert.deepEqual(result, { schema: "dbo", name: "MyProc" });
});

test("CREATE PROCEDURE with bracketed schema and name", () => {
  const result = parseProcedure("CREATE PROCEDURE [dbo].[MyProc]\nAS BEGIN END", "/w/MyProc.sql", "dbo");
  assert.deepEqual(result, { schema: "dbo", name: "MyProc" });
});

test("CREATE PROCEDURE without schema uses default", () => {
  const result = parseProcedure("CREATE PROCEDURE MyProc\nAS BEGIN END", "/w/MyProc.sql", "dbo");
  assert.deepEqual(result, { schema: "dbo", name: "MyProc" });
});

// --- ALTER PROCEDURE ---

test("ALTER PROCEDURE with schema", () => {
  const result = parseProcedure("ALTER PROCEDURE dbo.MyProc\nAS BEGIN END", "/w/MyProc.sql", "dbo");
  assert.deepEqual(result, { schema: "dbo", name: "MyProc" });
});

test("ALTER PROCEDURE with bracketed schema and name", () => {
  const result = parseProcedure("ALTER PROCEDURE [dbo].[MyProc]\nAS BEGIN END", "/w/x.sql", "dbo");
  assert.deepEqual(result, { schema: "dbo", name: "MyProc" });
});

// --- CREATE OR ALTER PROCEDURE ---

test("CREATE OR ALTER PROCEDURE with schema", () => {
  const result = parseProcedure("CREATE OR ALTER PROCEDURE dbo.MyProc\nAS BEGIN END", "/w/x.sql", "dbo");
  assert.deepEqual(result, { schema: "dbo", name: "MyProc" });
});

test("CREATE OR ALTER PROCEDURE without schema uses default", () => {
  const result = parseProcedure("CREATE OR ALTER PROCEDURE MyProc\nAS BEGIN END", "/w/x.sql", "dbo");
  assert.deepEqual(result, { schema: "dbo", name: "MyProc" });
});

test("CREATE OR ALTER PROCEDURE with bracketed name only", () => {
  const result = parseProcedure("CREATE OR ALTER PROCEDURE [MyProc]\nAS BEGIN END", "/w/x.sql", "dbo");
  assert.deepEqual(result, { schema: "dbo", name: "MyProc" });
});

// --- case insensitive ---

test("keyword matching is case-insensitive", () => {
  const result = parseProcedure("create procedure dbo.myProc\nas begin end", "/w/x.sql", "dbo");
  assert.deepEqual(result, { schema: "dbo", name: "myProc" });
});

// --- non-dbo schema ---

test("non-dbo schema is captured", () => {
  const result = parseProcedure("CREATE PROCEDURE financas.CancelaDivida\nAS BEGIN END", "/w/x.sql", "dbo");
  assert.deepEqual(result, { schema: "financas", name: "CancelaDivida" });
});

// --- fallback ---

test("fallback to filename when no PROCEDURE keyword found", () => {
  const result = parseProcedure("SELECT 1", "/w/CancelaDivida.sql", "dbo");
  assert.deepEqual(result, { schema: "dbo", name: "CancelaDivida" });
});

test("fallback uses defaultSchema from config", () => {
  const result = parseProcedure("", "C:\\projeto\\financas\\CancelaDivida.sql", "financas");
  assert.deepEqual(result, { schema: "financas", name: "CancelaDivida" });
});
