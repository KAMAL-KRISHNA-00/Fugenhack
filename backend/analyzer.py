import psutil
import win32gui
import win32process
import time
import json
import os

class GhostSentryAnalyzer:
    def __init__(self, upload_threshold_kb=100):
        """
        Pillar 1: Monitoring Hardware via Registry (Signal from Sentinel)
        Pillar 2: Stealth Detection (Hidden Windows)
        Pillar 3: Network-to-Hardware Correlation (Data Method)
        """
        self.threshold_kb = upload_threshold_kb
        self.last_net_io = {}
        self.threat_threshold = 65 # Combined score to trigger Killswitch
        self.telemetry_path = os.path.join(os.path.dirname(__file__), "runtime_telemetry.json")

    def is_process_hidden(self, target_pid):
        """Pillar 2: Checks if a process is 'Headless' (Stealth Mode)."""
        if target_pid is None: return True
        
        def callback(hwnd, hwnds):
            if win32gui.IsWindowVisible(hwnd):
                _, found_pid = win32process.GetWindowThreadProcessId(hwnd)
                if found_pid == target_pid:
                    hwnds.append(hwnd)
            return True
        
        visible_hwnds = []
        try:
            win32gui.EnumWindows(callback, visible_hwnds)
        except Exception:
            pass
            
        # Returns True if NO visible windows are found for this PID
        return len(visible_hwnds) == 0

    def get_network_upload(self, app_name):
        """Pillar 3: High-accuracy per-process network I/O spikes."""
        telemetry_speed, telemetry_pid = self.get_runtime_telemetry_upload(app_name)
        if telemetry_speed > 0:
            return telemetry_speed, telemetry_pid

        try:
            for proc in psutil.process_iter(['name', 'io_counters']):
                if app_name.lower() in proc.info['name'].lower():
                    pid = proc.pid
                    
                    # Take first snapshot
                    io1 = proc.info['io_counters']
                    if not io1: return 0, pid
                    
                    # WAIT: We need a gap to measure 'speed'
                    time.sleep(0.2) 
                    
                    # Take second snapshot
                    try:
                        io2 = proc.io_counters() # Fresh call
                    except (psutil.NoSuchProcess, psutil.AccessDenied):
                        return 0, pid

                    # Calculate the difference
                    bytes_sent = io2.write_bytes - io1.write_bytes
                    
                    # Convert to KB/s (0.2 seconds gap, so multiply by 5)
                    speed_kbps = (bytes_sent / 1024) * 5
                    return speed_kbps, pid
                    
            return 0, None
        except (psutil.NoSuchProcess, psutil.AccessDenied):
            return 0, None

    def get_runtime_telemetry_upload(self, app_name):
        """Consumes speed metrics produced by test.py for accurate exfil scoring."""
        if not os.path.exists(self.telemetry_path):
            return 0, None

        try:
            with open(self.telemetry_path, "r", encoding="utf-8") as fp:
                payload = json.load(fp)

            updated_at = float(payload.get("updated_at", 0))
            if time.time() - updated_at > 3:
                return 0, None

            process_name = str(payload.get("process_name", "")).lower()
            app_name_lc = str(app_name).lower()
            if app_name_lc not in process_name and process_name not in app_name_lc:
                return 0, None

            return float(payload.get("upload_kbps", 0)), int(payload.get("pid", 0) or 0)
        except Exception:
            return 0, None

    def analyze(self, active_apps):
        """
        The Correlation Engine.
        Input: list of {'name': str, 'trusted': bool, 'type': str} from Sentinel.
        """
        analysis_rows = []

        for app in active_apps:
            score = 0
            name = app['name']
            sensor = app.get('sensor', 'unknown')
            reasons = []
            
            # 1. Get Network Data & PID
            upload_speed, pid = self.get_network_upload(name)
            
            # 2. Check Stealth (Pillar 2)
            is_headless = self.is_process_hidden(pid)
            
            # --- SCORING LOGIC ---
            
            # Pillar 1 (Signature/Trust): From Sentinel
            if not app['trusted']:
                score += 30
                reasons.append("Untrusted signature (+30)")

            # Active camera access is a strong primary signal.
            if sensor == "webcam":
                score += 20
                reasons.append("Active webcam access (+20)")
            elif sensor == "microphone":
                score += 10
                reasons.append("Active microphone access (+10)")
                
            # Pillar 2 (Stealth): Invisible processes using hardware are high risk
            if is_headless:
                score += 25
                reasons.append("Headless process (+25)")
                
            # Pillar 3 (Data): Uploading data while hardware is active
            if upload_speed > self.threshold_kb:
                score += 45
                reasons.append(f"High exfil speed {round(upload_speed, 2)} KB/s (+45)")
            elif upload_speed > 1:
                score += 20
                reasons.append(f"Moderate exfil speed {round(upload_speed, 2)} KB/s (+20)")

            analysis_rows.append({
                "name": name,
                "sensor": sensor,
                "trusted": bool(app.get("trusted", False)),
                "score": score,
                "upload_kbps": round(upload_speed, 2),
                "headless": is_headless,
                "reasons": reasons,
            })

            # Output Analysis Results
            print(f"[*] Analyzing: {name} | Score: {score}/100 | Speed: {round(upload_speed, 2)}KB/s | Headless: {is_headless}")

            if score >= self.threat_threshold:
                self.print_alert(name, score, is_headless, upload_speed)
                return True, name, analysis_rows
                
        return False, None, analysis_rows

    def print_alert(self, name, score, headless, speed):
        print("\n" + "!"*50)
        print(f" CRITICAL THREAT DETECTED: {name.upper()}")
        print(f" THREAT SCORE: {score}/100")
        print(f" BEHAVIOR: {'HIDDEN' if headless else 'VISIBLE'} | EXFIL: {round(speed)} KB/s")
        print("!"*50 + "\n")

if __name__ == "__main__":
    # --- Integration Test with Mock Data ---
    analyzer = GhostSentryAnalyzer(upload_threshold_kb=50)
    print("--- GhostSentry Behavioral Analyzer Online ---")
    
    while True:
        # This simulates the dictionary list returned by your RegistrySentinel
        mock_sentinel_results = [
            {"name": "python.exe", "trusted": False, "type": "Desktop"}
        ]
        analyzer.analyze(mock_sentinel_results)
        time.sleep(1)