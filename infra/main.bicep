extension 'br:mcr.microsoft.com/bicep/extensions/microsoftgraph/v1.0:1.0.0'

resource web 'Microsoft.Graph/applications@v1.0' = {
  displayName: 'Weather Web'
  uniqueName: 'weather-web'
}

resource webPrincipal 'Microsoft.Graph/servicePrincipals@v1.0' = {
  appId: web.appId
}

module mapsAccount 'maps-account.bicep' = {
  params: {
    name: 'maps-account'
    roleAssignments: [
      {
        principalId: webPrincipal.id
        roleDefinitionIdOrName: 'Azure Maps Search and Render Data Reader'
      }
    ]
  }
}

output tenantId string = tenant().tenantId
output webId string = web.id
output webClientId string = web.appId
output mapsClientId string = mapsAccount.outputs.uniqueId
