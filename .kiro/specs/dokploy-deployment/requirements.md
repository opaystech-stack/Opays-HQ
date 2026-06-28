# Requirements Document

## Introduction

This feature defines the deployment of the "Opays HQ" application to a Dokploy-managed host. Opays HQ is a single-container, full-stack application: an Express 5 backend (run via `tsx`) that serves both the compiled React/TanStack Router frontend (built by Vite) and the JSON API from one process listening on port 3001. Persistence is provided by a `better-sqlite3` database stored on a durable volume.

The deployment must build the production container from the repository `Dockerfile`, configure environment variables and secrets, expose the application at `hq.opays.io` over TLS, route traffic to port 3001, verify liveness through the `/api/health` endpoint, and preserve the SQLite database across container restarts and redeployments. This specification also resolves an existing inconsistency: the repository contains an `nginx.conf` describing a standalone static SPA server on port 80, but the actual production runtime is the single Express container on port 3001. The Express container is the authoritative runtime, and the standalone nginx static-server configuration is not part of the deployed image.

## Glossary

- **Opays_HQ_App**: The full-stack application consisting of the Express backend and the bundled React frontend served from a single container process on port 3001.
- **Dokploy_Platform**: The Dokploy deployment platform that builds container images, runs containers, manages environment variables and secrets, performs health checks, and routes external traffic.
- **Deployment_Config**: The Dokploy configuration source (`doploy.yml` at the repository root) describing app name, build method, port, health check, domains, environment variables, and volumes.
- **Container_Image**: The production OCI image produced from the repository `Dockerfile` via its multi-stage build.
- **Health_Endpoint**: The HTTP endpoint `GET /api/health` exposed by the Opays_HQ_App that returns a JSON status payload.
- **Data_Volume**: The persistent host volume `/data/opays-hq` mounted into the container at `/app/data`, holding the SQLite database file.
- **SQLite_Database**: The `better-sqlite3` database file located at `/app/data/opays-hq.db` inside the container.
- **Application_Domain**: The public hostname `hq.opays.io` through which external users reach the Opays_HQ_App.
- **Reverse_Proxy**: The Dokploy_Platform ingress component that terminates TLS for the Application_Domain and forwards requests to the container port.
- **JWT_Secret**: The secret value supplied through the `JWT_SECRET` environment variable used by the Opays_HQ_App to sign and verify authentication tokens.
- **Deployment_Operator**: The human operator who triggers and verifies deployments through the Dokploy_Platform.

## Requirements

### Requirement 1: Build the production container from the Dockerfile

**User Story:** As a Deployment_Operator, I want Dokploy to build the application image from the repository Dockerfile, so that I deploy a reproducible production artifact.

#### Acceptance Criteria

1. WHEN a deployment is triggered, THE Dokploy_Platform SHALL build the Container_Image using the `Dockerfile` referenced by the Deployment_Config.
2. THE Container_Image SHALL include the compiled Vite frontend assets, the Express server source, and the production-only Node dependencies required to run the Opays_HQ_App.
3. WHEN the Container_Image is started, THE Opays_HQ_App SHALL run the server process and bind to all network interfaces (0.0.0.0) on port 3001 within 60 seconds, AND THE Opays_HQ_App SHALL be considered ready to accept requests once it has bound to port 3001, regardless of whether the server process is otherwise fully operational.
4. IF the Container_Image build fails, THEN THE Dokploy_Platform SHALL report the build failure to the Deployment_Operator, leave the previously running container unchanged, and not deploy the failed image.
5. IF the Container_Image build fails and the build-failure report cannot be delivered to the Deployment_Operator, THEN THE Dokploy_Platform SHALL leave the previously running container unchanged.
6. IF the Container_Image build exceeds 1800 seconds, THEN THE Dokploy_Platform SHALL abort the build and report a build timeout to the Deployment_Operator.

### Requirement 2: Single-container runtime serving frontend and API

**User Story:** As a Deployment_Operator, I want one container to serve both the web interface and the API, so that the runtime matches the Dockerfile and avoids a separate static web server.

#### Acceptance Criteria

1. THE Opays_HQ_App SHALL serve the compiled frontend assets and the JSON API from a single server process listening on port 3001 on all network interfaces.
2. WHEN a request targets a path beginning with `/api/` that matches a defined API route, THE Opays_HQ_App SHALL dispatch the request to that route handler and return the handler's response.
3. IF a request targets a path beginning with `/api/` that does not match any defined API route, THEN THE Opays_HQ_App SHALL return a not-found response and SHALL NOT return the SPA entry document.
4. WHEN a request targets a non-API path that matches a static asset, THE Opays_HQ_App SHALL return that asset with HTTP status 200.
5. WHEN a request targets a non-API path that does not match a static asset, THE Opays_HQ_App SHALL return the SPA entry document `index.html` with HTTP status 200.
6. THE Deployment_Config SHALL designate port 3001 as the container port exposed to the Reverse_Proxy.
7. THE deployed Container_Image SHALL serve all HTTP traffic from the single Express server process, with no standalone nginx process running and no `nginx.conf` applied.

