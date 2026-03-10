import cv2
import threading
import time
import socket

# 1. Simulate High Thread Count
def worker_task():
    while True:
        # Just a dummy task to keep a thread "alive"
        time.sleep(1)

def spawn_threads(count=30):
    for i in range(count):
        t = threading.Thread(target=worker_task, daemon=True)
        t.start()
    print(f"[*] Spawned {count} background threads.")

# 2. Simulate Network Upload (Data Exfiltration)
def simulate_upload():
    # Use UDP to blast data without waiting for a handshake
    sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    data = b"X" * 2048 # Larger chunks
    print("[*] Network exfiltration simulation started...")
    while True:
        # Blast data to a random address to create a 'Speed' signature
        sock.sendto(data, ("127.0.0.1", 9999)) 
        # Removing the sleep entirely or making it very small to ensure the KB/s rise
        time.sleep(0.001)
if __name__ == "__main__":
    print("--- [Mock-Threat] Starting Simulation ---")
    
    # Start the "Ghost" behaviors
    spawn_threads(35)
    threading.Thread(target=simulate_upload, daemon=True).start()
    
    # 3. Access the Camera
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Could not access camera.")
    else:
        print("[!] Camera is now ACTIVE. Testing Heuristi-Cam detection...")
        while True:
            ret, frame = cap.read()
            # We don't even need to show the window to test "Ghost" detection
            # cv2.imshow('Malware View', frame) 
            if cv2.waitKey(1) & 0xFF == ord('q'):
                break
    
    cap.release()