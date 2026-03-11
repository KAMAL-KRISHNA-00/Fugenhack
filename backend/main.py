from sentinel import RegistrySentinel
from analyzer import GhostSentryAnalyzer
from killswitch import HardwareKillSwitch
import time
import sys
import json
import os


def load_pairing_config(config_path):
    if not os.path.exists(config_path):
        return {}

    try:
        with open(config_path, "r", encoding="utf-8") as fp:
            payload = json.load(fp)
        if isinstance(payload, dict):
            return payload
    except Exception:
        pass

    return {}


def is_paired(config):
    device_id = config.get("device_id") if isinstance(config, dict) else None
    return bool(config.get("paired")) and isinstance(device_id, str) and bool(device_id.strip())


def publish_runtime_status(status_path, payload):
    try:
        with open(status_path, "w", encoding="utf-8") as fp:
            json.dump(payload, fp)
    except Exception:
        pass

def main():
    # 1. Initialize all modules
    sentinel = RegistrySentinel(debug=True)
    detective = GhostSentryAnalyzer(upload_threshold_kb=100)
    detective.threat_threshold = 55
    killer = HardwareKillSwitch()
    status_path = os.path.join(os.path.dirname(__file__), "runtime_status.json")
    config_path = os.path.join(os.path.dirname(__file__), "config.json")
    
    print("="*40)
    print(" HURISTI SYSTEM: [ONLINE] ")
    print(" Behavioral Correlation Mode: ACTIVE ")
    print("="*40)

    try:
        while True:
            config = load_pairing_config(config_path)
            if not is_paired(config):
                ui_payload = {
                    "updated_at": time.time(),
                    "active_count": 0,
                    "active_apps": [],
                    "analysis": [],
                    "threat_detected": False,
                    "threat_app": None,
                    "kill_attempted": False,
                    "kill_success": None,
                    "state": "PAIRING_REQUIRED",
                }
                publish_runtime_status(status_path, ui_payload)
                sys.stdout.write("\r[pairing] Waiting for paired=true and valid device_id in config.json...")
                sys.stdout.flush()
                time.sleep(2)
                continue

            # STEP 1: Sentinel checks for ANY hardware access
            # We check both webcam and mic
            active_apps = sentinel.get_app_diagnostics("webcam") + \
                          sentinel.get_app_diagnostics("microphone")

            ui_payload = {
                "updated_at": time.time(),
                "active_count": len(active_apps),
                "active_apps": active_apps,
                "analysis": [],
                "threat_detected": False,
                "threat_app": None,
                "kill_attempted": False,
                "kill_success": None,
            }

            if active_apps:
                print(f"\n[sentinel] Active app count: {len(active_apps)}")
                for app in active_apps:
                    trust = "TRUSTED" if app["trusted"] else "UNTRUSTED"
                    print(f"[sentinel] {app['type']}: {app['name']} ({trust})")

            if active_apps:
                # STEP 2: Analyzer performs deep behavioral correlation
                # Checks: Signatures, Stealth (Hidden Windows), and Network Exfiltration
                threat_detected, app_name, analysis_rows = detective.analyze(active_apps)
                ui_payload["analysis"] = analysis_rows
                ui_payload["threat_detected"] = threat_detected
                ui_payload["threat_app"] = app_name

                if threat_detected:
                    # STEP 3: Killswitch engages the hardware disconnect
                    print(f"\n[!] VERDICT: {app_name} is malicious.")
                    disabled = killer.disable_all_capture()
                    ui_payload["kill_attempted"] = True
                    ui_payload["kill_success"] = bool(disabled)
                    publish_runtime_status(status_path, ui_payload)
                    
                    if disabled:
                        print("[*] System secured. Investigation required.")
                        break

                    print("[!] Threat confirmed but kill-switch did not execute.")
                    print("[!] Run terminal as Administrator and retry.")
            else:
                # Optional: Visual heartbeat to show it's scanning
                sys.stdout.write("\r[*] Heartbeat: System Clear...")
                sys.stdout.flush()

            publish_runtime_status(status_path, ui_payload)

            # Polling frequency
            time.sleep(1)

    except KeyboardInterrupt:
        print("\n[!] Huristi System Terminated by User.")

if __name__ == "__main__":
    main()