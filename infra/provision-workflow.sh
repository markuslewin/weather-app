#!/bin/bash

export RESOURCE_GROUP="weather-app"
export LOCATION="eastus"
export REPO="markuslewin/weather-app"

# Create resource group
az group create --name "$RESOURCE_GROUP" --location "$LOCATION"

# Create federated identity for workflow
# Parse and set GitHub secrets for repo
gh secret set --repo "$REPO" --env-file <(
  az deployment group create \
    --resource-group "$RESOURCE_GROUP" \
    --template-file infra/workflow.bicep \
    --parameters "repo=$REPO" \
    --query properties.outputs.secrets.value \
      | jq -r '.[] | "\(.name)=\(.secret)"'
)

# All resources are created inside of the created resource group. To delete:
# az group delete --name $RESOURCE_GROUP