import subprocess
import ctypes
import re
import json

class HardwareKillSwitch:
    def __init__(self):
        self.device_name = "Camera"

    def _run_ps(self, cmd):
        result = subprocess.run(["powershell", "-NoProfile", "-Command", cmd], capture_output=True, text=True)
        return result.returncode, result.stdout, result.stderr

    def _is_supported_instance_id(self, instance_id):
        token = (instance_id or "").strip()
        if not token or "..." in token:
            return False

        upper = token.upper()

        # These are software endpoint/pseudo-devices and cannot be disabled with Disable-PnpDevice.
        if upper.startswith("SWD\\") or upper.startswith("SW\\{"):
            return False

        return "\\" in token

    def _list_instance_ids(self, class_list, name_regex=None):
        class_csv = ", ".join([f'"{c}"' for c in class_list])
        ps_cmd = (
            f'$devices = Get-PnpDevice -Class @({class_csv}) -PresentOnly | '
            'Select-Object -Property FriendlyName, InstanceId, Class, Status; '
            '$devices | ConvertTo-Json -Compress'
        )
        code, out, _err = self._run_ps(ps_cmd)
        if code != 0:
            return []

        payload = out.strip()
        if not payload:
            return []

        try:
            rows = json.loads(payload)
        except json.JSONDecodeError:
            return []

        if isinstance(rows, dict):
            rows = [rows]

        ids = []
        pattern = re.compile(name_regex, re.IGNORECASE) if name_regex else None
        for row in rows:
            if not isinstance(row, dict):
                continue

            name = str(row.get("FriendlyName") or "")
            token = str(row.get("InstanceId") or "").strip()

            if pattern and not pattern.search(name):
                continue

            if not self._is_supported_instance_id(token):
                continue

            ids.append(token)

        return list(dict.fromkeys(ids))

    def get_camera_instance_ids(self):
        return self._list_instance_ids(["Camera", "Image"])

    def get_microphone_instance_ids(self):
        return self._list_instance_ids(
            ["AudioEndpoint", "MEDIA"],
            name_regex=r"mic|microphone|array|input",
        )

    def is_admin(self):
        try:
            return bool(ctypes.windll.shell32.IsUserAnAdmin())
        except Exception:
            return False

    def _disable_instance_ids(self, instance_ids, label):
        if not instance_ids:
            print(f"[ERROR] No {label} device found to disable.")
            return False

        success = True
        for instance_id in instance_ids:
            print(f"[!] KILL-SWITCH: Disabling {label} device {instance_id}")
            cmd = (
                "$ErrorActionPreference = 'Stop'; "
                f'Disable-PnpDevice -InstanceId "{instance_id}" -Confirm:$false'
            )
            code, out, err = self._run_ps(cmd)

            if code != 0:
                error = (err.strip() or out.strip() or "Unknown failure").splitlines()[0]
                print(f"[ERROR] Disable failed for {instance_id}: {error}")
                success = False

        if success:
            print(f"[SUCCESS] {label} device(s) disabled successfully.")
        return success

    def _enable_instance_ids(self, instance_ids, label):
        if not instance_ids:
            print(f"[ERROR] No {label} device found to enable.")
            return False

        success = True
        for instance_id in instance_ids:
            print(f"[*] RESET: Enabling {label} device {instance_id}")
            cmd = (
                "$ErrorActionPreference = 'Stop'; "
                f'Enable-PnpDevice -InstanceId "{instance_id}" -Confirm:$false'
            )
            code, out, err = self._run_ps(cmd)

            if code != 0:
                error = (err.strip() or out.strip() or "Unknown failure").splitlines()[0]
                print(f"[ERROR] Enable failed for {instance_id}: {error}")
                success = False

        if success:
            print(f"[SUCCESS] {label} device(s) enabled successfully.")
        return success

    def disable_camera(self):
        if not self.is_admin():
            print("[ERROR] Kill-Switch requires Administrator privileges.")
            return False

        return self._disable_instance_ids(self.get_camera_instance_ids(), "camera")

    def disable_microphone(self):
        if not self.is_admin():
            print("[ERROR] Kill-Switch requires Administrator privileges.")
            return False

        return self._disable_instance_ids(self.get_microphone_instance_ids(), "microphone")

    def disable_all_capture(self):
        if not self.is_admin():
            print("[ERROR] Kill-Switch requires Administrator privileges.")
            return False

        cam_ok = self._disable_instance_ids(self.get_camera_instance_ids(), "camera")
        mic_ok = self._disable_instance_ids(self.get_microphone_instance_ids(), "microphone")
        return cam_ok and mic_ok

    def enable_camera(self):
        if not self.is_admin():
            print("[ERROR] Camera restore requires Administrator privileges.")
            return False

        return self._enable_instance_ids(self.get_camera_instance_ids(), "camera")

    def enable_microphone(self):
        if not self.is_admin():
            print("[ERROR] Microphone restore requires Administrator privileges.")
            return False

        return self._enable_instance_ids(self.get_microphone_instance_ids(), "microphone")

    def enable_all_capture(self):
        if not self.is_admin():
            print("[ERROR] Camera restore requires Administrator privileges.")
            return False

        cam_ok = self._enable_instance_ids(self.get_camera_instance_ids(), "camera")
        mic_ok = self._enable_instance_ids(self.get_microphone_instance_ids(), "microphone")
        return cam_ok and mic_ok

if __name__ == "__main__":
    # TEST ONLY: This will turn off your camera driver
    ks = HardwareKillSwitch()
    ks.disable_camera()
    # To turn it back on, run: ks.enable_camera()