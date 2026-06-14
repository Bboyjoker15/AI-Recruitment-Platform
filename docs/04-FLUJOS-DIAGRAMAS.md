# Diagramas de Flujo - AI Recruitment Platform

> **Nota:** Todos los diagramas usan sintaxis Mermaid.js y son renderizados nativamente por GitHub.

---

## 1. Arquitectura del sistema

```mermaid
graph TB
    subgraph Cliente["Navegador Web"]
        A[Next.js App<br/>React 19 + Tailwind CSS 4]
    end

    subgraph Servidor["Next.js Server"]
        B[App Router<br/>Server Components]
        C[Server Actions<br/>applyToJob / analyzeCandidate]
        D[Middleware<br/>session refresh + redirect]
    end

    subgraph Backend["Supabase Cloud"]
        E[Supabase Auth<br/>Email + Password]
        F[(PostgreSQL<br/>6 tablas)]
        G[RPC Functions<br/>insert_ai_log / update_candidate_stage]
    end

    subgraph IA["Motor de IA"]
        H[Groq API<br/>llama-3.3-70b-versatile]
    end

    subgraph Automatizacion["Automatizacion"]
        I[n8n Local<br/>3 workflows Webhook]
        J[Resend API<br/>Email transaccional]
        K[Cloudflare Tunnel<br/>localhost:5678 → public URL]
    end

    A <-->|HTTP| B
    A <-->|REST + Auth| E
    A <-->|REST| F
    B <-->|Cookies| E
    B <-->|Server Actions| F
    C -->|POST /chat/completions| H
    C -->|POST webhook| I
    I -->|Resend API| J
    I --> K
```

---

## 2. Flujo de autenticacion

```mermaid
flowchart TD
    START([Usuario llega a /login]) --> FORM[Ingresa email + password]
    FORM --> LOGIN[supabase.auth.signInWithPassword]
    LOGIN --> CHECK{Respuesta exitosa?}
    CHECK -->|No| ERROR[Mostrar mensaje de error]
    ERROR --> FORM
    CHECK -->|Si| DASH[Redirige a /dashboard]
    DASH --> DONE([Dashboard visible])
```

---

## 3. Flujo de registro

```mermaid
flowchart TD
    START([Usuario llega a /login modo signup]) --> FORM[Ingresa name + email + password]
    FORM --> SIGNUP[supabase.auth.signUp<br/>options.data.name = fullName]
    SIGNUP --> CHECK{Auth devuelve usuario?}
    CHECK -->|No| ERROR[Mostrar mensaje de error]
    ERROR --> FORM
    CHECK -->|Si| SUCCESS[Mostrar: Check your email]
    SUCCESS --> WAIT[Esperar confirmacion por email]
    WAIT --> REDIRECT[Iniciar sesion]
```

---

## 4. Flujo de middleware

```mermaid
flowchart TD
    REQ([Request a cualquier ruta]) --> MID[Middleware ejecuta updateSession]
    MID --> USER[supabase.auth.getUser]
    USER --> AUTH{Usuario autenticado?}
    
    AUTH -->|No| RUTA{Que ruta?}
    RUTA -->|/dashboard /jobs /candidates /interviews /tokens| REDIR_LOGIN[Redirect a /login]
    RUTA -->|/ /apply/* /login| ALLOW[Permitir acceso]
    
    AUTH -->|Si| LOGIN_PAGE{Es /login o / ?}
    LOGIN_PAGE -->|Si| REDIR_DASH[Redirect a /dashboard]
    LOGIN_PAGE -->|No| ALLOW
    
    ALLOW --> RESP([NextResponse.next])
    REDIR_LOGIN --> RESP_REDIR([NextResponse.redirect /login])
    REDIR_DASH --> RESP_REDIR_DASH([NextResponse.redirect /dashboard])
```

---

## 5. Flujo de analisis CV con IA

```mermaid
sequenceDiagram
    actor R as Recruiter
    participant F as Frontend
    participant SA as Server Action
    participant S as Supabase
    participant G as Groq API
    participant N as n8n

    R->>F: Selecciona PDF + completa formulario
    F->>F: Extrae texto con pdfjs-dist (CDN)
    F->>SA: analyzeCandidate(formData)
    
    SA->>SA: callAIApi(cvText, jobDescription)
    SA->>G: POST /chat/completions
    G-->>SA: JSON con analisis
    
    SA->>SA: parseAIScore(JSON)
    
    SA->>S: INSERT candidates (job_id, name, email, raw_cv_data)
    S-->>SA: candidate.id
    
    SA->>S: INSERT scores (candidate_id, summary, classification, score, ...)
    
    SA->>S: RPC insert_ai_log (prompt, response, tokens, latency)
    
    SA-->>F: Resultado { candidateId, score, classification }
    F-->>R: UI actualizada con score, resumen, sugerencias
    
    SA->>N: fetch(webhook/candidate-created) [fire-and-forget]
    N->>N: Resend: email candidato + reclutador
```

---

