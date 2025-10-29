export RESOURCE_GROUP="weather-app"
export LOCATION="eastus"
export REPO="markuslewin/weather-app"
export SECRETS_FILE=$(mktemp)

# Create resource group
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create federated identity for workflow
# Write dotenv-formatted secrets to file
az deployment group create \
  --resource-group $RESOURCE_GROUP \
  --template-file infra/workflow.bicep \
  --parameters repo=$REPO \
  --query properties.outputs.secrets.value \
    | jq -r '.[] | "\(.name)=\(.secret)"' \
    > $SECRETS_FILE

# Set secrets from generated file
gh secret set --env-file $SECRETS_FILE

# All resources are created inside of the created resource group. To delete:
# az group delete --name $RESOURCE_GROUP