# TrotixAI - Background Queue Worker

This directory contains the background queue worker container designed to process resume validation, metadata extraction, AI refinement, and semantic embedding generation. It listens to an Azure Storage Queue (`resumes-queue`) and persists results to the database and file storage.

## Architecture

The application runs as a **headless background worker** (no web server / HTTP ingress required). It is designed to be deployed to Azure Container Apps with **ingress disabled**, which allows it to run continuously in a secure, cost-effective environment without exposing open ports.

---

## Configuration Parameters

The application uses environment variables for configuration. In production, these should be supplied via Azure Container Apps secrets and environment variables.

| Parameter | Type | Description | Example / Default |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | Secret | Connection string for PostgreSQL database using `asyncpg`. | `postgresql+asyncpg://<user>:<password>@<host>:<port>/<db>` |
| `AZURE_STORAGE_CONNECTION_STRING` | Secret | Connection string to the Azure Storage Account containing the queues and blob containers. | `DefaultEndpointsProtocol=https;AccountName=...` |
| `AZURE_OPENAI_API_KEY` | Secret | API key for the Azure OpenAI Service. | `your-azure-openai-key` |
| `AZURE_OPENAI_ENDPOINT` | Config | Endpoint URL for the Azure OpenAI Service. | `https://<your-resource-name>.services.ai.azure.com/openai/v1` |
| `AZURE_OPENAI_DEPLOYMENT` | Config | Deployment name of the target Azure OpenAI model. | `gpt-4.1-mini` |
| `AZURE_OPENAI_API_VERSION` | Config | API version of the Azure OpenAI model. | `2025-04-14` |
| `AZURE_CONTAINER_NAME` | Config | Target blob container name for resume document retrieval/storage. | `rightnxtstorage` |
| `GOOGLE_DRIVE_FOLDER_ID` | Config | (Optional) Target folder ID for backup or alternative source storage. | `1mti6z0zSTClESo...` |
| `GOOGLE_APPLICATION_CREDENTIALS` | Config | (Optional) Path to Google Cloud Service Account credentials JSON file. | `ai/keys/credentials.json` |

---

## Local Development & Docker Verification

### Build the Docker Image
To build the container image locally, execute the following command from the `ai_container` folder:
```bash
docker build -t rightnxt-container-worker .
```

### Run the Container
Run the container locally using environment variables defined in a `.env` file:
```bash
docker run --env-file .env rightnxt-container-worker
```

---

### Push docker image to Azure Container Regisry

```terminal - Run Below command 

docker images

## On the overview page copy the login server on azure portal 

rightnxtcontainerregistry.azurecr.io

## In your Azure Container Registry, go to Settings > Access keys.

Enable Admin User : checkbox

Username : rightnxtcontainerregistry 
pwd : CBVE2ER6c8MjJgK6hpVynElZpBDCujUXw1LD7bAXeo0mj6boSvkoJQQJ99CFAC77bzfEqg7NAAACAZCRq4m3

Registry Name : rightnxtcontainerregistry
Login Server : rightnxtcontainerregistry.azurecr.io

## Log in to the registry from Docker

docker login rightnxtcontainerregistry.azurecr.io

## Tag your local image

docker tag rightnxt-container-worker:latest rightnxtcontainerregistry.azurecr.io/rightnxt-container-worker:latest

## Verify It

docker images

## Push the image

docker push rightnxtcontainerregistry.azurecr.io/rightnxt-container-worker:latest

## When finished, you will see

latest: digest: sha256:...

## Verify the image in Azure

Go to your Azure Container Registry
Select Repositories, you should see

rightnxt-container-worker


---

## Azure Container Apps Deployment Guide

Use the following step-by-step guide to build, push, and deploy this worker container to Azure.

### 1. Initialize Variables
Define the resource naming variables in your shell (Bash / PowerShell):
```bash
# Azure CLI Environment Settings
RESOURCE_GROUP="RightNxt"
LOCATION="eastus"
ENVIRONMENT="env-rightnxt"
CONTAINER_APP_NAME="rightnxt-container-worker"
REGISTRY_NAME="crrightnxtai"  # Must be globally unique (alphanumeric only)
```

### 2. Login & Prepare Azure CLI
Ensure you are logged into your subscription and have the Container Apps extension registered:
```bash
# Login to Azure
az login

# Register namespaces and extensions
az extension add --name containerapp --upgrade
az provider register --namespace Microsoft.App
az provider register --namespace Microsoft.OperationalInsights
```

### 3. Create Resource Group & Container App Environment
Create a resource group and a Container Apps Environment to host the worker:
```bash
# Create Resource Group
az group create --name $RESOURCE_GROUP --location $LOCATION

# Create Container App Environment
az containerapp env create \
  --name $ENVIRONMENT \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION
```

### 4. Create and Authenticate Azure Container Registry (ACR)
Create an Azure Container Registry to host the private Docker images:
```bash
# Create ACR
az acr create \
  --resource-group $RESOURCE_GROUP \
  --name $REGISTRY_NAME \
  --sku Basic \
  --admin-enabled true

# Authenticate with the ACR
az acr login --name $REGISTRY_NAME
```

### 5. Build and Push the Image to ACR
Build the Docker image in Azure using ACR Tasks (this compiles the multi-stage build directly in the cloud, removing the need for a local Docker daemon):
```bash
# Run cloud build and push (run this from the 'ai_container' directory)
az acr build \
  --registry $REGISTRY_NAME \
  --image ai-container-worker:latest \
  .
