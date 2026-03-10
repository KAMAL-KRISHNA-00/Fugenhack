import subprocess
import sys
import ctypes

def is_admin():
    """Checks if the script is running with Administrative privileges."""
    try:
        return ctypes.windll.shell32.IsUserAnAdmin()
    except:
        return False

def force_enable_camera():
    if not is_admin():
        print("[!] CRITICAL: Recovery must be run as Administrator.")
        print("[!] Right-click your terminal/IDE andk select 'Run as Administrator'.")
        return False

    print("--- Heuristi-Cam: Manual Hardware Recovery ---")
    
    # 1. Find the Device ID using PowerShell (More reliable than pnputil for searching)
    # We search both 'Camera' and 'Image' classes to be sure
    search_cmd = 'Get-PnpDevice -Class Camera, Image | Select-Object -ExpandProperty InstanceId'
    
    try:
        result = subprocess.run(["powershell", "-Command", search_cmd], capture_output=True, text=True)
        device_ids = result.stdout.strip().split('\n')
        
        if not device_ids or device_ids[0] == "":
            print("[?] No camera hardware found. It might already be enabled or unplugged.")
            return False

        # 2. Loop through found IDs and force enable them
        for device_id in device_ids:
            device_id = device_id.strip()
            print(f"[*] Attempting to wake device: {device_id}")
            
            # Use Enable-PnpDevice with the -Confirm:$false flag to bypass prompts
            enable_cmd = f'Enable-PnpDevice -InstanceId "{device_id}" -Confirm:$false'
            res = subprocess.run(["powershell", "-Command", enable_cmd], capture_output=True, text=True)
            
            if res.returncode == 0:
                print(f"[SUCCESS] Device {device_id} is now ONLINE.")
            else:
                print(f"[FAILED] Could not enable {device_id}. Error: {res.stderr}")

        return True

    except Exception as e:
        print(f"[ERROR] Recovery failed: {e}")
        return False

if __name__ == "__main__":
    force_enable_camera()
    input("\nPress Enter to exit...")   