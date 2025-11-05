import type { MapsSearchClient } from "@azure-rest/maps-search";
import MapsSearch from "@azure-rest/maps-search";
import { AzureCliCredential } from "@azure/identity";

const globalForMaps = globalThis as unknown as { maps: MapsSearchClient };

let maps: MapsSearchClient;
if (globalForMaps.maps) {
  maps = globalForMaps.maps;
} else {
  const clientId = process.env.MAPS_ACCOUNT_CLIENT_ID;
  if (!clientId) {
    throw new Error("MAPS_ACCOUNT_CLIENT_ID not set");
  }
  // todo: Fix prod credentials
  maps = MapsSearch(new AzureCliCredential(), clientId);
  // `ManagedIdentityCredential` throws due to MSW emitting duplicate error events
  // maps = MapsSearch(new DefaultAzureCredential(), clientId);
}

export { maps };

if (process.env.NODE_ENV !== "production") globalForMaps.maps = maps;
