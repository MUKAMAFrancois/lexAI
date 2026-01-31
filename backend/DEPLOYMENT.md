# Backend Deployment Guide for Google Cloud Run

Complete guide for deploying a FastAPI backend to Google Cloud Run.

## Configuration Variables

**Set these variables at the start of your PowerShell session:**

```powershell
# Replace with your values
$PROJECT_ID = "your-project-id"          # GCP project ID
$REGION = "us-central1"                   # GCP region
$REPO_NAME = "your-repo-name"             # Artifact Registry repository name
$SERVICE_NAME = "your-service-name"       # Cloud Run service name
$IMAGE_NAME = "your-image-name"           # Docker image name
```

**Example for LexAI project:**

```powershell
$PROJECT_ID = "lexai-backend"
$REGION = "us-central1"
$REPO_NAME = "lexai-repo"
$SERVICE_NAME = "lexai-api"
$IMAGE_NAME = "fastapi-backend"
```

## Prerequisites

- Google Cloud SDK installed
- Docker Desktop running
- Google Cloud project created

## One-Time Setup

### 1. Enable Required GCP Services

```powershell
gcloud services enable run.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable secretmanager.googleapis.com
```

### 2. Create Artifact Registry Repository

```powershell
gcloud artifacts repositories create $REPO_NAME `
    --repository-format=docker `
    --location=$REGION `
    --description="Docker repository for $SERVICE_NAME"
```

### 3. Configure Docker Authentication

```powershell
gcloud auth configure-docker $REGION-docker.pkg.dev
```

### 4. Create Secrets for Environment Variables

```powershell
# Create secrets for each environment variable your app needs
# Example: Google API Key
"YOUR_ACTUAL_API_KEY" | gcloud secrets create google-api-key --replication-policy="automatic" --data-file=-

# If you have additional secrets (e.g., database credentials, other API keys):
"YOUR_DATABASE_URL" | gcloud secrets create database-url --replication-policy="automatic" --data-file=-
"YOUR_OTHER_SECRET" | gcloud secrets create other-secret --replication-policy="automatic" --data-file=-
```

**Alternative method using file:**

```powershell
# Store secret in a file temporarily
echo "YOUR_SECRET_VALUE" > secret.txt
gcloud secrets create secret-name --replication-policy="automatic" --data-file="secret.txt"
rm secret.txt  # Delete immediately - never commit secrets!
```

### 5. Grant Secret Access to Cloud Run Service Account

```powershell
# Get your project number
$PROJECT_NUMBER = (gcloud projects describe $PROJECT_ID --format="value(projectNumber)")
$SERVICE_ACCOUNT = "serviceAccount:$PROJECT_NUMBER-compute@developer.gserviceaccount.com"

# For each secret, grant access:
gcloud secrets add-iam-policy-binding google-api-key `
    --member=$SERVICE_ACCOUNT `
    --role="roles/secretmanager.secretAccessor"

# If you have additional secrets:
gcloud secrets add-iam-policy-binding database-url `
    --member=$SERVICE_ACCOUNT `
    --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding other-secret `
    --member=$SERVICE_ACCOUNT `
    --role="roles/secretmanager.secretAccessor"
```

## Regular Deployment Process

### Step 1: Build Docker Image

```powershell
cd backend
$VERSION = "v1"  # Increment for each new deployment
docker build -t $REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/$IMAGE_NAME:$VERSION .
```

### Step 2: Push to Artifact Registry

```powershell
docker push $REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/$IMAGE_NAME:$VERSION
```

### Step 3: Deploy to Cloud Run

```powershell
# Single secret deployment:
gcloud run deploy $SERVICE_NAME `
    --image $REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/$IMAGE_NAME:$VERSION `
    --region $REGION `
    --allow-unauthenticated `
    --memory 512Mi `
    --cpu 1 `
    --set-secrets GOOGLE_API_KEY=google-api-key:latest

# Multiple secrets deployment:
gcloud run deploy $SERVICE_NAME `
    --image $REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/$IMAGE_NAME:$VERSION `
    --region $REGION `
    --allow-unauthenticated `
    --memory 512Mi `
    --cpu 1 `
    --set-secrets GOOGLE_API_KEY=google-api-key:latest,DATABASE_URL=database-url:latest,OTHER_SECRET=other-secret:latest

