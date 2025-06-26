# Dash System Architecture Diagrams

## 1. System Architecture Overview

```mermaid
graph TB
    %% Define color scheme for positive, readable appearance
    classDef userClass fill:#e1f5fe,stroke:#0277bd,stroke-width:3px,color:#000
    classDef frontendClass fill:#f3e5f5,stroke:#7b1fa2,stroke-width:3px,color:#000
    classDef backendClass fill:#e8f5e8,stroke:#2e7d32,stroke-width:3px,color:#000
    classDef databaseClass fill:#fff3e0,stroke:#ef6c00,stroke-width:3px,color:#000
    classDef authClass fill:#fce4ec,stroke:#c2185b,stroke-width:3px,color:#000
    classDef infraClass fill:#f1f8e9,stroke:#558b2f,stroke-width:3px,color:#000

    %% User Layer
    User[👤 User Browser]:::userClass

    %% Frontend Layer
    subgraph "Frontend Layer"
        SvelteKit[🎨 SvelteKit Web App<br/>- TypeScript + Svelte 5<br/>- TailwindCSS + AOH Design<br/>- Widget Management<br/>- Dashboard Creation]:::frontendClass
        Storybook[📚 Storybook<br/>Component Library]:::frontendClass
    end

    %% Reverse Proxy
    Traefik[🔀 Traefik Reverse Proxy<br/>- Load Balancing<br/>- SSL Termination<br/>- CORS Headers]:::infraClass

    %% Backend Layer
    subgraph "Backend Layer"
        DashAPI[🚀 Dash API Service<br/>Go + Chi Router<br/>- Dashboard CRUD<br/>- Widget Management<br/>- Category Management<br/>- Favourite Management]:::backendClass

        subgraph "External Services"
            TagService[🏷️ Tag Service<br/>Tag Management]:::backendClass
            IAMSService[🔐 IAMS AAS<br/>Authorization Service]:::authClass
        end
    end

    %% Authentication Layer
    subgraph "Authentication Layer"
        Keycloak[🔑 Keycloak<br/>- JWT Token Issuer<br/>- User Authentication<br/>- Multi-tenant Support]:::authClass
    end

    %% Database Layer
    subgraph "Database Layer"
        DashDB[(🗄️ Dashboard Database<br/>PostgreSQL 17.0<br/>Schema: aoh_dash)]:::databaseClass
        KeycloakDB[(🔐 Keycloak Database<br/>PostgreSQL 17.0)]:::databaseClass
    end

    %% Infrastructure
    subgraph "Infrastructure"
        Docker[🐳 Docker Containers]:::infraClass
        GitHub[📦 GitHub Container Registry]:::infraClass
    end

    %% Connections
    User --> Traefik
    Traefik --> SvelteKit
    Traefik --> Keycloak
    Traefik --> IAMSService

    SvelteKit --> DashAPI
    SvelteKit --> Keycloak
    SvelteKit --> TagService

    DashAPI --> DashDB
    DashAPI --> Keycloak
    DashAPI --> TagService

    Keycloak --> KeycloakDB
    IAMSService --> Keycloak

    Docker --> GitHub
```

## 2. Deployment Architecture

