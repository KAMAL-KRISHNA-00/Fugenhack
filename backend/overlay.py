import json
import os
import subprocess
import sys
import threading
import time
import tkinter as tk
import psutil
import ctypes
import ctypes.wintypes

from killswitch import HardwareKillSwitch
from pairing_page import PairingPage, ensure_pairing_config, load_pairing_config, is_device_paired, sync_pairing_from_supabase
import device_controller
from supabase_client import SupabasePairingClient

try:
    from pynput import keyboard
except ImportError:
    keyboard = None


def _debug(message):
    print(f"[overlay] {message}")


class HuristiOverlay:
    def __init__(self):
        _debug("Initializing overlay")
        self.root = tk.Tk()
        self.root.withdraw()

        self.status_path = os.path.join(os.path.dirname(__file__), "runtime_status.json")
        self.main_path = os.path.join(os.path.dirname(__file__), "main.py")
        self.config_path = os.path.join(os.path.dirname(__file__), "config.json")

        self.detector_process = None
        self.hotkey_listener = None
        self.win_hotkey_thread = None
        self.win_hotkey_registered = False
        self.hotkey_bound_local = False
        self.overlay_visible = False
        self.paired_mode = False
        self.pairing_page = None
        self._status_poll_started = False
        self._pairing_poll_started = False
        self._device_settings_poll_started = False
        self.last_mtime = 0
        self.killer = HardwareKillSwitch()
        self.poll_visible_ms = 850
        self.poll_hidden_ms = 2200
        self._fallback_cache = []
        self._fallback_cache_ts = 0.0

        self.theme = {
            "bg": "#070d1c",
            "panel": "#0f1a30",
            "panel_2": "#13213d",
            "stroke": "#22365e",
            "text": "#e5ecff",
            "muted": "#94a3c4",
            "ok": "#22c55e",
            "warn": "#f59e0b",
            "bad": "#ef4444",
            "accent": "#2f81f7",
        }

        self.status_var = tk.StringVar(value="SYSTEM: WAITING")
        self.threat_var = tk.StringVar(value="THREAT: CLEAR")
        self.kill_var = tk.StringVar(value="KILL-SWITCH: IDLE")
        self.shortcut_var = tk.StringVar(value="Ctrl+Alt+H: Toggle HUD")

        self.widgets = []
        self.process_cards = []

        self.root.protocol("WM_DELETE_WINDOW", self._on_close)

        config = ensure_pairing_config(self.config_path)
        _debug(f"Startup config | paired={config.get('paired')} | device_id={config.get('device_id')}")
        if is_device_paired(config):
            _debug("Entering paired mode on startup")
            self._enter_paired_mode()
        else:
            _debug("Entering pairing mode on startup")
            self._enter_pairing_mode(config)

    def _autostart_detector(self):
        if os.path.exists(self.status_path):
            try:
                with open(self.status_path, "r", encoding="utf-8") as fp:
                    data = json.load(fp)
                if time.time() - float(data.get("updated_at", 0)) < 2.5:
                    self.status_var.set("SYSTEM: DETECTOR ATTACHED")
                    return
            except Exception:
                pass

        try:
            self.detector_process = subprocess.Popen([sys.executable, self.main_path], cwd=os.path.dirname(__file__))
            self.status_var.set("SYSTEM: DETECTOR AUTOSTARTED")
        except Exception as e:
            self.status_var.set(f"SYSTEM: START FAILED ({e})")

    def _on_close(self):
        if self.win_hotkey_registered:
            try:
                ctypes.windll.user32.UnregisterHotKey(None, 1)
            except Exception:
                pass
            self.win_hotkey_registered = False

        if self.hotkey_listener:
            self.hotkey_listener.stop()

        if self.detector_process and self.detector_process.poll() is None:
            self.detector_process.terminate()
            try:
                self.detector_process.wait(timeout=2)
            except Exception:
                self.detector_process.kill()

        for widget in self.widgets:
            try:
                widget.destroy()
            except Exception:
                pass

        if self.pairing_page:
            self.pairing_page.close()

        self.root.destroy()

    def _enter_pairing_mode(self, config):
        self.paired_mode = False
        self.shortcut_var.set("Pair device first. Shortcut disabled.")
        _debug(f"Pairing mode active | device_id={config.get('device_id')}")

        if self.pairing_page is None:
            device_id = str(config.get("device_id") or "")
            self.pairing_page = PairingPage(self.root, device_id=device_id)
            self.pairing_page.set_status("Waiting for pairing confirmation in config.json")

        # Immediate cloud sync on entering pairing mode:
        # 1) ensure row exists in devices table
        # 2) fetch latest paired/user/token values
        synced = sync_pairing_from_supabase(self.config_path)
        if self.pairing_page:
            self.pairing_page.set_pair_code(synced.get("pair_token"))
            self.pairing_page.set_status("Waiting for pairing... complete in web dashboard")

        if is_device_paired(synced):
            _debug("Device already paired after immediate sync")
            self._enter_paired_mode()
            return

        if not self._pairing_poll_started:
            self._pairing_poll_started = True
            self.root.after(1500, self._poll_pairing_status)

    def _enter_paired_mode(self):
        if self.paired_mode:
            return

        self.paired_mode = True
        self.shortcut_var.set("Ctrl+Alt+H: Toggle HUD")
        _debug("Paired mode active; enabling dashboard and shortcuts")

        if self.pairing_page:
            self.pairing_page.close()
            self.pairing_page = None

        if not self.widgets:
            self._build_desktop_widgets()

        self._autostart_detector()
        self._start_hotkey_listener()

        if not self._status_poll_started:
            self._status_poll_started = True
            self.root.after(self.poll_hidden_ms, self._poll_status)

        # Start cloud → driver sync loop (every 5 seconds)
        self._device_settings_poll_started = False
        self.root.after(5000, self._poll_device_settings)

    def _poll_pairing_status(self):
        config = sync_pairing_from_supabase(self.config_path)
        if self.pairing_page:
            self.pairing_page.set_pair_code(config.get("pair_token"))
        if is_device_paired(config):
            _debug("Pairing confirmed during polling")
            self._enter_paired_mode()
            return

        if self.pairing_page:
            self.pairing_page.set_status("Waiting for pairing... set paired=true after web pairing")
        _debug(f"Still waiting for pairing | device_id={config.get('device_id')} | paired={config.get('paired')}")

        self.root.after(1500, self._poll_pairing_status)

    def _poll_device_settings(self):
        """Every 5 seconds: fetch camera_enabled/mic_enabled from Supabase and sync local drivers."""
        if not self.paired_mode:
            return

        config = load_pairing_config(self.config_path)
        device_id = str(config.get("device_id") or "").strip()

        def _fetch_and_apply():
            if not device_id:
                return
            client = SupabasePairingClient()
            if not client.enabled:
                return

            client.update_last_seen(device_id)
            row = client.fetch_device_settings(device_id)
            if not row:
                return

            camera_desired = bool(row.get("camera_enabled", True))
            mic_desired = bool(row.get("mic_enabled", True))

            camera_actual = device_controller.get_camera_enabled()
            mic_actual = device_controller.get_mic_enabled()

            if camera_desired != camera_actual:
                _debug(f"Camera mismatch: desired={camera_desired} actual={camera_actual} → applying")
                device_controller.set_camera_enabled(camera_desired)

            if mic_desired != mic_actual:
                _debug(f"Mic mismatch: desired={mic_desired} actual={mic_actual} → applying")
                device_controller.set_mic_enabled(mic_desired)

            # Re-check actual hardware state after apply attempts.
            camera_after = device_controller.get_camera_enabled()
            mic_after = device_controller.get_mic_enabled()

            # If local state still diverges (e.g., no admin rights), reflect reality to DB.
            if camera_after != camera_desired or mic_after != mic_desired:
                _debug(
                    "Apply mismatch persisted; syncing actual hardware state back to DB "
                    f"(camera={camera_after}, mic={mic_after})"
                )
                client.update_device_controls(
                    device_id=device_id,
                    camera_enabled=camera_after,
                    mic_enabled=mic_after,
                )

        threading.Thread(target=_fetch_and_apply, daemon=True).start()
        self.root.after(5000, self._poll_device_settings)

    def _start_hotkey_listener(self):
        if not self.paired_mode:
            return

        # Always bind local fallback in case focus is within overlay windows.
        if not self.hotkey_bound_local:
            self.root.bind_all("<Control-Alt-h>", lambda _e: self._toggle_overlay())
            self.root.bind_all("<Control-Alt-H>", lambda _e: self._toggle_overlay())
            self.hotkey_bound_local = True

        # Try Windows native global hotkey first (more reliable than pynput on some setups).
        if os.name == "nt" and self._start_windows_hotkey_listener():
            self.shortcut_var.set("Ctrl+Alt+H: Global HUD toggle active")
            return

        if keyboard is None:
            self.shortcut_var.set("pynput missing: using local Ctrl+Alt+H")
            return

        if self.hotkey_listener:
            return

        try:
            self.hotkey_listener = keyboard.GlobalHotKeys({
                "<ctrl>+<alt>+h": self._request_toggle,
                "<ctrl>+<alt>+H": self._request_toggle,
            })
            self.hotkey_listener.start()
            self.shortcut_var.set("Ctrl+Alt+H: Global HUD toggle active")
            _debug("Global hotkey started via pynput")
        except Exception as exc:
            _debug(f"pynput global hotkey failed: {exc}")
            self.shortcut_var.set("Global hotkey unavailable; local Ctrl+Alt+H only")

    def _start_windows_hotkey_listener(self):
        if self.win_hotkey_registered:
            return True

        try:
            user32 = ctypes.windll.user32
            MOD_ALT = 0x0001
            MOD_CONTROL = 0x0002
            VK_H = 0x48

            if not user32.RegisterHotKey(None, 1, MOD_CONTROL | MOD_ALT, VK_H):
                return False

            self.win_hotkey_registered = True
            _debug("Global hotkey started via RegisterHotKey")

            def _pump():
                MSG = ctypes.wintypes.MSG
                msg = MSG()
                while self.paired_mode and self.win_hotkey_registered:
                    result = user32.GetMessageW(ctypes.byref(msg), None, 0, 0)
                    if result <= 0:
                        break
                    if msg.message == 0x0312 and msg.wParam == 1:  # WM_HOTKEY
                        self.root.after(0, self._toggle_overlay)

            self.win_hotkey_thread = threading.Thread(target=_pump, daemon=True)
            self.win_hotkey_thread.start()
            return True
        except Exception as exc:
            _debug(f"RegisterHotKey failed: {exc}")
            return False

    def _request_toggle(self):
        self.root.after(0, self._toggle_overlay)

    def _toggle_overlay(self):
        if not self.paired_mode:
            return

        self.overlay_visible = not self.overlay_visible
        for widget in self.widgets:
            if self.overlay_visible:
                widget.deiconify()
                widget.lift()
            else:
                widget.withdraw()

    def _rounded_panel(self, parent, width, height, radius=14, fill=None, outline=None):
        fill = fill or self.theme["panel"]
        outline = outline or self.theme["stroke"]

        canvas = tk.Canvas(parent, width=width, height=height, bg=self.theme["bg"], highlightthickness=0)
        canvas.pack(fill="both", expand=True)

        x1, y1, x2, y2 = 2, 2, width - 2, height - 2
        points = [
            x1 + radius, y1,
            x2 - radius, y1,
            x2, y1,
            x2, y1 + radius,
            x2, y2 - radius,
            x2, y2,
            x2 - radius, y2,
            x1 + radius, y2,
            x1, y2,
            x1, y2 - radius,
            x1, y1 + radius,
            x1, y1,
        ]
        canvas.create_polygon(points, smooth=True, splinesteps=24, fill=fill, outline=outline, width=1)

        content = tk.Frame(canvas, bg=fill)
        canvas.create_window(10, 10, anchor="nw", window=content, width=width - 20, height=height - 20)
        return content

    def _make_widget(self, title, x, y, width, height):
        win = tk.Toplevel(self.root)
        win.title(title)
        win.geometry(f"{width}x{height}+{x}+{y}")
        win.overrideredirect(True)
        win.configure(bg=self.theme["bg"])
        win.attributes("-topmost", True)
        win.withdraw()

        container = self._rounded_panel(win, width, height, radius=16, fill=self.theme["panel"], outline=self.theme["stroke"])

        header = tk.Frame(container, bg=self.theme["panel"])
        header.pack(fill="x")
        tk.Label(
            header,
            text=title,
            fg=self.theme["text"],
            bg=self.theme["panel"],
            font=("Segoe UI Semibold", 10),
        ).pack(side="left", padx=(4, 0), pady=(2, 8))

        close_btn = tk.Button(
            header,
            text="x",
            fg=self.theme["muted"],
            bg=self.theme["panel"],
            activebackground=self.theme["panel_2"],
            activeforeground=self.theme["text"],
            relief="flat",
            bd=0,
            padx=8,
            command=self._toggle_overlay,
        )
        close_btn.pack(side="right", pady=(0, 6))

        body = tk.Frame(container, bg=self.theme["panel"])
        body.pack(fill="both", expand=True)

        self._bind_drag(container, win)
        self._bind_drag(header, win)

        self.widgets.append(win)
        return body

    def _bind_drag(self, widget, win):
        drag_state = {"x": 0, "y": 0}

        def start(event):
            drag_state["x"] = event.x_root
            drag_state["y"] = event.y_root

        def move(event):
            dx = event.x_root - drag_state["x"]
            dy = event.y_root - drag_state["y"]
            geo = win.geometry().split("+")
            x = int(geo[1]) + dx
            y = int(geo[2]) + dy
            win.geometry(f"+{x}+{y}")
            drag_state["x"] = event.x_root
            drag_state["y"] = event.y_root

        widget.bind("<ButtonPress-1>", start, add="+")
        widget.bind("<B1-Motion>", move, add="+")

    def _build_desktop_widgets(self):
        top = self._make_widget("System Bar", 760, 16, 500, 82)
        tk.Label(
            top,
            text="HURISTI SOC",
            fg=self.theme["text"],
            bg=self.theme["panel"],
            font=("Segoe UI Semibold", 16),
        ).pack(side="left", padx=8, pady=8)
        tk.Label(
            top,
            textvariable=self.shortcut_var,
            fg=self.theme["accent"],
            bg=self.theme["panel"],
            font=("Segoe UI Semibold", 9),
        ).pack(side="right", padx=8, pady=12)

        controls = self._make_widget("Actions", 20, 16, 260, 260)
        self._add_action_button(controls, "FULL LOCKDOWN", "#dc2626", self._kill_all)
        self._add_action_button(controls, "KILL CAMERAS", "#b91c1c", self._kill_camera)
        self._add_action_button(controls, "KILL MICS", "#7e22ce", self._kill_microphone)
        self._add_action_button(controls, "RESTORE ALL", "#15803d", self._restore_all)

        tk.Label(
            controls,
            textvariable=self.kill_var,
            fg=self.theme["warn"],
            bg=self.theme["panel"],
            font=("Segoe UI Semibold", 9),
        ).pack(anchor="w", padx=8, pady=(8, 4))

        status = self._make_widget("Threat Feed", 300, 110, 980, 560)

        top_row = tk.Frame(status, bg=self.theme["panel"])
        top_row.pack(fill="x", pady=(0, 8))

        tk.Label(top_row, textvariable=self.status_var, fg=self.theme["muted"], bg=self.theme["panel"], font=("Segoe UI", 10)).pack(
            side="left", padx=6
        )
        tk.Label(top_row, textvariable=self.threat_var, fg=self.theme["ok"], bg=self.theme["panel"], font=("Segoe UI Semibold", 10)).pack(
            side="right", padx=6
        )

        cards_container = tk.Frame(status, bg=self.theme["panel"])
        cards_container.pack(fill="both", expand=True)

        for _ in range(4):
            card = tk.Frame(cards_container, bg=self.theme["panel_2"], bd=1, relief="solid", highlightthickness=0)
            card.pack(fill="x", padx=6, pady=6)

            title = tk.Label(card, text="PROCESS", fg=self.theme["text"], bg=self.theme["panel_2"], font=("Segoe UI Semibold", 11))
            title.pack(anchor="w", padx=10, pady=(8, 2))

            meta = tk.Label(card, text="Sensor: - | Trusted: - | Headless: -", fg=self.theme["muted"], bg=self.theme["panel_2"], font=("Segoe UI", 9))
            meta.pack(anchor="w", padx=10)

            score = tk.Label(card, text="Risk: 0", fg=self.theme["ok"], bg=self.theme["panel_2"], font=("Segoe UI Semibold", 10))
            score.pack(anchor="w", padx=10, pady=2)

            detail = tk.Label(card, text="Signals: None", fg=self.theme["muted"], bg=self.theme["panel_2"], font=("Segoe UI", 9), wraplength=900, justify="left")
            detail.pack(anchor="w", padx=10, pady=(0, 8))

            self.process_cards.append({"title": title, "meta": meta, "score": score, "detail": detail, "frame": card})

    def _add_action_button(self, parent, text, color, command):
        button = tk.Button(
            parent,
            text=text,
            command=lambda: threading.Thread(target=command, daemon=True).start(),
            bg=color,
            fg="#ffffff",
            activebackground=self.theme["panel_2"],
            activeforeground="#ffffff",
            relief="flat",
            font=("Segoe UI Semibold", 9),
            padx=10,
            pady=8,
            bd=0,
        )
        button.pack(fill="x", padx=8, pady=5)

    def _kill_camera(self):
        ok = self.killer.disable_camera()
        self.kill_var.set("KILL-SWITCH: CAMERA DISABLED" if ok else "KILL-SWITCH: CAMERA FAILED")

    def _kill_microphone(self):
        ok = self.killer.disable_microphone()
        self.kill_var.set("KILL-SWITCH: MICROPHONE DISABLED" if ok else "KILL-SWITCH: MICROPHONE FAILED")

    def _kill_all(self):
        ok = self.killer.disable_all_capture()
        self.kill_var.set("KILL-SWITCH: CAM+MIC DISABLED" if ok else "KILL-SWITCH: CAM+MIC FAILED")

    def _restore_all(self):
        ok = self.killer.enable_all_capture()
        self.kill_var.set("KILL-SWITCH: DEVICES RESTORED" if ok else "KILL-SWITCH: RESTORE FAILED")

    def _poll_status(self):
        if not self.paired_mode:
            return

        self._load_status_if_changed()
        interval = self.poll_visible_ms if self.overlay_visible else self.poll_hidden_ms
        self.root.after(interval, self._poll_status)

    def _top_processes_fallback(self):
        # Cache fallback rows to avoid scanning all processes every refresh.
        if time.time() - self._fallback_cache_ts < 4.0 and self._fallback_cache:
            return self._fallback_cache

        rows = []
        try:
            processes = []
            for proc in psutil.process_iter(["name", "cpu_percent", "memory_percent", "num_threads"]):
                info = proc.info
                name = info.get("name") or "unknown"
                cpu = float(info.get("cpu_percent") or 0.0)
                mem = float(info.get("memory_percent") or 0.0)
                threads = int(info.get("num_threads") or 0)
                weight = (cpu * 0.55) + (mem * 0.35) + (threads * 0.10)
                processes.append((weight, name, cpu, mem, threads))

            processes.sort(reverse=True, key=lambda t: t[0])
            for weight, name, cpu, mem, threads in processes[:4]:
                rows.append(
                    {
                        "name": name,
                        "sensor": "-",
                        "trusted": True,
                        "headless": "-",
                        "score": 0,
                        "upload_kbps": 0,
                        "reasons": [f"Top process snapshot | CPU {cpu:.1f}% | RAM {mem:.1f}% | Threads {threads}"],
                    }
                )
        except Exception:
            pass

        self._fallback_cache = rows
        self._fallback_cache_ts = time.time()
        return rows

    def _build_top_rows(self, data):
        analysis = data.get("analysis", [])
        if analysis:
            sorted_rows = sorted(analysis, key=lambda r: float(r.get("score", 0)), reverse=True)
            return sorted_rows[:4]
        return self._top_processes_fallback()

    def _paint_cards(self, rows):
        for idx in range(4):
            card = self.process_cards[idx]
            if idx >= len(rows):
                card["title"].configure(text="NO DATA")
                card["meta"].configure(text="Sensor: - | Trusted: - | Headless: -")
                card["score"].configure(text="Risk: 0", fg=self.theme["ok"])
                card["detail"].configure(text="Signals: Waiting for telemetry")
                continue

            row = rows[idx]
            score = float(row.get("score", 0))
            score_color = self.theme["ok"]
            if score >= 70:
                score_color = self.theme["bad"]
            elif score >= 35:
                score_color = self.theme["warn"]

            trusted = "Yes" if row.get("trusted") else "No"
            headless = row.get("headless", "-")
            if isinstance(headless, bool):
                headless = "Yes" if headless else "No"

            signals = row.get("reasons", [])
            if not signals:
                signals = ["No high-risk indicators"]

            card["title"].configure(text=str(row.get("name", "unknown")).upper())
            card["meta"].configure(
                text=(
                    f"Sensor: {row.get('sensor', '-')} | Trusted: {trusted} | "
                    f"Headless: {headless} | Speed: {row.get('upload_kbps', 0)} KB/s"
                )
            )
            card["score"].configure(text=f"Risk: {int(score)}", fg=score_color)
            card["detail"].configure(text=f"Signals: {'; '.join(signals)}")

    def _load_status_if_changed(self):
        if not os.path.exists(self.status_path):
            return

        mtime = os.path.getmtime(self.status_path)
        if mtime == self.last_mtime:
            return
        self.last_mtime = mtime

        try:
            with open(self.status_path, "r", encoding="utf-8") as fp:
                data = json.load(fp)
        except Exception:
            self.status_var.set("SYSTEM: TELEMETRY PARSE ERROR")
            return

        ts = time.strftime("%H:%M:%S", time.localtime(float(data.get("updated_at", 0))))
        active_count = data.get("active_count", 0)
        self.status_var.set(f"SYSTEM: {ts} | ACTIVE APPS: {active_count}")

        threat_detected = data.get("threat_detected", False)
        threat_app = data.get("threat_app") or "NONE"
        self.threat_var.set(f"THREAT: {'DETECTED' if threat_detected else 'CLEAR'} | APP: {threat_app}")

        kill_attempted = data.get("kill_attempted", False)
        kill_success = data.get("kill_success")
        if kill_attempted:
            self.kill_var.set("KILL-SWITCH: SUCCESS" if kill_success else "KILL-SWITCH: FAILED (ADMIN REQUIRED)")

        rows = self._build_top_rows(data)
        self._paint_cards(rows)

    def run(self):
        self.root.mainloop()


if __name__ == "__main__":
    HuristiOverlay().run()
