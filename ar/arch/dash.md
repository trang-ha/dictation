## System Architecture Diagram

```mermaid
graph TB
    %% Define color scheme for positive, readable appearance
    classDef frontend fill:#e1f5fe,stroke:#0277bd,stroke-width:2px,color:#000
    classDef backend fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#000
    classDef database fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px,color:#000
    classDef auth fill:#fff3e0,stroke:#ef6c00,stroke-width:2px,color:#000
    classDef external fill:#fce4ec,stroke:#c2185b,stroke-width:2px,color:#000
    classDef infrastructure fill:#f1f8e9,stroke:#558b2f,stroke-width:2px,color:#000

    %% Frontend Layer
    subgraph "Frontend Layer"
        WEB[SvelteKit Web App<br/>TypeScript + TailwindCSS]
        COMP[Component Library<br/>AOH Design System]
        WIDGETS[Widget System<br/>Configurable Dashboards]
        STORES[Svelte Stores<br/>State Management]
    end

    %% Backend Layer
    subgraph "Backend Layer"
        API[Go REST API<br/>Chi Router]
        HANDLERS[HTTP Handlers<br/>Request Processing]
        SERVICES[Business Logic<br/>Service Layer]
        MODELS[Data Models<br/>Clean Architecture]
    end

    %% Database Layer
    subgraph "Data Layer"
        POSTGRES[(PostgreSQL 17.0<br/>Primary Database)]
        SCHEMA[aoh_dash Schema<br/>Multi-tenant Design]
        MIGRATIONS[Versioned Migrations<br/>Schema Evolution]
    end

    %% Authentication & Authorization
    subgraph "Identity & Access Management"
        KEYCLOAK[Keycloak IAM<br/>OpenID Connect]
        JWT[JWT Tokens<br/>Access & Refresh]
        RBAC[Role-Based Access<br/>Tenant Isolation]
    end

    %% External Services
    subgraph "External Services"
        TAG_SVC[Tag Service<br/>Metadata Management]
        IAMS_AAS[IAMS AAS<br/>Admin Service]
    end

    %% Infrastructure
    subgraph "Infrastructure"
        TRAEFIK[Traefik Proxy<br/>Load Balancer]
        DOCKER[Docker Containers<br/>Containerization]
        GITHUB[GitHub Actions<br/>CI/CD Pipeline]
    end

    %% Connections
    WEB --> COMP
    WEB --> WIDGETS
    WEB --> STORES
    WEB --> API
    
    API --> HANDLERS
    HANDLERS --> SERVICES
    SERVICES --> MODELS
    MODELS --> POSTGRES
    
    POSTGRES --> SCHEMA
    SCHEMA --> MIGRATIONS
    
    WEB --> KEYCLOAK
    API --> JWT
    KEYCLOAK --> JWT
    JWT --> RBAC
    
    API --> TAG_SVC
    KEYCLOAK --> IAMS_AAS
    
    TRAEFIK --> WEB
    TRAEFIK --> API
    TRAEFIK --> KEYCLOAK
    
    DOCKER --> WEB
    DOCKER --> API
    DOCKER --> POSTGRES
    DOCKER --> KEYCLOAK
    
    GITHUB --> DOCKER

    %% Apply styles
    class WEB,COMP,WIDGETS,STORES frontend
    class API,HANDLERS,SERVICES,MODELS backend
    class POSTGRES,SCHEMA,MIGRATIONS database
    class KEYCLOAK,JWT,RBAC auth
    class TAG_SVC,IAMS_AAS external
    class TRAEFIK,DOCKER,GITHUB infrastructure
```

## Deployment Architecture Diagram