```mermaid
graph TB
    %% Define color scheme
    classDef loadBalancer fill:#e3f2fd,stroke:#1976d2,stroke-width:3px,color:#000
    classDef webTier fill:#f3e5f5,stroke:#7b1fa2,stroke-width:3px,color:#000
    classDef appTier fill:#e8f5e8,stroke:#2e7d32,stroke-width:3px,color:#000
    classDef authTier fill:#fce4ec,stroke:#c2185b,stroke-width:3px,color:#000
    classDef dataTier fill:#fff3e0,stroke:#ef6c00,stroke-width:3px,color:#000
    classDef monitoring fill:#f1f8e9,stroke:#558b2f,stroke-width:3px,color:#000

    %% Load Balancer Tier
    subgraph "Load Balancer Tier"
        Traefik[🔀 Traefik v3.1<br/>Port: 80, 8080<br/>- HTTP/HTTPS Routing<br/>- Service Discovery<br/>- Health Checks]:::loadBalancer
    end

    %% Web Tier
    subgraph "Web Tier"
        DashWeb[🎨 Dash Web Container<br/>dash-web:latest-dev<br/>Port: 80<br/>- SvelteKit SSR<br/>- Static Assets<br/>- Client-side Routing]:::webTier
    end

    %% Application Tier
    subgraph "Application Tier"
        DashApp[🚀 Dash App Container<br/>dash:latest-dev<br/>Port: 5000<br/>- Go HTTP Server<br/>- REST API<br/>- Business Logic]:::appTier

        TagApp[🏷️ Tag Service<br/>External Service<br/>- Tag Management<br/>- Cross-reference]:::appTier
    end

    %% Authentication Tier
    subgraph "Authentication Tier"
        Keycloak[🔑 Keycloak Container<br/>iams-keycloak:build20240829-03<br/>Port: 80<br/>- OAuth2/OIDC Provider<br/>- JWT Token Issuer<br/>- Multi-tenant Auth]:::authTier

        IAMSAAS[🛡️ IAMS AAS Container<br/>iams-aas:latest-dev<br/>Port: 8080<br/>- Authorization Service<br/>- Role Management]:::authTier
    end

    %% Data Tier
    subgraph "Data Tier"
        DashDB[(🗄️ Dashboard Database<br/>postgres:17.0<br/>Port: 5432<br/>Schema: aoh_dash<br/>- Dashboards<br/>- Widgets<br/>- Categories)]:::dataTier

        KeycloakDB[(🔐 Keycloak Database<br/>postgres:17.0<br/>Port: 5432<br/>- Users<br/>- Realms<br/>- Sessions)]:::dataTier
    end

    %% Monitoring & Tools
    subgraph "Development Tools"
        Adminer[🔧 Adminer<br/>Port: 8080<br/>Database Admin]:::monitoring
    end

    %% Network Flow
    Internet[🌐 Internet] --> Traefik

    Traefik --> DashWeb
    Traefik --> Keycloak
    Traefik --> IAMSAAS

    DashWeb --> DashApp
    DashWeb --> Keycloak
    DashWeb --> TagApp

    DashApp --> DashDB
    DashApp --> Keycloak
    DashApp --> TagApp

    Keycloak --> KeycloakDB
    IAMSAAS --> Keycloak

    Adminer --> DashDB
    Adminer --> KeycloakDB

    %% Environment Variables
    subgraph "Configuration"
        EnvVars[📋 Environment Variables<br/>- Database Connections<br/>- Service URLs<br/>- Authentication Config<br/>- Feature Flags]:::monitoring
    end

    DashWeb -.-> EnvVars
    DashApp -.-> EnvVars
    Keycloak -.-> EnvVars
```

## 3. Data Flow Architecture with Data Structures

