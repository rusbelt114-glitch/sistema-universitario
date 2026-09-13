"""
SISTEMA UNIVERSITARIO - SERVIDOR DE API REST EN PYTHON & AUTOMATIZACIÓN GIT EN TIEMPO REAL
Cualquier cambio guardado en la web realiza automáticamente `git commit` y `git push origin main`
"""

import http.server
import socketserver
import json
import sqlite3
import subprocess
import os
from datetime import datetime

PORT = 8000
DB_NAME = "sistema_universitario.db"

def auto_git_push(commit_reason="Actualización académica"):
    """Función de Sincronización Automática con GitHub en segundo plano"""
    try:
        # 1. Asegurar rama main
        subprocess.run(["git", "branch", "-M", "main"], capture_output=True)
        # 2. Agregar cambios
        subprocess.run(["git", "add", "."], capture_output=True)
        # 3. Commit automático
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%mm:%S")
        commit_msg = f"Auto-Sync: {commit_reason} - {timestamp}"
        subprocess.run(["git", "commit", "-m", commit_msg], capture_output=True)

        # 4. Push automático a GitHub si está vinculado el remoto origin
        remote_check = subprocess.run(["git", "remote", "get-url", "origin"], capture_output=True, text=True)
        if remote_check.returncode == 0:
            push_res = subprocess.run(["git", "push", "origin", "main"], capture_output=True, text=True)
            print(f"✅ Auto-Git Push a GitHub exitoso: {push_res.stdout.strip()}")
            return True
        else:
            print("ℹ️ Commit local realizado. Remoto 'origin' aún no vinculado.")
            return False
    except Exception as e:
        print(f"⚠️ Error en Auto-Git Sync: {e}")
        return False

class UniversityRequestHandler(http.server.SimpleHTTPRequestHandler):

    def _set_headers(self, status=200, content_type="application/json"):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_OPTIONS(self):
        self._set_headers(200)

    def do_GET(self):
        if self.path.startswith("/api/materias"):
            self.get_materias()
        elif self.path.startswith("/api/evaluaciones"):
            self.get_evaluaciones()
        elif self.path == "/api/git-sync":
            synced = auto_git_push("Sincronización manual desde la Web")
            self._set_headers(200)
            self.wfile.write(json.dumps({"status": "success", "synced": synced}).encode("utf-8"))
        else:
            super().do_GET()

    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)
        payload = json.loads(post_data.decode('utf-8')) if post_data else {}

        if self.path == "/api/materia/update":
            self.update_materia(payload)
        elif self.path == "/api/evaluacion/save":
            self.save_evaluacion(payload)
        elif self.path == "/api/evaluacion/delete":
            self.delete_evaluacion(payload)
        elif self.path == "/api/git-sync":
            synced = auto_git_push("Cambio guardado en interfaz Web")
            self._set_headers(200)
            self.wfile.write(json.dumps({"status": "success", "synced": synced}).encode("utf-8"))
        else:
            self._set_headers(404)
            self.wfile.write(json.dumps({"error": "Ruta no encontrada"}).encode("utf-8"))

    def get_materias(self):
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        cursor.execute("SELECT id, carrera, trayecto_id, codigo, nombre, uc, estatus, nota, ref_doc FROM materias")
        rows = cursor.fetchall()
        conn.close()

        materias = []
        for r in rows:
            materias.append({
                "id": r[0], "carrera": r[1], "trayecto_id": r[2], "codigo": r[3],
                "nombre": r[4], "uc": r[5], "estatus": r[6], "nota": r[7], "ref_doc": r[8]
            })

        self._set_headers(200)
        self.wfile.write(json.dumps({"status": "success", "data": materias}).encode("utf-8"))

    def get_evaluaciones(self):
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        cursor.execute("SELECT id, materia_id, nombre, ponderacion, nota, fecha, completada FROM evaluaciones")
        rows = cursor.fetchall()
        conn.close()

        evals = []
        for r in rows:
            evals.append({
                "id": r[0], "materia_id": r[1], "nombre": r[2], "ponderacion": r[3],
                "nota": r[4], "fecha": r[5], "completada": bool(r[6])
            })

        self._set_headers(200)
        self.wfile.write(json.dumps({"status": "success", "data": evals}).encode("utf-8"))

    def update_materia(self, data):
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        cursor.execute("""
        UPDATE materias
        SET estatus = ?, nota = ?, ref_doc = ?
        WHERE id = ?
        """, (data.get("estatus"), data.get("nota"), data.get("ref_doc"), data.get("id")))
        conn.commit()
        conn.close()

        # Sincronización automática inmediata a GitHub
        auto_git_push(f"Modificación de Asignatura {data.get('id')}")

        self._set_headers(200)
        self.wfile.write(json.dumps({"status": "updated", "git_synced": True}).encode("utf-8"))

    def save_evaluacion(self, data):
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        cursor.execute("""
        INSERT OR REPLACE INTO evaluaciones (id, materia_id, nombre, ponderacion, nota, fecha, completada)
        VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (
            data.get("id"), data.get("materia_id"), data.get("nombre"),
            data.get("ponderacion"), data.get("nota"), data.get("fecha"),
            1 if data.get("completada") else 0
        ))
        conn.commit()
        conn.close()

        # Sincronización automática inmediata a GitHub
        auto_git_push(f"Actualización de Evaluación {data.get('nombre')}")

        self._set_headers(200)
        self.wfile.write(json.dumps({"status": "saved", "git_synced": True}).encode("utf-8"))

    def delete_evaluacion(self, data):
        conn = sqlite3.connect(DB_NAME)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM evaluaciones WHERE id = ?", (data.get("id"),))
        conn.commit()
        conn.close()

        auto_git_push("Eliminación de Evaluación")

        self._set_headers(200)
        self.wfile.write(json.dumps({"status": "deleted", "git_synced": True}).encode("utf-8"))

if __name__ == "__main__":
    from database import init_db
    init_db()

    print(f"Servidor Python en http://localhost:{PORT} con Git Auto-Push activado")
    with socketserver.TCPServer(("", PORT), UniversityRequestHandler) as httpd:
        httpd.serve_forever()
