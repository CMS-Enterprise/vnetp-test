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