```mermaid
sequenceDiagram
    participant U as 👤 User Browser
    participant SW as 🎨 SvelteKit Web
    participant T as 🔀 Traefik
    participant KC as 🔑 Keycloak
    participant DA as 🚀 Dash API
    participant DB as 🗄️ PostgreSQL
    participant TS as 🏷️ Tag Service

    Note over U,TS: Dashboard Creation Flow with Data Structures

    %% Authentication Flow
    rect rgb(252, 228, 236)
        Note over U,KC: Authentication Phase
        U->>SW: Navigate to /aoh/dash/create
        SW->>KC: Redirect to OAuth2 login
        KC->>U: Login form
        U->>KC: Credentials {username, password}
        KC->>SW: Authorization code
        SW->>KC: Token exchange {code, client_id, client_secret}
        KC->>SW: JWT Token {access_token, refresh_token, id_token}
        Note over SW: Store tokens in HTTP-only cookies
    end

    %% Dashboard Creation Flow
    rect rgb(232, 245, 232)
        Note over U,DB: Dashboard Creation Phase
        U->>SW: Create Dashboard Form
        Note over U: Dashboard Data:<br/>{<br/>  name: "My Dashboard",<br/>  description: "Dashboard desc",<br/>  tags: [{text: "analytics"}],<br/>  widgets: []<br/>}

        SW->>DA: POST /api/dashboard
        Note over SW,DA: Request Body:<br/>{<br/>  dashboard: {<br/>    name: "My Dashboard",<br/>    description: "Dashboard desc"<br/>  },<br/>  tags: [{text: "analytics"}],<br/>  widgets: []<br/>}

        DA->>KC: Validate JWT Token
        KC->>DA: Token Claims {user_id, tenant_id, roles}

        DA->>DB: INSERT INTO dashboard
        Note over DA,DB: SQL Insert:<br/>INSERT INTO aoh_dash.dashboard<br/>(name, description, created_by, tenant_id)<br/>VALUES ($1, $2, $3, $4)<br/>RETURNING id, occ_lock

        DB->>DA: Dashboard Row {id: uuid, occ_lock: 0}

        DA->>TS: POST /tag with tag data
        Note over DA,TS: Tag Request:<br/>{<br/>  text: "analytics",<br/>  description: "Analytics tag"<br/>}
        TS->>DA: Tag Response {id: "tag-uuid"}

        DA->>DB: INSERT INTO dashboard_tag_mapping
        Note over DA,DB: Tag Mapping:<br/>INSERT INTO dashboard_tag_mapping<br/>(dashboard_id, tag_id, tenant_id)<br/>VALUES ($1, $2, $3)

        DA->>SW: Dashboard Created Response
        Note over DA,SW: Response:<br/>{<br/>  data: {<br/>    id: "dashboard-uuid",<br/>    name: "My Dashboard",<br/>    description: "Dashboard desc",<br/>    occ_lock: 0,<br/>    tags: [{id: "tag-uuid", text: "analytics"}]<br/>  },<br/>  message: "Success"<br/>}

        SW->>U: Redirect to /aoh/dash/[id]
    end

    %% Widget Addition Flow
    rect rgb(227, 242, 253)
        Note over U,DB: Widget Addition Phase
        U->>SW: Add Widget to Dashboard
        Note over U: Widget Data:<br/>{<br/>  widget_type_id: "info-widget-uuid",<br/>  row: 0, column: 0,<br/>  width: 2, height: 1,<br/>  config: {title: "Info Widget"}<br/>}

        SW->>DA: POST /api/widget
        Note over SW,DA: Widget Request:<br/>{<br/>  dashboard_id: "dashboard-uuid",<br/>  widget_type_id: "info-widget-uuid",<br/>  row: 0, column: 0,<br/>  width: 2, height: 1,<br/>  config: {title: "Info Widget"}<br/>}

        DA->>DB: INSERT INTO widget
        Note over DA,DB: Widget Insert:<br/>INSERT INTO aoh_dash.widget<br/>(dashboard_id, widget_type_id,<br/> row, column, width, height, config)<br/>VALUES ($1, $2, $3, $4, $5, $6, $7)<br/>RETURNING id, occ_lock

        DB->>DA: Widget Row
        Note over DB,DA: Widget Response:<br/>{<br/>  id: "widget-uuid",<br/>  dashboard_id: "dashboard-uuid",<br/>  widget_type_id: "info-widget-uuid",<br/>  row: 0, column: 0,<br/>  width: 2, height: 1,<br/>  config: {title: "Info Widget"},<br/>  occ_lock: 0<br/>}

        DA->>SW: Widget Created Response
        SW->>U: Update Dashboard UI
    end

    %% Dashboard Retrieval Flow
    rect rgb(248, 245, 232)
        Note over U,DB: Dashboard Retrieval Phase
        U->>SW: Load Dashboard /aoh/dash/[id]
        SW->>DA: GET /api/dashboard/[id]

        DA->>DB: Complex JOIN Query
        Note over DA,DB: Dashboard Query:<br/>SELECT d.*, w.*, wt.*, t.*<br/>FROM dashboard d<br/>LEFT JOIN widget w ON d.id = w.dashboard_id<br/>LEFT JOIN widget_type wt ON w.widget_type_id = wt.id<br/>LEFT JOIN dashboard_tag_mapping dtm ON d.id = dtm.dashboard_id<br/>LEFT JOIN tag t ON dtm.tag_id = t.id<br/>WHERE d.id = $1 AND d.tenant_id = $2

        DB->>DA: Complete Dashboard Data
        Note over DB,DA: Dashboard with Relations:<br/>{<br/>  id: "dashboard-uuid",<br/>  name: "My Dashboard",<br/>  description: "Dashboard desc",<br/>  occ_lock: 0,<br/>  widgets: [{<br/>    id: "widget-uuid",<br/>    widget_type_id: "info-widget-uuid",<br/>    row: 0, column: 0,<br/>    width: 2, height: 1,<br/>    config: {title: "Info Widget"}<br/>  }],<br/>  tags: [{<br/>    id: "tag-uuid",<br/>    text: "analytics"<br/>  }]<br/>}

        DA->>SW: Dashboard Response
        SW->>U: Render Dashboard with Widgets
    end

    %% Favourite Management Flow
    rect rgb(241, 248, 233)
        Note over U,DB: Favourite Management Phase
        U->>SW: Toggle Favourite
        SW->>DA: PATCH /api/favourite/[dashboard_id]
        Note over SW,DA: Favourite Request:<br/>{<br/>  favourite: true<br/>}

        DA->>DB: INSERT INTO favourite
        Note over DA,DB: Favourite Insert:<br/>INSERT INTO aoh_dash.favourite<br/>(dashboard_id, user_id, tenant_id)<br/>VALUES ($1, $2, $3)<br/>ON CONFLICT DO NOTHING

        DB->>DA: Favourite Status
        DA->>SW: Success Response
        SW->>U: Update UI State
    end
```

