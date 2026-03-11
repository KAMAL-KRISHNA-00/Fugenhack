import json
import os
import platform
import socket
import tkinter as tk
import uuid
from typing import Any, Dict, Optional

from supabase_client import SupabasePairingClient


DEFAULT_CONFIG: Dict[str, Any] = {
    "paired": False,
    "device_id": None,
    "access_token": None,
}


def _debug(message: str) -> None:
    print(f"[pairing] {message}")


def _save_config(config_path: str, payload: Dict[str, Any]) -> None:
    with open(config_path, "w", encoding="utf-8") as fp:
        json.dump(payload, fp, indent=2)


def ensure_pairing_config(config_path: str) -> Dict[str, Any]:
    os.makedirs(os.path.dirname(config_path), exist_ok=True)

    data: Dict[str, Any] = {}
    if os.path.exists(config_path):
        try:
            with open(config_path, "r", encoding="utf-8") as fp:
                loaded = json.load(fp)
            if isinstance(loaded, dict):
                data = loaded
        except Exception:
            data = {}

    config = DEFAULT_CONFIG.copy()
    config.update({
        "paired": bool(data.get("paired", False)),
        "device_id": data.get("device_id"),
        "access_token": data.get("access_token"),
    })

    if not isinstance(config.get("device_id"), str) or not config.get("device_id"):
        config["device_id"] = str(uuid.uuid4())
        config["paired"] = False
        config["access_token"] = None
        _debug(f"Generated new device_id: {config['device_id']}")

    _save_config(config_path, config)
    _debug(f"Config ensured at {config_path} | paired={config['paired']} | device_id={config['device_id']}")
    return config


def load_pairing_config(config_path: str) -> Dict[str, Any]:
    if not os.path.exists(config_path):
        return ensure_pairing_config(config_path)

    try:
        with open(config_path, "r", encoding="utf-8") as fp:
            data = json.load(fp)
        if isinstance(data, dict):
            return data
    except Exception:
        pass

    return ensure_pairing_config(config_path)


def is_device_paired(config: Dict[str, Any]) -> bool:
    device_id = config.get("device_id")
    return bool(config.get("paired")) and isinstance(device_id, str) and bool(device_id.strip())


# Module-level Supabase client singleton — created once, reused across every poll
_supabase_client: Optional[SupabasePairingClient] = None
_device_registered: bool = False


def _get_client() -> SupabasePairingClient:
    global _supabase_client
    if _supabase_client is None:
        _supabase_client = SupabasePairingClient()
    return _supabase_client


def sync_pairing_from_supabase(config_path: str) -> Dict[str, Any]:
    global _device_registered

    config = load_pairing_config(config_path)
    device_id = str(config.get("device_id") or "").strip()
    if not device_id:
        _debug("No device_id available for Supabase sync.")
        return config

    client = _get_client()
    if not client.enabled:
        _debug("Supabase client not enabled. Check SUPABASE_URL and SUPABASE_ANON_KEY.")
        return config

    if not _device_registered:
        client.register_device_if_missing(
            device_id=device_id,
            device_name=socket.gethostname() or "Unknown-PC",
            platform_name=platform.system() or "Windows",
        )
        _device_registered = True

    row = client.fetch_device_pairing(device_id)
    if not row:
        _debug(f"No Supabase device row found yet for device_id={device_id}")
        return config

    client.update_last_seen(device_id)

    paired = bool(row.get("paired"))
    token = row.get("access_token")
    _debug(f"Supabase sync result | device_id={device_id} | paired={paired} | has_access_token={bool(token)}")

    config["paired"] = paired
    config["access_token"] = token if isinstance(token, str) else config.get("access_token")
    _save_config(config_path, config)
    return config


class PairingPage:
    def __init__(self, root: tk.Tk, device_id: str):
        self.root = root
        self.device_id = device_id
        self.window = tk.Toplevel(root)
        self.window.title("Ghost-Sentry Pairing")
        self.window.geometry("600x340")
        self.window.resizable(False, False)
        self.window.configure(bg="#0b1324")
        self.window.attributes("-topmost", True)
        self.window.deiconify()
        self.window.lift()

        frame = tk.Frame(self.window, bg="#0b1324", padx=20, pady=20)
        frame.pack(fill="both", expand=True)

        tk.Label(
            frame,
            text="Device Pairing Required",
            font=("Segoe UI", 22, "bold"),
            fg="#e2e8f0",
            bg="#0b1324",
        ).pack(anchor="w")

        tk.Label(
            frame,
            text="Use this Device ID in your web app dashboard to pair this desktop agent.",
            font=("Segoe UI", 10),
            fg="#94a3b8",
            bg="#0b1324",
        ).pack(anchor="w", pady=(6, 18))

        id_box = tk.Frame(frame, bg="#111d37", bd=1, relief="solid")
        id_box.pack(fill="x")

        tk.Label(
            id_box,
            text=self.device_id,
            font=("Consolas", 14, "bold"),
            fg="#38bdf8",
            bg="#111d37",
            padx=14,
            pady=14,
        ).pack(side="left")

        tk.Button(
            id_box,
            text="Copy",
            command=self._copy_id,
            bg="#2563eb",
            fg="#ffffff",
            relief="flat",
            padx=14,
            pady=6,
            font=("Segoe UI", 9, "bold"),
        ).pack(side="right", padx=12)

        self.status_var = tk.StringVar(value="Waiting for pairing...")
        tk.Label(
            frame,
            textvariable=self.status_var,
            font=("Segoe UI", 10, "bold"),
            fg="#f59e0b",
            bg="#0b1324",
        ).pack(anchor="w", pady=(18, 0))

        try:
            self.window.focus_force()
        except Exception:
            pass

        _debug(f"Pairing window opened for device_id={self.device_id}")

    def _copy_id(self) -> None:
        self.window.clipboard_clear()
        self.window.clipboard_append(self.device_id)
        self.status_var.set("Device ID copied. Complete pairing in web dashboard.")

    def set_status(self, message: str) -> None:
        self.status_var.set(message)

    def close(self) -> None:
        try:
            self.window.destroy()
        except Exception:
            pass