## 6. Flujo de postulacion publica

```mermaid
sequenceDiagram
    actor C as Candidato
    participant LP as Landing Page
    participant AP as Apply Page
    participant SA as Server Action
    participant S as Supabase (Admin)
    participant G as Groq API
    participant N as n8n

    C->>LP: Navega a pagina principal
    LP-->>C: Lista de vacantes publicadas
    C->>LP: Hace clic en una vacante
    LP->>AP: Redirige a /apply/[jobId]
    AP-->>C: Formulario de postulacion

    C->>AP: Completa nombre + email + PDF
    AP->>AP: Extrae texto del PDF (pdfjs-dist)
    C->>AP: Hace clic en "Enviar postulacion"
    AP->>SA: applyToJob(formData)
    
    SA->>SA: callAIApi(cvText, jobDescription)
    SA->>G: POST /chat/completions
    G-->>SA: JSON analisis
    
    SA->>SA: parseAIScore(JSON)
    SA->>S: INSERT candidates (admin client)
    SA->>S: INSERT scores (admin client)
    SA->>S: RPC insert_ai_log (admin client)
    
    SA-->>AP: { success, score, classification }
    AP-->>C: Pantalla de confirmacion con score

    SA->>N: fetch(webhook/candidate-created)
    N->>N: Resend: email candidato + reclutador
```

---

## 7. Workflows de n8n

### 7.1 Candidate Created

```mermaid
flowchart LR
    WH["Webhook<br/>POST /webhook/candidate-created"] --> EC["Email Candidato<br/>'Postulacion recibida'"]
    WH --> ER["Email Reclutador<br/>'Nuevo candidato'"]
    EC --> R1["Resend API"]
    ER --> R2["Resend API"]
```

### 7.2 Candidate Stage Change

```mermaid
flowchart TD
    WH["Webhook<br/>POST /webhook/candidate-stage"] --> IF{"new_status == 'hired'?"}
    IF -->|No| EC["Email Candidato<br/>'Actualizacion de etapa'"]
    IF -->|Si| ER["Email Reclutador<br/>'Contratado'"]
    EC --> R1["Resend API"]
    ER --> R2["Resend API"]
```

### 7.3 Interview Scheduled

```mermaid
flowchart LR
    WH["Webhook<br/>POST /webhook/interview-scheduled"] --> EC["Email Candidato<br/>'Entrevista agendada'"]
    WH --> ER["Email Reclutador<br/>'Nueva entrevista'"]
    EC --> R1["Resend API"]
    ER --> R2["Resend API"]
```

---

## 8. Flujo de programacion de entrevista

```mermaid
sequenceDiagram
    actor R as Recruiter
    participant F as Frontend
    participant SA as Server Action
    participant S as Supabase
    participant N as n8n

    R->>F: Abre formulario de entrevista
    R->>F: Selecciona candidato + fecha + notas
    R->>F: Hace clic en "Agendar"
    
    F->>SA: scheduleInterview(formData)
    SA->>S: RPC schedule_interview (candidate_id, date, notes)
    S->>S: DISABLE TRIGGER + INSERT + ENABLE TRIGGER
    S-->>SA: interview.id
    
    SA-->>F: Confirmacion
    F-->>R: Entrevista visible en lista

    SA->>N: fetch(webhook/interview-scheduled)
    N->>N: Resend: emails candidato + reclutador
```

---

## 9. Diagrama de componentes

```mermaid
graph TB
    subgraph Pages["Paginas (src/app)"]
        LANDING["/page.tsx<br/>Landing publica"]
        LOGIN["/login/page.tsx<br/>Auth signin/signup"]
        
        subgraph DASH["/dashboard/*"]
            DASHBOARD["/dashboard/page.tsx<br/>KPIs + graficos"]
            JOBS["/jobs/page.tsx<br/>Lista vacantes"]
            JOBS_NEW["/jobs/new/page.tsx<br/>Crear vacante"]
            JOBS_ID["/jobs/[id]/page.tsx<br/>Detalle + candidatos"]
            JOBS_EDIT["/jobs/[id]/edit<br/>Editar vacante"]
            CAND_NEW["/jobs/[id]/candidates/new<br/>Subir CV"]
            CANDIDATES["/candidates/page.tsx<br/>Lista candidatos"]
            CAND_ID["/candidates/[id]/page.tsx<br/>Detalle candidato"]
            INTERVIEWS["/interviews/page.tsx<br/>Lista entrevistas"]
            INTERVIEWS_NEW["/interviews/new/page.tsx<br/>Agendar"]
            TOKENS["/tokens/page.tsx<br/>Consumo IA"]
        end
        
        subgraph APPLY["/apply/*"]
            APPLY_FORM["/apply/[jobId]/page.tsx<br/>Postulacion publica"]
        end
    end

    subgraph Components["Componentes"]
        SHARED["BackButton / Button / Badge<br/>Card / Input / Select"]
        NAV["DashboardNav"]
        JOB["JobList / JobForm / JobActions<br/>ShareLink"]
        CAND["CandidateList / CVAnalysis<br/>StageControls / EditCandidateForm"]
        INT["InterviewForm / EditInterviewForm"]
        TOKEN["UsageCards / UsageChart<br/>UsageTable"]
        APPLY_C["ApplyForm / ApplySuccess"]
    end

    subgraph ServerActions["Server Actions"]
        ANALYZE["analyzeCandidate"]
        APPLY_SA["applyToJob"]
        UPDATE_C["updateCandidateStage"]
        SCHEDULE["scheduleInterview"]
    end

    CAND_NEW --> ANALYZE
    APPLY_FORM --> APPLY_SA
    CAND_ID --> UPDATE_C
    INTERVIEWS_NEW --> SCHEDULE
```

