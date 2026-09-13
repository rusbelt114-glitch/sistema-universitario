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
        { id: "inf-111", codigo: "INF-PSI1", nombre: "Proyecto Socio Tecnológico I - MI", uc: 9, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-112", codigo: "INF-AED1", nombre: "Algorítmica y Programación I", uc: 5, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-113", codigo: "INF-SOC1", nombre: "Sistemas Operativos", uc: 4, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-114", codigo: "INF-MAT1", nombre: "Matemática I", uc: 4, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-115", codigo: "INF-ARQ1", nombre: "Arquitectura del Computador", uc: 4, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-116", codigo: "INF-FSC1", nombre: "Formación Socio Crítica I", uc: 2, estatus: "por_cursar", nota: null, refDoc: "" }
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
    }
  ]
};

// Seed Evaluaciones Iniciales para Asignaturas en Curso 2-2
const EVALUACIONES_INICIALES = {
  "adm-221": [
    { id: "eval-1", nombre: "Avance Capítulo I - PSI II", ponderacion: 25, nota: 18, fecha: "2026-09-20", completada: true },
    { id: "eval-2", nombre: "Avance Capítulo II - Diagnóstico", ponderacion: 25, nota: null, fecha: "2026-10-15", completada: false },
    { id: "eval-3", nombre: "Defensa Parcial", ponderacion: 50, nota: null, fecha: "2026-11-10", completada: false }
  ],
  "adm-223": [
    { id: "eval-4", nombre: "Taller Sistema de Costos por Órdenes", ponderacion: 30, nota: 17, fecha: "2026-09-10", completada: true },
    { id: "eval-5", nombre: "Examen Parcial Costos por Procesos", ponderacion: 40, nota: null, fecha: "2026-09-28", completada: false },
    { id: "eval-6", nombre: "Trabajo Práctico Análisis Costo-Volumen", ponderacion: 30, nota: null, fecha: "2026-10-20", completada: false }
  ],
  "adm-225": [
    { id: "eval-7", nombre: "Ensayo Presupuesto Público Ley ONAPRE", ponderacion: 30, nota: 16, fecha: "2026-09-08", completada: true },
    { id: "eval-8", nombre: "Caso Práctico Presupuesto de Ventas y Producción", ponderacion: 35, nota: null, fecha: "2026-10-02", completada: false }
  ]
};

// Seed Horario por defecto
const HORARIO_DEFECTO = {
  A: [
    { id: "h1", dia: "Lunes", hora: "08:00 - 10:00", materia: "Proyecto Socio Integrador II (PSI-22)", aula: "Lab 3" },
    { id: "h2", dia: "Lunes", hora: "10:15 - 12:15", materia: "Formación Socio Crítica II (FSC-22)", aula: "Aula 12" },
    { id: "h3", dia: "Miércoles", hora: "08:00 - 10:00", materia: "Administración de Costos I", aula: "Aula 08" },
    { id: "h4", dia: "Miércoles", hora: "10:15 - 12:15", materia: "Presupuesto Público y Privado", aula: "Aula 08" },
    { id: "h5", dia: "Viernes", hora: "08:00 - 10:00", materia: "Gestión Ecológica Ambiental", aula: "Aula 05" },
    { id: "h6", dia: "Viernes", hora: "10:15 - 12:15", materia: "Habilidades Directivas I", aula: "Aula 05" }
  ],
  B: [
    { id: "h7", dia: "Martes", hora: "08:00 - 10:30", materia: "Algorítmica y Programación", aula: "Lab Computación 1" },
    { id: "h8", dia: "Martes", hora: "10:45 - 12:30", materia: "Sistemas Operativos", aula: "Lab Computación 2" },
    { id: "h9", dia: "Jueves", hora: "08:00 - 10:30", materia: "Bases de Datos I", aula: "Lab Computación 1" },
    { id: "h10", dia: "Jueves", hora: "10:45 - 12:30", materia: "Arquitectura del Computador", aula: "Aula 14" }
  ]
};
