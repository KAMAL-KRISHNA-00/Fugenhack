export type CommandType = 'full_lockdown' | 'kill_camera' | 'kill_mic' | 'kill_network' | 'restore_all';

export interface LogEntry {
    id: string;
    timestamp: number;
    device_id?: string;
    event: string;
}

export interface SlaveDevice {
    device_id: string;
    hostname: string;
    ip: string;
    platform: string;
    status: string;
    threat_score: number;
    threat_history: number[];
    camera_active: boolean;
    camera_locked: boolean;
    mic_locked: boolean;
    network_locked: boolean;
    cpu_percent: number;
    ram_percent: number;
    disk_percent: number;
    suspicious_processes: string[];
    active_camera_apps: string[];
}
