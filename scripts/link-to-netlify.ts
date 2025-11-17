import { NetlifyAPI } from "@netlify/api";
import * as core from "@actions/core";
import { Client } from "@microsoft/microsoft-graph-client";
// Yes, really...
import { TokenCredentialAuthenticationProvider } from "@microsoft/microsoft-graph-client/lib/src/authentication/azureTokenCredentials/TokenCredentialAuthenticationProvider.js";
import { AzureCliCredential } from "@azure/identity";
import z from "zod";

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
    // From `azure/login` action
    new AzureCliCredential(),
    {
      scopes: ["https://graph.microsoft.com/.default"],
    }
  ),
});
const netlifyClient = new NetlifyAPI(env.NETLIFY_AUTH_TOKEN);

const secretDisplayName = "web-secret";
const app = z
  .object({
    passwordCredentials: z.object({ displayName: z.string() }).array(),
  })
  .parse(
    await graphClient
      .api(`/applications/${encodeURIComponent(env.AZURE_WEB_ID)}`)
      .get()
  );
if (
  app.passwordCredentials.find((c) => c.displayName === secretDisplayName) ===
  undefined
) {
  const credential = z.object({ secretText: z.string() }).parse(
    await graphClient
      .api(`/applications/${encodeURIComponent(env.AZURE_WEB_ID)}/addPassword`)
      .post({
        passwordCredential: {
          displayName: secretDisplayName,
        },
      })
  );
  core.setSecret(credential.secretText);
}

const accountId = env.NETLIFY_ACCOUNT_ID;
const siteId = env.NETLIFY_SITE_ID;

const vars = await netlifyClient.getEnvVars({
  accountId,
  siteId,
});

await Promise.all(
  [
    { key: "AZURE_TENANT_ID", value: env.AZURE_TENANT_ID },
    { key: "AZURE_WEB_CLIENT_ID", value: env.AZURE_WEB_CLIENT_ID },
    // todo: { key: "AZURE_WEB_CLIENT_SECRET", value: credential.secretText },
    { key: "AZURE_MAPS_CLIENT_ID", value: env.AZURE_MAPS_CLIENT_ID },
  ].map(({ key, value }) => {
    const envVar: EnvVar = {
      key,
      // When `is_secret` is `false`, `scopes` isn't allowed on free tier
      // When `is_secret` is `true`, we must set all scopes except `post-processing` on free tier
      is_secret: true,
      // We only really care about `functions`
      scopes: ["builds", "functions", "runtime"],
      values: [
        {
          value,
        },
      ],
    };
    if (vars.find((v) => v.key === key)) {
      return netlifyClient.updateEnvVar({
        accountId,
        siteId,
        key,
        body: envVar,
      });
    }
    return netlifyClient.createEnvVars({
      accountId,
      siteId,
      body: [envVar],
    });
  })
);

type EnvVar = Parameters<
  typeof netlifyClient.updateEnvVar
>[0]["body"] extends infer TBody
  ? TBody extends { key?: unknown }
    ? TBody
    : never
  : never;
