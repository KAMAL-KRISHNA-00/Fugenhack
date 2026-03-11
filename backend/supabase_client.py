import os
from typing import Any, Dict, Optional

try:
    from supabase import Client, create_client
except ImportError as _supabase_import_err:
    print(f"[supabase] Import failed: {_supabase_import_err}")
    Client = Any
    create_client = None


def _load_env_file() -> None:
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if not os.path.exists(env_path):
        return

    try:
        with open(env_path, "r", encoding="utf-8") as fp:
            for raw_line in fp:
                line = raw_line.strip()
                if not line or line.startswith("#") or "=" not in line:
                    continue

                key, value = line.split("=", 1)
                key = key.strip()
                value = value.strip().strip('"').strip("'")
                if key and key not in os.environ:
                    os.environ[key] = value
    except Exception as exc:
        print(f"[supabase] Failed to read .env file: {exc}")


_load_env_file()


class SupabasePairingClient:
    def __init__(self, url: Optional[str] = None, key: Optional[str] = None):
        self.url = url or os.getenv("SUPABASE_URL", "")
        self.key = key or os.getenv("SUPABASE_ANON_KEY", "")
        self.client: Optional[Client] = None

        if not self.url or not self.key:
            missing = []
            if not self.url:
                missing.append("SUPABASE_URL")
            if not self.key:
                missing.append("SUPABASE_ANON_KEY")
            print(f"[supabase] Client disabled. Missing env vars: {', '.join(missing)}")
            return

        if not create_client:
            print("[supabase] Client disabled. supabase package is not available.")
            return

        try:
            self.client = create_client(self.url, self.key)
            print(f"[supabase] Client initialized for {self.url}")
        except Exception as exc:
            print(f"[supabase] Client initialization failed: {exc}")
            self.client = None

    @property
    def enabled(self) -> bool:
        return self.client is not None

    def fetch_device_pairing(self, device_id: str) -> Dict[str, Any]:
        if not self.client or not device_id:
            return {}

        try:
            response = (
                self.client.table("devices")
                .select(
                    "device_id, user_id, paired, access_token, device_name, os, "
                    "camera_enabled, mic_enabled, pair_token, last_seen"
                )
                .eq("device_id", device_id)
                .limit(1)
                .execute()
            )
            rows = getattr(response, "data", None) or []
            if rows:
                row = rows[0]
                if isinstance(row, dict):
                    return row
        except Exception as exc:
            print(f"[supabase] fetch_device_pairing failed: {exc}")

        return {}

    def fetch_device_settings(self, device_id: str) -> Dict[str, Any]:
        """Lightweight fetch for just the control flags polled every 5 seconds."""
        if not self.client or not device_id:
            return {}

        try:
            response = (
                self.client.table("devices")
                .select("camera_enabled, mic_enabled")
                .eq("device_id", device_id)
                .limit(1)
                .execute()
            )
            rows = getattr(response, "data", None) or []
            if rows and isinstance(rows[0], dict):
                return rows[0]
        except Exception as exc:
            print(f"[supabase] fetch_device_settings failed: {exc}")

        return {}

    def update_last_seen(self, device_id: str) -> None:
        """Update the last_seen timestamp so the server knows the device is online."""
        if not self.client or not device_id:
            return

        try:
            self.client.table("devices").update(
                {"last_seen": "now()"}
            ).eq("device_id", device_id).execute()
        except Exception as exc:
            print(f"[supabase] update_last_seen failed: {exc}")

    def pair_device_to_user(self, device_id: str, user_id: str, access_token: Optional[str] = None) -> Dict[str, Any]:
        if not self.client or not device_id or not user_id:
            return {}

        payload: Dict[str, Any] = {
            "p_device_id": device_id,
            "p_user_id": user_id,
        }
        if access_token:
            payload["p_access_token"] = access_token

        try:
            response = self.client.rpc("pair_device_to_user", payload).execute()
            rows = getattr(response, "data", None)
            if isinstance(rows, list) and rows:
                row = rows[0]
                return row if isinstance(row, dict) else {}
            if isinstance(rows, dict):
                return rows
        except Exception as exc:
            print(f"[supabase] pair_device_to_user failed: {exc}")

        return {}

    def unpair_device_from_user(self, device_id: str, user_id: str) -> Dict[str, Any]:
        if not self.client or not device_id or not user_id:
            return {}

        try:
            response = self.client.rpc(
                "unpair_device_from_user",
                {
                    "p_device_id": device_id,
                    "p_user_id": user_id,
                },
            ).execute()
            rows = getattr(response, "data", None)
            if isinstance(rows, list) and rows:
                row = rows[0]
                return row if isinstance(row, dict) else {}
            if isinstance(rows, dict):
                return rows
        except Exception as exc:
            print(f"[supabase] unpair_device_from_user failed: {exc}")

        return {}

    def register_device_if_missing(self, device_id: str, device_name: str, platform_name: str) -> bool:
        if not self.client or not device_id:
            return False

        existing = self.fetch_device_pairing(device_id)
        if existing:
            return True

        payload: Dict[str, Any] = {
            "device_id": device_id,
            "device_name": device_name,
            "os": platform_name,
            "paired": False,
            "camera_enabled": True,
            "mic_enabled": True,
        }

        try:
            self.client.table("devices").insert(payload).execute()
            print(f"[supabase] Registered new device row for device_id={device_id}")
            return True
        except Exception as exc:
            print(f"[supabase] register_device_if_missing failed: {exc}")
            return False
