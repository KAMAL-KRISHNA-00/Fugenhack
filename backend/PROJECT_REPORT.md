# Huristi - Your Privacy Partner

## Project Overview
Huristi is a Windows-focused privacy security prototype designed to monitor webcam usage, score suspicious behavior, and trigger a hardware-level containment action when risk is high.

Core workflow:
1. Detect unknown camera activity.
2. Analyze running processes heuristically.
3. Disable camera hardware if threat score crosses threshold.
4. Allow manual recovery to re-enable hardware.

## Architecture Summary
The system is split into focused modules:
- `main.py`: Orchestrator loop.
- `sentinel.py`: Webcam activity detection from Windows registry consent keys.
- `analyzer.py`: Process risk scoring engine.
- `killswitch.py`: Camera device disable/enable using `pnputil`.
- `recovery.py`: Admin recovery utility to force-enable camera devices.
- `overlay.py`: Optional PyQt6 live monitoring panel.
- `test.py`: Threat simulation script.

## Implementation Details

### `main.py` (Coordinator)
- Initializes `RegistrySentinel`, `HeuristicDetective`, and `HardwareKillSwitch`.
- Sets `detective.threshold_score = 50` for easier triggering during testing.
- Polls every second:
  - Calls `sentinel.get_active_pids()` to detect active non-whitelisted camera usage.
  - If activity exists, calls `detective.analyze()`.
  - If threat is confirmed, calls `killer.disable_camera()` and exits loop on success.

### `sentinel.py` (Camera Access Detection)
- Reads:
  - `HKCU\Software\Microsoft\Windows\CurrentVersion\CapabilityAccessManager\ConsentStore\webcam`
- Uses `LastUsedTimeStart > LastUsedTimeStop` to identify currently active camera clients.
- Scans both:
  - Packaged apps.
  - `NonPackaged` desktop apps.
- Applies a hardcoded whitelist (e.g., Windows Camera, Chrome, Teams, Zoom, Brave).
- Returns unique active app identifiers.

### `analyzer.py` (Heuristic Risk Engine)
- Iterates processes via `psutil.process_iter()`.
- Current prototype focus: evaluates processes whose name contains `python`.
- Risk score is based on:
  - Thread count:
    - `> 50` threads: `+50`
    - `> 15` threads: `+30`
  - Write-rate proxy (`io_counters().write_bytes` delta over 0.4s):
    - `> 5 KB`: `+50`
    - `> 0.1 KB`: `+20`
- Triggers threat when total score >= threshold.

### `killswitch.py` (Containment)
- Finds camera instance ID with:
  - `pnputil /enum-devices /class Camera`
- Disables camera with:
  - `pnputil /disable-device "<instance_id>"`
- Provides `enable_camera()` helper using:
  - `pnputil /enable-device "<instance_id>"`
- In real usage, admin rights are typically required.

### `recovery.py` (Manual Recovery)
- Validates administrator privileges with `ctypes.windll.shell32.IsUserAnAdmin()`.
- Enumerates camera/image devices using PowerShell:
  - `Get-PnpDevice -Class Camera, Image`
- Attempts to restore each device with:
  - `Enable-PnpDevice -InstanceId "<id>" -Confirm:$false`
- Prints per-device success/failure.

### `overlay.py` (Monitoring UI)
- Implements a frameless always-on-top PyQt6 dashboard.
- Background `QThread` gathers:
  - CPU usage.
  - High-thread processes.
- Displays a threat index and process table.
- Global hotkey (`Ctrl+Alt+H`) toggles panel visibility.
- Includes UI buttons for restore/terminate concepts, but not fully wired to backend actions.

### `test.py` (Threat Simulation)
- Spawns many background threads.
- Simulates high activity with repeated UDP sends.
- Opens webcam through OpenCV to trigger camera-use path.
- Useful for validating detector and kill-switch behavior.

## Runtime Flow
1. Run `main.py`.
2. Sentinel detects non-whitelisted active camera usage.
3. Analyzer scores candidate process behavior.
4. If score exceeds threshold, kill-switch disables camera device.
5. Run `recovery.py` as Administrator to restore camera devices when needed.

## Dependencies and Environment
- OS: Windows.
- Python packages used: `psutil`, `opencv-python`, `PyQt6`, `pynput`.
- System commands/cmdlets: `pnputil`, PowerShell `Get-PnpDevice`, `Enable-PnpDevice`.
- Elevated privileges required for hardware state changes.

## Strengths
- Clear separation of concerns across modules.
- Uses native Windows webcam consent state for detection.
- Provides active containment (device disable) and recovery flow.
- Includes simulation tooling for practical tests.

## Current Limitations
- Sentinel activity and analyzer target process are not tightly correlated.
- Analyzer currently focuses on Python-named processes only.
- "Network" score uses write-byte deltas as a proxy, not direct socket/network counters.
- Broad exception handling reduces observability/debug clarity.
- Overlay is mostly visualization; backend integration is partial.

## Suggested Next Improvements
1. Correlate detected camera consumer with exact process ID before kill action.
2. Expand analyzer beyond Python processes.
3. Add true network telemetry (connections, bytes sent/recv).
4. Add structured logging and explicit error reporting.
5. Wire overlay action buttons to kill/recovery backend safely.
6. Add configurable whitelist and threshold settings via config file.
