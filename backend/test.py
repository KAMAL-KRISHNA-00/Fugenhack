import cv2
import threading
import time
import socket
import sys
import numpy as np
import sounddevice as sd
import os
import json

class ThreatSimulator:
    def __init__(self):
        self.stop_threads = False
        self.threads = []
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.data = b"MALICIOUS_DATA_CHUNK" * 100 
        self.target_ip = "127.0.0.1"
        self.target_port = 9999
        self.bytes_sent = 0
        self.active_sensors = []
        self.telemetry_path = os.path.join(os.path.dirname(__file__), "runtime_telemetry.json")
        self.state_lock = threading.Lock()
        self.last_bytes_snapshot = 0
        self.last_snapshot_time = time.time()

    def write_runtime_telemetry(self, upload_kbps=0.0):
        with self.state_lock:
            payload = {
                "pid": os.getpid(),
                "process_name": os.path.basename(sys.executable),
                "upload_kbps": round(float(upload_kbps), 2),
                "bytes_sent": int(self.bytes_sent),
                "active_sensors": list(self.active_sensors),
                "updated_at": time.time(),
            }

        try:
            with open(self.telemetry_path, "w", encoding="utf-8") as fp:
                json.dump(payload, fp)
        except Exception:
            pass

    def worker_task(self):
        while not self.stop_threads:
            _ = np.sqrt(np.random.rand(100, 100))
            time.sleep(0.1)

    def spawn_threads(self, count=45):
        print(f"[*] PILLAR 2: Spawning {count} background threads...")
        for _ in range(count):
            t = threading.Thread(target=self.worker_task, daemon=True)
            t.start()
            self.threads.append(t)
        self.live_monitor("Thread Entropy Test")

    def simulate_upload(self, intensity=0.0001):
        self.stop_threads = False
        while not self.stop_threads:
            try:
                self.sock.sendto(self.data, (self.target_ip, self.target_port))
                with self.state_lock:
                    self.bytes_sent += len(self.data)

                now = time.time()
                delta_t = now - self.last_snapshot_time
                if delta_t >= 0.5:
                    with self.state_lock:
                        delta_bytes = self.bytes_sent - self.last_bytes_snapshot
                        self.last_bytes_snapshot = self.bytes_sent
                    upload_kbps = (delta_bytes / 1024.0) / max(delta_t, 0.001)
                    self.last_snapshot_time = now
                    self.write_runtime_telemetry(upload_kbps)

                time.sleep(intensity)
            except: break

    def access_microphone(self, duration=15):
        with self.state_lock:
            self.active_sensors.append("Microphone")
        try:
            def callback(indata, frames, time, status): pass
            with sd.InputStream(callback=callback):
                time.sleep(duration)
        except Exception as e: print(f"Mic Error: {e}")
        finally:
            with self.state_lock:
                if "Microphone" in self.active_sensors:
                    self.active_sensors.remove("Microphone")

    def access_camera(self, duration=15):
        with self.state_lock:
            self.active_sensors.append("Camera")
        # Try different indices if 0 doesn't work (1, 2, etc.)
        cap = cv2.VideoCapture(0, cv2.CAP_DSHOW) # CAP_DSHOW is better for Windows
        
        if not cap.isOpened():
            print("\n[X] ERROR: Could not open camera. Check if another app is using it.")
            with self.state_lock:
                if "Camera" in self.active_sensors:
                    self.active_sensors.remove("Camera")
            return

        print(f"\n[!] CAMERA ENGAGED - Monitoring for {duration} seconds...")
        start_time = time.time()
        try:
            while time.time() - start_time < duration and not self.stop_threads:
                ret, frame = cap.read()
                if not ret:
                    print("\n[X] ERROR: Failed to grab frame.")
                    break
                # If you WANT to see the window for testing, uncomment the line below:
                # cv2.imshow('Malware Preview', frame); cv2.waitKey(1)
        finally:
            cap.release()
            cv2.destroyAllWindows()
            with self.state_lock:
                if "Camera" in self.active_sensors:
                    self.active_sensors.remove("Camera")

    def live_monitor(self, test_name):
        """Displays live details of the simulation."""
        print(f"\n>>> RUNNING: {test_name}")
        print(">>> Press Ctrl+C to return to menu...\n")
        try:
            while True:
                # Calculate simple KB sent
                with self.state_lock:
                    kb_sent = self.bytes_sent / 1024
                    sensors = list(self.active_sensors)

                sensor_str = ", ".join(sensors) if sensors else "None"
                self.write_runtime_telemetry(0 if kb_sent == 0 else (kb_sent * 2))
                
                # Clear line and print status
                sys.stdout.write(f"\r[STATUS] Threads: {len(self.threads)} | Data Sent: {kb_sent:.2f} KB | Active Sensors: {sensor_str} ")
                sys.stdout.flush()
                time.sleep(0.5)
        except KeyboardInterrupt:
            print("\n\n[*] Returning to Menu...")

    def run_full_attack(self):
        print("\n" + "!"*40)
        print(" INITIALIZING FULL GHOST-SENTRY BREACH ")
        print("!"*40)
        self.stop_threads = False
        self.bytes_sent = 0
        
        # Start Threads
        threading.Thread(target=self.simulate_upload, daemon=True).start()
        self.spawn_threads(50)
        threading.Thread(target=self.access_camera, args=(30,), daemon=True).start()
        threading.Thread(target=self.access_microphone, args=(30,), daemon=True).start()
        
        self.live_monitor("FULL SYSTEM ATTACK")

    def menu(self):
        while True:
            # Reset counters on menu return
            self.bytes_sent = 0 
            self.write_runtime_telemetry(0)
            print("\n" + "="*40)
            print(" HURISTI ADVANCED THREAT SIMULATOR ")
            print("="*40)
            print("1. PILLAR 2: High Thread Entropy")
            print("2. PILLAR 1: Network Exfiltration (UDP Blast)")
            print("3. SENSOR:   Camera Only")
            print("4. SENSOR:   Microphone Only")
            print("5. [!!!] FULL GHOST-SENTRY ATTACK [!!!]")
            print("6. RESET ALL")
            print("0. EXIT")
            
            choice = input("\nSelect choice: ")

            if choice == '1':
                self.spawn_threads()
            elif choice == '2':
                threading.Thread(target=self.simulate_upload, daemon=True).start()
                self.live_monitor("Network Exfiltration")
            elif choice == '3':
                threading.Thread(target=self.access_camera, daemon=True).start()
                self.live_monitor("Camera Access")
            elif choice == '4':
                threading.Thread(target=self.access_microphone, daemon=True).start()
                self.live_monitor("Microphone Access")
            elif choice == '5':
                self.run_full_attack()
            elif choice == '6':
                self.stop_threads = True
                self.threads = []
                with self.state_lock:
                    self.active_sensors = []
                    self.last_bytes_snapshot = 0
                    self.last_snapshot_time = time.time()
                    self.bytes_sent = 0
                self.write_runtime_telemetry(0)
                print("[*] Resetting simulator state...")
                time.sleep(1)
            elif choice == '0':
                self.stop_threads = True
                self.write_runtime_telemetry(0)
                sys.exit()

if __name__ == "__main__":
    sim = ThreatSimulator()
    try:
        sim.menu()
    except KeyboardInterrupt:
        sys.exit()