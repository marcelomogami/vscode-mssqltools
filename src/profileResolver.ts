import * as vscode from "vscode";
import type { IConnectionInfo } from "vscode-mssql";

interface MssqlProfile {
  profileName?: string;
  server?: string;
  database?: string;
  user?: string;
  password?: string;
  authenticationType?: string;
  [key: string]: unknown;
}

export function resolveProfile(
  connectionName: string,
  database?: string,
): IConnectionInfo {
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

  if (!profile.server) {
    throw new Error(`MSSQL connection "${connectionName}" has no server configured.`);
  }

  return {
    server: profile.server,
    database: database ?? profile.database ?? "",
    user: profile.user ?? "",
    password: profile.password ?? "",
    email: undefined,
    accountId: undefined,
    tenantId: undefined,
    port: 0,
    authenticationType: profile.authenticationType ?? "SqlLogin",
    azureAccountToken: undefined,
    expiresOn: undefined,
    encrypt: "Optional",
    trustServerCertificate: undefined,
    hostNameInCertificate: undefined,
    persistSecurityInfo: undefined,
    columnEncryptionSetting: undefined,
    attestationProtocol: undefined,
    enclaveAttestationUrl: undefined,
    connectTimeout: undefined,
    commandTimeout: undefined,
    connectRetryCount: undefined,
    connectRetryInterval: undefined,
    applicationName: undefined,
    workstationId: undefined,
    applicationIntent: undefined,
    currentLanguage: undefined,
    pooling: undefined,
    maxPoolSize: undefined,
    minPoolSize: undefined,
    loadBalanceTimeout: undefined,
    replication: undefined,
    attachDbFilename: undefined,
    failoverPartner: undefined,
    multiSubnetFailover: undefined,
    multipleActiveResultSets: undefined,
    packetSize: undefined,
    typeSystemVersion: undefined,
    connectionString: undefined,
    secureEnclaves: undefined,
    containerName: undefined,
  };
}
