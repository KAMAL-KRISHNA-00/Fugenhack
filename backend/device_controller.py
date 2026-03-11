"""
device_controller.py
Controls Windows camera and microphone hardware via PowerShell PnP device commands.
Requires the process to be running with administrator privileges to enable/disable devices.
"""

import subprocess


def _run_ps(script: str) -> str:
    try:
        result = subprocess.run(
            ["powershell", "-NoProfile", "-NonInteractive", "-Command", script],
            capture_output=True,
            text=True,
            timeout=10,
        )
        return result.stdout.strip()
    except Exception as exc:
        print(f"[device_ctrl] PowerShell error: {exc}")
        return ""


# ── Camera ──────────────────────────────────────────────────────────────────
# Camera devices appear under class "Camera" (Win10 1803+) or "Image" (older/external)
_CAMERA_FILTER = (
    "Get-PnpDevice | Where-Object { $_.Class -eq 'Camera' -or $_.Class -eq 'Image' }"
)


def get_camera_enabled() -> bool:
    """Returns True if at least one camera device is in OK (enabled) state."""
    out = _run_ps(f"{_CAMERA_FILTER} | Select-Object -ExpandProperty Status")
    return "OK" in out


def set_camera_enabled(enabled: bool) -> None:
    """Enable or disable all camera devices."""
    verb = "Enable-PnpDevice" if enabled else "Disable-PnpDevice"
    _run_ps(
        f"{_CAMERA_FILTER} | {verb} -Confirm:$false -ErrorAction SilentlyContinue"
    )
    print(f"[device_ctrl] Camera {'enabled' if enabled else 'disabled'}")


# ── Microphone ───────────────────────────────────────────────────────────────
# Microphones are AudioEndpoint devices whose FriendlyName contains "Microphone"
_MIC_FILTER = (
    "Get-PnpDevice | Where-Object { "
    "$_.Class -eq 'AudioEndpoint' -and $_.FriendlyName -match 'Microphone|Mic' }"
)


def get_mic_enabled() -> bool:
    """Returns True if at least one microphone device is in OK (enabled) state."""
    out = _run_ps(f"{_MIC_FILTER} | Select-Object -ExpandProperty Status")
    return "OK" in out


def set_mic_enabled(enabled: bool) -> None:
    """Enable or disable all microphone devices."""
    verb = "Enable-PnpDevice" if enabled else "Disable-PnpDevice"
    _run_ps(
        f"{_MIC_FILTER} | {verb} -Confirm:$false -ErrorAction SilentlyContinue"
    )
    print(f"[device_ctrl] Mic {'enabled' if enabled else 'disabled'}")
