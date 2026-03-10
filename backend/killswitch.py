import subprocess

class HardwareKillSwitch:
    def __init__(self):
        # This is the common name for integrated webcams
        self.device_name = "Camera" 

    def get_camera_instance_id(self):
        """Finds the hardware ID of the camera."""
        cmd = 'pnputil /enum-devices /class Camera'
        result = subprocess.run(["powershell", "-Command", cmd], capture_output=True, text=True)
        
        # Look for the Instance ID line
        for line in result.stdout.split('\n'):
            if "Instance ID:" in line:
                return line.split(":")[-1].strip()
        return None

    def disable_camera(self):
        instance_id = self.get_camera_instance_id()
        if instance_id:
            print(f"[!] KILL-SWITCH: Disabling device {instance_id}")
            # The capture_output=True lets us see if it actually worked
            cmd = f'pnputil /disable-device "{instance_id}"'
            result = subprocess.run(["powershell", "-Command", cmd], capture_output=True, text=True)
            
            if "Failed" in result.stdout or "denied" in result.stdout.lower():
                print("[ERROR] Kill-Switch failed! Please run as Administrator.")
                return False
            
            print("[SUCCESS] Driver disabled successfully.")
            return True
        return False

    def enable_camera(self):
        instance_id = self.get_camera_instance_id()
        if instance_id:
            print(f"[*] RESET: Re-enabling camera device...")
            cmd = f'pnputil /enable-device "{instance_id}"'
            subprocess.run(["powershell", "-Command", cmd])

if __name__ == "__main__":
    # TEST ONLY: This will turn off your camera driver
    ks = HardwareKillSwitch()
    ks.disable_camera()
    # To turn it back on, run: ks.enable_camera()