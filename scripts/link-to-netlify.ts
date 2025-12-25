import { NetlifyAPI } from "@netlify/api";
import * as core from "@actions/core";
import { Client } from "@microsoft/microsoft-graph-client";
// Yes, really...
import { TokenCredentialAuthenticationProvider } from "@microsoft/microsoft-graph-client/lib/src/authentication/azureTokenCredentials/TokenCredentialAuthenticationProvider.js";
import { AzureCliCredential } from "@azure/identity";
import z from "zod";
import type { Env } from "#app/utils/env";

const env = z
  .object({
    AZURE_TENANT_ID: z.string(),
    AZURE_WEB_ID: z.string(),
    AZURE_WEB_CLIENT_ID: z.string(),
    AZURE_MAPS_CLIENT_ID: z.string(),
    NETLIFY_AUTH_TOKEN: z.string(),
    NETLIFY_SITE_ID: z.string(),
    NETLIFY_ACCOUNT_ID: z.string(),
  })
  .parse(process.env);

const graphClient = Client.initWithMiddleware({
  authProvider: new TokenCredentialAuthenticationProvider(
    // Reuse auth token from `azure/login` action
    new AzureCliCredential(),
    {
      scopes: ["https://graph.microsoft.com/.default"],
    }
  ),
});
const netlifyClient = new NetlifyAPI(env.NETLIFY_AUTH_TOKEN);

const putSecret = async (id: string) => {
  // Track which password is ours
  const secretDisplayName = "d14127a0-482b-4c80-9e4e-dbdd548dd98b";
  const app = await getApp(id);
  await deleteSecret(
    app.id,
    app.passwordCredentials
      .filter((c) => c.displayName === secretDisplayName)
      .map((c) => c.keyId)
  );
  return createSecret(app.id, secretDisplayName);
};

const getApp = async (id: string) => {
  return z
    .object({
      id: z.string(),
      passwordCredentials: z
        .object({ keyId: z.string(), displayName: z.string() })
        .array(),
    })
    .parse(
      await graphClient.api(`/applications/${encodeURIComponent(id)}`).get()
    );
};

const deleteSecret = async (id: string, keyIds: string[]) => {
  await Promise.all(
    keyIds.map((keyId) => {
      return graphClient
        .api(`/applications/${encodeURIComponent(id)}/removePassword`)
        .post({
          keyId,
        });
    })
  );
};

const createSecret = async (id: string, displayName: string) => {
  const { secretText } = z.object({ secretText: z.string() }).parse(
    await graphClient
      .api(`/applications/${encodeURIComponent(id)}/addPassword`)
      .post({
        passwordCredential: {
          displayName,
        },
      })
  );
  core.setSecret(secretText);
  return { secretText };
};

const deleteVars = async ({
  accountId,
  siteId,
  keys,
}: {
  accountId: string;
  siteId: string;
  keys: Key[];
}) => {
  await Promise.all(
    keys.map((key) => {
      return netlifyClient.deleteEnvVar({ accountId, siteId, key });
    })
  );
};

const postVars = async ({
  accountId,
  siteId,
  vars,
}: {
  accountId: string;
  siteId: string;
  vars: Env;
}) => {
  await netlifyClient.createEnvVars({
    accountId,
    siteId,
    body: Object.entries(vars).map(([key, value]) => {
      return {
        key,
        // When `is_secret` is `false`, `scopes` isn't allowed on free tier
        // When `is_secret` is `true`, all scopes except `post-processing` must be set on free tier
        is_secret: true,
        // We only really care about `functions`
        scopes: ["builds", "functions", "runtime"],
        values: [
          {
            value: String(value),
          },
        ],
      } satisfies EnvVar;
    }),
  });
};

type EnvVar = Parameters<
  typeof netlifyClient.updateEnvVar
>[0]["body"] extends infer TBody
  ? TBody extends { key?: unknown }
    ? TBody
    : never
  : never;

const accountId = env.NETLIFY_ACCOUNT_ID;
const siteId = env.NETLIFY_SITE_ID;
const keys = [
  "AZURE_TENANT_ID",
  "AZURE_WEB_CLIENT_ID",
  "AZURE_WEB_CLIENT_SECRET",
  "AZURE_MAPS_CLIENT_ID",
] as const;
type Key = (typeof keys)[number];

const [{ secretText }] = await Promise.all([
  putSecret(env.AZURE_WEB_ID),
  deleteVars({ accountId, siteId, keys: [...keys] }),
]);
await postVars({
  accountId,
  siteId,
  vars: {
    NODE_ENV: "production",
    MOCKS: false,
    AZURE_TENANT_ID: env.AZURE_TENANT_ID,
    AZURE_WEB_CLIENT_ID: env.AZURE_WEB_CLIENT_ID,
    AZURE_WEB_CLIENT_SECRET: secretText,
    AZURE_MAPS_CLIENT_ID: env.AZURE_MAPS_CLIENT_ID,
  },
});
