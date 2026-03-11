import winreg
import time
import subprocess

class RegistrySentinel:
    def __init__(self, debug=False):
        self.sensor_paths = {
            "webcam": r"Software\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\webcam",
            "microphone": r"Software\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\microphone"
        }
        self.debug = debug

    def _log(self, message):
        if self.debug:
            print(f"[sentinel] {message}")

    def verify_signature(self, file_path):
    # --- TESTING LOGIC: FLAG INTERPRETERS ---
        if "python.exe" in file_path.lower():
            return False # Treat Python scripts as untrusted
    # ----------------------------------------

        try:
            clean_path = file_path.replace('#', '\\')
            cmd = f"(Get-AuthenticodeSignature '{clean_path}').Status"
            result = subprocess.run(
                ["powershell", "-NoProfile", "-Command", cmd],
                capture_output=True,
                text=True,
                timeout=4,
            )
            status = result.stdout.strip()
            if result.returncode != 0:
                self._log(f"Signature check failed for {clean_path}: {result.stderr.strip()}")
                return False
            if self.debug:
                self._log(f"Signature {clean_path}: {status}")
            result = status
            return result == "Valid"
        except Exception:
            return False

    def is_active(self, key):
        """Detects activity if Start > Stop or if Stop is 0 (currently streaming)."""
        try:
            start, _ = winreg.QueryValueEx(key, "LastUsedTimeStart")
            stop, _ = winreg.QueryValueEx(key, "LastUsedTimeStop")
            return start > stop or stop == 0
        except FileNotFoundError:
            return False

    def get_app_diagnostics(self, sensor):
        results = []
        try:
            root_path = self.sensor_paths[sensor]
            self._log(f"Scanning {sensor} registry path")
            with winreg.OpenKey(winreg.HKEY_CURRENT_USER, root_path) as root_key:
                # 1. Scan root for Packaged Apps (Windows Camera, etc.)
                num_keys, _, _ = winreg.QueryInfoKey(root_key)
                for i in range(num_keys):
                    app_id = winreg.EnumKey(root_key, i)
                    if app_id == "NonPackaged": continue
                    
                    with winreg.OpenKey(root_key, app_id) as app_key:
                        if self.is_active(app_key):
                            # Store apps are generally trusted by Windows, but we mark them
                            results.append({"name": app_id, "trusted": True, "type": "Packaged", "sensor": sensor})

                # 2. Scan NonPackaged for Desktop Apps (.exe)
                try:
                    with winreg.OpenKey(root_key, "NonPackaged") as np_key:
                        num_np, _, _ = winreg.QueryInfoKey(np_key)
                        for i in range(num_np):
                            app_path = winreg.EnumKey(np_key, i)
                            with winreg.OpenKey(np_key, app_path) as app_key:
                                if self.is_active(app_key):
                                    is_signed = self.verify_signature(app_path)
                                    results.append({
                                        "name": app_path.split('#')[-1], 
                                        "trusted": is_signed, 
                                        "type": "Desktop",
                                        "sensor": sensor,
                                    })
                except FileNotFoundError: pass
        except Exception as e:
            self._log(f"Failed scanning {sensor}: {e}")

        if self.debug:
            if results:
                self._log(f"{sensor} active entries: {len(results)}")
            else:
                self._log(f"{sensor} active entries: 0")
        return results

    def run(self):
        print("--- [Huristi] Live Hardware Monitor ---")
        print("Format: [STATUS] SENSOR -> APP_NAME (TYPE)\n")
        
        while True:
            for sensor in ["webcam", "microphone"]:
                active_apps = self.get_app_diagnostics(sensor)
                for app in active_apps:
                    status = "[TRUSTED]" if app['trusted'] else "[UNTRUSTED/THREAT]"
                    print(f"{status} {sensor.upper()} -> {app['name']} ({app['type']})")
            
            time.sleep(1)

if __name__ == "__main__":
    RegistrySentinel().run()