import type { MapsSearchClient } from "@azure-rest/maps-search";
import MapsSearch from "@azure-rest/maps-search";
import { AzureCliCredential, ClientSecretCredential } from "@azure/identity";

const globalForMaps = globalThis as unknown as { maps: MapsSearchClient };

let maps: MapsSearchClient;
if (globalForMaps.maps) {
  maps = globalForMaps.maps;
} else {
  const mapsClientId = process.env.AZURE_MAPS_CLIENT_ID;
  if (typeof mapsClientId !== "string") {
    throw new Error("AZURE_MAPS_CLIENT_ID not set");
  }
  let credentials;
  // todo: Figure this out
  if (process.env.NODE_ENV === "production" && process.env.MOCKS !== "true") {
    const tenantId = process.env.AZURE_TENANT_ID;
    if (typeof tenantId !== "string") {
      throw new Error("AZURE_TENANT_ID not set");
    }
    const clientId = process.env.AZURE_WEB_CLIENT_ID;
    if (typeof clientId !== "string") {
      throw new Error("AZURE_WEB_CLIENT_ID not set");
    }
    const clientSecret = process.env.AZURE_WEB_CLIENT_SECRET;
    if (typeof clientSecret !== "string") {
      throw new Error("AZURE_WEB_CLIENT_SECRET not set");
    }
    credentials = new ClientSecretCredential(tenantId, clientId, clientSecret);
  } else {
    credentials = new AzureCliCredential();
  }
  maps = MapsSearch(credentials, mapsClientId);
}

export { maps };

if (process.env.NODE_ENV !== "production") globalForMaps.maps = maps;
