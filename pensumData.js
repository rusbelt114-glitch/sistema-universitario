/**
 * SISTEMA UNIVERSITARIO - SEED DATA
 * Pensum Oficial UNEXCA PNF Administración e Informática
 */
/* exported PENSUM_ADMINISTRACION, PENSUM_INFORMATICA, EVALUACIONES_INICIALES, HORARIO_DEFECTO, MAPA_PRELACIONES */

const PENSUM_ADMINISTRACION = {
  carrera: "PNF EN ADMINISTRACIÓN",
  institucion: "UNEXCA",
  metaUC_TSU: 110,
  metaUC_Lic: 222,
  trayectos: [
    // 🟦 TRAYECTO I
    {
      id: "1-1",
      nombre: "Trayecto I - Semestre I (1-1)",
      nivel: "TSU",
      totalUC: 29,
      materias: [
        { id: "adm-111", codigo: "PSI-11", nombre: "Proyecto Socio Integrador I - Módulo I", uc: 9, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "adm-112", codigo: "FSC-11", nombre: "Formación Sociocrítica I - Módulo I", uc: 4, estatus: "repetir", nota: null, refDoc: "Estatus condicionado / por definir" },
        { id: "adm-113", codigo: "CON-11", nombre: "Contabilidad I - Módulo I", uc: 4, estatus: "repetir", nota: null, refDoc: "Materia por repetir" },
        { id: "adm-114", codigo: "FAD-11", nombre: "Fundamentos de la Administración - Módulo I", uc: 4, estatus: "repetir", nota: null, refDoc: "Materia por repetir" },
        { id: "adm-115", codigo: "EST-11", nombre: "Estadística", uc: 2, estatus: "pendiente_consulta", nota: null, refDoc: "Pendiente por consulta oficial" },
        { id: "adm-116", codigo: "EOE-11", nombre: "Expresión Oral y Escrita", uc: 2, estatus: "pendiente_consulta", nota: null, refDoc: "Pendiente por consulta oficial" },
        { id: "adm-117", codigo: "MJ1-11", nombre: "Marco Jurídico I", uc: 2, estatus: "pendiente_consulta", nota: null, refDoc: "Pendiente por consulta oficial" },
        { id: "adm-118", codigo: "TIC-11", nombre: "Tecnología de la Información y la Comunicación", uc: 2, estatus: "aprobada", nota: 16, refDoc: "DOC-20250714-WA0034..pdf" }
      ]
    },
    {
      id: "1-2",
      nombre: "Trayecto I - Semestre II (1-2)",
      nivel: "TSU",
      totalUC: 29,
      materias: [
        { id: "adm-121", codigo: "PSI-12", nombre: "Proyecto Socio Integrador I - Módulo II", uc: 9, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "adm-122", codigo: "FSC-12", nombre: "Formación Sociocrítica I - Módulo II", uc: 4, estatus: "repetir", nota: null, refDoc: "Estatus condicionado / por definir" },
        { id: "adm-123", codigo: "CON-12", nombre: "Contabilidad I - Módulo II", uc: 4, estatus: "repetir", nota: null, refDoc: "Materia por repetir" },
        { id: "adm-124", codigo: "FAD-12", nombre: "Fundamentos de la Administración - Módulo II", uc: 4, estatus: "repetir", nota: null, refDoc: "Materia por repetir" },
        { id: "adm-125", codigo: "OPF-12", nombre: "Operaciones Financieras", uc: 2, estatus: "aprobada", nota: 15, refDoc: "HOJA DE ACTUACION OPERACIONES FINANCIERAS" },
        { id: "adm-126", codigo: "TPM-12", nombre: "Teoría y Prácticas del Mercadeo", uc: 2, estatus: "intensivo_verano", nota: null, refDoc: "Próximo período - Intensivo Verano" },
        { id: "adm-127", codigo: "DFC-12", nombre: "Deberes Formales del Contribuyente", uc: 2, estatus: "intensivo_verano", nota: null, refDoc: "Próximo período - Intensivo Verano" },
        { id: "adm-128", codigo: "ELE-12", nombre: "Electiva I", uc: 2, estatus: "pendiente_consulta", nota: null, refDoc: "Pendiente por consulta oficial" }
      ]
    },

    // 🟩 TRAYECTO II
    {
      id: "2-1",
      nombre: "Trayecto II - Semestre I (2-1)",
      nivel: "TSU",
      totalUC: 27,
      materias: [
        { id: "adm-211", codigo: "PSI-21", nombre: "Proyecto Socio Integrador II - Módulo I", uc: 9, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "adm-212", codigo: "FSC-21", nombre: "Formación Sociocrítica II - Módulo I", uc: 4, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "adm-213", codigo: "CON-21", nombre: "Contabilidad II - Módulo I", uc: 4, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "adm-214", codigo: "FEC-21", nombre: "Fundamentos de la Economía", uc: 2, estatus: "pendiente_consulta", nota: null, refDoc: "Pendiente por consulta oficial" },
        { id: "adm-215", codigo: "OYS-21", nombre: "Organización y Sistema", uc: 2, estatus: "aprobada", nota: 14, refDoc: "HOJA DE ACTUACION (1).xlsx" },
        { id: "adm-216", codigo: "GTH-21", nombre: "Gestión del Talento Humano", uc: 2, estatus: "aprobada", nota: 12.5, refDoc: "Promediada 12.5 pts" },
        { id: "adm-217", codigo: "MJ2-21", nombre: "Marco Jurídico II", uc: 2, estatus: "pendiente_consulta", nota: null, refDoc: "Pendiente por consulta oficial" },
        { id: "adm-218", codigo: "AAC-21", nombre: "Actividades Acreditables I", uc: 2, estatus: "aprobada", nota: 16, refDoc: "NOTAS1-2026 ALTAGRACIA.xlsx" }
      ]
    },
    {
      id: "2-2",
      nombre: "Trayecto II - Semestre II (2-2)",
      nivel: "TSU",
      totalUC: 25,
      actual: true,
      materias: [
        { id: "adm-221", codigo: "PSI-22", nombre: "Proyecto Socio Integrador II - Módulo II", uc: 9, estatus: "en_curso", nota: null, refDoc: "Fase de culminación TSU" },
        { id: "adm-222", codigo: "FSC-22", nombre: "Formación Sociocrítica II - Módulo II", uc: 4, estatus: "en_curso", nota: null, refDoc: "Fase de culminación TSU" },
        { id: "adm-223", codigo: "ACO-22", nombre: "Administración de Costos I", uc: 2, estatus: "en_curso", nota: null, refDoc: "Fase de culminación TSU" },
        { id: "adm-224", codigo: "GEA-22", nombre: "Gestión Ecológica Ambiental", uc: 2, estatus: "en_curso", nota: null, refDoc: "Fase de culminación TSU" },
        { id: "adm-225", codigo: "PPP-22", nombre: "Presupuesto Público y Privado", uc: 2, estatus: "en_curso", nota: null, refDoc: "Fase de culminación TSU" },
        { id: "adm-226", codigo: "HDI-22", nombre: "Habilidades Directivas I", uc: 2, estatus: "en_curso", nota: null, refDoc: "Fase de culminación TSU" },
        { id: "adm-227", codigo: "DF2-22", nombre: "Deberes Formales del Contribuyente II", uc: 2, estatus: "en_curso", nota: null, refDoc: "Fase de culminación TSU" },
        { id: "adm-228", codigo: "ELE-22", nombre: "Electiva II", uc: 2, estatus: "en_curso", nota: null, refDoc: "Fase de culminación TSU" }
      ]
    },

    // 🟨 TRAYECTO III
    {
      id: "3-1",
      nombre: "Trayecto III - Semestre I (3-1)",
      nivel: "Licenciatura",
      totalUC: 28,
      materias: [
        { id: "adm-311", codigo: "PSI-31", nombre: "Proyecto Socio Integrador III - Módulo I", uc: 9, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "adm-312", codigo: "SGC-31", nombre: "Sociocrítica: Gestión y Participación Social - Módulo I", uc: 4, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "adm-313", codigo: "AC2-31", nombre: "Administración de Costos II", uc: 2, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "adm-314", codigo: "SAD-31", nombre: "Sistemas Administrativos", uc: 3, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "adm-315", codigo: "PYG-31", nombre: "Planificación y Gestión", uc: 3, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "adm-316", codigo: "HD2-31", nombre: "Habilidades Directivas II", uc: 2, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "adm-317", codigo: "AAC-31", nombre: "Actividades Acreditables II", uc: 2, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "adm-318", codigo: "CGU-31", nombre: "Contabilidad Gubernamental", uc: 3, estatus: "por_cursar", nota: null, refDoc: "" }
      ]
    },
    {
      id: "3-2",
      nombre: "Trayecto III - Semestre II (3-2)",
      nivel: "Licenciatura",
      totalUC: 30,
      materias: [
        { id: "adm-321", codigo: "PSI-32", nombre: "Proyecto Socio Integrador III - Módulo II", uc: 9, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "adm-322", codigo: "SGC-32", nombre: "Sociocrítica: Gestión y Participación Social - Módulo II", uc: 4, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "adm-323", codigo: "ADP-32", nombre: "Administración de la Producción", uc: 4, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "adm-324", codigo: "FEP-32", nombre: "Formulación y Evaluación de Proyectos", uc: 3, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "adm-325", codigo: "AEF-32", nombre: "Análisis e Interpretación de Estados Financieros", uc: 4, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "adm-326", codigo: "ADM-32", nombre: "Administración del Mercadeo", uc: 2, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "adm-327", codigo: "ES2-32", nombre: "Estadística II", uc: 2, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "adm-328", codigo: "ELE-32", nombre: "Electiva III", uc: 2, estatus: "por_cursar", nota: null, refDoc: "" }
      ]
    },

    // 🟥 TRAYECTO IV
    {
      id: "4-1",
      nombre: "Trayecto IV - Semestre I (4-1)",
      nivel: "Licenciatura",
      totalUC: 30,
      materias: [
        { id: "adm-411", codigo: "PSI-41", nombre: "Proyecto Socio Integrador IV - Módulo I", uc: 9, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "adm-412", codigo: "SGC-41", nombre: "Sociocrítica: Gestión y Participación Social - Módulo I", uc: 4, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "adm-413", codigo: "ADF-41", nombre: "Administración Financiera", uc: 4, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "adm-414", codigo: "INO-41", nombre: "Investigación de Operaciones", uc: 4, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "adm-415", codigo: "SFI-41", nombre: "Sistemas Financieros", uc: 3, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "adm-416", codigo: "PIA-41", nombre: "Paquetes Informáticos Aplicados a la Administración", uc: 2, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "adm-417", codigo: "ELE-41", nombre: "Electiva IV", uc: 2, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "adm-418", codigo: "AAC-41", nombre: "Actividades Acreditables III", uc: 2, estatus: "por_cursar", nota: null, refDoc: "" }
      ]
    },
    {
      id: "4-2",
      nombre: "Trayecto IV - Semestre II (4-2)",
      nivel: "Licenciatura",
      totalUC: 24,
      materias: [
        { id: "adm-421", codigo: "PSI-42", nombre: "Proyecto Socio Integrador IV - Módulo II", uc: 9, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "adm-422", codigo: "SGC-42", nombre: "Sociocrítica: Gestión y Participación Social - Módulo II", uc: 4, estatus: "por_cursar", nota: null, refDoc: "" },
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
  metaUC_Lic: 218,
  trayectos: [
    // 🟦 TRAYECTO I
    {
      id: "1-1",
      nombre: "Trayecto I - Semestre I (1-1)",
      nivel: "TSU",
      totalUC: 28,
      actual: true,
      materias: [
        { id: "inf-111", codigo: "PST-11", nombre: "Proyecto Socio Tecnológico I - Módulo I", uc: 9, estatus: "en_curso", nota: null, refDoc: "" },
        { id: "inf-112", codigo: "FSC-11", nombre: "Formación Sociocrítica I - Módulo I", uc: 3, estatus: "en_curso", nota: null, refDoc: "" },
        { id: "inf-113", codigo: "AYP-11", nombre: "Algorítmica y Programación - Módulo I", uc: 4, estatus: "en_curso", nota: null, refDoc: "" },
        { id: "inf-114", codigo: "ADC-11", nombre: "Arquitectura del Computador - Módulo I", uc: 4, estatus: "en_curso", nota: null, refDoc: "" },
        { id: "inf-115", codigo: "MAT-11", nombre: "Matemática I - Módulo I", uc: 4, estatus: "en_curso", nota: null, refDoc: "" },
        { id: "inf-116", codigo: "ING-11", nombre: "Inglés I - Módulo I", uc: 2, estatus: "en_curso", nota: null, refDoc: "" },
        { id: "inf-117", codigo: "AAC-11", nombre: "Actividades Acreditables I", uc: 2, estatus: "en_curso", nota: null, refDoc: "" }
      ]
    },
    {
      id: "1-2",
      nombre: "Trayecto I - Semestre II (1-2)",
      nivel: "TSU",
      totalUC: 28,
      materias: [
        { id: "inf-121", codigo: "PST-12", nombre: "Proyecto Socio Tecnológico I - Módulo II", uc: 9, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-122", codigo: "FSC-12", nombre: "Formación Sociocrítica I - Módulo II", uc: 3, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-123", codigo: "AYP-12", nombre: "Algorítmica y Programación - Módulo II", uc: 4, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-124", codigo: "ADC-12", nombre: "Arquitectura del Computador - Módulo II", uc: 4, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-125", codigo: "MAT-12", nombre: "Matemática I - Módulo II", uc: 4, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-126", codigo: "ING-12", nombre: "Inglés I - Módulo II", uc: 2, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-127", codigo: "ELE-12", nombre: "Electiva I", uc: 2, estatus: "por_cursar", nota: null, refDoc: "" }
      ]
    },

    // 🟩 TRAYECTO II
    {
      id: "2-1",
      nombre: "Trayecto II - Semestre I (2-1)",
      nivel: "TSU",
      totalUC: 29,
      materias: [
        { id: "inf-211", codigo: "PST-21", nombre: "Proyecto Socio Tecnológico II - Módulo I", uc: 9, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-212", codigo: "FSC-21", nombre: "Formación Sociocrítica II - Módulo I", uc: 3, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-213", codigo: "PR1-21", nombre: "Programación I - Módulo I", uc: 4, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-214", codigo: "IDS-21", nombre: "Ingeniería de Software I", uc: 4, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-215", codigo: "MAT-21", nombre: "Matemática II", uc: 4, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-216", codigo: "RDC-21", nombre: "Redes de Computadoras", uc: 3, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-217", codigo: "AAC-21", nombre: "Actividades Acreditables II", uc: 2, estatus: "por_cursar", nota: null, refDoc: "" }
      ]
    },
    {
      id: "2-2",
      nombre: "Trayecto II - Semestre II (2-2)",
      nivel: "TSU",
      totalUC: 25,
      materias: [
        { id: "inf-221", codigo: "PST-22", nombre: "Proyecto Socio Tecnológico II - Módulo II", uc: 9, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-222", codigo: "FSC-22", nombre: "Formación Sociocrítica II - Módulo II", uc: 3, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-223", codigo: "PR1-22", nombre: "Programación I - Módulo II", uc: 4, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-224", codigo: "IDS-22", nombre: "Ingeniería de Software II", uc: 4, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-225", codigo: "BDD-22", nombre: "Base de Datos", uc: 3, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-226", codigo: "ELE-22", nombre: "Electiva II", uc: 2, estatus: "por_cursar", nota: null, refDoc: "" }
      ]
    },

    // 🟨 TRAYECTO III
    {
      id: "3-1",
      nombre: "Trayecto III - Semestre I (3-1)",
      nivel: "Ingeniería",
      totalUC: 29,
      materias: [
        { id: "inf-311", codigo: "PST-31", nombre: "Proyecto Socio Tecnológico III - Módulo I", uc: 9, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-312", codigo: "FSC-31", nombre: "Formación Sociocrítica III - Módulo I", uc: 3, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-313", codigo: "PR2-31", nombre: "Programación II", uc: 4, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-314", codigo: "IS2-31", nombre: "Ingeniería de Software II - Módulo I", uc: 4, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-315", codigo: "SO-31", nombre: "Sistemas Operativos", uc: 4, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-316", codigo: "MAP-31", nombre: "Matemática Aplicada", uc: 3, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-317", codigo: "AAC-31", nombre: "Actividades Acreditables III", uc: 2, estatus: "por_cursar", nota: null, refDoc: "" }
      ]
    },
    {
      id: "3-2",
      nombre: "Trayecto III - Semestre II (3-2)",
      nivel: "Ingeniería",
      totalUC: 25,
      materias: [
        { id: "inf-321", codigo: "PST-32", nombre: "Proyecto Socio Tecnológico III - Módulo II", uc: 9, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-322", codigo: "FSC-32", nombre: "Formación Sociocrítica III - Módulo II", uc: 3, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-323", codigo: "IS2-32", nombre: "Ingeniería de Software II - Módulo II", uc: 4, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-324", codigo: "INO-32", nombre: "Investigación de Operaciones", uc: 4, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-325", codigo: "MBD-32", nombre: "Modelado de Base de Datos", uc: 3, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-326", codigo: "ELE-32", nombre: "Electiva III", uc: 2, estatus: "por_cursar", nota: null, refDoc: "" }
      ]
    },

    // 🟥 TRAYECTO IV
    {
      id: "4-1",
      nombre: "Trayecto IV - Semestre I (4-1)",
      nivel: "Ingeniería",
      totalUC: 29,
      materias: [
        { id: "inf-411", codigo: "PST-41", nombre: "Proyecto Socio Tecnológico IV - Módulo I", uc: 9, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-412", codigo: "FSC-41", nombre: "Formación Sociocrítica IV - Módulo I", uc: 3, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-413", codigo: "ABD-41", nombre: "Administración de Base de Datos", uc: 4, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-414", codigo: "RDA-41", nombre: "Redes Avanzadas", uc: 4, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-415", codigo: "SEG-41", nombre: "Seguridad en Informática", uc: 4, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-416", codigo: "ING-41", nombre: "Inglés Instrumental - Módulo I", uc: 3, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-417", codigo: "AAC-41", nombre: "Actividades Acreditables IV", uc: 2, estatus: "por_cursar", nota: null, refDoc: "" }
      ]
    },
    {
      id: "4-2",
      nombre: "Trayecto IV - Semestre II (4-2)",
      nivel: "Ingeniería",
      totalUC: 25,
      materias: [
        { id: "inf-421", codigo: "PST-42", nombre: "Proyecto Socio Tecnológico IV - Módulo II", uc: 9, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-422", codigo: "FSC-42", nombre: "Formación Sociocrítica IV - Módulo II", uc: 3, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-423", codigo: "AUD-42", nombre: "Auditoría de Informática", uc: 4, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-424", codigo: "GPI-42", nombre: "Gestión de Proyectos en Informática", uc: 4, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-425", codigo: "ING-42", nombre: "Inglés Instrumental - Módulo II", uc: 3, estatus: "por_cursar", nota: null, refDoc: "" },
        { id: "inf-426", codigo: "ELE-42", nombre: "Electiva IV", uc: 2, estatus: "por_cursar", nota: null, refDoc: "" }
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

  // PNF Informática 1-1 (Inicio de Cursado Homologado)
  "inf-111": [
    { id: "eval-inf-pst1", nombre: "Diagnóstico y Vinculación Comunitaria", ponderacion: 25, nota: null, fecha: "2026-10-14", completada: false },
    { id: "eval-inf-pst2", nombre: "Levantamiento de Requerimientos Tecnológicos", ponderacion: 35, nota: null, fecha: "2026-11-08", completada: false },
    { id: "eval-inf-pst3", nombre: "Defensa del Informe de Avance Módulo I", ponderacion: 40, nota: null, fecha: "2026-11-30", completada: false }
  ],
  "inf-112": [
    { id: "eval-inf-fsc1", nombre: "Tecnologías Libres y Soberanía Nacional", ponderacion: 30, nota: null, fecha: "2026-10-16", completada: false },
    { id: "eval-inf-fsc2", nombre: "Impacto Social de las TIC", ponderacion: 35, nota: null, fecha: "2026-11-04", completada: false },
    { id: "eval-inf-fsc3", nombre: "Proyecto de Alfabetización y Servicio Comunitario", ponderacion: 35, nota: null, fecha: "2026-11-24", completada: false }
  ],
  "inf-113": [
    { id: "eval-inf-ayp1", nombre: "Lógica, Pseudocódigo y Diagramas de Flujo", ponderacion: 30, nota: null, fecha: "2026-10-08", completada: false },
    { id: "eval-inf-ayp2", nombre: "Estructuras de Control y Funciones", ponderacion: 35, nota: null, fecha: "2026-10-28", completada: false },
    { id: "eval-inf-ayp3", nombre: "Proyecto Práctico de Programación Módulo I", ponderacion: 35, nota: null, fecha: "2026-11-22", completada: false }
  ],
  "inf-114": [
    { id: "eval-inf-adc1", nombre: "Arquitectura Von Neumann y Representación de Datos", ponderacion: 30, nota: null, fecha: "2026-10-10", completada: false },
    { id: "eval-inf-adc2", nombre: "Álgebra de Boole y Circuitos Lógicos", ponderacion: 35, nota: null, fecha: "2026-10-30", completada: false },
    { id: "eval-inf-adc3", nombre: "Componentes de Hardware y Memorias", ponderacion: 35, nota: null, fecha: "2026-11-25", completada: false }
  ],
  "inf-115": [
    { id: "eval-inf-mat1", nombre: "Conjuntos y Lógica Matemática", ponderacion: 30, nota: null, fecha: "2026-10-06", completada: false },
    { id: "eval-inf-mat2", nombre: "Álgebra Lineal y Matrices", ponderacion: 35, nota: null, fecha: "2026-10-26", completada: false },
    { id: "eval-inf-mat3", nombre: "Funciones y Geometría Analítica", ponderacion: 35, nota: null, fecha: "2026-11-18", completada: false }
  ],
  "inf-116": [
    { id: "eval-inf-ing1", nombre: "Vocabulario Técnico en Computación", ponderacion: 35, nota: null, fecha: "2026-10-12", completada: false },
    { id: "eval-inf-ing2", nombre: "Comprensión Lectora de Manuales", ponderacion: 35, nota: null, fecha: "2026-11-05", completada: false },
    { id: "eval-inf-ing3", nombre: "Traducción de Documentación Técnica", ponderacion: 30, nota: null, fecha: "2026-11-26", completada: false }
  ],
  "inf-117": [
    { id: "eval-inf-aac1", nombre: "Taller de Integración y Desarrollo Integral", ponderacion: 50, nota: null, fecha: "2026-10-15", completada: false },
    { id: "eval-inf-aac2", nombre: "Participación en Actividades Institucionales", ponderacion: 50, nota: null, fecha: "2026-11-20", completada: false }
  ]
};

// Mapa de Prelaciones Académicas UNEXCA
const MAPA_PRELACIONES = {
  ADM: {
    "adm-111": { prelaA: ["adm-121", "adm-211", "adm-221", "adm-311", "adm-321", "adm-411", "adm-421"], nombre: "Proyecto Socio Integrador I - Módulo I" },
    "adm-112": { prelaA: ["adm-122", "adm-212", "adm-222"], nombre: "Formación Sociocrítica I - Módulo I" },
    "adm-113": { prelaA: ["adm-123", "adm-213", "adm-223"], nombre: "Contabilidad I - Módulo I" },
    "adm-123": { prelaA: ["adm-213", "adm-223"], nombre: "Contabilidad I - Módulo II" },
    "adm-114": { prelaA: ["adm-124", "adm-215", "adm-314"], nombre: "Fundamentos de la Administración - Módulo I" },
    "adm-124": { prelaA: ["adm-215", "adm-314"], nombre: "Fundamentos de la Administración - Módulo II" }
  },
  INF: {
    "inf-111": { prelaA: ["inf-121", "inf-211", "inf-221", "inf-311", "inf-321", "inf-411", "inf-421"], nombre: "Proyecto Socio Tecnológico I - Módulo I" },
    "inf-112": { prelaA: ["inf-122", "inf-212", "inf-222"], nombre: "Formación Sociocrítica I - Módulo I" },
    "inf-113": { prelaA: ["inf-123", "inf-213", "inf-223", "inf-313"], nombre: "Algorítmica y Programación - Módulo I" },
    "inf-123": { prelaA: ["inf-213", "inf-223", "inf-313"], nombre: "Algorítmica y Programación - Módulo II" },
    "inf-114": { prelaA: ["inf-124", "inf-216", "inf-315", "inf-414"], nombre: "Arquitectura del Computador - Módulo I" },
    "inf-115": { prelaA: ["inf-125", "inf-215", "inf-316", "inf-324"], nombre: "Matemática I - Módulo I" },
    "inf-125": { prelaA: ["inf-215", "inf-316", "inf-324"], nombre: "Matemática I - Módulo II" },
    "inf-214": { prelaA: ["inf-224", "inf-314", "inf-323", "inf-424"], nombre: "Ingeniería de Software I" },
    "inf-225": { prelaA: ["inf-325", "inf-413"], nombre: "Base de Datos" }
  }
};

const HORARIO_DEFECTO = {
  ADM: { A: [], B: [] },
  INF: { A: [], B: [] }
};

if (typeof window !== "undefined") {
  window.PENSUM_ADMINISTRACION = PENSUM_ADMINISTRACION;
  window.PENSUM_INFORMATICA = PENSUM_INFORMATICA;
  window.EVALUACIONES_INICIALES = EVALUACIONES_INICIALES;
  window.MAPA_PRELACIONES = MAPA_PRELACIONES;
  window.HORARIO_DEFECTO = HORARIO_DEFECTO;
}
if (typeof globalThis !== "undefined") {
  globalThis.PENSUM_ADMINISTRACION = PENSUM_ADMINISTRACION;
  globalThis.PENSUM_INFORMATICA = PENSUM_INFORMATICA;
  globalThis.EVALUACIONES_INICIALES = EVALUACIONES_INICIALES;
  globalThis.MAPA_PRELACIONES = MAPA_PRELACIONES;
  globalThis.HORARIO_DEFECTO = HORARIO_DEFECTO;
}