```mermaid
graph TB
    %% Define color scheme
    classDef loadbalancer fill:#e3f2fd,stroke:#1976d2,stroke-width:3px,color:#000
    classDef webapp fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#000
    classDef api fill:#e8f5e8,stroke:#388e3c,stroke-width:2px,color:#000
    classDef auth fill:#fff8e1,stroke:#f57c00,stroke-width:2px,color:#000
    classDef database fill:#fce4ec,stroke:#c2185b,stroke-width:2px,color:#000
    classDef network fill:#f1f8e9,stroke:#689f38,stroke-width:2px,color:#000
    classDef storage fill:#fff3e0,stroke:#ff9800,stroke-width:2px,color:#000

    %% External Access
    USERS[👥 Users<br/>Web Browsers]
    INTERNET((Internet))

    %% Load Balancer & Reverse Proxy
    subgraph "Load Balancer Layer"
        TRAEFIK[🔀 Traefik v3.1<br/>Reverse Proxy<br/>Port: 80, 8080]
    end

    %% Application Layer
    subgraph "Application Services"
        subgraph "Frontend Container"
            DASH_WEB[🌐 dash-web<br/>SvelteKit App<br/>Node.js 20.18<br/>Port: 80]
        end
        
        subgraph "Backend Container"
            DASH_APP[⚙️ dash-app<br/>Go 1.24 API<br/>Chi Router<br/>Port: 5000]
        end
    end

    %% Authentication Layer
    subgraph "Identity Management"
        subgraph "Keycloak Container"
            KEYCLOAK[🔐 iams-keycloak<br/>OpenID Connect<br/>Port: 80]
        end
        
        subgraph "Admin Service Container"
            IAMS_AAS[👤 iams-aas<br/>Admin API<br/>Port: 8080]
        end
    end

    %% Database Layer
    subgraph "Data Persistence"
        subgraph "Main Database"
            POSTGRES_MAIN[(🗄️ PostgreSQL 17.0<br/>Main Database<br/>Port: 5432)]
        end
        
        subgraph "Keycloak Database"
            POSTGRES_KC[(🗄️ PostgreSQL 17.0<br/>Keycloak DB<br/>Port: 5432)]
        end
    end

    %% Storage & Volumes
    subgraph "Persistent Storage"
        KC_DATA[📁 Keycloak Data<br/>./.data/keycloak-postgres/]
        REALM_CONFIG[📋 Realm Config<br/>./deployments/realm]
    end

    %% Network Configuration
    subgraph "Network & Routing"
        DOCKER_NET[🌐 Docker Network<br/>Container Communication]
        HOST_RULES[📋 Host Rules<br/>dash-web.localhost<br/>dash.localhost<br/>keycloak.localhost]
    end

    %% Connections
    USERS --> INTERNET
    INTERNET --> TRAEFIK
    
    TRAEFIK --> DASH_WEB
    TRAEFIK --> DASH_APP
    TRAEFIK --> KEYCLOAK
    TRAEFIK --> IAMS_AAS
    
    DASH_WEB --> DASH_APP
    DASH_WEB --> KEYCLOAK
    DASH_APP --> POSTGRES_MAIN
    DASH_APP --> KEYCLOAK
    
    KEYCLOAK --> POSTGRES_KC
    KEYCLOAK --> REALM_CONFIG
    IAMS_AAS --> KEYCLOAK
    
    POSTGRES_KC --> KC_DATA
    
    DOCKER_NET -.-> DASH_WEB
    DOCKER_NET -.-> DASH_APP
    DOCKER_NET -.-> KEYCLOAK
    DOCKER_NET -.-> IAMS_AAS
    DOCKER_NET -.-> POSTGRES_MAIN
    DOCKER_NET -.-> POSTGRES_KC
    
    HOST_RULES -.-> TRAEFIK

    %% Apply styles
    class TRAEFIK loadbalancer
    class DASH_WEB webapp
    class DASH_APP api
    class KEYCLOAK,IAMS_AAS auth
    class POSTGRES_MAIN,POSTGRES_KC database
    class DOCKER_NET,HOST_RULES network
    class KC_DATA,REALM_CONFIG storage
```

## Data Flow Diagram

