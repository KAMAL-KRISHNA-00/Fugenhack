import psutil
import time

class HeuristicDetective:
    def __init__(self):
        self.threshold_score = 60 # If score hits 60, we trigger the Kill-Switch

    def get_speed(self, proc):
        try:
            io_1 = proc.io_counters().write_bytes
            time.sleep(0.4)
            io_2 = proc.io_counters().write_bytes
            return (io_2 - io_1) / 1024
        except: return 0

    def analyze(self):
        for proc in psutil.process_iter(['pid', 'name', 'num_threads']):
            try:
                name = proc.info['name']
                threads = proc.info['num_threads']
                
                # We only care about the test script for now
                if "python" in name.lower():
                    score = 0
                    speed = self.get_speed(proc)

                    # 1. Thread Score (Max 50 points)
                    if threads > 50: score += 50
                    elif threads > 15: score += 30

                    # 2. Network Score (Max 50 points)
                    if speed > 5: score += 50
                    elif speed > 0.1: score += 20

                    print(f"[Analysis] {name} (PID: {proc.info['pid']}) | Score: {score}/100")
                    
                    if score >= self.threshold_score:
                        print(f"!!! ALERT !!! High Risk Detected: {score}/100")
                        return True, proc.info # Signal for Kill-Switch
            except: continue
        return False, None

if __name__ == "__main__":
    detective = HeuristicDetective()
    detective.analyze()