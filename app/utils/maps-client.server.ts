import { env } from "#app/utils/env";
import type { MapsSearchClient } from "@azure-rest/maps-search";
import MapsSearch from "@azure-rest/maps-search";
import { AzureCliCredential, ClientSecretCredential } from "@azure/identity";

const globalForMaps = globalThis as unknown as { maps: MapsSearchClient };

let maps: MapsSearchClient;
if (globalForMaps.maps) {
  maps = globalForMaps.maps;
} else {
  let credentials;
  if (env.NODE_ENV === "production") {
    credentials = new ClientSecretCredential(
      env.AZURE_TENANT_ID,
      env.AZURE_WEB_CLIENT_ID,
      env.AZURE_WEB_CLIENT_SECRET
    );
  } else {
    credentials = new AzureCliCredential();
  }
  maps = MapsSearch(credentials, env.AZURE_MAPS_CLIENT_ID);
}

export { maps };

if (process.env.NODE_ENV !== "production") globalForMaps.maps = maps;