### Requirement 3: Environment variables and secret configuration

**User Story:** As a Deployment_Operator, I want runtime environment variables and the JWT secret configured securely, so that the application runs in production mode with valid authentication signing.

#### Acceptance Criteria

1. WHEN the Opays_HQ_App container is started, THE Dokploy_Platform SHALL provide the environment variable `NODE_ENV` with the value `production` to the Opays_HQ_App.
2. WHEN the Opays_HQ_App container is started, THE Dokploy_Platform SHALL provide the environment variable `PORT` with the value `3001` to the Opays_HQ_App.
3. WHEN the Opays_HQ_App container is started, THE Dokploy_Platform SHALL provide the `JWT_Secret` to the Opays_HQ_App through the `JWT_SECRET` environment variable sourced from a Dokploy_Platform secret.
4. IF the `JWT_SECRET` environment variable is empty, undefined, or contains only whitespace characters at startup, THEN THE Opays_HQ_App SHALL terminate startup, exit with a non-zero status code, and emit an error log entry indicating the JWT secret is missing, AND THE Opays_HQ_App MAY bind to port 3001 before exiting.
5. THE Deployment_Config SHALL reference the `JWT_Secret` by variable substitution and SHALL NOT store the secret value in the repository.
6. IF the `JWT_SECRET` environment variable contains fewer than 32 characters at startup, THEN THE Opays_HQ_App SHALL terminate startup, exit with a non-zero status code, and emit an error log entry indicating the JWT secret does not meet the minimum length, AND THE Opays_HQ_App MAY bind to port 3001 before exiting.

### Requirement 4: Health check verification

**User Story:** As a Deployment_Operator, I want Dokploy to verify application health through the health endpoint, so that only healthy containers receive traffic.

#### Acceptance Criteria

1. WHEN the Health_Endpoint receives a `GET /api/health` request, THE Opays_HQ_App SHALL respond with HTTP status 200, a `Content-Type` of `application/json`, and a JSON body containing a `status` field set to `ok`.
2. THE Dokploy_Platform SHALL poll the Health_Endpoint every 30 seconds as defined by the Deployment_Config.
3. WHILE a health check is outstanding, THE Dokploy_Platform SHALL wait up to the configured timeout of 10 seconds for a response.
4. IF a health check does not receive an HTTP 200 response carrying a `status` field set to `ok` within the 10-second timeout, THEN THE Dokploy_Platform SHALL record that health check as failed.
5. IF the Health_Endpoint produces 3 consecutive failed health checks, THEN THE Dokploy_Platform SHALL mark the container as unhealthy.
6. WHILE the container is marked unhealthy, THE Dokploy_Platform SHALL withhold external traffic from that container.
7. WHEN the Health_Endpoint produces 2 consecutive successful health checks while the container is marked unhealthy, THE Dokploy_Platform SHALL mark the container as healthy and resume routing external traffic to that container.

### Requirement 5: Persistent SQLite storage via durable volume

**User Story:** As a Deployment_Operator, I want the SQLite database stored on a durable volume, so that application data survives restarts and redeployments.

#### Acceptance Criteria

1. THE Dokploy_Platform SHALL mount the Data_Volume from host path `/data/opays-hq` to container path `/app/data` with read-write access.
2. IF the Data_Volume mount fails during deployment, THEN THE Dokploy_Platform SHALL abort the deployment, retain the previously running container as the active container, and report the mount failure to the Deployment_Operator.
3. THE Opays_HQ_App SHALL store the SQLite_Database file at `/app/data/opays-hq.db`.
4. WHEN the Opays_HQ_App starts and the `/app/data` directory does not contain the SQLite_Database file, THE Opays_HQ_App SHALL create the database file at `/app/data/opays-hq.db` and initialize the schema before accepting API requests.
5. IF the Opays_HQ_App cannot create the SQLite_Database file or initialize the schema at startup because the `/app/data` directory is absent or not writable, THEN THE Opays_HQ_App SHALL fail startup and emit a log entry identifying the storage failure.
6. WHEN a container is replaced by a new deployment, THE Dokploy_Platform SHALL attach the same Data_Volume to the replacement container.
7. WHEN the replacement container starts and the SQLite_Database file already exists at `/app/data/opays-hq.db`, THE Opays_HQ_App SHALL open the existing database file and SHALL NOT re-initialize the schema or overwrite stored records.
8. WHEN the Opays_HQ_App completes a write transaction against the SQLite_Database, THE Opays_HQ_App SHALL persist the committed change to the Data_Volume such that the change is readable after a container restart or redeployment.

