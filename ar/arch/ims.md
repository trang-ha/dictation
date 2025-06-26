## System Architecture Diagram
```mermaid
graph TB
    %% Define color scheme for positive, readable appearance
    classDef frontend fill:#e1f5fe,stroke:#0277bd,stroke-width:3px,color:#000
    classDef backend fill:#f3e5f5,stroke:#7b1fa2,stroke-width:3px,color:#000
    classDef database fill:#e8f5e8,stroke:#2e7d32,stroke-width:3px,color:#000
    classDef external fill:#fff3e0,stroke:#f57c00,stroke-width:3px,color:#000
    classDef middleware fill:#fce4ec,stroke:#c2185b,stroke-width:3px,color:#000

    %% Frontend Layer
    subgraph "Frontend Layer"
        WEB[🌐 SvelteKit Web App<br/>TypeScript + TailwindCSS]
        UI[🎨 Component Library<br/>Bits UI + Custom Components]
        STORE[📦 State Management<br/>Svelte Stores + Runes]
    end

    %% API Gateway Layer
    subgraph "API Gateway Layer"
        PROXY[🔄 SvelteKit API Proxy<br/>Request/Response Routing]
        AUTH_MW[🔐 Authentication Middleware<br/>JWT Bearer Token Validation]
    end

    %% Backend Layer
    subgraph "Backend Layer"
        API[🚀 Go HTTP Server<br/>Chi Router + Clean Architecture]
        HANDLER[📋 Handler Layer<br/>HTTP Request Processing]
        SERVICE[⚙️ Service Layer<br/>Business Logic]
        MODEL[🗃️ Model Layer<br/>Data Access + Validation]
    end

    %% Database Layer
    subgraph "Database Layer"
        PG[(🐘 PostgreSQL<br/>Primary Database)]
        SCHEMA[📊 Schema Management<br/>Versioned Migrations]
    end

    %% External Services
    subgraph "External Services"
        KC[🔑 Keycloak/IAM<br/>Identity & Access Management]
        LOG[📝 Logging Service<br/>Uber Zap Logger]
    end

    %% Connections
    WEB --> UI
    WEB --> STORE
    WEB --> PROXY
    PROXY --> AUTH_MW
    AUTH_MW --> API
    API --> HANDLER
    HANDLER --> SERVICE
    SERVICE --> MODEL
    MODEL --> PG
    MODEL --> SCHEMA
    AUTH_MW --> KC
    API --> LOG
    HANDLER --> KC

    %% Apply styles
    class WEB,UI,STORE frontend
    class PROXY,AUTH_MW middleware
    class API,HANDLER,SERVICE,MODEL backend
    class PG,SCHEMA database
    class KC,LOG external
```