# Or use multiple --set-secrets flags:
gcloud run deploy $SERVICE_NAME `
    --image $REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/$IMAGE_NAME:$VERSION `
    --region $REGION `
    --allow-unauthenticated `
    --memory 512Mi `
    --cpu 1 `
    --set-secrets GOOGLE_API_KEY=google-api-key:latest `
    --set-secrets DATABASE_URL=database-url:latest `
    --set-secrets OTHER_SECRET=other-secret:latest
```

**Note:** Format is `ENV_VAR_NAME=secret-name:version`

## Quick Deployment (After Setup)

```powershell
cd backend
$VERSION = "v5"  # Update version number

# Build and push
docker build -t $REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/$IMAGE_NAME:$VERSION .
docker push $REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/$IMAGE_NAME:$VERSION

# Deploy with single secret:
gcloud run deploy $SERVICE_NAME --image $REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/$IMAGE_NAME:$VERSION --region $REGION --allow-unauthenticated --memory 512Mi --cpu 1 --set-secrets GOOGLE_API_KEY=google-api-key:latest

# Deploy with multiple secrets (comma-separated):
gcloud run deploy $SERVICE_NAME --image $REGION-docker.pkg.dev/$PROJECT_ID/$REPO_NAME/$IMAGE_NAME:$VERSION --region $REGION --allow-unauthenticated --memory 512Mi --cpu 1 --set-secrets GOOGLE_API_KEY=google-api-key:latest,DATABASE_URL=database-url:latest,OTHER_SECRET=other-secret:latest
```

## Updating Secrets

If you need to update any secret:

```powershell
# Create a new version of the secret (example with API key)
"NEW_API_KEY" | gcloud secrets versions add google-api-key --data-file=-

# For other secrets:
"NEW_DATABASE_URL" | gcloud secrets versions add database-url --data-file=-

# Redeploy the service (it will automatically use the latest version)
gcloud run deploy $SERVICE_NAME --region $REGION
```

## Troubleshooting

### Docker Desktop Not Running

Error: `error during connect: ... dockerDesktopLinuxEngine`

- **Solution**: Start Docker Desktop and wait for it to fully initialize

### Authentication Error

Error: `Unauthenticated request`

- **Solution**: Run `gcloud auth configure-docker $REGION-docker.pkg.dev`

### Container Failed to Start

Error: `container failed to start and listen on port`

- **Solution**: Check that Dockerfile uses `CMD exec uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8080}`
- Verify environment variables are set (especially `GOOGLE_API_KEY`)

### Import Errors in Container

- **Solution**: Ensure Dockerfile copies `app/` to `./app/` and CMD uses `app.main:app`

## Project Structure Requirements

For deployment to work correctly:

- `backend/app/` contains all Python modules
- `backend/requirements.txt` lists all dependencies
- `backend/Dockerfile` maintains the `app` package structure
- All imports use `from app.` prefix (e.g., `from app.routers import chat`)

## Environment Variables

### Secrets (Sensitive Data)

Set via Secret Manager using `--set-secrets` flag:

- `GOOGLE_API_KEY`: Google Gemini API key
- `DATABASE_URL`: Database connection string (if needed)
- Add more as needed for your application

### Auto-Set by Cloud Run

- `PORT`: Automatically set by Cloud Run (defaults to 8080)

### Plain Environment Variables (Non-Sensitive)

If you have non-sensitive config, use `--set-env-vars`:

```powershell
gcloud run deploy $SERVICE_NAME ... --set-env-vars DEBUG=false,LOG_LEVEL=info
```

## Example Configuration (LexAI Project)

```powershell
$PROJECT_ID = "lexai-backend"
$REGION = "us-central1"
$REPO_NAME = "lexai-repo"
$SERVICE_NAME = "lexai-api"
$IMAGE_NAME = "fastapi-backend"
```

**Deployment Settings:**

- **Memory**: 512Mi
- **CPU**: 1
- **Access**: Public (unauthenticated)
