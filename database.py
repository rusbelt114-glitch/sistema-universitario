"""
SISTEMA UNIVERSITARIO DE GESTIÓN ACADÉMICA
Base de Datos SQLite3 & Script de Inicialización Homologado (ADM e INF)
"""

import sqlite3

DB_NAME = "sistema_universitario.db"

def init_db():
    conn = sqlite3.connect(DB_NAME)
    cursor = conn.cursor()

    # Tabla: Materias
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS materias (
        id TEXT PRIMARY KEY,
        carrera TEXT NOT NULL,
        trayecto_id TEXT NOT NULL,
        codigo TEXT NOT NULL,
        nombre TEXT NOT NULL,
        uc INTEGER NOT NULL,
        estatus TEXT NOT NULL,
        nota REAL,
        ref_doc TEXT
    )
    """)

    # Tabla: Evaluaciones
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS evaluaciones (
        id TEXT PRIMARY KEY,
        materia_id TEXT NOT NULL,
        nombre TEXT NOT NULL,
        ponderacion REAL NOT NULL,
        nota REAL,
        fecha TEXT,
        completada INTEGER DEFAULT 0,
        FOREIGN KEY (materia_id) REFERENCES materias (id)
    )
    """)

    # Tabla: Horario
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS horario (
        id TEXT PRIMARY KEY,
        semana TEXT NOT NULL,
        dia TEXT NOT NULL,
        hora TEXT NOT NULL,
        materia TEXT NOT NULL,
        aula TEXT
    )
    """)

    # Tabla: Notificaciones
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS notificaciones (
        id TEXT PRIMARY KEY,
        titulo TEXT NOT NULL,
        descripcion TEXT,
        prioridad TEXT DEFAULT 'normal',
        fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)

    # Seed de Materias Homologadas (PNF Administración y PNF Informática UNEXCA)
    materias_seed = [
        # --- PNF ADMINISTRACIÓN ---
        # Trayecto 1-1
        ("adm-111", "ADM", "1-1", "PSI-11", "Proyecto Socio Integrador I - Módulo I", 9, "por_cursar", None, ""),
        ("adm-112", "ADM", "1-1", "FSC-11", "Formación Sociocrítica I - Módulo I", 4, "repetir", None, "Estatus condicionado / por definir"),
        ("adm-113", "ADM", "1-1", "CON-11", "Contabilidad I - Módulo I", 4, "repetir", None, "Materia por repetir"),
        ("adm-114", "ADM", "1-1", "FAD-11", "Fundamentos de la Administración - Módulo I", 4, "repetir", None, "Materia por repetir"),
        ("adm-115", "ADM", "1-1", "EST-11", "Estadística", 2, "pendiente_consulta", None, "Pendiente por consulta oficial"),
        ("adm-116", "ADM", "1-1", "EOE-11", "Expresión Oral y Escrita", 2, "pendiente_consulta", None, "Pendiente por consulta oficial"),
        ("adm-117", "ADM", "1-1", "MJ1-11", "Marco Jurídico I", 2, "pendiente_consulta", None, "Pendiente por consulta oficial"),
        ("adm-118", "ADM", "1-1", "TIC-11", "Tecnología de la Información y la Comunicación", 2, "aprobada", 16.0, "DOC-20250714-WA0034..pdf"),

        # Trayecto 1-2
        ("adm-121", "ADM", "1-2", "PSI-12", "Proyecto Socio Integrador I - Módulo II", 9, "por_cursar", None, ""),
        ("adm-122", "ADM", "1-2", "FSC-12", "Formación Sociocrítica I - Módulo II", 4, "repetir", None, "Estatus condicionado / por definir"),
        ("adm-123", "ADM", "1-2", "CON-12", "Contabilidad I - Módulo II", 4, "repetir", None, "Materia por repetir"),
        ("adm-124", "ADM", "1-2", "FAD-12", "Fundamentos de la Administración - Módulo II", 4, "repetir", None, "Materia por repetir"),
        ("adm-125", "ADM", "1-2", "OPF-12", "Operaciones Financieras", 2, "aprobada", 15.0, "HOJA DE ACTUACION OPERACIONES FINANCIERAS"),
        ("adm-126", "ADM", "1-2", "TPM-12", "Teoría y Prácticas del Mercadeo", 2, "intensivo_verano", None, "Próximo período - Intensivo Verano"),
        ("adm-127", "ADM", "1-2", "DFC-12", "Deberes Formales del Contribuyente", 2, "intensivo_verano", None, "Próximo período - Intensivo Verano"),
        ("adm-128", "ADM", "1-2", "ELE-12", "Electiva I", 2, "pendiente_consulta", None, "Pendiente por consulta oficial"),

        # Trayecto 2-1
        ("adm-211", "ADM", "2-1", "PSI-21", "Proyecto Socio Integrador II - Módulo I", 9, "por_cursar", None, ""),
        ("adm-212", "ADM", "2-1", "FSC-21", "Formación Sociocrítica II - Módulo I", 4, "por_cursar", None, ""),
        ("adm-213", "ADM", "2-1", "CON-21", "Contabilidad II - Módulo I", 4, "por_cursar", None, ""),
        ("adm-214", "ADM", "2-1", "FEC-21", "Fundamentos de la Economía", 2, "pendiente_consulta", None, "Pendiente por consulta oficial"),
        ("adm-215", "ADM", "2-1", "OYS-21", "Organización y Sistema", 2, "aprobada", 14.0, "HOJA DE ACTUACION (1).xlsx"),
        ("adm-216", "ADM", "2-1", "GTH-21", "Gestión del Talento Humano", 2, "aprobada", 12.5, "Promediada 12.5 pts"),
        ("adm-217", "ADM", "2-1", "MJ2-21", "Marco Jurídico II", 2, "pendiente_consulta", None, "Pendiente por consulta oficial"),
        ("adm-218", "ADM", "2-1", "AAC-21", "Actividades Acreditables I", 2, "aprobada", 16.0, "NOTAS1-2026 ALTAGRACIA.xlsx"),

        # Trayecto 2-2 (Fase Activa Actual ADM)
        ("adm-221", "ADM", "2-2", "PSI-22", "Proyecto Socio Integrador II - Módulo II", 9, "en_curso", None, "Fase de culminación TSU"),
        ("adm-222", "ADM", "2-2", "FSC-22", "Formación Sociocrítica II - Módulo II", 4, "en_curso", None, "Fase de culminación TSU"),
        ("adm-223", "ADM", "2-2", "ACO-22", "Administración de Costos I", 2, "en_curso", None, "Fase de culminación TSU"),
        ("adm-224", "ADM", "2-2", "GEA-22", "Gestión Ecológica Ambiental", 2, "en_curso", None, "Fase de culminación TSU"),
        ("adm-225", "ADM", "2-2", "PPP-22", "Presupuesto Público y Privado", 2, "en_curso", None, "Fase de culminación TSU"),
        ("adm-226", "ADM", "2-2", "HDI-22", "Habilidades Directivas I", 2, "en_curso", None, "Fase de culminación TSU"),
        ("adm-227", "ADM", "2-2", "DF2-22", "Deberes Formales del Contribuyente II", 2, "en_curso", None, "Fase de culminación TSU"),
        ("adm-228", "ADM", "2-2", "ELE-22", "Electiva II", 2, "en_curso", None, "Fase de culminación TSU"),

        # --- PNF INFORMÁTICA ---
        # Trayecto 1-1 (Fase Activa Actual INF)
        ("inf-111", "INF", "1-1", "PST-11", "Proyecto Socio Tecnológico I - Módulo I", 9, "en_curso", None, ""),
        ("inf-112", "INF", "1-1", "FSC-11", "Formación Sociocrítica I - Módulo I", 3, "en_curso", None, ""),
        ("inf-113", "INF", "1-1", "AYP-11", "Algorítmica y Programación - Módulo I", 4, "en_curso", None, ""),
        ("inf-114", "INF", "1-1", "ADC-11", "Arquitectura del Computador - Módulo I", 4, "en_curso", None, ""),
        ("inf-115", "INF", "1-1", "MAT-11", "Matemática I - Módulo I", 4, "en_curso", None, ""),
        ("inf-116", "INF", "1-1", "ING-11", "Inglés I - Módulo I", 2, "en_curso", None, ""),
        ("inf-117", "INF", "1-1", "AAC-11", "Actividades Acreditables I", 2, "en_curso", None, ""),

        # Trayecto 1-2
        ("inf-121", "INF", "1-2", "PST-12", "Proyecto Socio Tecnológico I - Módulo II", 9, "por_cursar", None, ""),
        ("inf-122", "INF", "1-2", "FSC-12", "Formación Sociocrítica I - Módulo II", 3, "por_cursar", None, ""),
        ("inf-123", "INF", "1-2", "AYP-12", "Algorítmica y Programación - Módulo II", 4, "por_cursar", None, ""),
        ("inf-124", "INF", "1-2", "ADC-12", "Arquitectura del Computador - Módulo II", 4, "por_cursar", None, ""),
        ("inf-125", "INF", "1-2", "MAT-12", "Matemática I - Módulo II", 4, "por_cursar", None, ""),
        ("inf-126", "INF", "1-2", "ING-12", "Inglés I - Módulo II", 2, "por_cursar", None, ""),
        ("inf-127", "INF", "1-2", "ELE-12", "Electiva I", 2, "por_cursar", None, ""),

        # Trayecto 2-1
        ("inf-211", "INF", "2-1", "PST-21", "Proyecto Socio Tecnológico II - Módulo I", 9, "por_cursar", None, ""),
        ("inf-212", "INF", "2-1", "FSC-21", "Formación Sociocrítica II - Módulo I", 3, "por_cursar", None, ""),
        ("inf-213", "INF", "2-1", "PR1-21", "Programación I - Módulo I", 4, "por_cursar", None, ""),
        ("inf-214", "INF", "2-1", "IDS-21", "Ingeniería de Software I", 4, "por_cursar", None, ""),
        ("inf-215", "INF", "2-1", "MAT-21", "Matemática II", 4, "por_cursar", None, ""),
        ("inf-216", "INF", "2-1", "RDC-21", "Redes de Computadoras", 3, "por_cursar", None, ""),
        ("inf-217", "INF", "2-1", "AAC-21", "Actividades Acreditables II", 2, "por_cursar", None, ""),

        # Trayecto 2-2
        ("inf-221", "INF", "2-2", "PST-22", "Proyecto Socio Tecnológico II - Módulo II", 9, "por_cursar", None, ""),
        ("inf-222", "INF", "2-2", "FSC-22", "Formación Sociocrítica II - Módulo II", 3, "por_cursar", None, ""),
        ("inf-223", "INF", "2-2", "PR1-22", "Programación I - Módulo II", 4, "por_cursar", None, ""),
        ("inf-224", "INF", "2-2", "IDS-22", "Ingeniería de Software II", 4, "por_cursar", None, ""),
        ("inf-225", "INF", "2-2", "BDD-22", "Base de Datos", 3, "por_cursar", None, ""),
        ("inf-226", "INF", "2-2", "ELE-22", "Electiva II", 2, "por_cursar", None, "")
    ]

    cursor.executemany("""
    INSERT OR REPLACE INTO materias (id, carrera, trayecto_id, codigo, nombre, uc, estatus, nota, ref_doc)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, materias_seed)

    # Seed Evaluaciones Homologadas
    evaluaciones_seed = [
        # ADM 2-2
        ("eval-1", "adm-221", "Avance Capítulo I - PSI II", 25.0, 18.0, "2026-09-20", 1),
        ("eval-2", "adm-221", "Avance Capítulo II - Diagnóstico", 25.0, None, "2026-10-15", 0),
        ("eval-3", "adm-221", "Defensa Parcial", 50.0, None, "2026-11-10", 0),
        ("eval-4", "adm-223", "Taller Sistema de Costos por Órdenes", 30.0, 17.0, "2026-09-10", 1),
        ("eval-5", "adm-223", "Examen Parcial Costos por Procesos", 40.0, None, "2026-09-28", 0),
        ("eval-6", "adm-225", "Ensayo Presupuesto Público Ley ONAPRE", 30.0, 16.0, "2026-09-08", 1),

        # INF 1-1
        ("eval-inf-pst1", "inf-111", "Diagnóstico y Vinculación Comunitaria", 25.0, None, "2026-10-14", 0),
        ("eval-inf-pst2", "inf-111", "Levantamiento de Requerimientos Tecnológicos", 35.0, None, "2026-11-08", 0),
        ("eval-inf-pst3", "inf-111", "Defensa del Informe de Avance Módulo I", 40.0, None, "2026-11-30", 0),
        ("eval-inf-fsc1", "inf-112", "Tecnologías Libres y Soberanía Nacional", 30.0, None, "2026-10-16", 0),
        ("eval-inf-ayp1", "inf-113", "Lógica, Pseudocódigo y Diagramas de Flujo", 30.0, None, "2026-10-08", 0)
    ]

    cursor.executemany("""
    INSERT OR REPLACE INTO evaluaciones (id, materia_id, nombre, ponderacion, nota, fecha, completada)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    """, evaluaciones_seed)

    conn.commit()
    conn.close()
    print("Base de datos SQLite 'sistema_universitario.db' inicializada correctamente.")

if __name__ == "__main__":
    init_db()