## 4. Database Schema and Relationships

```mermaid
erDiagram
    %% Define entities with their attributes
    DASHBOARD {
        uuid id PK
        timestamp created_at
        timestamp updated_at
        text created_by
        text updated_by
        text tenant_id
        int occ_lock
        text name UK
        text description
    }

    WIDGET {
        uuid id PK
        timestamp created_at
        timestamp updated_at
        text created_by
        text updated_by
        text tenant_id
        int occ_lock
        uuid dashboard_id FK
        uuid widget_type_id FK
        int row
        int column
        int width
        int height
        jsonb config
        uuid shared_config_id FK
    }

    WIDGET_TYPE {
        uuid id PK
        timestamp created_at
        timestamp updated_at
        text created_by
        text updated_by
        text tenant_id
        int occ_lock
        text name UK
        text icon
        int min_width
        int min_height
        int max_width
        int max_height
        uuid category_id FK
        int limit
        boolean enabled
        text path
    }

    CATEGORY {
        uuid id PK
        timestamp created_at
        timestamp updated_at
        text created_by
        text updated_by
        text tenant_id
        int occ_lock
        text name UK
        text description
    }

    SHARED_CONFIG {
        uuid id PK
        timestamp created_at
        timestamp updated_at
        text created_by
        text updated_by
        text tenant_id
        int occ_lock
        text name UK
        text description
        uuid widget_type_id FK
        jsonb config
    }

    DASHBOARD_TAG_MAPPING {
        uuid id PK
        timestamp created_at
        timestamp updated_at
        text created_by
        text updated_by
        text tenant_id
        int occ_lock
        uuid dashboard_id FK
        text tag_id
    }

    FAVOURITE {
        uuid id PK
        timestamp created_at
        timestamp updated_at
        text created_by
        text updated_by
        text tenant_id
        int occ_lock
        uuid dashboard_id FK
        text user_id
    }

    MODULE_INFO {
        uuid id PK
        timestamp created_at
        timestamp updated_at
        int occ_lock
        text key UK
        text value
        text comment
    }

    %% Define relationships
    DASHBOARD ||--o{ WIDGET : "contains"
    DASHBOARD ||--o{ DASHBOARD_TAG_MAPPING : "has_tags"
    DASHBOARD ||--o{ FAVOURITE : "favourited_by"

    WIDGET_TYPE ||--o{ WIDGET : "defines"
    WIDGET_TYPE ||--o{ SHARED_CONFIG : "has_configs"

    CATEGORY ||--o{ WIDGET_TYPE : "categorizes"

    SHARED_CONFIG ||--o{ WIDGET : "configures"

    %% External relationships (no FK constraints)
    DASHBOARD_TAG_MAPPING }o--|| TAG_SERVICE : "references"
    FAVOURITE }o--|| USER_SERVICE : "references"
```

