/**
 * SISTEMA UNIVERSITARIO - SEED DATA
 * Pensum Oficial UNEXCA PNF Administración e Informática
 */
/* exported PENSUM_ADMINISTRACION, PENSUM_INFORMATICA, EVALUACIONES_INICIALES, HORARIO_DEFECTO */

const PENSUM_ADMINISTRACION = {
  carrera: "PNF EN ADMINISTRACIÓN",
  institucion: "UNEXCA",
  metaUC_TSU: 110,
  metaUC_Lic: 222,
  trayectos: [
    {
      id: "1-1",
      nombre: "Trayecto I - Fase I (1-1)",
      nivel: "TSU",
      totalUC: 29,
      materias: [
        { id: "adm-111", codigo: "PSI-11", nombre: "Proyecto Socio Integrador I - MI", uc: 9, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "adm-112", codigo: "FSC-11", nombre: "Formación Socio Crítica I - MI", uc: 4, estatus: "repetir", nota: null, refDoc: "Estatus condicionado / por definir" },
        { id: "adm-113", codigo: "CON-11", nombre: "Contabilidad I - MI", uc: 4, estatus: "repetir", nota: null, refDoc: "Materia por repetir" },
        { id: "adm-114", codigo: "FAD-11", nombre: "Fundamentos de la Administración - MI", uc: 4, estatus: "repetir", nota: null, refDoc: "Materia por repetir" },
        { id: "adm-115", codigo: "EST-11", nombre: "Estadística", uc: 2, estatus: "pendiente_consulta", nota: null, refDoc: "Pendiente por consulta oficial" },
        { id: "adm-116", codigo: "EOE-11", nombre: "Expresión Oral y Escrita", uc: 2, estatus: "pendiente_consulta", nota: null, refDoc: "Pendiente por consulta oficial" },
        { id: "adm-117", codigo: "MJ1-11", nombre: "Marco Jurídico 1", uc: 2, estatus: "pendiente_consulta", nota: null, refDoc: "Pendiente por consulta oficial" },
        { id: "adm-118", codigo: "TIC-11", nombre: "Tecnología de la Información y la Comunicación", uc: 2, estatus: "aprobada", nota: 16, refDoc: "DOC-20250714-WA0034..pdf" }
      ]
    },
    {
      id: "1-2",
      nombre: "Trayecto I - Fase II (1-2)",
      nivel: "TSU",
      totalUC: 29,
      materias: [
        { id: "adm-121", codigo: "PSI-12", nombre: "Proyecto Socio Integrador I - MII", uc: 9, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "adm-122", codigo: "FSC-12", nombre: "Formación Socio Crítica I - MII", uc: 4, estatus: "repetir", nota: null, refDoc: "Estatus condicionado / por definir" },
        { id: "adm-123", codigo: "CON-12", nombre: "Contabilidad I - MII", uc: 4, estatus: "repetir", nota: null, refDoc: "Materia por repetir" },
        { id: "adm-124", codigo: "FAD-12", nombre: "Fundamentos de la Administración - MII", uc: 4, estatus: "repetir", nota: null, refDoc: "Materia por repetir" },
        { id: "adm-125", codigo: "OPF-12", nombre: "Operaciones Financieras", uc: 2, estatus: "aprobada", nota: 15, refDoc: "HOJA DE ACTUACION OPERACIONES FINANCIERAS" },
        { id: "adm-126", codigo: "TPM-12", nombre: "Teoría y Prácticas del Mercadeo", uc: 2, estatus: "intensivo_verano", nota: null, refDoc: "Próximo período - Intensivo Verano" },
        { id: "adm-127", codigo: "DFC-12", nombre: "Deberes Formales del Contribuyente", uc: 2, estatus: "intensivo_verano", nota: null, refDoc: "Próximo período - Intensivo Verano" },
        { id: "adm-128", codigo: "ELE-12", nombre: "Electiva I", uc: 2, estatus: "pendiente_consulta", nota: null, refDoc: "Pendiente por consulta oficial" }
      ]
    },
    {
      id: "2-1",
      nombre: "Trayecto II - Fase I (2-1)",
      nivel: "TSU",
      totalUC: 27,
      materias: [
        { id: "adm-211", codigo: "PSI-21", nombre: "Proyecto Socio Integrador II - MI", uc: 9, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "adm-212", codigo: "FSC-21", nombre: "Formación Socio Crítica II - MI", uc: 4, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "adm-213", codigo: "CON-21", nombre: "Contabilidad II - MI", uc: 4, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "adm-214", codigo: "FEC-21", nombre: "Fundamentos de la Economía", uc: 2, estatus: "pendiente_consulta", nota: null, refDoc: "Pendiente por consulta oficial" },
        { id: "adm-215", codigo: "OYS-21", nombre: "Organización y Sistema", uc: 2, estatus: "aprobada", nota: 14, refDoc: "HOJA DE ACTUACION (1).xlsx" },
        { id: "adm-216", codigo: "GTH-21", nombre: "Gestión del Talento Humano", uc: 2, estatus: "aprobada", nota: 12.5, refDoc: "Promediada 12.5 pts" },
        { id: "adm-217", codigo: "MJ2-21", nombre: "Marco Jurídico II", uc: 2, estatus: "pendiente_consulta", nota: null, refDoc: "Pendiente por consulta oficial" },
        { id: "adm-218", codigo: "AAC-21", nombre: "Actividades Acreditables I", uc: 2, estatus: "aprobada", nota: 16, refDoc: "NOTAS1-2026 ALTAGRACIA.xlsx" }
      ]
    },
    {
      id: "2-2",
      nombre: "Trayecto II - Fase II (2-2) [FASE ACTUAL ACTIVA]",
      nivel: "TSU",
      totalUC: 25,
      actual: true,
      materias: [
        { id: "adm-221", codigo: "PSI-22", nombre: "Proyecto Socio Integrador II - MII", uc: 9, estatus: "en_curso", nota: null, refDoc: "Fase de culminación TSU" },
        { id: "adm-222", codigo: "FSC-22", nombre: "Formación Socio Crítica II - MII", uc: 4, estatus: "en_curso", nota: null, refDoc: "Fase de culminación TSU" },
        { id: "adm-223", codigo: "ACO-22", nombre: "Administración de Costos I", uc: 2, estatus: "en_curso", nota: null, refDoc: "Fase de culminación TSU" },
        { id: "adm-224", codigo: "GEA-22", nombre: "Gestión Ecológica Ambiental", uc: 2, estatus: "en_curso", nota: null, refDoc: "Fase de culminación TSU" },
        { id: "adm-225", codigo: "PPP-22", nombre: "Presupuesto Público y Privado", uc: 2, estatus: "en_curso", nota: null, refDoc: "Fase de culminación TSU" },
        { id: "adm-226", codigo: "HDI-22", nombre: "Habilidades Directivas I", uc: 2, estatus: "en_curso", nota: null, refDoc: "Fase de culminación TSU" },
        { id: "adm-227", codigo: "DF2-22", nombre: "Deberes Formales del Contribuyente II", uc: 2, estatus: "en_curso", nota: null, refDoc: "Fase de culminación TSU" },
        { id: "adm-228", codigo: "EL2-22", nombre: "Electiva II", uc: 2, estatus: "en_curso", nota: null, refDoc: "Fase de culminación TSU" }
      ]
    },
    {
      id: "3-1",
      nombre: "Trayecto III - Fase I (3-1)",
      nivel: "Licenciatura",
      totalUC: 28,
      materias: [
        { id: "adm-311", codigo: "PSI-31", nombre: "Proyecto Socio Integrador III - MI", uc: 9, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "adm-312", codigo: "SGC-31", nombre: "Sociocrítica: Gestión y Participación Social MI", uc: 4, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "adm-313", codigo: "AC2-31", nombre: "Administración de Costos II", uc: 2, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "adm-314", codigo: "SAD-31", nombre: "Sistemas Administrativos", uc: 3, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "adm-315", codigo: "PYG-31", nombre: "Planificación y Gestión", uc: 3, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "adm-316", codigo: "HD2-31", nombre: "Habilidades Directivas II", uc: 2, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "adm-317", codigo: "AA2-31", nombre: "Actividad Acreditable II", uc: 2, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "adm-318", codigo: "CGU-31", nombre: "Contabilidad Gubernamental", uc: 3, estatus: "por_cursar", nota: null, refDoc: "" }
      ]
    },
    {
      id: "3-2",
      nombre: "Trayecto III - Fase II (3-2)",
      nivel: "Licenciatura",
      totalUC: 30,
      materias: [
        { id: "adm-321", codigo: "PSI-32", nombre: "Proyecto Socio Integrador III - MII", uc: 9, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "adm-322", codigo: "SGC-32", nombre: "Sociocrítica: Gestión y Participación Social MII", uc: 4, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "adm-323", codigo: "ADP-32", nombre: "Administración de la Producción", uc: 4, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "adm-324", codigo: "FEP-32", nombre: "Formulación y Evaluación de Proyectos", uc: 3, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "adm-325", codigo: "AEF-32", nombre: "Análisis e Interpretación de Estados Financieros", uc: 4, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "adm-326", codigo: "ADM-32", nombre: "Administración del Mercadeo", uc: 2, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "adm-327", codigo: "ES2-32", nombre: "Estadística II", uc: 2, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "adm-328", codigo: "EL3-32", nombre: "Electiva III", uc: 2, estatus: "por_cursar", nota: null, refDoc: "" }
      ]
    },
    {
      id: "4-1",
      nombre: "Trayecto IV - Fase I (4-1)",
      nivel: "Licenciatura",
      totalUC: 30,
      materias: [
        { id: "adm-411", codigo: "PSI-41", nombre: "Proyecto Socio Integrador IV - MI", uc: 9, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "adm-412", codigo: "SGC-41", nombre: "Sociocrítica: Gestión y Participación Social MI", uc: 4, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "adm-413", codigo: "ADF-41", nombre: "Administración Financiera", uc: 4, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "adm-414", codigo: "INO-41", nombre: "Investigación de Operaciones", uc: 4, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "adm-415", codigo: "SFI-41", nombre: "Sistemas Financieros", uc: 3, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "adm-416", codigo: "EL4-41", nombre: "Electiva IV", uc: 2, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "adm-417", codigo: "PIA-41", nombre: "Paquetes Informáticos Aplicados a la Administración", uc: 2, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "adm-418", codigo: "AA3-41", nombre: "Actividad Acreditable III", uc: 2, estatus: "por_cursar", nota: null, refDoc: "" }
      ]
    },
    {
      id: "4-2",
      nombre: "Trayecto IV - Fase II (4-2)",
      nivel: "Licenciatura",
      totalUC: 24,
      materias: [
        { id: "adm-421", codigo: "PSI-42", nombre: "Proyecto Socio Integrador IV - MII", uc: 9, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "adm-422", codigo: "SGC-42", nombre: "Sociocrítica: Gestión y Participación Social MII", uc: 4, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "adm-423", codigo: "AUD-42", nombre: "Auditoría Administrativa", uc: 4, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "adm-424", codigo: "GPU-42", nombre: "Gestión Pública", uc: 3, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "adm-425", codigo: "CGA-42", nombre: "Control de Gestión Administrativa", uc: 4, estatus: "por_cursar", nota: null, refDoc: "" }
      ]
    }
  ]
};