### Requirement 6: Domain routing and TLS termination

**User Story:** As an end user, I want to reach Opays HQ securely at its public domain, so that I can use the application over an encrypted connection.

#### Acceptance Criteria

1. WHEN a request arrives with a Host header equal to the Application_Domain `hq.opays.io`, THE Dokploy_Platform SHALL route the request to the Opays_HQ_App container on port 3001.
2. WHEN an external client establishes an HTTPS connection to the Application_Domain, THE Reverse_Proxy SHALL terminate TLS and forward the decrypted request to the Opays_HQ_App container on port 3001 while preserving the original request path and query string.
3. IF the Reverse_Proxy cannot complete the TLS handshake for an incoming HTTPS connection, THEN THE Reverse_Proxy SHALL close the connection without forwarding any request to the Opays_HQ_App container.
4. WHEN an external client connects to the Application_Domain over HTTP, THE Reverse_Proxy SHALL respond with a permanent redirect to the same requested URL changed to the `https` scheme, preserving the host, path, and query string.
5. THE Reverse_Proxy SHALL present a TLS certificate whose subject or subject-alternative-name matches the Application_Domain `hq.opays.io`, whose validity period includes the current date and time, and which chains to a publicly trusted certificate authority.
6. IF an incoming request arrives with a Host header that does not match the Application_Domain `hq.opays.io`, OR with a missing or malformed Host header, THEN THE Reverse_Proxy SHALL reject the request without routing it to the Opays_HQ_App container.

### Requirement 7: Zero-downtime deployment and rollback

**User Story:** As a Deployment_Operator, I want redeployments to avoid downtime and support rollback, so that updates do not interrupt users and failed releases can be reverted.

#### Acceptance Criteria

1. WHEN a new deployment is triggered, THE Dokploy_Platform SHALL start the replacement container and confirm it passes the health check (as defined in Requirement 4) before routing traffic to it.
2. WHILE the replacement container has not yet passed the health check, THE Dokploy_Platform SHALL continue routing traffic to the previously running container.
3. WHEN the replacement container passes the health check, THE Dokploy_Platform SHALL route new traffic to the replacement container.
4. WHEN the replacement container has begun receiving traffic, THE Dokploy_Platform SHALL allow in-flight requests on the previous container to drain for a grace period of up to 30 seconds before stopping it.
5. IF the replacement container fails to become healthy within the health check attempts defined in Requirement 4 (3 consecutive failed checks), THEN THE Dokploy_Platform SHALL stop the failed replacement container and retain the previously running container as the active container without interrupting its traffic.
6. WHEN the Deployment_Operator requests a rollback, THE Dokploy_Platform SHALL redeploy the previously successful Container_Image using the same health-check-gated zero-downtime traffic switch defined in criteria 1 through 4.
7. IF the Deployment_Operator requests a rollback and no previously successful Container_Image exists, THEN THE Dokploy_Platform SHALL reject the rollback request, retain the active container, and report the failure to the Deployment_Operator.

### Requirement 8: Deployment verification

**User Story:** As a Deployment_Operator, I want to confirm a deployment succeeded, so that I know the application is live and serving users correctly.

#### Acceptance Criteria

1. WHEN a deployment completes, THE Dokploy_Platform SHALL report the deployment outcome as success or failure to the Deployment_Operator within 10 seconds.
2. IF the deployment status report cannot be delivered, THEN THE Dokploy_Platform SHALL keep the completed deployment active without rolling it back.
3. WHEN the Deployment_Operator requests the Health_Endpoint through the Application_Domain after deployment, THE Opays_HQ_App SHALL respond with HTTP status 200 and a `status` field set to `ok` within 10 seconds.
4. WHEN the Deployment_Operator requests the application root through the Application_Domain, THE Opays_HQ_App SHALL return the SPA entry document with HTTP status 200 within 10 seconds.
5. WHEN the Deployment_Operator submits valid credentials to the authentication API through the Application_Domain, THE Opays_HQ_App SHALL return a signed authentication token within 10 seconds.
6. IF the Deployment_Operator submits invalid credentials to the authentication API through the Application_Domain, THEN THE Opays_HQ_App SHALL reject the request with an error indication and SHALL NOT return a signed authentication token.