## 5. Component Architecture

```mermaid
graph TB
    %% Define color scheme
    classDef coreComponent fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px,color:#000
    classDef dashComponent fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#000
    classDef uiComponent fill:#e3f2fd,stroke:#1976d2,stroke-width:2px,color:#000
    classDef widgetComponent fill:#fff3e0,stroke:#ef6c00,stroke-width:2px,color:#000
    classDef serviceComponent fill:#fce4ec,stroke:#c2185b,stroke-width:2px,color:#000

    %% Core AOH Framework
    subgraph "AOH Core Framework"
        AuthProvider[🔐 AuthProvider<br/>JWT Token Management]:::coreComponent
        ThemeProvider[🎨 ThemeProvider<br/>Dark/Light Theme]:::coreComponent
        BreadcrumbStore[🧭 Breadcrumb Store<br/>Navigation State]:::coreComponent
        Logger[📝 Logger<br/>Structured Logging]:::coreComponent

        subgraph "Core UI Components"
            Button[🔘 Button]:::uiComponent
            Input[📝 Input]:::uiComponent
            Avatar[👤 Avatar]:::uiComponent
            Sidebar[📋 Sidebar]:::uiComponent
            Headerbar[📊 Headerbar]:::uiComponent
        end
    end

    %% Dashboard Components
    subgraph "Dashboard Components"
        WidgetGrid[🎯 WidgetGrid<br/>GridStack Integration]:::dashComponent
        WidgetItem[🧩 WidgetItem<br/>Individual Widget]:::dashComponent
        WidgetSelector[🎛️ WidgetSelector<br/>Widget Picker]:::dashComponent
        PropertyInspector[🔧 PropertyInspector<br/>Widget Configuration]:::dashComponent
        TagSelector[🏷️ TagSelector<br/>Tag Management]:::dashComponent

        subgraph "Dashboard UI"
            Card[📄 Card]:::uiComponent
            Dialog[💬 Dialog]:::uiComponent
            Table[📊 Table]:::uiComponent
            Tabs[📑 Tabs]:::uiComponent
            Badge[🏆 Badge]:::uiComponent
        end
    end

    %% Widget Implementations
    subgraph "Widget Types"
        InfoWidget[ℹ️ Info Widget<br/>Static Information]:::widgetComponent
        ErrorWidget[❌ Error Widget<br/>Error Display]:::widgetComponent
        ItemListWidget[📋 ItemList Widget<br/>Data Lists]:::widgetComponent
        CustomWidget[⚙️ Custom Widgets<br/>Extensible]:::widgetComponent
    end

    %% Services
    subgraph "Services"
        DashService[🚀 Dash Service<br/>API Communication]:::serviceComponent
        AuthService[🔐 Auth Service<br/>OIDC Integration]:::serviceComponent
        TagService[🏷️ Tag Service<br/>External Tag API]:::serviceComponent
    end

    %% Component Relationships
    WidgetGrid --> WidgetItem
    WidgetGrid --> WidgetSelector
    WidgetItem --> PropertyInspector
    WidgetItem --> InfoWidget
    WidgetItem --> ErrorWidget
    WidgetItem --> ItemListWidget
    WidgetItem --> CustomWidget

    WidgetSelector --> TagSelector
    PropertyInspector --> Card
    PropertyInspector --> Dialog
    PropertyInspector --> Tabs

    DashService --> AuthService
    WidgetGrid --> DashService
    TagSelector --> TagService

    AuthProvider --> AuthService
    ThemeProvider --> Button
    ThemeProvider --> Card
    BreadcrumbStore --> Headerbar

    Logger --> DashService
    Logger --> AuthService
```

