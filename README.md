# DCS User Interface

API layer found at `draas/dmapi`.

## Setup

1. `npm install`
2. `npm start`
3. Navigate to `http://localhost:4200/`

## Generating API

1. From `dmpapi`, run `npm run start:dev`
2. Copy `dmpapi/swagger-spec.yaml` to `ui/swagger-spec.yaml`
3. From `ui`, run `npm run generate-client`

## Testing

1. `npm test`
2. or `npm run test:ci`


## Authentication

# Package
This OIDC implentation relies on a fork of the `oidc-client-js` package (https://git-dc01-prod.draas.cdsvdc.lcl/CTMZ/oidc-client). This package is certified and 
follows a standard oidc spec. 

# Callback
The redirect_uri is always `/callback` which lazy loads the Tenant Component. If the user only has one tenant they will see a spinner and then be redirected to
`/dashboard` and that tenant is set as a query parameter in the URL. If a user has the roles `dcs_admin`, `dcs_ro` or access to multiple tenants. They will land 
on the tenant page where they will see buttons with tenant options. When a user selects a tenant that tenant is set as a query parameter and they are directed to 
`/dashboard` route.

# Configuration
To see the current OIDC configuration go to `config.json`. This is the configuration for local development that is statically served at `<base-url>/assets/config.json`.
When this is deployed to other environments this file is overwritten from values set in `https://git-dc01-prod.draas.cdsvdc.lcl/draas/deploy` using a template from 
`https://git-dc01-prod.draas.cdsvdc.lcl/draas/draas.dcs`. 
In the deploy repo you can find the environments with OIDC configurations at `vars/dcs/{{env_name}}`. The template in `draas.dcs` repo is located at `templates/config.json.j2`.

The configuration itself includes: 
1) Tenants available 
2) Values for oidc configuration (issuer, redirect_uri, metadata, etc)
3) A boolean to enable the feature (if this is false, ensure that the value in dmpapi is false as well).
