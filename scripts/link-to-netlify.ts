// import { NetlifyAPI } from "@netlify/api";
import * as core from "@actions/core";
import { Client } from "@microsoft/microsoft-graph-client";
// Yes, really...
import { TokenCredentialAuthenticationProvider } from "@microsoft/microsoft-graph-client/lib/src/authentication/azureTokenCredentials/TokenCredentialAuthenticationProvider.js";
import { AzureCliCredential } from "@azure/identity";
import z from "zod";

const getEnv = (key: string) => {
  const value = process.env[key];
  if (value === undefined) throw new Error(`Missing env ${key}`);
  return value;
};

const AZURE_WEB_ID = getEnv("AZURE_WEB_ID");
// const NETLIFY_AUTH_TOKEN = getEnv("NETLIFY_AUTH_TOKEN");

const graphClient = Client.initWithMiddleware({
  authProvider: new TokenCredentialAuthenticationProvider(
    // From `azure/login` action
    new AzureCliCredential(),
    {
      scopes: ["https://graph.microsoft.com/.default"],
    }
  ),
});
// const netlifyClient = new NetlifyAPI(NETLIFY_AUTH_TOKEN);

const secretDisplayName = "web-secret";
const app = z
  .object({
    passwordCredentials: z.object({ displayName: z.string() }).array(),
  })
  .parse(
    await graphClient
      .api(`/applications/${encodeURIComponent(AZURE_WEB_ID)}`)
      .get()
  );
if (
  app.passwordCredentials.find((c) => c.displayName === secretDisplayName) ===
  undefined
) {
  const credential = z.object({ secretText: z.string() }).parse(
    await graphClient
      .api(`/applications/${encodeURIComponent(AZURE_WEB_ID)}/addPassword`)
      .post({
        displayName: secretDisplayName,
      })
  );
  console.log("Before masking", credential.secretText);
  core.setSecret(credential.secretText);
  console.log("After masking", credential.secretText);
}

// Set secrets
// Double-check these and `main.bicep` outputs
// AZURE_TENANT_ID
// AZURE_WEB_CLIENT_ID
// AZURE_WEB_CLIENT_SECRET
// AZURE_MAPS_CLIENT_ID
// await Promise.all(
//   [].map((env) => {
//     // createEnv, updateEnv can set `is_secret`...
//     return netlifyClient.setEnvVarValue({});
//   })
// );
