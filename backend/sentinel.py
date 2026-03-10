import winreg
import psutil
import time

class RegistrySentinel:
    def __init__(self):
        self.reg_path = r"Software\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\webcam"
        self.hkey = winreg.HKEY_CURRENT_USER
        
        # --- FLAG/WHITELIST SECTION ---
        # Add the names of apps you want the Sentinel to IGNORE
        self.whitelisted_apps = [
            "Microsoft.WindowsCamera", # Official Windows Camera App
            "chrome",                   # Google Chrome
            "ms-teams",                 # Microsoft Teams
            "Zoom",                     # Zoom Meetings
            "brave"                     # Brave Browser
        ]

    def is_app_active(self, key):
        try:
            start_time, _ = winreg.QueryValueEx(key, "LastUsedTimeStart")
            stop_time, _ = winreg.QueryValueEx(key, "LastUsedTimeStop")
            return start_time > stop_time
        except FileNotFoundError:
            return False

    def get_active_pids(self):
        active_apps = []
        try:
            root_key = winreg.OpenKey(self.hkey, self.reg_path)
            
            # 1. CHECK STORE APPS (Packaged)
            try:
                num_subkeys, _, _ = winreg.QueryInfoKey(root_key)
                for i in range(num_subkeys):
                    name = winreg.EnumKey(root_key, i)
                    if name == "NonPackaged": continue
                    
                    # FLAG CHECK: Is this app in our whitelist?
                    if any(white in name for white in self.whitelisted_apps):
                        continue

                    with winreg.OpenKey(root_key, name) as app_key:
                        if self.is_app_active(app_key):
                            active_apps.append(name.split('_')[0]) 
            except OSError: pass

            # 2. CHECK DESKTOP APPS (NonPackaged)
            try:
                with winreg.OpenKey(root_key, "NonPackaged") as np_key:
                    num_np_keys, _, _ = winreg.QueryInfoKey(np_key)
                    for i in range(num_np_keys):
                        name = winreg.EnumKey(np_key, i)
                        
                        # FLAG CHECK: Is this app in our whitelist?
                        if any(white.lower() in name.lower() for white in self.whitelisted_apps):
                            continue

                        with winreg.OpenKey(np_key, name) as app_key:
                            if self.is_app_active(app_key):
                                active_apps.append(name.split('#')[-1])
            except FileNotFoundError: pass

        except Exception as e:
            print(f"Registry Error: {e}")
        
        return list(set(active_apps))

    def run(self):
        print(f"--- [Heuristi-Cam] Sentinel Active ---")
        print(f"Ignoring: {', '.join(self.whitelisted_apps)}")
        while True:
            active = self.get_active_pids()
            if active:
                # This only prints if the app is NOT in the whitelist
                print(f"[!!!] UNKNOWN CAMERA ACCESS: {', '.join(active)}")
            time.sleep(1)

if __name__ == "__main__":
    RegistrySentinel().run()