## 6. API Endpoint Structure

```mermaid
graph LR
    %% Define color scheme
    classDef rootEndpoint fill:#e8f5e8,stroke:#2e7d32,stroke-width:2px,color:#000
    classDef dashboardEndpoint fill:#f3e5f5,stroke:#7b1fa2,stroke-width:2px,color:#000
    classDef widgetEndpoint fill:#fff3e0,stroke:#ef6c00,stroke-width:2px,color:#000
    classDef categoryEndpoint fill:#e3f2fd,stroke:#1976d2,stroke-width:2px,color:#000
    classDef favouriteEndpoint fill:#fce4ec,stroke:#c2185b,stroke-width:2px,color:#000
    classDef healthEndpoint fill:#f1f8e9,stroke:#558b2f,stroke-width:2px,color:#000

    %% Root API Structure
    Root["🌐 / API Root"]:::rootEndpoint
    V1["📋 /v1 Versioned API"]:::rootEndpoint

    %% Health Endpoints
    Health["❤️ Health Checks"]:::healthEndpoint
    Livez["✅ /livez"]:::healthEndpoint
    Readyz["🔄 /readyz"]:::healthEndpoint

    %% Dashboard Endpoints
    Dashboard["📊 /dashboard"]:::dashboardEndpoint
    DashboardById["🆔 /dashboard/id/[id]"]:::dashboardEndpoint
    DashboardByName["📝 /dashboard/name/[name]"]:::dashboardEndpoint
    DashboardByUser["👤 /dashboard/user_id/[id]"]:::dashboardEndpoint
    DashboardTag["🏷️ /dashboard/tag"]:::dashboardEndpoint

    %% Widget Endpoints
    Widget["🧩 /widget"]:::widgetEndpoint
    WidgetById["🆔 /widget/id/[id]"]:::widgetEndpoint
    WidgetType["⚙️ /widget/type"]:::widgetEndpoint
    WidgetTypeById["🆔 /widget/type/id/[id]"]:::widgetEndpoint
    WidgetTypeName["📝 /widget/type/name/[name]"]:::widgetEndpoint
    SharedConfig["🔧 /widget/shared_config"]:::widgetEndpoint

    %% Category Endpoints
    Category["📂 /category"]:::categoryEndpoint
    CategoryById["🆔 /category/id/[id]"]:::categoryEndpoint
    CategoryByName["📝 /category/name/[name]"]:::categoryEndpoint

    %% Favourite Endpoints
    Favourite["⭐ /favourite"]:::favouriteEndpoint
    FavouriteById["🆔 /favourite/id/[id]"]:::favouriteEndpoint

    %% API Structure
    Root --> Health
    Root --> Dashboard
    Root --> Widget
    Root --> Category
    Root --> Favourite

    V1 --> Health
    V1 --> Dashboard
    V1 --> Widget
    V1 --> Category
    V1 --> Favourite

    Health --> Livez
    Health --> Readyz

    Dashboard --> DashboardById
    Dashboard --> DashboardByName
    Dashboard --> DashboardByUser
    Dashboard --> DashboardTag

    Widget --> WidgetById
    Widget --> WidgetType
    Widget --> SharedConfig

    WidgetType --> WidgetTypeById
    WidgetType --> WidgetTypeName
    WidgetType --> SharedConfig

    Category --> CategoryById
    Category --> CategoryByName

    Favourite --> FavouriteById
```

---

_Generated for the Dash project - A comprehensive dashboard management system with customizable widgets and multi-tenant support._
