# Weather App

I document my experience building this app in the post "[Streaming a Weather App with React Router
](https://markuslewin.github.io/blog/weather-app/)" on my blog.

## Local Development

This project has two external dependencies:

- **[Open-Meteo API](https://open-meteo.com/)**: Provides weather and search data
- **[Azure Maps Search API](https://learn.microsoft.com/en-us/azure/azure-maps/rest-sdk-developer-guide#javascripttypescript)**: Provides the location name

You can mock these services during development using [MSW](https://mswjs.io/):

```sh
VITE_MOCKS=true npm run dev
```

### Using Real Data

#### Open-Meteo API

You can use the Open-Meteo API during local development. These requests count toward the request limits of the API. These limits are generous so this will probably not be a problem.

#### Azure Maps Search API

The Azure Maps Search API requires an Azure Maps account inside your Azure tenant. You can provision the account using Bicep:

```sh
az group create --name weather-app --location eastus
az deployment group create --resource-group weather-app --template-file infra/main.bicep
```

The Bicep deployment creates:

- An app registration
- An Azure Maps account

It also outputs values for some of the required secrets:

- `AZURE_MAPS_CLIENT_ID`
- `AZURE_TENANT_ID`
- `AZURE_WEB_CLIENT_ID`

The web app connects to the Azure Maps account via the app registration. To connect to the app registration, add a client secret to it in the Azure Portal. Provide the secret to the app via the `AZURE_WEB_CLIENT_SECRET` environment variable.

For deployments, these steps are automated through the `provision` job inside `.github/workflows/deploy.yml`.