## Deployment Architecture Diagram
```mermaid
graph TB
    %% Define color scheme
    classDef container fill:#e3f2fd,stroke:#1976d2,stroke-width:3px,color:#000
    classDef service fill:#f1f8e9,stroke:#388e3c,stroke-width:3px,color:#000
    classDef storage fill:#fff8e1,stroke:#f57c00,stroke-width:3px,color:#000
    classDef network fill:#fce4ec,stroke:#c2185b,stroke-width:3px,color:#000
    classDef external fill:#f3e5f5,stroke:#7b1fa2,stroke-width:3px,color:#000

    %% Load Balancer
    LB[🌐 Load Balancer<br/>Nginx/HAProxy]

    %% Container Orchestration
    subgraph "Container Platform (Docker/K8s)"
        
        subgraph "Frontend Services"
            WEB1[📱 SvelteKit App Instance 1<br/>Port: 3000]
            WEB2[📱 SvelteKit App Instance 2<br/>Port: 3001]
            WEB3[📱 SvelteKit App Instance N<br/>Port: 300N]
        end

        subgraph "Backend Services"
            API1[🚀 IMS API Instance 1<br/>Port: 5000]
            API2[🚀 IMS API Instance 2<br/>Port: 5001]
            API3[🚀 IMS API Instance N<br/>Port: 500N]
        end

        subgraph "Shared Services"
            KC_SVC[🔑 Keycloak Service<br/>Port: 8080]
            LOG_SVC[📝 Logging Service<br/>Centralized Logs]
        end
    end

    %% Database Layer
    subgraph "Database Cluster"
        PG_PRIMARY[(🐘 PostgreSQL Primary<br/>Read/Write)]
        PG_REPLICA1[(🐘 PostgreSQL Replica 1<br/>Read Only)]
        PG_REPLICA2[(🐘 PostgreSQL Replica 2<br/>Read Only)]
    end

    %% Storage
    subgraph "Persistent Storage"
        DB_STORAGE[💾 Database Storage<br/>Persistent Volumes]
        LOG_STORAGE[📁 Log Storage<br/>Persistent Volumes]
        CONFIG_STORAGE[⚙️ Configuration Storage<br/>ConfigMaps/Secrets]
    end

    %% External Services
    subgraph "External Infrastructure"
        MONITORING[📊 Monitoring<br/>Prometheus/Grafana]
        BACKUP[💾 Backup Service<br/>Automated DB Backups]
        CDN[🌍 CDN<br/>Static Asset Delivery]
    end

    %% Network Connections
    LB --> WEB1
    LB --> WEB2
    LB --> WEB3
    
    WEB1 --> API1
    WEB2 --> API2
    WEB3 --> API3
    
    API1 --> PG_PRIMARY
    API2 --> PG_PRIMARY
    API3 --> PG_PRIMARY
    
    API1 --> PG_REPLICA1
    API2 --> PG_REPLICA2
    API3 --> PG_REPLICA1
    
    WEB1 --> KC_SVC
    WEB2 --> KC_SVC
    WEB3 --> KC_SVC
    
    API1 --> KC_SVC
    API2 --> KC_SVC
    API3 --> KC_SVC
    
    API1 --> LOG_SVC
    API2 --> LOG_SVC
    API3 --> LOG_SVC
    
    PG_PRIMARY --> DB_STORAGE
    PG_REPLICA1 --> DB_STORAGE
    PG_REPLICA2 --> DB_STORAGE
    
    LOG_SVC --> LOG_STORAGE
    KC_SVC --> CONFIG_STORAGE
    
    PG_PRIMARY --> BACKUP
    LOG_SVC --> MONITORING
    API1 --> MONITORING
    
    WEB1 --> CDN
    WEB2 --> CDN
    WEB3 --> CDN

    %% Apply styles
    class WEB1,WEB2,WEB3,API1,API2,API3 container
    class KC_SVC,LOG_SVC service
    class DB_STORAGE,LOG_STORAGE,CONFIG_STORAGE storage
    class LB network
    class PG_PRIMARY,PG_REPLICA1,PG_REPLICA2 storage
    class MONITORING,BACKUP,CDN external

```
## Data Flow Diagram
```mermaid
sequenceDiagram
    participant U as 👤 User
    participant W as 🌐 SvelteKit Frontend
    participant P as 🔄 API Proxy
    participant A as 🔐 Auth Middleware
    participant H as 📋 Handler Layer
    participant S as ⚙️ Service Layer
    participant M as 🗃️ Model Layer
    participant D as 🐘 PostgreSQL
    participant K as 🔑 Keycloak

    %% Authentication Flow
    Note over U,K: 🔐 Authentication Flow
    U->>W: 1. Access Protected Route
    W->>K: 2. Redirect to Login
    K->>U: 3. Login Form
    U->>K: 4. Submit Credentials
    K->>W: 5. Return JWT Token
    W->>W: 6. Store Token in Cookies

    %% Incident Management Flow
    Note over U,D: 📋 Incident Management Flow
    U->>W: 7. Create/View Incident
    W->>P: 8. API Request + JWT
    P->>A: 9. Validate JWT Token
    A->>K: 10. Verify Token with Keycloak
    K->>A: 11. Token Valid + Claims
    A->>H: 12. Forward Request + User Context
    
    %% Business Logic Processing
    H->>H: 13. Validate Request Data
    H->>S: 14. Execute Business Logic
    S->>S: 15. Apply Business Rules
    S->>M: 16. Data Access Request
    
    %% Database Operations
    M->>M: 17. Build SQL Query
    M->>D: 18. Execute Database Query
    D->>M: 19. Return Query Results
    M->>S: 20. Return Processed Data
    
    %% Response Flow
    S->>H: 21. Return Service Response
    H->>P: 22. HTTP Response + Data
    P->>W: 23. JSON Response
    W->>W: 24. Update UI State
    W->>U: 25. Display Updated Interface

    %% Error Handling Flow
    Note over U,D: ⚠️ Error Handling Flow
    alt Authentication Error
        A->>P: 26a. 401 Unauthorized
        P->>W: 27a. Redirect to Login
    else Business Logic Error
        S->>H: 26b. Business Error
        H->>P: 27b. 400 Bad Request
        P->>W: 28b. Error Message
        W->>U: 29b. Display Error
    else Database Error
        D->>M: 26c. Database Error
        M->>S: 27c. Data Access Error
        S->>H: 28c. Service Error
        H->>P: 29c. 500 Internal Error
        P->>W: 30c. Error Response
        W->>U: 31c. Display Error Message
    end

    %% Client-Side Communication (BroadcastChannel)
    Note over U,W: 📡 Client-Side Tab Communication
    W->>W: 32. BroadcastChannel Message
    Note right of W: Only between browser tabs<br/>Same origin, client-side only
```
