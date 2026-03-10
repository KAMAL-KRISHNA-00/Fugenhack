import sys
import psutil
import subprocess
import ctypes
import threading
from PyQt6.QtWidgets import (QApplication, QWidget, QVBoxLayout, QHBoxLayout, 
                             QLabel, QPushButton, QTableWidget, QTableWidgetItem, 
                             QHeaderView, QFrame)
from PyQt6.QtCore import Qt, QTimer, pyqtSignal, QObject, QThread
from PyQt6.QtGui import QColor, QFont, QLinearGradient, QBrush
from pynput import keyboard

# --- 1. SIGNAL BRIDGE (Essential for Hotkeys) ---
class HotkeySignal(QObject):
    toggle_request = pyqtSignal()

# --- 2. THE BACKGROUND SCANNER (Performance) ---
class ScanWorker(QThread):
    stats_ready = pyqtSignal(dict)

    def run(self):
        while True:
            try:
                cpu = psutil.cpu_percent()
                processes = []
                for proc in psutil.process_iter(['name', 'num_threads', 'cpu_percent']):
                    t_count = proc.info.get('num_threads', 0)
                    if t_count and t_count > 12: # Heuristic threshold
                        processes.append(proc.info)
                
                processes = sorted(processes, key=lambda x: x['num_threads'], reverse=True)[:8]
                self.stats_ready.emit({'cpu': cpu, 'procs': processes})
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
            self.msleep(1000)

# --- 3. THE NEON CONTROL PANEL ---
class HeuristiAdvancedPanel(QWidget):
    def __init__(self):
        super().__init__()
        self.init_ui()
        
        # Background Worker
        self.worker = ScanWorker()
        self.worker.stats_ready.connect(self.update_ui)
        self.worker.start()

    def init_ui(self):
        self.setWindowFlags(Qt.WindowType.FramelessWindowHint | Qt.WindowType.WindowStaysOnTopHint | Qt.WindowType.Tool)
        self.setAttribute(Qt.WidgetAttribute.WA_TranslucentBackground)
        self.setFixedSize(600, 480)

        # Deep Carbon & Neon Emerald Stylesheet
        self.setStyleSheet("""
            QWidget#MainFrame {
                background-color: rgba(10, 10, 10, 235);
                border: 2px solid #00ff66;
                border-radius: 15px;
            }
            QLabel { color: #00ff66; font-family: 'Consolas', 'Segoe UI'; }
            QTableWidget {
                background-color: rgba(20, 20, 20, 150);
                gridline-color: #004422;
                color: #b3ffcc;
                border: 1px solid #004422;
                font-size: 11px;
                selection-background-color: #004422;
            }
            QHeaderView::section {
                background-color: #050505;
                color: #00ff66;
                border: 1px solid #004422;
                padding: 4px;
            }
            QPushButton {
                background-color: #0a1a0a;
                border: 1px solid #00ff66;
                border-radius: 8px;
                color: #00ff66;
                font-weight: bold;
                font-family: 'Segoe UI';
                height: 35px;
            }
            QPushButton:hover { background-color: #00ff66; color: #000; }
            QPushButton#KillBtn { border-color: #ff3333; color: #ff3333; background-color: #1a0a0a; }
            QPushButton#KillBtn:hover { background-color: #ff3333; color: #fff; }
        """)

        self.main_frame = QWidget(self)
        self.main_frame.setObjectName("MainFrame")
        self.main_frame.resize(600, 480)
        
        layout = QVBoxLayout(self.main_frame)
        layout.setContentsMargins(20, 20, 20, 20)

        # Header with Scanner Effect
        header_layout = QHBoxLayout()
        self.title = QLabel("VIDI-SENTRY // PROTOCOL ACTIVE")
        self.title.setStyleSheet("font-size: 18px; letter-spacing: 3px; font-weight: bold; color: #00ff66;")
        header_layout.addWidget(self.title)
        layout.addLayout(header_layout)

        # Dashboard HUD Stats
        dash_layout = QHBoxLayout()
        self.lbl_cpu = self.create_stat_label("CORE LOAD")
        self.lbl_threat = self.create_stat_label("THREAT INDEX")
        dash_layout.addWidget(self.lbl_cpu)
        dash_layout.addWidget(self.lbl_threat)
        layout.addLayout(dash_layout)

        # Process Intelligence Table
        self.table = QTableWidget(0, 3)
        self.table.setHorizontalHeaderLabels(["IDENTIFIED PROCESS", "THREADS", "USAGE"])
        self.table.horizontalHeader().setSectionResizeMode(QHeaderView.ResizeMode.Stretch)
        self.table.verticalHeader().setVisible(False)
        self.table.setShowGrid(True)
        layout.addWidget(self.table)

        # Control Matrix
        btn_layout = QHBoxLayout()
        self.btn_reset = QPushButton("RESTORE HARDWARE")
        self.btn_kill = QPushButton("TERMINATE DRIVER")
        self.btn_kill.setObjectName("KillBtn")
        
        btn_layout.addWidget(self.btn_reset)
        btn_layout.addWidget(self.btn_kill)
        layout.addLayout(btn_layout)

    def create_stat_label(self, text):
        lbl = QLabel(f"{text}: --")
        lbl.setStyleSheet("font-size: 13px; font-weight: bold; border: 1px solid #004422; padding: 10px; border-radius: 5px;")
        return lbl

    def update_ui(self, data):
        self.lbl_cpu.setText(f"CORE LOAD: {data['cpu']}%")
        
        # Threat Logic
        threat_level = "LOW"
        self.table.setRowCount(len(data['procs']))
        for i, p in enumerate(data['procs']):
            self.table.setItem(i, 0, QTableWidgetItem(p['name']))
            self.table.setItem(i, 1, QTableWidgetItem(str(p['num_threads'])))
            self.table.setItem(i, 2, QTableWidgetItem(f"{p['cpu_percent']}%"))
            
            if p['num_threads'] > 45:
                threat_level = "CRITICAL"
                self.table.item(i, 1).setForeground(QColor("#ff3333"))

        self.lbl_threat.setText(f"THREAT INDEX: {threat_level}")
        color = "#00ff66" if threat_level == "LOW" else "#ff3333"
        self.lbl_threat.setStyleSheet(f"font-size: 13px; font-weight: bold; border: 1px solid {color}; padding: 10px; border-radius: 5px; color: {color};")

# --- 4. INTEGRATED APP HANDLER ---
class VidiApp:
    def __init__(self):
        self.q_app = QApplication(sys.argv)
        self.panel = HeuristiAdvancedPanel()
        self.sig_bridge = HotkeySignal()
        
        # Connect Signal to UI
        self.sig_bridge.toggle_request.connect(self.toggle_ui)
        
        # Start Keyboard Listener
        self.listener = keyboard.GlobalHotKeys({'<ctrl>+<alt>+h': self.sig_bridge.toggle_request.emit})
        self.listener.start()

        # Hide by defaultḥ
        self.panel.hide()

    def toggle_ui(self):
        if self.panel.isVisible():
            self.panel.hide()
        else:
            self.panel.show()
            self.panel.raise_()
            self.panel.activateWindow()

    def run(self):
        sys.exit(self.q_app.exec())

if __name__ == "__main__":
    app = VidiApp()
    app.run()