```

### 6. Deploy to Azure Container Apps
Deploy the image to Azure Container Apps. Since this is a queue worker, **ingress is disabled (`--ingress none`)**:

```bash
# Deploy to Azure Container Apps
az containerapp create \
  --name $CONTAINER_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --environment $ENVIRONMENT \
  --image $REGISTRY_NAME.azurecr.io/ai-container-worker:latest \
  --registry-server $REGISTRY_NAME.azurecr.io \
  --ingress none \
  --cpu 1.0 \
  --memory 2.0Gi \
  --min-replicas 1 \
  --max-replicas 3 \
  --secrets \
    db-url="postgresql+asyncpg://..." \
    storage-conn="DefaultEndpointsProtocol=https;AccountName=..." \
    openai-key="your-openai-api-key" \
  --env-vars \
    DATABASE_URL=secretref:db-url \
    AZURE_STORAGE_CONNECTION_STRING=secretref:storage-conn \
    AZURE_OPENAI_API_KEY=secretref:openai-key \
    AZURE_OPENAI_ENDPOINT="https://rightnxtai-foundry.services.ai.azure.com/openai/v1" \
    AZURE_OPENAI_DEPLOYMENT="gpt-4.1-mini" \
    AZURE_OPENAI_API_VERSION="2025-04-14" \
    AZURE_CONTAINER_NAME="rightnxtstorage"
```

### 7. Monitor Logs
Verify the container starts up and polls the queue successfully by streaming the logs:
```bash
az containerapp logs show \
  --name $CONTAINER_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --follow
```

---

## Azure Portal Deployment Guide

If you prefer deploying and managing Container Apps using the Azure Portal UI, follow these steps:

### 1. Build and Push the Container Image
The container image must exist in a registry before deploying through the Portal.
* Build the image in Azure Container Registry (ACR) via CLI (simplest method, requires no local Docker):
  ```bash
  az acr build --registry <your-acr-name> --image ai-container-worker:latest .
  ```

### 2. Create the Container App
1. Go to the [Azure Portal](https://portal.azure.com/).
2. Search for and select **Container Apps**, then click **Create**.
3. Under the **Basics** tab:
   * **Project details**: Select your target Azure Subscription and Resource Group.
   * **Container app name**: Enter `ai-container-worker` (or your preferred name).
   * **Region**: Select your target region (e.g. `East US`).
   * **Container Apps Environment**: Select an existing environment or click **Create new** to set up a new environment.
4. Click **Next: Container >**.

### 3. Configure the Container Settings
Under the **Container** tab:
1. Ensure **Use simple settings** is checked.
2. Select **Azure Container Registry** (or other registry options if applicable) as your image source.
3. Fill in the registry credentials:
   * **Registry**: Select your ACR (e.g., `crtotixai`).
   * **Image**: Select `ai-container-worker`.
   * **Image Tag**: Select `latest`.
4. Under **Container resource allocation**:
   * Set **CPU** to `1.0` cores.
   * Set **Memory** to `2.0 Gi` (necessary for NLP models).
5. Click **Next: Ingress >**.

### 4. Configure Ingress (Disable)
Under the **Ingress** tab:
1. Since this is a queue worker that only polls Azure Storage, we must disable HTTP entry.
2. **Uncheck** the box next to **Enable Ingress** (setting Ingress to **Disabled**).
3. Click **Next: Review + create >**, then click **Create**. Wait for deployment to finish.

### 5. Configure Secrets & Environment Variables (Post-Creation)
For security, credentials (like connection strings and OpenAI keys) must be saved as Secrets, while configuration fields can be defined directly.
1. Navigate to the newly created Container App resource.
2. Under **Settings** in the left sidebar, click **Secrets**.
3. Click **Add** and create the following secrets:
   * **Name**: `db-url` | **Value**: `postgresql+asyncpg://...`
   * **Name**: `storage-conn` | **Value**: `DefaultEndpointsProtocol=https;...`
   * **Name**: `openai-key` | **Value**: `your-azure-openai-key`
4. Click **Save**.
5. Under **Application** in the left sidebar, click **Containers**.
6. Click **Edit and deploy** (this opens revision settings to deploy a new revision).
7. Under **Container details**, click on your container image name to edit its settings.
8. Go to the **Environment variables** section and click **Add** to add the following variables:
   * `DATABASE_URL` -> Source: **Reference a secret** -> Select `db-url`
   * `AZURE_STORAGE_CONNECTION_STRING` -> Source: **Reference a secret** -> Select `storage-conn`
   * `AZURE_OPENAI_API_KEY` -> Source: **Reference a secret** -> Select `openai-key`
   * `AZURE_OPENAI_ENDPOINT` -> Source: **Manual entry** -> `https://rightnxtai-foundry.services.ai.azure.com/openai/v1`
   * `AZURE_OPENAI_DEPLOYMENT` -> Source: **Manual entry** -> `gpt-4.1-mini`
   * `AZURE_OPENAI_API_VERSION` -> Source: **Manual entry** -> `2025-04-14`
   * `AZURE_CONTAINER_NAME` -> Source: **Manual entry** -> `rightnxtstorage`
9. Click **Save** and then click **Create** at the bottom of the page to deploy the revision.

### 6. Monitor Logs in the Portal
1. In your Container App resource menu, go to **Monitoring** -> **Log stream**.
2. Select the container replica to view live startup and queue processing logs.