```mermaid
sequenceDiagram
    participant U as 👤 User
    participant T as 🔀 Traefik
    participant W as 🌐 SvelteKit Web
    participant K as 🔐 Keycloak
    participant A as ⚙️ Go API
    participant D as 🗄️ PostgreSQL
    participant TS as 🏷️ Tag Service

    %% Authentication Flow
    Note over U,TS: 🔐 Authentication Flow
    U->>+T: 1. Access Dashboard
    T->>+W: 2. Route to Web App
    W->>W: 3. Check Auth Status
    alt Not Authenticated
        W->>+K: 4. Redirect to Login
        K->>-U: 5. Login Form
        U->>+K: 6. Submit Credentials
        K->>K: 7. Validate User
        K->>-W: 8. Return JWT Tokens
        W->>W: 9. Store Tokens in Cookies
    end

    %% Dashboard Data Flow
    Note over U,TS: 📊 Dashboard Data Flow
    W->>+A: 10. GET /api/dashboard (with JWT)
    A->>A: 11. Validate JWT Token
    A->>A: 12. Extract Tenant ID
    A->>+D: 13. Query Dashboards
    Note over D: SELECT * FROM dashboard<br/>WHERE tenant_id = ?
    D->>-A: 14. Return Dashboard List
    A->>-W: 15. JSON Response
    W->>-U: 16. Render Dashboard List

    %% Widget Configuration Flow
    Note over U,TS: 🧩 Widget Configuration Flow
    U->>+W: 17. Select Dashboard
    W->>+A: 18. GET /api/dashboard/{id}
    A->>+D: 19. Query Dashboard + Widgets
    Note over D: SELECT d.*, w.* FROM dashboard d<br/>LEFT JOIN widget w ON d.id = w.dashboard_id<br/>WHERE d.id = ? AND d.tenant_id = ?
    D->>-A: 20. Return Dashboard with Widgets
    A->>-W: 21. Dashboard Configuration
    W->>W: 22. Render Widget Grid
    W->>-U: 23. Interactive Dashboard

    %% Tag Management Flow
    Note over U,TS: 🏷️ Tag Management Flow
    U->>+W: 24. Add Tags to Dashboard
    W->>+TS: 25. GET /tags (External Service)
    TS->>-W: 26. Available Tags
    W->>+A: 27. POST /api/dashboard/{id}/tags
    A->>+D: 28. Insert Tag Mappings
    Note over D: INSERT INTO dashboard_tag_mapping<br/>(dashboard_id, tag_id, tenant_id)
    D->>-A: 29. Confirm Insertion
    A->>-W: 30. Success Response
    W->>-U: 31. Updated Dashboard

    %% Widget CRUD Operations
    Note over U,TS: ⚡ Widget CRUD Operations
    U->>+W: 32. Add/Edit Widget
    W->>+A: 33. POST/PATCH /api/widget
    A->>A: 34. Validate Widget Config
    A->>+D: 35. Insert/Update Widget
    Note over D: INSERT/UPDATE widget<br/>SET config = ?, position = ?<br/>WHERE dashboard_id = ?
    D->>-A: 36. Return Updated Widget
    A->>-W: 37. Widget Data
    W->>W: 38. Update Widget Grid
    W->>-U: 39. Real-time Update

    %% Favourites Flow
    Note over U,TS: ⭐ Favourites Management
    U->>+W: 40. Toggle Favourite
    W->>+A: 41. POST/DELETE /api/favourite
    A->>+D: 42. Insert/Delete Favourite
    Note over D: INSERT/DELETE FROM favourite<br/>WHERE user_id = ? AND dashboard_id = ?
    D->>-A: 43. Confirm Operation
    A->>-W: 44. Success Response
    W->>-U: 45. Updated UI State

    %% Error Handling & Logging
    Note over U,TS: 🚨 Error Handling
    alt API Error
        A->>A: 46. Log Error (Zap Logger)
        A->>W: 47. Structured Error Response
        W->>U: 48. User-Friendly Error Message
    end

    %% Token Refresh Flow
    Note over U,TS: 🔄 Token Refresh
    alt Token Expired
        W->>+K: 49. Refresh Token Request
        K->>K: 50. Validate Refresh Token
        K->>-W: 51. New Access Token
        W->>W: 52. Update Cookies
        W->>A: 53. Retry Original Request
    end
```