---

## 10. Diagrama de navegacion

```mermaid
flowchart LR
    LANDING["/ (Landing)"] --> LOGIN["/login"]
    LANDING --> APPLY["/apply/[jobId]"]
    LOGIN --> DASH["/dashboard"]
    
    DASH --> DBOARD["/dashboard"]
    DASH --> JOBS["/jobs"]
    DASH --> CAND["/candidates"]
    DASH --> INTV["/interviews"]
    DASH --> TOKENS["/tokens"]
    
    JOBS --> JOBS_NEW["/jobs/new"]
    JOBS --> JOBS_ID["/jobs/[id]"]
    JOBS_ID --> JOBS_EDIT["/jobs/[id]/edit"]
    JOBS_ID --> CAND_NEW["/jobs/[id]/candidates/new"]
    JOBS_ID --> CAND_ID["/candidates/[id]"]
    
    CAND --> CAND_ID
    CAND_ID --> CAND_EDIT["/candidates/[id]/edit"]
    
    INTV --> INTV_NEW["/interviews/new"]
    INTV_NEW --> INTV
    
    APPLY --> LANDING
    
    style LANDING fill:#10b981,color:#fff
    style LOGIN fill:#3b82f6,color:#fff
    style APPLY fill:#f59e0b,color:#fff
    style DASH fill:#6366f1,color:#fff
```

---

## 11. Matriz de permisos

| # | Capacidad | Reclutador | Publico |
|:-:|-----------|:----------:|:-------:|
| 1 | Ver landing page | ✓ | ✓ |
| 2 | Ver vacantes publicadas | ✓ | ✓ |
| 3 | Postularse a una vacante | ✗ | ✓ |
| 4 | Iniciar sesion / registrarse | ✓ | ✓ |
| 5 | Ver dashboard con metricas | ✓ | ✗ |
| 6 | Crear / editar / eliminar vacantes | ✓ | ✗ |
| 7 | Publicar / cerrar vacantes | ✓ | ✗ |
| 8 | Subir y analizar CVs | ✓ | ✗ |
| 9 | Ver lista de candidatos | ✓ | ✗ |
| 10 | Mover candidatos entre etapas | ✓ | ✗ |
| 11 | Agendar / editar entrevistas | ✓ | ✗ |
| 12 | Ver consumo de tokens | ✓ | ✗ |
| 13 | Compartir enlace de postulacion | ✓ | ✗ |

> **Leyenda:** ✓ = Permitido | ✗ = Denegado

---

## 12. Flujo de datos de Supabase

### Canales de datos entre frontend y backend

```mermaid
flowchart TD
    subgraph Clientes["Clientes Supabase"]
        BC["Browser Client<br/>client.ts<br/>Anon key + cookies SSR"]
        SC["Server Client<br/>server.ts<br/>Anon key + cookies"]
        AC["Admin Client<br/>admin.ts<br/>Anon key + persistSession: false"]
    end

    subgraph Operaciones["Operaciones"]
        AUTH["Auth<br/>signInWithPassword / signUp / signOut / getUser"]
        CRUD["CRUD Directo<br/>select / insert / update / delete"]
        RPC["RPC Functions<br/>insert_ai_log / update_candidate_stage / schedule_interview"]
    end

    subgraph Tablas["Tablas con RLS"]
        REC["recruiters<br/>RLS: auth.uid() = id"]
        JOBS["jobs<br/>RLS: recruiter_id = auth.uid()<br/>Publico: status = published"]
        CAND["candidates<br/>RLS: via jobs.recruiter_id"]
        SCORES["scores<br/>RLS: via candidates → jobs"]
        INTV["interviews<br/>RLS: via candidates → jobs"]
        LOGS["ai_logs<br/>RLS: auth.role() = authenticated"]
    end

    BC --> AUTH
    BC --> CRUD
    BC --> RPC
    
    SC --> AUTH
    SC --> CRUD
    SC --> RPC
    
    AC --> RPC
    AC --> CRUD
    
    CRUD --> REC
    CRUD --> JOBS
    CRUD --> CAND
    CRUD --> SCORES
    CRUD --> INTV
    CRUD --> LOGS
```

---

*Documentacion generada en Junio 2026 para el proyecto AI Recruitment Platform.*
