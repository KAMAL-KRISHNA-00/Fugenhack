import time
from sentinel import RegistrySentinel
from analyzer import HeuristicDetective
from killswitch import HardwareKillSwitch

def run_huristi():
    print("--- Huristi: Your Privacy Partner is ACTIVE ---")
    
    # Initialize our three modules
    sentinel = RegistrySentinel()
    detective = HeuristicDetective()
    killer = HardwareKillSwitch()

    # Set sensitivity to 50 for the test
    detective.threshold_score = 50 

    while True:
        # 1. Check if ANY unknown app is using the camera
        active_apps = sentinel.get_active_pids()
        
        if active_apps:
            print(f"[!] Camera Activity detected from: {active_apps}")
            
            # 2. Interrogate the system for those apps
            is_threat, info = detective.analyze()
            
            if is_threat:
                print(f"!!! SECURITY BREACH: {info['name']} (PID: {info['pid']}) !!!")
                
                # 3. Pull the plug
                success = killer.disable_camera()
                if success:
                    print("[SUCCESS] Hardware disabled. You are safe.")
                    # Exit or wait for user to manual reset
                    break
        
        time.sleep(1) # Check every second

if __name__ == "__main__":
    run_huristi()