# Fugenhack Project Flowchart

Simple modular view of how the system works end-to-end.

## High-Level Modules
- Frontend Dashboard (pairing + control UI)
- Backend Desktop Agent (pairing screen + runtime monitor)
- Supabase Database (users, devices, device_status)

## System Flow (General)
```mermaid
flowchart TD
    A[Desktop Agent Starts] --> B[Load or Create Local Config]
    B --> C[Generate/Read device_id]
    C --> D[Register device row in Supabase devices table]
    D --> E{paired == true?}

    E -- No --> F[Show Pairing Screen\nDisplay device_id / pair token]
    F --> G[User opens Frontend Dashboard]
    G --> H[User enters device_id and clicks Pair]
    H --> I[Frontend API updates devices row\nuser_id assigned, paired=true]
    I --> E

    E -- Yes --> J[Agent enters Paired Mode]
    J --> K[Start Main Monitor Runtime]
    K --> L[Read webcam/mic activity + threat analysis]
    L --> M[Write runtime status/telemetry]

    N[Dashboard polls Supabase] --> O[Show device cards + status]
    O --> P[Kill/Restore action from dashboard]
    P --> Q[Update devices flags\ncamera_enabled / mic_enabled]
    Q --> R[Agent polls device settings every 5s]
    R --> S[Enable/Disable local camera and mic drivers]
    S --> O

    M --> O
```

## Data Responsibilities
- users: Login and ownership data
- devices: Pairing state and control flags
- device_status: Live metrics (cpu, ram, disk, camera_app, mic_app, threat_score)

## Runtime Notes
- Pairing gate blocks main monitor until paired=true
- Dashboard actions modify cloud flags
- Agent sync loop enforces cloud flags on local hardware