const PENSUM_INFORMATICA = {
  carrera: "PNF EN INFORMÁTICA",
  institucion: "UNEXCA",
  metaUC_TSU: 110,
  metaUC_Lic: 220,
  trayectos: [
    {
      id: "inf-11",
      nombre: "Trayecto I - Fase I (1-1)",
      nivel: "TSU",
      totalUC: 28,
      materias: [
        { id: "inf-111", codigo: "INF-PSI1", nombre: "Proyecto Socio Tecnológico I - MI", uc: 9, estatus: "en_curso", nota: null, refDoc: "" },
        { id: "inf-112", codigo: "INF-AED1", nombre: "Algorítmica y Programación I", uc: 5, estatus: "en_curso", nota: null, refDoc: "" },
        { id: "inf-113", codigo: "INF-SOC1", nombre: "Sistemas Operativos", uc: 4, estatus: "en_curso", nota: null, refDoc: "" },
        { id: "inf-114", codigo: "INF-MAT1", nombre: "Matemática I", uc: 4, estatus: "en_curso", nota: null, refDoc: "" },
        { id: "inf-115", codigo: "INF-ARQ1", nombre: "Arquitectura del Computador", uc: 4, estatus: "en_curso", nota: null, refDoc: "" },
        { id: "inf-116", codigo: "INF-FSC1", nombre: "Formación Socio Crítica I", uc: 2, estatus: "en_curso", nota: null, refDoc: "" }
      ]
    },
    {
      id: "inf-12",
      nombre: "Trayecto I - Fase II (1-2)",
      nivel: "TSU",
      totalUC: 28,
      materias: [
        { id: "inf-121", codigo: "INF-PSI2", nombre: "Proyecto Socio Tecnológico I - MII", uc: 9, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-122", codigo: "INF-AED2", nombre: "Algorítmica y Programación II", uc: 5, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-123", codigo: "INF-BD1", nombre: "Bases de Datos I", uc: 4, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-124", codigo: "INF-RED1", nombre: "Redes de Computadoras I", uc: 4, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-125", codigo: "INF-ING1", nombre: "Ingeniería del Software I", uc: 4, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-126", codigo: "INF-ELE1", nombre: "Electiva I Informática", uc: 2, estatus: "por_cursar", nota: null, refDoc: "" }
      ]
    },
    {
      id: "inf-21",
      nombre: "Trayecto II - Fase I (2-1)",
      nivel: "TSU",
      totalUC: 28,
      materias: [
        { id: "inf-211", codigo: "INF-PSI3", nombre: "Proyecto Socio Tecnológico II - MI", uc: 9, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-212", codigo: "INF-POO1", nombre: "Programación Orientada a Objetos", uc: 5, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-213", codigo: "INF-BD2", nombre: "Bases de Datos II", uc: 4, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-214", codigo: "INF-RED2", nombre: "Redes de Computadoras II", uc: 4, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-215", codigo: "INF-ING2", nombre: "Ingeniería del Software II", uc: 4, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-216", codigo: "INF-ELE2", nombre: "Electiva II Informática", uc: 2, estatus: "por_cursar", nota: null, refDoc: "" }
      ]
    },
    {
      id: "inf-22",
      nombre: "Trayecto II - Fase II (2-2)",
      nivel: "TSU",
      totalUC: 26,
      materias: [
        { id: "inf-221", codigo: "INF-PSI4", nombre: "Proyecto Socio Tecnológico II - MII", uc: 9, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-222", codigo: "INF-WEB1", nombre: "Desarrollo Web", uc: 5, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-223", codigo: "INF-SEG1", nombre: "Seguridad Informática", uc: 4, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-224", codigo: "INF-SIS1", nombre: "Sistemas Distribuidos", uc: 4, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-225", codigo: "INF-AAC1", nombre: "Actividades Acreditables I", uc: 4, estatus: "por_cursar", nota: null, refDoc: "" }
      ]
    },
    {
      id: "inf-31",
      nombre: "Trayecto III - Fase I (3-1)",
      nivel: "Ingeniería",
      totalUC: 28,
      materias: [
        { id: "inf-311", codigo: "INF-PSI5", nombre: "Proyecto Socio Tecnológico III - MI", uc: 9, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-312", codigo: "INF-MOD1", nombre: "Modelado de Sistemas", uc: 5, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-313", codigo: "INF-AUD1", nombre: "Auditoría Informática", uc: 4, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-314", codigo: "INF-GES1", nombre: "Gestión de Proyectos Informáticos", uc: 5, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-315", codigo: "INF-ELE3", nombre: "Electiva III Informática", uc: 5, estatus: "por_cursar", nota: null, refDoc: "" }
      ]
    },
    {
      id: "inf-32",
      nombre: "Trayecto III - Fase II (3-2)",
      nivel: "Ingeniería",
      totalUC: 26,
      materias: [
        { id: "inf-321", codigo: "INF-PSI6", nombre: "Proyecto Socio Tecnológico III - MII", uc: 9, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-322", codigo: "INF-IA1", nombre: "Inteligencia Artificial", uc: 5, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-323", codigo: "INF-CAL1", nombre: "Calidad del Software", uc: 4, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-324", codigo: "INF-TEL1", nombre: "Teleprocesamiento", uc: 4, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-325", codigo: "INF-AAC2", nombre: "Actividades Acreditables II", uc: 4, estatus: "por_cursar", nota: null, refDoc: "" }
      ]
    },
    {
      id: "inf-41",
      nombre: "Trayecto IV - Fase I (4-1)",
      nivel: "Ingeniería",
      totalUC: 28,
      materias: [
        { id: "inf-411", codigo: "INF-PSI7", nombre: "Proyecto Socio Tecnológico IV - MI", uc: 9, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-412", codigo: "INF-OPT1", nombre: "Optimización de Algoritmos", uc: 5, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-413", codigo: "INF-ARQ2", nombre: "Arquitectura de Software", uc: 5, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-414", codigo: "INF-GOB1", nombre: "Gobierno de Tecnologías de Información", uc: 5, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-415", codigo: "INF-ELE4", nombre: "Electiva IV Informática", uc: 4, estatus: "por_cursar", nota: null, refDoc: "" }
      ]
    },
    {
      id: "inf-42",
      nombre: "Trayecto IV - Fase II (4-2)",
      nivel: "Ingeniería",
      totalUC: 24,
      materias: [
        { id: "inf-421", codigo: "INF-PSI8", nombre: "Proyecto Socio Tecnológico IV - MII (Grado)", uc: 12, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-422", codigo: "INF-SEG2", nombre: "Seguridad de la Información Avanzada", uc: 6, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-423", codigo: "INF-CGR4", nombre: "Trabajo Especial de Grado / Ingeniería", uc: 6, estatus: "por_cursar", nota: null, refDoc: "" }
      ]
    }
  ]
};

// Seed Evaluaciones Iniciales para Asignaturas en Curso (Administración 2-2 e Informática 1-1)
const EVALUACIONES_INICIALES = {
  // PNF Administración 2-2
  "adm-221": [
    { id: "eval-1", nombre: "Avance Capítulo I - PSI II", ponderacion: 25, nota: 18, fecha: "2026-09-20", completada: true },
    { id: "eval-2", nombre: "Avance Capítulo II - Diagnóstico", ponderacion: 25, nota: null, fecha: "2026-10-15", completada: false },
    { id: "eval-3", nombre: "Defensa Parcial", ponderacion: 50, nota: null, fecha: "2026-11-10", completada: false }
  ],
  "adm-222": [
    { id: "eval-adm-fsc1", nombre: "Ensayo Crítico Geopolítica y Soberanía", ponderacion: 30, nota: null, fecha: "2026-10-05", completada: false },
    { id: "eval-adm-fsc2", nombre: "Debate Participación Comunitaria", ponderacion: 35, nota: null, fecha: "2026-10-25", completada: false },
    { id: "eval-adm-fsc3", nombre: "Informe Final de Vinculación Social", ponderacion: 35, nota: null, fecha: "2026-11-18", completada: false }
  ],
  "adm-223": [
    { id: "eval-4", nombre: "Taller Sistema de Costos por Órdenes", ponderacion: 30, nota: 17, fecha: "2026-09-10", completada: true },
    { id: "eval-5", nombre: "Examen Parcial Costos por Procesos", ponderacion: 40, nota: null, fecha: "2026-09-28", completada: false },
    { id: "eval-6", nombre: "Trabajo Práctico Análisis Costo-Volumen", ponderacion: 30, nota: null, fecha: "2026-10-20", completada: false }
  ],
  "adm-224": [
    { id: "eval-adm-gea1", nombre: "Diagnóstico Ambiental Organizacional", ponderacion: 30, nota: null, fecha: "2026-10-08", completada: false },
    { id: "eval-adm-gea2", nombre: "Plan de Gestión de Residuos y Huella", ponderacion: 35, nota: null, fecha: "2026-10-28", completada: false },
    { id: "eval-adm-gea3", nombre: "Exposición Marco Legal Ambiental", ponderacion: 35, nota: null, fecha: "2026-11-15", completada: false }
  ],
  "adm-225": [
    { id: "eval-7", nombre: "Ensayo Presupuesto Público Ley ONAPRE", ponderacion: 30, nota: 16, fecha: "2026-09-08", completada: true },
    { id: "eval-8", nombre: "Caso Práctico Presupuesto de Ventas y Producción", ponderacion: 35, nota: null, fecha: "2026-10-02", completada: false },
    { id: "eval-adm-ppp3", nombre: "Defensa Cédulas Presupuestarias", ponderacion: 35, nota: null, fecha: "2026-11-05", completada: false }
  ],
  "adm-226": [
    { id: "eval-adm-hdi1", nombre: "Dinámica de Liderazgo y Equipos", ponderacion: 30, nota: null, fecha: "2026-10-12", completada: false },
    { id: "eval-adm-hdi2", nombre: "Simulación de Negociación y Conflictos", ponderacion: 35, nota: null, fecha: "2026-10-30", completada: false },
    { id: "eval-adm-hdi3", nombre: "Test y Plan de Desarrollo Directivo", ponderacion: 35, nota: null, fecha: "2026-11-20", completada: false }
  ],
  "adm-227": [
    { id: "eval-adm-df21", nombre: "Declaración Retenciones IVA / ISLR", ponderacion: 35, nota: null, fecha: "2026-10-10", completada: false },
    { id: "eval-adm-df22", nombre: "Caso Práctico Libros Fiscales", ponderacion: 35, nota: null, fecha: "2026-10-29", completada: false },
    { id: "eval-adm-df23", nombre: "Prueba Teórico-Práctica COT", ponderacion: 30, nota: null, fecha: "2026-11-12", completada: false }
  ],
  "adm-228": [
    { id: "eval-adm-el21", nombre: "Taller Práctico Aplicado", ponderacion: 50, nota: null, fecha: "2026-10-20", completada: false },
    { id: "eval-adm-el22", nombre: "Proyecto Integrador Electiva", ponderacion: 50, nota: null, fecha: "2026-11-18", completada: false }
  ],

  // PNF Informática 1-1 (Inicio de Cursado)
  "inf-111": [
    { id: "eval-inf-psi1", nombre: "Diagnóstico y Abordaje Comunitario", ponderacion: 25, nota: null, fecha: "2026-10-10", completada: false },
    { id: "eval-inf-psi2", nombre: "Levantamiento de Requerimientos del Sistema", ponderacion: 35, nota: null, fecha: "2026-11-05", completada: false },
    { id: "eval-inf-psi3", nombre: "Prototipo Inicial y Defensa de Avance", ponderacion: 40, nota: null, fecha: "2026-11-28", completada: false }
  ],
  "inf-112": [
    { id: "eval-inf-aed1", nombre: "Taller de Diagramas de Flujo y Pseudocódigo", ponderacion: 25, nota: null, fecha: "2026-10-02", completada: false },
    { id: "eval-inf-aed2", nombre: "Parcial I: Estructuras de Control y Bucles", ponderacion: 35, nota: null, fecha: "2026-10-22", completada: false },
    { id: "eval-inf-aed3", nombre: "Parcial II: Arreglos, Matrices y Funciones", ponderacion: 40, nota: null, fecha: "2026-11-19", completada: false }
  ],
  "inf-113": [
    { id: "eval-inf-soc1", nombre: "Laboratorio I: Comandos Shell Linux / Bash", ponderacion: 30, nota: null, fecha: "2026-10-08", completada: false },
    { id: "eval-inf-soc2", nombre: "Examen: Gestión de Procesos y Memoria", ponderacion: 35, nota: null, fecha: "2026-10-29", completada: false },
    { id: "eval-inf-soc3", nombre: "Laboratorio II: Permisos y Sistemas de Archivos", ponderacion: 35, nota: null, fecha: "2026-11-17", completada: false }
  ],
  "inf-114": [
    { id: "eval-inf-mat1", nombre: "Prueba Corta: Álgebra, Ecuaciones y Funciones", ponderacion: 30, nota: null, fecha: "2026-10-06", completada: false },
    { id: "eval-inf-mat2", nombre: "Examen Parcial: Matrices, Determinantes y Sistemas", ponderacion: 35, nota: null, fecha: "2026-10-27", completada: false },
    { id: "eval-inf-mat3", nombre: "Taller Práctico: Lógica Proposicional y Conjuntos", ponderacion: 35, nota: null, fecha: "2026-11-21", completada: false }
  ],
  "inf-115": [
    { id: "eval-inf-arq1", nombre: "Informe Técnico: Arquitectura de Von Neumann y Buses", ponderacion: 30, nota: null, fecha: "2026-10-09", completada: false },
    { id: "eval-inf-arq2", nombre: "Taller: Sistemas de Numeración y Álgebra Booleana", ponderacion: 35, nota: null, fecha: "2026-10-31", completada: false },
    { id: "eval-inf-arq3", nombre: "Práctica: Ensamble, Mantenimiento y Microprocesadores", ponderacion: 35, nota: null, fecha: "2026-11-24", completada: false }
  ],
  "inf-116": [
    { id: "eval-inf-fsc1", nombre: "Ensayo: Tecnologías Libres y Soberanía Nacional", ponderacion: 30, nota: null, fecha: "2026-10-14", completada: false },
    { id: "eval-inf-fsc2", nombre: "Mesa Redonda: Ética y Ley de Delitos Informáticos", ponderacion: 35, nota: null, fecha: "2026-11-04", completada: false },
    { id: "eval-inf-fsc3", nombre: "Proyecto Comunitario de Alfabetización Digital", ponderacion: 35, nota: null, fecha: "2026-11-26", completada: false }
  ]
};

// Mapa de Prelaciones Académicas UNEXCA
const MAPA_PRELACIONES = {
  ADM: {
    "adm-113": { prelaA: ["adm-123", "adm-213", "adm-223"], nombre: "Contabilidad I - MI" },
    "adm-123": { prelaA: ["adm-213", "adm-223"], nombre: "Contabilidad I - MII" },
    "adm-114": { prelaA: ["adm-124", "adm-215", "adm-314"], nombre: "Fundamentos de la Adm MI" },
    "adm-124": { prelaA: ["adm-215", "adm-314"], nombre: "Fundamentos de la Adm MII" },
    "adm-111": { prelaA: ["adm-121", "adm-211", "adm-221"], nombre: "Proyecto Socio Integrador I" },
    "adm-112": { prelaA: ["adm-122", "adm-212", "adm-222"], nombre: "Formación Socio Crítica I" }
  },
  INF: {
    "inf-112": { prelaA: ["inf-122", "inf-212", "inf-222"], nombre: "Algorítmica y Programación I" },
    "inf-122": { prelaA: ["inf-212", "inf-222"], nombre: "Algorítmica y Programación II" },
    "inf-114": { prelaA: ["inf-210", "inf-312", "inf-412"], nombre: "Matemática I" },
    "inf-111": { prelaA: ["inf-121", "inf-211", "inf-221"], nombre: "Proyecto Socio Tecnológico I" },
    "inf-113": { prelaA: ["inf-124", "inf-224"], nombre: "Sistemas Operativos" },
    "inf-123": { prelaA: ["inf-213"], nombre: "Bases de Datos I" }
  }
};

// Horario por defecto
const HORARIO_DEFECTO = {
  ADM: { A: [], B: [] },
  INF: { A: [], B: [] }
};

