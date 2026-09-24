/**
 * SISTEMA UNIVERSITARIO DE GESTIÓN ACADÉMICA - APP LOGIC
 * Control de Estado Interactivo con Auto-Sync Instantáneo y PWA Instalable
 */
/* global PENSUM_ADMINISTRACION, PENSUM_INFORMATICA, EVALUACIONES_INICIALES, HORARIO_DEFECTO */

let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
});

class UniversityApp {
  storageKey = "SISTEMA_UNIVERSITARIO_DATA_V3";
  currentCareer = "ADM"; // "ADM" o "INF"
  currentWeek = "A"; // "A" (Administración) o "B" (Informática)
  currentTab = "dashboard";
  hasEnteredApp = false;
  selectedEvalSubjectId = null;

  constructor() {
    this.state = {
      pensum: {
        ADM: structuredClone(PENSUM_ADMINISTRACION),
        INF: structuredClone(PENSUM_INFORMATICA)
      },
      evaluaciones: structuredClone(EVALUACIONES_INICIALES),
      horario: structuredClone(HORARIO_DEFECTO),
      notificaciones: [
        { id: "n1", titulo: "Materias por Repetir en Adm", desc: "Fundamentos de Adm I y II, Contabilidad I y II, Formación Sociocrítica I (Módulos I y II). Revisa reprogramación.", prioridad: "urgente" },
        { id: "n2", titulo: "Intensivo de Verano Próximo", desc: "Inscripción en Teoría y Práctica del Mercadeo y Deberes Formales del Contribuyente.", prioridad: "normal" },
        { id: "n3", titulo: "Consultar Notas Oficiales", desc: "Estadística, Expresión Oral, Marco Jurídico I y II, Electiva I, Fundamentos de Economía.", prioridad: "normal" }
      ]
    };

    this.init();
  }

  init() {
    this.loadState();

    const landing = document.getElementById("landing-screen");
    const mainApp = document.getElementById("main-app-screen");

    if (this.hasEnteredApp) {
      if (landing) landing.style.display = "none";
      if (mainApp) mainApp.style.display = "block";
    } else {
      if (landing) landing.style.display = "flex";
      if (mainApp) mainApp.style.display = "none";
    }

    this.updateWeekUI();
    this.setupModalDismiss();
    this.render();
    if (this.hasEnteredApp) {
      this.switchTab(this.currentTab || "dashboard");
    }
  }

  setupModalDismiss() {
    document.querySelectorAll(".modal-overlay").forEach(overlay => {
      overlay.addEventListener("click", (e) => {
        if (e.target === overlay) {
          overlay.classList.remove("active");
        }
      });
    });
  }

  // --- INSTALACIÓN PWA EN PANTALLA DE INICIO ---
  installPWA() {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      deferredPrompt.userChoice
        .then(() => {
          deferredPrompt = null;
        })
        .catch((err) => {
          console.error("Error en instalación PWA:", err);
        });
    } else {
      this.showToast("Para instalar: usa el menú de tu navegador > Agregar a inicio", "info");
    }
  }

  // --- PERSISTENCIA & AUTO-SYNC INSTANTÁNEO ---
  loadState() {
    let saved = localStorage.getItem(this.storageKey);

    // Migración transparente desde V2 para incorporar nuevo pensum homologado sin perder personalizaciones
    if (!saved) {
      const oldV2 = localStorage.getItem("SISTEMA_UNIVERSITARIO_DATA_V2");
      if (oldV2) {
        try {
          const parsedV2 = JSON.parse(oldV2);
          const migrated = {
            currentCareer: parsedV2.currentCareer || "ADM",
            currentWeek: parsedV2.currentWeek || "A",
            currentTab: parsedV2.currentTab || "dashboard",
            hasEnteredApp: parsedV2.hasEnteredApp || false,
            horario: parsedV2.horario || structuredClone(HORARIO_DEFECTO),
            notificaciones: parsedV2.notificaciones || [],
            pensum: {
              ADM: structuredClone(PENSUM_ADMINISTRACION),
              INF: structuredClone(PENSUM_INFORMATICA)
            },
            evaluaciones: { ...structuredClone(EVALUACIONES_INICIALES), ...(parsedV2.evaluaciones || {}) }
          };

          // Migrar notas o estatus personalizados previos por código de materia
          if (parsedV2.pensum) {
            ['ADM', 'INF'].forEach(c => {
              if (parsedV2.pensum[c] && parsedV2.pensum[c].trayectos) {
                parsedV2.pensum[c].trayectos.forEach(oldT => {
                  if (oldT.materias) {
                    oldT.materias.forEach(oldM => {
                      migrated.pensum[c].trayectos.forEach(newT => {
                        const newM = newT.materias.find(m => m.codigo === oldM.codigo);
                        if (newM && oldM.estatus && oldM.estatus !== newM.estatus) {
                          newM.estatus = oldM.estatus;
                          newM.nota = oldM.nota;
                          newM.refDoc = oldM.refDoc || newM.refDoc;
                        }
                      });
                    });
                  }
                });
              }
            });
          }

          localStorage.setItem(this.storageKey, JSON.stringify(migrated));
          saved = JSON.stringify(migrated);
        } catch (e) {
          console.error("Error en migración V2 a V3:", e);
        }
      }
    }

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.pensum) {
          ['ADM', 'INF'].forEach(c => {
            const seedCareer = c === 'ADM' ? PENSUM_ADMINISTRACION : PENSUM_INFORMATICA;
            if (!this.state.pensum[c]) this.state.pensum[c] = structuredClone(seedCareer);
            if (parsed.pensum[c] && parsed.pensum[c].trayectos) {
              // Validar que el pensum esté homologado (primer elemento siempre es Proyecto PSI/PST)
              const isHomologated = parsed.pensum[c].trayectos.every(t =>
                t.materias && t.materias.length > 0 &&
                (t.materias[0].codigo.startsWith("PSI-") || t.materias[0].codigo.startsWith("PST-"))
              );

              if (!isHomologated) {
                parsed.pensum[c] = structuredClone(seedCareer);
              } else {
                seedCareer.trayectos.forEach(seedT => {
                  const existingT = parsed.pensum[c].trayectos.find(t => t.id === seedT.id);
                  if (existingT) {
                    existingT.nombre = seedT.nombre;
                    existingT.nivel = seedT.nivel;
                    existingT.totalUC = seedT.totalUC;
                  } else {
                    parsed.pensum[c].trayectos.push(structuredClone(seedT));
                  }
                });
              }
              parsed.pensum[c].metaUC_TSU = seedCareer.metaUC_TSU;
              parsed.pensum[c].metaUC_Lic = seedCareer.metaUC_Lic;
              this.state.pensum[c] = parsed.pensum[c];
            }
          });
        }
        if (parsed.evaluaciones) {
          this.state.evaluaciones = { ...structuredClone(EVALUACIONES_INICIALES), ...parsed.evaluaciones };
        }
        if (parsed.horario) this.state.horario = parsed.horario;
        if (parsed.notificaciones) this.state.notificaciones = parsed.notificaciones;
        if (parsed.currentCareer) this.currentCareer = parsed.currentCareer;
        if (parsed.currentWeek) this.currentWeek = parsed.currentWeek;
        if (parsed.currentTab) this.currentTab = parsed.currentTab;
        if (parsed.hasEnteredApp !== undefined) this.hasEnteredApp = parsed.hasEnteredApp;
      } catch (e) {
        console.error("Error al cargar estado local", e);
      }
    }
  }

  saveState() {
    const toSave = {
      pensum: this.state.pensum,
      evaluaciones: this.state.evaluaciones,
      horario: this.state.horario,
      notificaciones: this.state.notificaciones,
      currentCareer: this.currentCareer,
      currentWeek: this.currentWeek,
      currentTab: this.currentTab,
      hasEnteredApp: this.hasEnteredApp
    };
    localStorage.setItem(this.storageKey, JSON.stringify(toSave));

    fetch('/api/git-sync', { method: 'POST' }).catch(() => { });
  }

  // --- CONTROL DE NAVEGACIÓN Y CARRERA ---
  selectCareer(careerCode) {
    this.currentCareer = careerCode;
    this.hasEnteredApp = true;
    this.selectedEvalSubjectId = null;
    this.saveState();

    const landing = document.getElementById("landing-screen");
    if (landing) landing.style.display = "none";
    const mainApp = document.getElementById("main-app-screen");
    if (mainApp) mainApp.style.display = "block";

    this.updateCareerHeaderUI();
    this.switchTab(this.currentTab || "dashboard");
  }

  logout() {
    this.hasEnteredApp = false;
    this.saveState();
    const landing = document.getElementById("landing-screen");
    if (landing) landing.style.display = "flex";
    const mainApp = document.getElementById("main-app-screen");
    if (mainApp) mainApp.style.display = "none";
  }

  goToSubjectEvaluations(subjectId) {
    this.selectedEvalSubjectId = subjectId;
    this.switchTab("evaluaciones");
  }

  async activateTrayecto(trayectoId, event) {
    if (event) event.stopPropagation();
    const pensum = this.state.pensum[this.currentCareer];
    const targetTrayecto = pensum.trayectos.find(t => t.id === trayectoId);
    if (!targetTrayecto) return;

    const confirmed = await this.showConfirmDialog({
      title: `¿Activar ${targetTrayecto.nombre}?`,
      message: `Este trayecto se establecerá como tu semestre actual en curso. Sus materias se mostrarán en la pestaña 'Mi Semestre'.`,
      icon: '📚',
      acceptText: 'Sí, Iniciar Semestre',
      cancelText: 'Cancelar',
      acceptColor: '#104c91'
    });
    if (!confirmed) return;

    pensum.trayectos.forEach(t => {
      if (t.id === trayectoId) {
        t.actual = true;
        t.culminado = false;
        t.materias.forEach(m => {
          if (m.estatus === "por_cursar") {
            m.estatus = "en_curso";
          }
        });
      } else {
        t.actual = false;
      }
    });

    this.saveState();
    this.renderDashboard();
    this.renderPensum();
    this.renderSemestreActual();
    this.showToast(`Has iniciado ${targetTrayecto.nombre}.`, "success");
  }

  async culminateTrayecto(trayectoId, event) {
    if (event) event.stopPropagation();
    const pensum = this.state.pensum[this.currentCareer];
    const activeTray = pensum.trayectos.find(t => t.actual);
    const targetTrayecto = pensum.trayectos.find(t => t.id === (trayectoId || activeTray?.id));
    if (!targetTrayecto) return;

    const confirmed = await this.showConfirmDialog({
      title: `¿Deseas culminar este semestre?`,
      message: `¿Deseas marcar como CULMINADO "${targetTrayecto.nombre}"?\nAl culminar, este semestre se cerrará y podrás seleccionar tu siguiente semestre para iniciar.`,
      icon: '🎓',
      acceptText: 'Sí, Culminar Semestre',
      cancelText: 'Cancelar',
      acceptColor: '#0A4D40'
    });
    if (!confirmed) return;

    targetTrayecto.actual = false;
    targetTrayecto.culminado = true;

    targetTrayecto.materias.forEach(m => {
      const isProyecto = (m.nombre.toLowerCase().includes("proyecto socio") || m.codigo.toLowerCase().includes("psi") || m.codigo.toLowerCase().includes("pst"));
      const minPass = isProyecto ? 16 : 13;
      if (m.estatus === "en_curso" || m.estatus === "por_cursar") {
        if (m.nota !== null && m.nota >= minPass) {
          m.estatus = "aprobada";
        } else if (m.nota !== null && m.nota < minPass) {
          m.estatus = "repetir";
        } else {
          m.estatus = "aprobada";
          m.nota = minPass;
        }
      }
    });

    this.saveState();
    this.renderDashboard();
    this.renderPensum();
    this.renderSemestreActual();
    this.showToast(`"${targetTrayecto.nombre}" marcado como CULMINADO con éxito.`, "success");
  }

  startSelectedSemester() {
    const sel = document.getElementById("select-new-semester-to-start");
    if (!sel || !sel.value) return;
    this.activateTrayecto(sel.value);
  }

  promptSwitchSemester() {
    const pensum = this.state.pensum[this.currentCareer];
    const select = document.getElementById("select-switch-semester-picker");
    if (!select) return;
    select.innerHTML = pensum.trayectos.map(t => {
      const statusText = t.actual ? " — [ACTIVO EN CURSO]" : (t.culminado ? " — [CULMINADO]" : "");
      return `<option value="${t.id}" ${t.actual ? "selected" : ""}>${t.nombre}${statusText}</option>`;
    }).join("");
    this.openModal("modal-switch-semester");
  }

  confirmSwitchSemesterFromModal() {
    const select = document.getElementById("select-switch-semester-picker");
    if (!select || !select.value) return;
    const chosenId = select.value;
    this.closeModal("modal-switch-semester");
    this.activateTrayecto(chosenId);
  }

  showLanding() {
    const landing = document.getElementById("landing-screen");
    if (landing) landing.style.display = "flex";
    const mainApp = document.getElementById("main-app-screen");
    if (mainApp) mainApp.style.display = "none";
  }

  toggleWeek() {
    this.currentWeek = this.currentWeek === "A" ? "B" : "A";
    this.saveState();
    this.updateWeekUI();
    if (this.currentTab === "horario") {
      this.renderSchedule();
    }
  }

  updateWeekUI() {
    const isWeekA = this.currentWeek === "A";
    const elementTexts = {
      "landing-week-badge": isWeekA ? "SEMANA A (ADMINISTRACIÓN)" : "SEMANA B (INFORMÁTICA)",
      "btn-toggle-week-landing": isWeekA ? "Cambiar a Semana B (Informática)" : "Cambiar a Semana A (Administración)",
      "header-week-text": isWeekA ? "SEMANA A (ADM)" : "SEMANA B (INF)",
      "home-week-text": isWeekA ? "SEMANA A (ADM)" : "SEMANA B (INF)",
      "horario-week-title": isWeekA ? "Semana A (Administración)" : "Semana B (Informática)"
    };

    Object.entries(elementTexts).forEach(([id, text]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    });
  }

  toggleCareer() {
    this.currentCareer = this.currentCareer === "ADM" ? "INF" : "ADM";
    this.selectedEvalSubjectId = null;
    this.saveState();
    this.updateCareerHeaderUI();
    this.switchTab(this.currentTab);
  }

  updateCareerHeaderUI() {
    const headerTitle = document.getElementById("header-career-title");
    const homeCareerBadge = document.getElementById("home-career-badge");
    const toggleCareerBtn = document.getElementById("btn-toggle-career-header");
    const activeData = this.state.pensum[this.currentCareer];
    if (activeData) {
      if (headerTitle) headerTitle.textContent = activeData.carrera + " (" + activeData.institucion + ")";
      if (homeCareerBadge) homeCareerBadge.textContent = `${activeData.carrera} (${this.currentCareer})`;
      if (toggleCareerBtn) {
        if (this.currentCareer === "ADM") {
          toggleCareerBtn.innerHTML = `<span>Cambiar a Informática</span>`;
          toggleCareerBtn.title = "Cambiar a PNF en Informática";
        } else {
          toggleCareerBtn.innerHTML = `<span>Cambiar a Administración</span>`;
          toggleCareerBtn.title = "Cambiar a PNF en Administración";
        }
      }

      const filterTrayectoSelect = document.getElementById("filter-trayecto-select");
      if (filterTrayectoSelect) {
        let opts = '<option value="todos">Todos los Trayectos</option>';
        activeData.trayectos.forEach(t => {
          opts += `<option value="${t.id}">${t.nombre}</option>`;
        });
        filterTrayectoSelect.innerHTML = opts;
      }
    }
  }

  switchTab(tabId) {
    this.currentTab = tabId;
    if (this.hasEnteredApp) {
      this.saveState();
    }

    document.querySelectorAll(".nav-tabs .tab-btn").forEach(btn => {
      btn.classList.remove("active");
    });
    const targetBtn = Array.from(document.querySelectorAll(".nav-tabs .tab-btn")).find(b => b.getAttribute("onclick")?.includes(tabId));
    if (targetBtn) targetBtn.classList.add("active");

    document.querySelectorAll(".bottom-nav-item").forEach(btn => {
      btn.classList.remove("active");
    });
    const targetBottomBtn = Array.from(document.querySelectorAll(".bottom-nav-item")).find(b => b.getAttribute("onclick")?.includes(tabId));
    if (targetBottomBtn) targetBottomBtn.classList.add("active");

    document.querySelectorAll(".tab-section").forEach(sec => {
      sec.style.display = "none";
    });

    const activeSec = document.getElementById(`tab-${tabId}`);
    if (activeSec) activeSec.style.display = "block";

    if (tabId === "dashboard") this.renderDashboard();
    if (tabId === "semestre") this.renderSemestreActual();
    if (tabId === "pensum") this.renderPensum();
    if (tabId === "evaluaciones") this.renderEvaluationsSection();
    if (tabId === "consultas") this.renderConsultas();
    if (tabId === "horario") this.renderSchedule();
    if (tabId === "notificaciones") this.renderNotifications();
  }

  triggerFabAction() {
    if (this.currentTab === "pensum" || this.currentTab === "dashboard" || this.currentTab === "semestre") {
      this.openAddSubjectModal();
    } else if (this.currentTab === "evaluaciones") {
      this.openAddEvalModal();
    } else if (this.currentTab === "horario") {
      this.openAddScheduleModal();
    } else if (this.currentTab === "notificaciones") {
      this.openAddTaskModal();
    } else {
      this.openAddSubjectModal();
    }
  }

  // --- METRICAS Y DASHBOARD ---
  getCalculatedStats(careerCode) {
    const pensum = this.state.pensum[careerCode];
    let ucTSUAprobadas = 0;
    let ucTotalAprobadas = 0;
    let materiasEnCurso = 0;
    let materiasRepetir = 0;
    let materiasConsulta = 0;
    let totalScoreSum = 0;
    let totalWeightedScoreSum = 0;
    let totalUCCursadasConNota = 0;
    let totalMateriasConNota = 0;

    pensum.trayectos.forEach(t => {
      t.materias.forEach(m => {
        if (m.estatus === "aprobada") {
          ucTotalAprobadas += m.uc;
          if (t.nivel === "TSU") {
            ucTSUAprobadas += m.uc;
          }
        }
        if (m.estatus === "en_curso") materiasEnCurso++;
        if (m.estatus === "repetir") materiasRepetir++;
        if (m.estatus === "pendiente_consulta") materiasConsulta++;

        if (m.nota !== null && m.nota !== undefined && !Number.isNaN(Number(m.nota))) {
          const notaNum = Number(m.nota);
          totalScoreSum += notaNum;
          totalWeightedScoreSum += (notaNum * m.uc);
          totalUCCursadasConNota += m.uc;
          totalMateriasConNota++;
        }
      });
    });

    const totalMateriasCerradas = (totalMateriasConNota + materiasRepetir);
    const eficiencia = totalMateriasCerradas > 0
      ? Math.round((totalMateriasConNota / totalMateriasCerradas) * 100)
      : 100;

    const promedioPonderado = totalUCCursadasConNota > 0
      ? (totalWeightedScoreSum / totalUCCursadasConNota).toFixed(2)
      : "0.00";

    const promedioSimple = totalMateriasConNota > 0
      ? (totalScoreSum / totalMateriasConNota).toFixed(2)
      : "0.00";

    return {
      ucTSUAprobadas,
      metaUC_TSU: pensum.metaUC_TSU,
      ucTotalAprobadas,
      metaUC_Lic: pensum.metaUC_Lic,
      materiasEnCurso,
      materiasRepetir,
      materiasConsulta,
      promedioPonderado,
      promedioSimple,
      totalMateriasConNota,
      eficiencia
    };
  }

  renderSemestreActual() {
    const container = document.getElementById("semestre-view-container");
    if (!container) return;

    const pensum = this.state.pensum[this.currentCareer];
    const activeTrayecto = pensum.trayectos.find(t => t.actual);

    // 1. Materias del semestre activo (si hay semestre activo)
    const currentSemesterMaterias = activeTrayecto ? activeTrayecto.materias : [];

    // 2. Materias de semestres anteriores POR REPETIR (arrastres)
    const repetirFromOtherTrayectos = [];
    pensum.trayectos.forEach(t => {
      if (activeTrayecto && t.id === activeTrayecto.id) return;
      t.materias.forEach(m => {
        if (m.estatus === "repetir") {
          repetirFromOtherTrayectos.push({ materia: m, trayecto: t });
        }
      });
    });

    // 3. Materias en consulta oficial (si las hay)
    const consultaMaterias = [];
    pensum.trayectos.forEach(t => {
      t.materias.forEach(m => {
        if (m.estatus === "pendiente_consulta") {
          consultaMaterias.push({ materia: m, trayecto: t });
        }
      });
    });

    let html = "";

    // --- CABECERA DE CONTROL DE SEMESTRE ---
    if (activeTrayecto) {
      html += `
        <div class="semestre-header-card" style="background: white; border: 1.5px solid var(--border-color); border-radius: 10px; padding: 14px 16px; margin-bottom: 14px; box-shadow: var(--shadow-xs);">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 10px;">
            <div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="status-badge status-en_curso" style="font-size: 0.72rem; padding: 3px 8px;">ACTIVO EN CURSO</span>
                <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 700;">NIVEL ${activeTrayecto.nivel} • ${activeTrayecto.totalUC} UC TOTALES</span>
              </div>
              <h2 style="margin: 4px 0 2px 0; font-size: 1.25rem; color: var(--text-primary); font-weight: 900;">${activeTrayecto.nombre}</h2>
              <p style="margin: 0; font-size: 0.8rem; color: var(--text-secondary);">
                Gestiona tus asignaturas de este semestre. Al finalizar las evaluaciones, puedes marcar este semestre como culminado.
              </p>
            </div>
            <div style="display: flex; gap: 6px; flex-wrap: wrap;">
              <button type="button" class="btn-action" style="background: #117A65; color: white; border: none; font-weight: bold; font-size: 0.8rem; padding: 6px 12px; border-radius: 6px;" onclick="app.culminateTrayecto('${activeTrayecto.id}', event)">
                ✓ Culminar Este Semestre
              </button>
              <button type="button" class="btn-action" style="color: var(--primary-blue); border-color: var(--primary-blue); font-weight: bold; font-size: 0.8rem; padding: 6px 12px; border-radius: 6px;" onclick="app.promptSwitchSemester()">
                Cambiar Semestre
              </button>
            </div>
          </div>
        </div>
      `;
    } else {
      // No hay semestre activo: Semestre culminado o cerrado
      let nextOptions = "";
      pensum.trayectos.forEach(t => {
        const isCulm = t.culminado ? "(Culminado)" : "";
        nextOptions += `<option value="${t.id}">${t.nombre} ${isCulm}</option>`;
      });

      html += `
        <div class="semestre-header-card" style="background: #F0FDF4; border: 1.5px solid #86EFAC; border-radius: 10px; padding: 16px 18px; margin-bottom: 14px; box-shadow: var(--shadow-xs);">
          <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 6px;">
            <span style="font-size: 1.4rem;">🎓</span>
            <h2 style="margin: 0; font-size: 1.15rem; color: #166534; font-weight: 900;">Semestre Culminado / No Hay Semestre en Curso</h2>
          </div>
          <p style="margin: 0 0 12px 0; font-size: 0.85rem; color: #166534; line-height: 1.4;">
            Has cerrado tu semestre anterior. Selecciona el siguiente semestre que vas a cursar y pulsa <strong>Iniciar Semestre</strong> para cargar sus asignaturas:
          </p>
          <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
            <select id="select-new-semester-to-start" class="filter-select" style="max-width: 320px; font-weight: 700;">
              ${nextOptions}
            </select>
            <button type="button" class="btn-primary" style="padding: 8px 16px; font-weight: 800; font-size: 0.82rem;" onclick="app.startSelectedSemester()">
              ▶ Iniciar Semestre Seleccionado
            </button>
          </div>
        </div>
      `;
    }

    // --- BLOQUE 1: ASIGNATURAS DEL SEMESTRE EN CURSO ---
    html += `
      <div class="trayecto-block" style="margin-bottom: 14px; border-radius: 10px; overflow: hidden; border: 1px solid var(--border-color); background: white;">
        <div class="trayecto-header" style="background: #F8FAFC; border-bottom: 1px solid var(--border-color); padding: 10px 14px; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 1rem;">📚</span>
            <strong style="font-size: 0.9rem; color: var(--text-primary);">Materias del Semestre en Curso</strong>
            <span class="status-badge status-en_curso" style="margin-left: 4px;">${currentSemesterMaterias.length} materias</span>
          </div>
          ${activeTrayecto ? `<span style="font-size: 0.72rem; color: var(--text-muted); font-weight: 700;">${activeTrayecto.nombre}</span>` : ''}
        </div>
        <div style="padding: 12px;">
    `;

    if (!activeTrayecto || currentSemesterMaterias.length === 0) {
      html += `
        <div style="text-align: center; padding: 24px 12px; color: var(--text-muted); font-size: 0.85rem;">
          No hay asignaturas en curso actualmente. Inicia un nuevo semestre arriba para ver sus materias aquí.
        </div>
      `;
    } else {
      html += `<div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 8px;">`;
      currentSemesterMaterias.forEach(m => {
        const statusTextMap = {
          aprobada: "Aprobada",
          en_curso: "En Curso",
          repetir: "Por Repetir",
          intensivo_verano: "Intensivo Verano",
          pendiente_consulta: "Pendiente Consulta",
          por_cursar: "Por Cursar"
        };
        html += `
          <div class="schedule-item" style="display: flex; flex-direction: column; justify-content: space-between; padding: 10px 12px; margin-bottom: 0; border: 1px solid var(--border-color); border-radius: 8px; background: #FFFFFF; cursor: pointer; transition: transform 0.1s ease, box-shadow 0.1s ease;" onclick="app.openSubjectDetailModal('${m.id}')">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <span style="font-size: 0.72rem; font-weight: 800; color: #64748B;">${m.codigo} • ${m.uc} UC</span>
                <div style="font-size: 1rem; font-weight: 900; color: var(--primary-blue);">${m.nota ? `${m.nota} pts` : '-'}</div>
              </div>
              <div style="font-size: 0.88rem; font-weight: 800; color: #0F172A; line-height: 1.25; margin-bottom: 8px;">${m.nombre}</div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #E2E8F0; padding-top: 6px; margin-top: 4px;">
              <span class="status-badge status-${m.estatus}">${statusTextMap[m.estatus] || m.estatus}</span>
              <button type="button" class="btn-action" style="font-size: 0.72rem; padding: 3px 8px;" onclick="event.stopPropagation(); app.openSubjectDetailModal('${m.id}')">Ficha / Notas →</button>
            </div>
          </div>
        `;
      });
      html += `</div>`;
    }
    html += `</div></div>`;

    // --- BLOQUE 2: MATERIAS DE SEMESTRES ANTERIORES POR REPETIR (SEPARADO Y CLARO) ---
    html += `
      <div class="trayecto-block" style="margin-bottom: 14px; border-radius: 10px; overflow: hidden; border: 1.5px solid ${repetirFromOtherTrayectos.length > 0 ? '#FECDD3' : 'var(--border-color)'}; background: white;">
        <div class="trayecto-header" style="background: ${repetirFromOtherTrayectos.length > 0 ? '#FFF1F2' : '#F8FAFC'}; border-bottom: 1px solid ${repetirFromOtherTrayectos.length > 0 ? '#FECDD3' : 'var(--border-color)'}; padding: 10px 14px; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 1rem;">⚠️</span>
            <strong style="font-size: 0.9rem; color: ${repetirFromOtherTrayectos.length > 0 ? '#9F1239' : 'var(--text-primary)'};">Materias por Repetir de Semestres Anteriores</strong>
            <span class="status-badge status-repetir" style="margin-left: 4px;">${repetirFromOtherTrayectos.length} pendientes</span>
          </div>
          <span style="font-size: 0.72rem; color: #9F1239; font-weight: 700;">Arrastres</span>
        </div>
        <div style="padding: 12px;">
    `;

    if (repetirFromOtherTrayectos.length === 0) {
      html += `
        <div style="display: flex; align-items: center; gap: 8px; padding: 14px; background: #F0FDF4; border-radius: 8px; color: #166534; font-size: 0.82rem; font-weight: 700;">
          <span>✓</span>
          <span>¡Excelente! No tienes materias pendientes por repetir de semestres anteriores. Todo tu historial está al día.</span>
        </div>
      `;
    } else {
      html += `
        <p style="font-size: 0.78rem; color: #64748B; margin: 0 0 10px 0;">
          Estas asignaturas pertenecen a semestres cursados previamente. Están separadas aquí para no mezclar tu carga académica del semestre actual:
        </p>
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 8px;">
      `;
      repetirFromOtherTrayectos.forEach(item => {
        const m = item.materia;
        const t = item.trayecto;
        html += `
          <div class="schedule-item" style="display: flex; flex-direction: column; justify-content: space-between; padding: 10px 12px; margin-bottom: 0; border: 1.5px solid #FECDD3; border-radius: 8px; background: #FFFBFB; cursor: pointer;" onclick="app.openSubjectDetailModal('${m.id}')">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <span style="font-size: 0.72rem; font-weight: 800; color: #BE123C;">Origen: ${t.nombre}</span>
                <span style="font-size: 0.72rem; font-weight: 700; color: #64748B;">${m.uc} UC</span>
              </div>
              <div style="font-size: 0.88rem; font-weight: 800; color: #0F172A; line-height: 1.25; margin-bottom: 8px;">${m.nombre}</div>
            </div>
            <div style="display: flex; justify-content: space-between; align-items: center; border-top: 1px dashed #FECDD3; padding-top: 6px; margin-top: 4px;">
              <span class="status-badge status-repetir">POR REPETIR</span>
              <button type="button" class="btn-action" style="font-size: 0.72rem; padding: 3px 8px; color: #BE123C; border-color: #FECDD3;" onclick="event.stopPropagation(); app.openSubjectDetailModal('${m.id}')">Ficha / Notas →</button>
            </div>
          </div>
        `;
      });
      html += `</div>`;
    }
    html += `</div></div>`;

    // --- BLOQUE 3: MATERIAS EN CONSULTA (SI APLICA) ---
    if (consultaMaterias.length > 0) {
      html += `
        <details class="trayecto-block" style="border-radius: 10px; overflow: hidden; border: 1px solid #E2E8F0; background: white;">
          <summary class="trayecto-header" style="background: #FAF5FF; border-bottom: 1px solid #E9D5FF; padding: 10px 14px; cursor: pointer; user-select: none;">
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="font-size: 1rem;">📋</span>
              <strong style="font-size: 0.88rem; color: #6B21A8;">Materias en Consulta Oficial (${consultaMaterias.length})</strong>
            </div>
            <span style="font-size: 0.72rem; color: #7E22CE; font-weight: 700;">Toca para ver</span>
          </summary>
          <div style="padding: 10px 12px;">
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 6px;">
      `;
      consultaMaterias.forEach(item => {
        const m = item.materia;
        const t = item.trayecto;
        html += `
          <div class="schedule-item" style="display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; margin-bottom: 0; cursor: pointer;" onclick="app.openSubjectDetailModal('${m.id}')">
            <div>
              <div style="font-size: 0.68rem; color: #6B21A8; font-weight: 700;">${t.nombre} • ${m.uc} UC</div>
              <div style="font-size: 0.82rem; font-weight: 800; color: #1E293B;">${m.nombre}</div>
              <span class="status-badge status-pendiente_consulta">Pendiente Consulta</span>
            </div>
            <button type="button" class="btn-action" style="font-size: 0.68rem; padding: 2px 6px;" onclick="event.stopPropagation(); app.openSubjectDetailModal('${m.id}')">Asignar Nota →</button>
          </div>
        `;
      });
      html += `</div></div></details>`;
    }

    container.innerHTML = html;
  }

  renderDashboard() {
    const stats = this.getCalculatedStats(this.currentCareer);

    const pctTSU = Math.min(100, Math.round((stats.ucTSUAprobadas / stats.metaUC_TSU) * 100));
    const tsuVal = document.getElementById("stat-uc-tsu-val");
    if (tsuVal) tsuVal.textContent = `${stats.ucTSUAprobadas} / ${stats.metaUC_TSU} UC`;
    const tsuBar = document.getElementById("stat-uc-tsu-bar");
    if (tsuBar) tsuBar.style.width = `${pctTSU}%`;
    const tsuPct = document.getElementById("stat-uc-tsu-pct");
    if (tsuPct) tsuPct.textContent = `${pctTSU}% completado del TSU`;

    const gpaPond = document.getElementById("stat-promedio-ponderado");
    if (gpaPond) gpaPond.textContent = `${stats.promedioPonderado} pts`;

    const gpaSimple = document.getElementById("stat-promedio-simple");
    if (gpaSimple) gpaSimple.textContent = `${stats.promedioSimple} pts`;

    const matEval = document.getElementById("stat-materias-evaluadas");
    if (matEval) matEval.textContent = `${stats.totalMateriasConNota} materias evaluadas`;

    const eficVal = document.getElementById("stat-eficiencia-val");
    if (eficVal) eficVal.textContent = `${stats.eficiencia}%`;

    const matCurso = document.getElementById("stat-materias-curso");
    if (matCurso) matCurso.textContent = String(stats.materiasEnCurso);
    const matRepetir = document.getElementById("stat-materias-repetir");
    if (matRepetir) matRepetir.textContent = String(stats.materiasRepetir);
    const matConsulta = document.getElementById("stat-consultas-count");
    if (matConsulta) matConsulta.textContent = String(stats.materiasConsulta);
    const notifsCount = document.getElementById("stat-eval-pendientes");
    if (notifsCount) notifsCount.textContent = String(this.state.notificaciones.length);

    // Actualizar Tarjeta de Estado del Semestre en Inicio (Limpio y sin saturación)
    const pensum = this.state.pensum[this.currentCareer];
    const activeTrayecto = pensum.trayectos.find(t => t.actual);

    let countRepetir = 0;
    pensum.trayectos.forEach(t => t.materias.forEach(m => { if (m.estatus === "repetir") countRepetir++; }));

    const semNameEl = document.getElementById("home-semester-name");
    const semDetailsEl = document.getElementById("home-semester-details");
    const semBadgeEl = document.getElementById("home-semester-active-badge");

    if (activeTrayecto) {
      const enCursoCount = activeTrayecto.materias.filter(m => m.estatus === "en_curso").length;
      if (semNameEl) semNameEl.textContent = activeTrayecto.nombre;
      if (semDetailsEl) semDetailsEl.textContent = `${enCursoCount} materias en curso de este semestre • ${countRepetir} pendientes por repetir`;
      if (semBadgeEl) {
        semBadgeEl.className = "status-badge status-en_curso";
        semBadgeEl.textContent = "En Curso";
      }
    } else {
      if (semNameEl) semNameEl.textContent = "Semestre Culminado / Sin Semestre Activo";
      if (semDetailsEl) semDetailsEl.textContent = `Selecciona tu próximo semestre en 'Mi Semestre' • ${countRepetir} pendientes por repetir`;
      if (semBadgeEl) {
        semBadgeEl.className = "status-badge status-aprobada";
        semBadgeEl.textContent = "Culminado";
      }
    }

    // Render Dashboard Trayectos Summary
    const summaryContainer = document.getElementById("dashboard-trayectos-summary");
    if (summaryContainer) {
      const openTrayectos = new Set(Array.from(document.querySelectorAll("#dashboard-trayectos-summary details[open]")).map(d => d.dataset.trayectoId));
      const pensum = this.state.pensum[this.currentCareer];
      let trayectosHtml = "";

      let activeTrayectoName = "";

      pensum.trayectos.forEach(t => {
        let aprobadas = 0;
        let repetir = 0;
        let enCurso = 0;
        let consulta = 0;
        let ucGanadas = 0;

        let matListHtml = "";
        t.materias.forEach(m => {
          if (m.estatus === "aprobada") {
            aprobadas++;
            ucGanadas += m.uc;
          }
          if (m.estatus === "repetir") repetir++;
          if (m.estatus === "en_curso") enCurso++;
          if (m.estatus === "pendiente_consulta") consulta++;

          const statusTextMap = {
            aprobada: "Aprobada",
            en_curso: "En Curso",
            repetir: "Por Repetir",
            intensivo_verano: "Intensivo Verano",
            pendiente_consulta: "Pendiente Consulta",
            por_cursar: "Por Cursar"
          };

          matListHtml += `
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 8px; border-bottom: 1px dashed var(--border-color); flex-wrap: wrap; gap: 6px; cursor: pointer;" onclick="app.openSubjectDetailModal('${m.id}')">
              <div>
                <strong style="color: var(--text-dark); font-size: 0.8rem;">${m.nombre}</strong>
                <span style="font-size: 0.72rem; color: var(--text-muted); margin-left: 4px;">(${m.uc} UC)</span>
                ${m.nota ? `<span style="font-size: 0.78rem; font-weight: 700; color: var(--primary-blue); margin-left: 6px;">• ${m.nota} pts</span>` : ''}
              </div>
              <div style="display: flex; align-items: center; gap: 6px;">
                <span class="status-badge status-${m.estatus}">${statusTextMap[m.estatus] || m.estatus}</span>
                <button type="button" class="btn-action" onclick="event.stopPropagation(); app.openSubjectDetailModal('${m.id}')">Notas</button>
              </div>
            </div>
          `;
        });

        const isCurrentActive = t.actual || (enCurso > 0);
        if (isCurrentActive && !activeTrayectoName) {
          activeTrayectoName = `${t.nombre} (En Curso)`;
        }

        let trayectoActionBtn = "";
        if (isCurrentActive) {
          trayectoActionBtn = `
            <span style="font-size: 0.72rem; background: #E8F8F5; color: #117A65; border: 1px solid #A3E4D7; padding: 1px 6px; border-radius: 4px; font-weight: bold;">En Curso</span>
            <button type="button" class="btn-action" style="background: #117A65; color: white; border: none; font-weight: bold; font-size: 0.72rem; margin-left: 4px;" onclick="app.culminateTrayecto('${t.id}', event)">Culminar</button>
          `;
        } else if (t.culminado || (aprobadas === t.materias.length && t.materias.length > 0)) {
          trayectoActionBtn = `
            <span style="font-size: 0.72rem; background: #D1F2EB; color: #0E6251; padding: 1px 6px; border-radius: 4px; font-weight: bold;">Culminado</span>
            <button type="button" class="btn-action" style="color: var(--primary-blue); border-color: var(--primary-blue); font-size: 0.72rem; margin-left: 4px;" onclick="app.activateTrayecto('${t.id}', event)">Iniciar</button>
            <button type="button" class="btn-action" style="background: #117A65; color: white; border: none; font-weight: bold; font-size: 0.72rem; margin-left: 4px;" onclick="app.culminateTrayecto('${t.id}', event)">Culminar</button>
          `;
        } else {
          trayectoActionBtn = `
            <button type="button" class="btn-action" style="color: var(--primary-blue); border-color: var(--primary-blue); font-weight: bold; font-size: 0.72rem;" onclick="app.activateTrayecto('${t.id}', event)">Iniciar</button>
            <button type="button" class="btn-action" style="background: #117A65; color: white; border: none; font-weight: bold; font-size: 0.72rem; margin-left: 4px;" onclick="app.culminateTrayecto('${t.id}', event)">Culminar</button>
          `;
        }

        const isOpenAttr = openTrayectos.has(t.id) ? "open" : "";

        trayectosHtml += `
          <details data-trayecto-id="${t.id}" ${isOpenAttr} class="trayecto-block" style="margin-bottom: 6px; border-radius: 8px;">
            <summary class="trayecto-header" style="padding: 7px 10px; cursor: pointer; user-select: none;">
              <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                <h3 style="margin: 0; font-size: 0.85rem; color: var(--primary-blue); display: inline-block;">${t.nombre}</h3>
                <div style="display: inline-flex; align-items: center; gap: 4px; flex-wrap: wrap;">${trayectoActionBtn}</div>
              </div>
              <div style="font-size: 0.72rem; color: var(--text-secondary);">
                Aprobadas: <strong>${aprobadas}</strong> | Repetir: <strong>${repetir}</strong> | UC: <strong>${ucGanadas}/${t.totalUC}</strong>
              </div>
            </summary>
            <div style="padding: 6px 10px; border-top: 1px solid var(--border-color);">${matListHtml}</div>
          </details>
        `;
      });

      summaryContainer.innerHTML = trayectosHtml;

      const phaseDesc = document.getElementById("home-phase-desc");
      if (phaseDesc && activeTrayectoName) {
        phaseDesc.textContent = activeTrayectoName;
      }
    }
  }

  renderPensum() {
    const container = document.getElementById("pensum-trayectos-container");
    const openTrayectos = new Set(Array.from(document.querySelectorAll("#pensum-trayectos-container details[open]")).map(d => d.dataset.trayectoId));
    const pensum = this.state.pensum[this.currentCareer];

    const searchQuery = (document.getElementById("search-subject-input")?.value || "").toLowerCase();
    const statusFilter = document.getElementById("filter-status-select")?.value || "todos";
    const trayectoFilter = document.getElementById("filter-trayecto-select")?.value || "todos";

    let html = "";

    pensum.trayectos.forEach(t => {
      if (trayectoFilter !== "todos" && t.id !== trayectoFilter) return;

      const filteredMaterias = t.materias.filter(m => {
        const matchesQuery = m.nombre.toLowerCase().includes(searchQuery) || m.codigo.toLowerCase().includes(searchQuery);
        const matchesStatus = statusFilter === "todos" || m.estatus === statusFilter;
        return matchesQuery && matchesStatus;
      });

      if (filteredMaterias.length === 0) return;

      const isCurrentActive = t.actual || (filteredMaterias.some(m => m.estatus === "en_curso"));
      const isOpenAttr = (openTrayectos.has(t.id) || (searchQuery !== "" && filteredMaterias.length > 0) || statusFilter !== "todos" || trayectoFilter !== "todos") ? "open" : "";

      let trayectoActionBtn = "";
      if (isCurrentActive) {
        trayectoActionBtn = `
          <span class="status-badge status-en_curso" style="margin-left: 6px;">ACTUAL EN CURSO</span>
          <button type="button" class="btn-action" style="background: #117A65; color: white; border: none; font-weight: bold; font-size: 0.72rem; margin-left: 4px;" onclick="app.culminateTrayecto('${t.id}', event)">Culminar</button>
        `;
      } else if (t.culminado || (filteredMaterias.every(m => m.estatus === "aprobada") && filteredMaterias.length > 0)) {
        trayectoActionBtn = `
          <span style="font-size: 0.72rem; background: #D1F2EB; color: #0E6251; padding: 1px 6px; border-radius: 4px; font-weight: bold; margin-left: 6px;">Culminado</span>
          <button type="button" class="btn-action" style="color: var(--primary-blue); border-color: var(--primary-blue); font-size: 0.72rem; margin-left: 4px;" onclick="app.activateTrayecto('${t.id}', event)">Iniciar</button>
          <button type="button" class="btn-action" style="background: #117A65; color: white; border: none; font-weight: bold; font-size: 0.72rem; margin-left: 4px;" onclick="app.culminateTrayecto('${t.id}', event)">Culminar</button>
        `;
      } else {
        trayectoActionBtn = `
          <button type="button" class="btn-action" style="color: var(--primary-blue); border-color: var(--primary-blue); font-weight: bold; font-size: 0.72rem; margin-left: 6px;" onclick="app.activateTrayecto('${t.id}', event)">Iniciar</button>
          <button type="button" class="btn-action" style="background: #117A65; color: white; border: none; font-weight: bold; font-size: 0.72rem; margin-left: 4px;" onclick="app.culminateTrayecto('${t.id}', event)">Culminar</button>
        `;
      }

      html += `
        <details data-trayecto-id="${t.id}" ${isOpenAttr} class="trayecto-block" style="margin-bottom: 8px; border-radius: 8px; overflow: hidden;">
          <summary class="trayecto-header" style="cursor: pointer; user-select: none; padding: 7px 10px;">
            <div class="trayecto-title">
              <span>${t.nombre}</span>
              ${trayectoActionBtn}
            </div>
            <span class="trayecto-badge-uc">${t.totalUC} UC</span>
          </summary>

          <div class="subject-table-wrapper" style="padding: 4px 6px;">
            <table class="subject-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Asignatura</th>
                  <th>UC</th>
                  <th>Estatus</th>
                  <th>Nota</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
      `;

      filteredMaterias.forEach(m => {
        const statusClass = `status-${m.estatus}`;
        const statusTextMap = {
          aprobada: "Aprobada",
          en_curso: "En Curso",
          repetir: "Por Repetir",
          intensivo_verano: "Intensivo Verano",
          pendiente_consulta: "Pendiente Consulta",
          por_cursar: "Por Cursar"
        };

        const notaDisplay = m.nota ? `<strong>${m.nota} pts</strong>` : "-";

        let prelaHtml = "";
        if (typeof MAPA_PRELACIONES !== "undefined" && MAPA_PRELACIONES[this.currentCareer]) {
          const careerPrela = MAPA_PRELACIONES[this.currentCareer];
          if (careerPrela[m.id]) {
            prelaHtml += `<div class="prela-tag">Requisito clave</div>`;
          }
          for (const [reqId, info] of Object.entries(careerPrela)) {
            if (info.prelaA && info.prelaA.includes(m.id)) {
              let reqSub = null;
              pensum.trayectos.forEach(tr => tr.materias.forEach(mat => { if (mat.id === reqId) reqSub = mat; }));
              if (reqSub && reqSub.estatus === "repetir") {
                prelaHtml += `<div class="prela-warning-tag">Prelada por: ${reqSub.nombre} (Por Repetir)</div>`;
              }
            }
          }
        }

        html += `
          <tr style="cursor: pointer;" onclick="app.openSubjectDetailModal('${m.id}')">
            <td class="subject-code">${m.codigo}</td>
            <td class="subject-name">
              ${m.nombre}
              ${prelaHtml}
            </td>
            <td><strong>${m.uc}</strong></td>
            <td><span class="status-badge ${statusClass}">${statusTextMap[m.estatus] || m.estatus}</span></td>
            <td>${notaDisplay}</td>
            <td>
              <button type="button" class="btn-action" style="color: var(--primary-blue); font-weight: bold;" onclick="event.stopPropagation(); app.openSubjectDetailModal('${m.id}')">Ficha / Notas →</button>
            </td>
          </tr>
        `;
      });

      html += `
              </tbody>
            </table>
          </div>
        </details>
      `;
    });

    container.innerHTML = html || '<div style="text-align:center; padding:20px; color:var(--text-muted);">No hay asignaturas que coincidan con la búsqueda.</div>';
  }

  filterSubjects() {
    this.renderPensum();
  }

  openSubjectDetailModal(subjectId) {
    this.selectedEvalSubjectId = subjectId;
    this.renderSubjectDetailContent(subjectId);
    this.openModal("modal-subject-detail");
  }

  renderSubjectDetailContent(subjectId) {
    const container = document.getElementById("detail-subject-content");
    const titleEl = document.getElementById("detail-subject-title");
    if (!container) return;

    const pensum = this.state.pensum[this.currentCareer];
    let foundSubject = null;
    let foundTrayecto = null;

    pensum.trayectos.forEach(t => {
      t.materias.forEach(m => {
        if (m.id === subjectId) {
          foundSubject = m;
          foundTrayecto = t;
        }
      });
    });

    if (!foundSubject) {
      container.innerHTML = '<div style="padding:20px; text-align:center; color:var(--text-muted);">Asignatura no encontrada.</div>';
      return;
    }

    if (titleEl) {
      titleEl.textContent = `${foundSubject.codigo} • ${foundSubject.nombre}`;
    }

    const statusTextMap = {
      aprobada: "Aprobada",
      en_curso: "En Curso",
      repetir: "Por Repetir",
      intensivo_verano: "Intensivo Verano",
      pendiente_consulta: "Pendiente Consulta",
      por_cursar: "Por Cursar"
    };

    const isProyecto = (foundSubject.nombre.toLowerCase().includes("proyecto socio") || foundSubject.codigo.toLowerCase().includes("psi") || foundSubject.codigo.toLowerCase().includes("pst"));
    const minPassScore = isProyecto ? 16 : 13;
    const goodScore = isProyecto ? 18 : 16;
    const excelScore = 20;

    const evals = this.state.evaluaciones[subjectId] || [];
    let totalWeight = 0;
    let totalScoreWeighted = 0;

    evals.forEach(e => {
      totalWeight += Number.parseFloat(e.ponderacion || 0);
      if (e.nota !== null && e.nota !== undefined) {
        totalScoreWeighted += (Number.parseFloat(e.nota) * (Number.parseFloat(e.ponderacion) / 100));
      }
    });

    const remainingWeight = Math.max(0, 100 - totalWeight);
    let predictiveHtml = "";
    if (totalWeight < 100 || foundSubject.estatus !== "aprobada") {
      const neededMin = Math.max(0, minPassScore - totalScoreWeighted);
      const reqGradeMin = remainingWeight > 0 ? (neededMin / (remainingWeight / 100)).toFixed(1) : "N/A";

      const neededGood = Math.max(0, goodScore - totalScoreWeighted);
      const reqGradeGood = remainingWeight > 0 ? (neededGood / (remainingWeight / 100)).toFixed(1) : "N/A";

      const neededExcel = Math.max(0, excelScore - totalScoreWeighted);
      const reqGradeExcel = remainingWeight > 0 ? (neededExcel / (remainingWeight / 100)).toFixed(1) : "N/A";

      predictiveHtml = `
        <div class="eval-predictive-box" style="margin-top: 12px; margin-bottom: 12px;">
          <div class="predictive-header">
            <div class="predictive-title">
              <span>Simulador de Calificación (${isProyecto ? 'Proyecto: Mínimo 16 pts' : 'General: Mínimo 13 pts'})</span>
            </div>
            <div style="font-size: 0.75rem; color: #166534; font-weight: bold;">
              Por evaluar: ${remainingWeight}%
            </div>
          </div>
          <div class="predictive-targets-grid">
            <div class="predictive-target-card">
              <div class="predictive-target-name">Mínimo para Aprobar (${minPassScore} pts)</div>
              <div class="predictive-target-score">${reqGradeMin <= 0 ? "¡Aprobado!" : (reqGradeMin > 20 ? "No alcanza" : `${reqGradeMin} pts prom.`)}</div>
              <div style="font-size:0.68rem; color:var(--text-muted); margin-top: 2px;">Faltan ${neededMin.toFixed(2)} pts</div>
            </div>
            <div class="predictive-target-card">
              <div class="predictive-target-name">Meta Rendimiento (${goodScore} pts)</div>
              <div class="predictive-target-score">${reqGradeGood <= 0 ? "¡Alcanzado!" : (reqGradeGood > 20 ? "No alcanza" : `${reqGradeGood} pts prom.`)}</div>
              <div style="font-size:0.68rem; color:var(--text-muted); margin-top: 2px;">Faltan ${neededGood.toFixed(2)} pts</div>
            </div>
            <div class="predictive-target-card">
              <div class="predictive-target-name">Sobresaliente (${excelScore} pts)</div>
              <div class="predictive-target-score">${reqGradeExcel <= 0 ? "¡Alcanzado!" : (reqGradeExcel > 20 ? "No alcanza" : `${reqGradeExcel} pts prom.`)}</div>
              <div style="font-size:0.68rem; color:var(--text-muted); margin-top: 2px;">Faltan ${neededExcel.toFixed(2)} pts</div>
            </div>
          </div>
        </div>
      `;
    }

    let evalRows = "";
    if (evals.length === 0) {
      evalRows = '<tr><td colspan="6" style="text-align:center; padding:16px; color:var(--text-muted); font-size:0.8rem;">Sin evaluaciones registradas aún. Presiona <strong>+ Nueva Evaluación</strong> para agregar una.</td></tr>';
    } else {
      evals.forEach((e, idx) => {
        const ptsGanados = (e.nota !== null) ? ((e.nota * e.ponderacion) / 100).toFixed(2) : "-";
        const statusBadge = e.completada
          ? '<span class="status-badge status-aprobada" style="font-size:0.68rem;">Completada</span>'
          : '<span class="status-badge status-intensivo_verano" style="font-size:0.68rem;">Pendiente</span>';

        evalRows += `
          <tr>
            <td class="subject-name" style="font-size:0.82rem;">${e.nombre}</td>
            <td style="font-size:0.8rem;"><strong>${e.ponderacion}%</strong></td>
            <td style="font-size:0.8rem;">${e.nota !== null ? `<strong>${e.nota} pts</strong>` : "-"}</td>
            <td style="font-size:0.8rem;"><strong style="color: var(--primary-blue);">${ptsGanados} pts</strong></td>
            <td>${statusBadge}</td>
            <td>
              <div style="display:flex; gap:4px;">
                <button type="button" class="btn-action" style="padding:2px 6px; font-size:0.7rem;" onclick="app.openEditEvalModal('${idx}')">Editar</button>
                <button type="button" class="btn-action" style="padding:2px 6px; font-size:0.7rem; color:#BE123C; border-color:#FECDD3;" onclick="app.deleteEvaluation('${idx}')">&times;</button>
              </div>
            </td>
          </tr>
        `;
      });
    }

    const html = `
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div style="background: var(--bg-hover); border-radius: 8px; padding: 10px 12px; border: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
          <div>
            <div style="font-size: 0.72rem; font-weight: bold; color: var(--primary-blue); text-transform: uppercase;">
              ${foundTrayecto ? foundTrayecto.nombre : 'Pensum'} • ${foundSubject.uc} UC • Nota Oficial: <strong>${foundSubject.nota !== null ? foundSubject.nota + ' pts' : 'Sin calificar'}</strong>
            </div>
            ${foundSubject.refDoc ? `<div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;"><strong>Profesor / Nota:</strong> ${foundSubject.refDoc}</div>` : ''}
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span class="status-badge status-${foundSubject.estatus}">${statusTextMap[foundSubject.estatus] || foundSubject.estatus}</span>
            <button type="button" class="btn-action" style="font-size: 0.72rem; padding: 3px 8px;" onclick="app.openEditSubjectModal('${foundSubject.id}')">Editar Datos</button>
          </div>
        </div>

        ${predictiveHtml}

        <div style="background: white; border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; margin-top: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; background: var(--bg-hover); border-bottom: 1px solid var(--border-color); flex-wrap: wrap; gap: 6px;">
            <div style="font-size: 0.78rem; font-weight: bold; color: var(--text-dark);">
              Ponderación: ${totalWeight}% / 100% • Acumulado: <span style="color: var(--primary-blue);">${totalScoreWeighted.toFixed(2)} / 20 pts</span>
            </div>
            <div style="display: flex; gap: 6px;">
              <button type="button" class="btn-primary" style="padding: 3px 8px; font-size: 0.72rem;" onclick="app.openAddEvalModal()">+ Nueva Evaluación</button>
              <button type="button" class="btn-action" style="background: #117A65; color: white; border: none; font-weight: bold; padding: 3px 8px; font-size: 0.72rem;" onclick="app.syncEvalGradeToPensum('${subjectId}')">Sincronizar Nota</button>
            </div>
          </div>

          <div class="subject-table-wrapper" style="max-height: 250px; overflow-y: auto;">
            <table class="subject-table">
              <thead>
                <tr>
                  <th>Evaluación</th>
                  <th>Peso</th>
                  <th>Nota</th>
                  <th>Ganados</th>
                  <th>Estatus</th>
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                ${evalRows}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    container.innerHTML = html;
  }

  openAddSubjectModal() {
    const pensum = this.state.pensum[this.currentCareer];
    document.getElementById("edit-subject-id").value = "";
    document.getElementById("modal-subject-title").textContent = `Agregar Nueva Asignatura (${this.currentCareer})`;
    document.getElementById("edit-subject-name").value = "";
    document.getElementById("edit-subject-code").value = "";
    document.getElementById("edit-subject-uc").value = "2";

    const trayectoSelect = document.getElementById("edit-subject-trayecto");
    if (trayectoSelect && pensum) {
      trayectoSelect.innerHTML = pensum.trayectos.map(t => `<option value="${t.id}">${t.nombre}</option>`).join("");
      const activeT = pensum.trayectos.find(t => t.actual) || pensum.trayectos[0];
      if (activeT) trayectoSelect.value = activeT.id;
    }

    document.getElementById("edit-subject-status").value = "en_curso";
    document.getElementById("edit-subject-grade").value = "";
    document.getElementById("edit-subject-ref").value = "";

    this.openModal("modal-edit-subject");
  }

  openEditSubjectModal(subjectId) {
    const pensum = this.state.pensum[this.currentCareer];
    let foundMat = null;
    let foundTrayecto = null;

    pensum.trayectos.forEach(t => {
      t.materias.forEach(m => {
        if (m.id === subjectId) {
          foundMat = m;
          foundTrayecto = t;
        }
      });
    });

    if (!foundMat) return;

    document.getElementById("edit-subject-id").value = foundMat.id;
    document.getElementById("modal-subject-title").textContent = `Editar: ${foundMat.nombre}`;
    document.getElementById("edit-subject-name").value = foundMat.nombre;
    document.getElementById("edit-subject-code").value = foundMat.codigo;
    document.getElementById("edit-subject-uc").value = foundMat.uc;

    const trayectoSelect = document.getElementById("edit-subject-trayecto");
    if (trayectoSelect && pensum) {
      trayectoSelect.innerHTML = pensum.trayectos.map(t => `<option value="${t.id}">${t.nombre}</option>`).join("");
      if (foundTrayecto) trayectoSelect.value = foundTrayecto.id;
    }

    document.getElementById("edit-subject-status").value = foundMat.estatus;
    document.getElementById("edit-subject-grade").value = foundMat.nota !== null ? foundMat.nota : "";
    document.getElementById("edit-subject-ref").value = foundMat.refDoc || "";

    this.openModal("modal-edit-subject");
  }

  saveSubjectEdit(event) {
    event.preventDefault();
    const scrollPos = window.scrollY;

    const id = document.getElementById("edit-subject-id").value;
    const name = (document.getElementById("edit-subject-name").value || "").trim();
    let code = (document.getElementById("edit-subject-code").value || "").trim();
    const ucVal = document.getElementById("edit-subject-uc").value;
    const uc = ucVal ? Number.parseInt(ucVal, 10) : 2;
    const trayectoTarget = document.getElementById("edit-subject-trayecto").value;
    const newStatus = document.getElementById("edit-subject-status").value;
    const newGradeVal = document.getElementById("edit-subject-grade").value;
    const newRef = (document.getElementById("edit-subject-ref").value || "").trim();

    if (!name) {
      this.showToast("Por favor ingresa el nombre de la asignatura.", "warning");
      return;
    }

    if (!code) {
      code = name.substring(0, 3).toUpperCase() + "-" + Math.floor(100 + Math.random() * 900);
    }

    const pensum = this.state.pensum[this.currentCareer];
    const isProyecto = name.toLowerCase().includes("proyecto socio") || code.toLowerCase().includes("psi") || code.toLowerCase().includes("pst");
    const minPass = isProyecto ? 16 : 13;
    let finalStatus = newStatus;
    let gradeNum = null;

    if (newGradeVal !== "") {
      gradeNum = Number.parseFloat(newGradeVal);
      if (gradeNum >= minPass && (newStatus === "en_curso" || newStatus === "por_cursar" || newStatus === "repetir")) {
        finalStatus = "aprobada";
      } else if (gradeNum < minPass && newStatus === "aprobada") {
        finalStatus = "repetir";
      }
    }

    if (id !== "") {
      let existingMat = null;
      let currentTrayecto = null;

      pensum.trayectos.forEach(t => {
        t.materias.forEach(m => {
          if (m.id === id) {
            existingMat = m;
            currentTrayecto = t;
          }
        });
      });

      if (existingMat) {
        existingMat.nombre = name;
        existingMat.codigo = code;
        existingMat.uc = uc;
        existingMat.estatus = finalStatus;
        existingMat.nota = gradeNum;
        existingMat.refDoc = newRef;

        if (currentTrayecto && currentTrayecto.id !== trayectoTarget) {
          currentTrayecto.materias = currentTrayecto.materias.filter(m => m.id !== id);
          let newTrayectoObj = pensum.trayectos.find(t => t.id === trayectoTarget);
          if (!newTrayectoObj) newTrayectoObj = currentTrayecto;
          newTrayectoObj.materias.push(existingMat);
        }
      }
    } else {
      const newSubject = {
        id: (this.currentCareer === "ADM" ? "adm-" : "inf-") + Date.now(),
        codigo: code,
        nombre: name,
        uc: uc,
        estatus: finalStatus,
        nota: gradeNum,
        refDoc: newRef
      };

      let targetTrayectoObj = pensum.trayectos.find(t => t.id === trayectoTarget);
      if (!targetTrayectoObj) {
        targetTrayectoObj = pensum.trayectos.find(t => t.actual) || pensum.trayectos[0];
      }
      if (targetTrayectoObj) {
        targetTrayectoObj.materias.push(newSubject);
      }
    }

    this.saveState();
    this.closeModal("modal-edit-subject");

    const searchInput = document.getElementById("search-subject-input");
    if (searchInput) searchInput.value = "";
    const statusFilter = document.getElementById("filter-status-select");
    if (statusFilter) statusFilter.value = "todos";

    // Actualización inmediata en vivo de todas las vistas
    this.renderDashboard();
    this.renderPensum();
    this.renderSemestreActual();
    this.renderConsultas();

    const targetId = id || this.selectedEvalSubjectId;
    if (targetId) {
      this.renderSubjectDetailContent(targetId);
      this.loadEvaluationsForSubject(targetId);
    }
    window.scrollTo({ top: scrollPos, behavior: "instant" });
    this.showToast(`¡Asignatura "${name}" guardada con éxito!`, "success");
  }

  deleteSubject(subjectId) {
    const pensum = this.state.pensum[this.currentCareer];
    pensum.trayectos.forEach(t => {
      t.materias = t.materias.filter(m => m.id !== subjectId);
    });

    this.saveState();
    this.renderPensum();
    this.renderDashboard();
    this.renderSemestreActual();
    this.renderConsultas();
    this.showToast("Asignatura eliminada del pensum.", "info");
  }

  renderConsultas() {
    const tbody = document.getElementById("tabla-consultas-body");
    const filterSelect = document.getElementById("consultas-filter-select");
    const filterVal = filterSelect ? filterSelect.value : "pendiente_consulta";
    const pensum = this.state.pensum[this.currentCareer];

    let html = "";
    let count = 0;

    pensum.trayectos.forEach(t => {
      t.materias.forEach(m => {
        const matches = (filterVal === "todos") || (m.estatus === filterVal);
        if (matches) {
          count++;
          const statusTextMap = {
            aprobada: "Aprobada",
            en_curso: "En Curso",
            repetir: "Por Repetir",
            intensivo_verano: "Intensivo Verano",
            pendiente_consulta: "Pendiente Consulta",
            por_cursar: "Por Cursar"
          };

          html += `
            <tr>
              <td class="subject-name">${m.nombre}</td>
              <td><strong>${t.nombre}</strong></td>
              <td><span class="status-badge status-${m.estatus}">${statusTextMap[m.estatus] || m.estatus}</span></td>
              <td>${m.nota ? `${m.nota} pts` : "Por Registrar"}</td>
              <td>${m.refDoc || "Sin observaciones registradas"}</td>
              <td>
                <button class="btn-action" onclick="app.openEditSubjectModal('${m.id}')">Editar Estatus / Nota</button>
              </td>
            </tr>
          `;
        }
      });
    });

    if (count === 0) {
      html = `<tr><td colspan="6" style="text-align:center; padding:25px; color:var(--text-muted);">No hay asignaturas registradas con este filtro.</td></tr>`;
    }

    tbody.innerHTML = html;
  }

  renderEvaluationsSection() {
    const picker = document.getElementById("eval-subject-picker");
    const scopeSelect = document.getElementById("eval-filter-scope");
    const scope = scopeSelect ? scopeSelect.value : "actuales";
    const pensum = this.state.pensum[this.currentCareer];

    let options = "";
    let firstEnCursoId = null;
    let firstAnyId = null;
    let selectedExists = false;

    pensum.trayectos.forEach(t => {
      let groupOptions = "";

      t.materias.forEach(m => {
        if (!firstAnyId) firstAnyId = m.id;
        if (!firstEnCursoId && (m.estatus === "en_curso" || m.estatus === "repetir")) {
          firstEnCursoId = m.id;
        }

        const isActiva = (m.estatus === "en_curso" || m.estatus === "repetir" || m.estatus === "intensivo_verano" || m.estatus === "pendiente_consulta");
        if (scope === "actuales" && !isActiva) {
          return;
        }

        if (this.selectedEvalSubjectId === m.id) {
          selectedExists = true;
        }

        const selectedAttr = (this.selectedEvalSubjectId === m.id) ? "selected" : "";
        groupOptions += `<option value="${m.id}" ${selectedAttr}>${m.nombre}</option>`;
      });

      if (groupOptions) {
        options += `<optgroup label="${t.nombre}">${groupOptions}</optgroup>`;
      }
    });

    if (!options && scope === "actuales") {
      options = `<option value="">No hay materias activas. Cambia el filtro a "Todas".</option>`;
    }

    picker.innerHTML = options || '<option value="">No hay materias disponibles</option>';

    if (!selectedExists || !this.selectedEvalSubjectId) {
      this.selectedEvalSubjectId = firstEnCursoId || firstAnyId;
    }

    if (this.selectedEvalSubjectId) {
      picker.value = this.selectedEvalSubjectId;
      this.loadEvaluationsForSubject(this.selectedEvalSubjectId);
    }
  }

  loadEvaluationsForSubject(subjectId) {
    this.selectedEvalSubjectId = subjectId;
    this.renderSubjectDetailContent(subjectId);
    const container = document.getElementById("eval-panel-container");

    const pensum = this.state.pensum[this.currentCareer];
    let foundSubject = null;
    let foundTrayecto = null;

    pensum.trayectos.forEach(t => {
      t.materias.forEach(m => {
        if (m.id === subjectId) {
          foundSubject = m;
          foundTrayecto = t;
        }
      });
    });

    const evals = this.state.evaluaciones[subjectId] || [];

    let totalWeight = 0;
    let totalScoreWeighted = 0;

    evals.forEach(e => {
      totalWeight += Number.parseFloat(e.ponderacion || 0);
      if (e.nota !== null && e.nota !== undefined) {
        totalScoreWeighted += (Number.parseFloat(e.nota) * (Number.parseFloat(e.ponderacion) / 100));
      }
    });

    let subjectHeaderHtml = "";
    if (foundSubject) {
      const statusTextMap = {
        aprobada: "Aprobada",
        en_curso: "En Curso",
        repetir: "Por Repetir",
        intensivo_verano: "Intensivo Verano",
        pendiente_consulta: "Pendiente Consulta",
        por_cursar: "Por Cursar"
      };

      subjectHeaderHtml = `
        <div class="subject-eval-header-card" style="background: white; border-radius: 12px; padding: 18px 22px; margin-bottom: 20px; border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
          <div>
            <div style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; color: var(--primary-marine); letter-spacing: 0.5px; margin-bottom: 4px;">
              ${foundTrayecto ? foundTrayecto.nombre : 'Pensum Académico'} • ${foundSubject.uc} UC
            </div>
            <h2 style="margin: 0; font-size: 1.35rem; color: var(--text-dark);">
              ${foundSubject.nombre}
            </h2>
            ${foundSubject.refDoc ? `<p style="margin: 6px 0 0 0; font-size: 0.85rem; color: var(--text-secondary);"><strong>Detalles / Profesor / Soporte:</strong> ${foundSubject.refDoc}</p>` : ''}
          </div>
          <div>
            <span class="status-badge status-${foundSubject.estatus}">${statusTextMap[foundSubject.estatus] || foundSubject.estatus}</span>
          </div>
        </div>
      `;
    }

    // Calculador Predictivo de Nota Necesaria con Regla UNEXCA: General (13 pts) / Proyecto (16 pts)
    const isProyecto = (foundSubject && (foundSubject.nombre.toLowerCase().includes("proyecto socio") || foundSubject.codigo.toLowerCase().includes("psi") || foundSubject.codigo.toLowerCase().includes("pst")));
    const minPassScore = isProyecto ? 16 : 13;
    const goodScore = isProyecto ? 18 : 16;
    const excelScore = 20;

    let predictiveHtml = "";
    const remainingWeight = Math.max(0, 100 - totalWeight);
    if (totalWeight < 100 || (foundSubject && foundSubject.estatus !== "aprobada")) {
      const neededMin = Math.max(0, minPassScore - totalScoreWeighted);
      const reqGradeMin = remainingWeight > 0 ? (neededMin / (remainingWeight / 100)).toFixed(1) : "N/A";

      const neededGood = Math.max(0, goodScore - totalScoreWeighted);
      const reqGradeGood = remainingWeight > 0 ? (neededGood / (remainingWeight / 100)).toFixed(1) : "N/A";

      const neededExcel = Math.max(0, excelScore - totalScoreWeighted);
      const reqGradeExcel = remainingWeight > 0 ? (neededExcel / (remainingWeight / 100)).toFixed(1) : "N/A";

      predictiveHtml = `
        <div class="eval-predictive-box">
          <div class="predictive-header">
            <div class="predictive-title">
              <span>Simulador de Calificación Necesaria (${isProyecto ? 'Proyecto: Mínimo 16 pts' : 'Materia General: Mínimo 13 pts'})</span>
            </div>
            <div style="font-size: 0.8rem; color: #166534; font-weight: bold;">
              Ponderación restante por evaluar: ${remainingWeight}%
            </div>
          </div>
          <div class="predictive-targets-grid">
            <div class="predictive-target-card">
              <div class="predictive-target-name">Mínimo para Aprobar (${minPassScore} pts)</div>
              <div class="predictive-target-score">${reqGradeMin <= 0 ? "¡Aprobado!" : (reqGradeMin > 20 ? "No alcanza" : `${reqGradeMin} pts prom.`)}</div>
              <div style="font-size:0.72rem; color:var(--text-muted); margin-top: 3px;">Faltan ${neededMin.toFixed(2)} pts acumulados</div>
            </div>
            <div class="predictive-target-card">
              <div class="predictive-target-name">Meta Rendimiento Bueno (${goodScore} pts)</div>
              <div class="predictive-target-score">${reqGradeGood <= 0 ? "¡Alcanzado!" : (reqGradeGood > 20 ? "No alcanza" : `${reqGradeGood} pts prom.`)}</div>
              <div style="font-size:0.72rem; color:var(--text-muted); margin-top: 3px;">Faltan ${neededGood.toFixed(2)} pts acumulados</div>
            </div>
            <div class="predictive-target-card">
              <div class="predictive-target-name">Meta Distinción / Sobresaliente (${excelScore} pts)</div>
              <div class="predictive-target-score">${reqGradeExcel <= 0 ? "¡Alcanzado!" : (reqGradeExcel > 20 ? "No alcanza" : `${reqGradeExcel} pts prom.`)}</div>
              <div style="font-size:0.72rem; color:var(--text-muted); margin-top: 3px;">Faltan ${neededExcel.toFixed(2)} pts acumulados</div>
            </div>
          </div>
        </div>
      `;
    }

    let html = `
      ${subjectHeaderHtml}
      ${predictiveHtml}
      <div class="eval-panel">
        <div class="eval-summary-bar">
          <div>
            <span>PONDERACIÓN ACUMULADA: <strong>${totalWeight}%</strong> de 100%</span>
          </div>
          <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
            <div class="eval-score-total">
              NOTA ACUMULADA: ${totalScoreWeighted.toFixed(2)} / 20 pts
            </div>
            <button type="button" class="btn-action" style="background: var(--primary-marine); color: white; border: none; font-weight: bold; padding: 6px 12px;" onclick="app.syncEvalGradeToPensum('${subjectId}')">
              Sincronizar con Pensum
            </button>
          </div>
        </div>

        <div class="subject-table-wrapper">
          <table class="subject-table">
            <thead>
              <tr>
                <th>Evaluación / Taller</th>
                <th>Ponderación (%)</th>
                <th>Nota (0-20)</th>
                <th>Puntos Ganados</th>
                <th>Fecha</th>
                <th>Estatus</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
    `;

    if (evals.length === 0) {
      html += `<tr><td colspan="7" style="text-align:center; padding:30px; color:var(--text-muted);">No hay evaluaciones registradas para esta asignatura aún.<br><span style="font-size:0.85rem; margin-top:5px; display:inline-block;">Haz clic en <strong>+ Nueva Evaluación</strong> arriba para registrar lo acordado con el profesor.</span></td></tr>`;
    } else {
      evals.forEach((e, idx) => {
        const ptsGanados = (e.nota !== null) ? ((e.nota * e.ponderacion) / 100).toFixed(2) : "-";
        const statusBadge = e.completada
          ? '<span class="status-badge status-aprobada">COMPLETADA</span>'
          : '<span class="status-badge status-intensivo_verano">PENDIENTE</span>';

        html += `
          <tr>
            <td class="subject-name">${e.nombre}</td>
            <td><strong>${e.ponderacion}%</strong></td>
            <td>${e.nota !== null ? `<strong>${e.nota} pts</strong>` : "-"}</td>
            <td><strong style="color: var(--primary-marine);">${ptsGanados} pts</strong></td>
            <td>${e.fecha || "-"}</td>
            <td>${statusBadge}</td>
            <td>
              <button type="button" class="btn-action" onclick="app.openEditEvalModal('${idx}')">Editar</button>
              <button type="button" class="btn-action" style="color:#C0392B; border-color:#FDEDEC;" onclick="app.deleteEvaluation('${idx}')">Eliminar</button>
            </td>
          </tr>
        `;
      });
    }

    html += `
            </tbody>
          </table>
        </div>
      </div>
    `;

    container.innerHTML = html;
  }

  syncEvalGradeToPensum(subjectId) {
    const scrollPos = window.scrollY;
    const pensum = this.state.pensum[this.currentCareer];
    let found = null;
    pensum.trayectos.forEach(t => {
      t.materias.forEach(m => {
        if (m.id === subjectId) found = m;
      });
    });
    if (!found) return;

    const evals = this.state.evaluaciones[subjectId] || [];
    let totalScoreWeighted = 0;
    let totalWeight = 0;
    evals.forEach(e => {
      totalWeight += Number.parseFloat(e.ponderacion || 0);
      if (e.nota !== null && e.nota !== undefined) {
        totalScoreWeighted += (Number.parseFloat(e.nota) * (Number.parseFloat(e.ponderacion) / 100));
      }
    });

    const finalGrade = Math.round(totalScoreWeighted * 10) / 10;
    found.nota = finalGrade;

    const isProyecto = found.nombre.toLowerCase().includes("proyecto socio") || found.codigo.toLowerCase().includes("psi") || found.codigo.toLowerCase().includes("pst");
    const minPass = isProyecto ? 16 : 13;

    if (finalGrade >= minPass) {
      found.estatus = "aprobada";
    } else if (totalWeight >= 100 && finalGrade < minPass) {
      found.estatus = "repetir";
    }

    this.saveState();
    this.renderDashboard();
    this.renderPensum();
    this.renderSemestreActual();
    this.renderSubjectDetailContent(subjectId);
    this.loadEvaluationsForSubject(subjectId);
    window.scrollTo({ top: scrollPos, behavior: "instant" });
    this.showToast(`Nota de ${finalGrade} pts sincronizada en "${found.nombre}". (${found.estatus.toUpperCase()})`, "success");
  }

  openAddEvalModal() {
    if (!this.selectedEvalSubjectId) {
      this.showToast("Por favor selecciona una materia primero.", "warning");
      return;
    }
    document.getElementById("edit-eval-id").value = "";
    document.getElementById("modal-eval-title").textContent = "Nueva Evaluación";
    document.getElementById("edit-eval-name").value = "";
    document.getElementById("edit-eval-weight").value = "25";
    document.getElementById("edit-eval-score").value = "";
    document.getElementById("edit-eval-date").value = "";
    document.getElementById("edit-eval-completed").checked = false;

    this.openModal("modal-edit-eval");
  }

  openEditEvalModal(index) {
    const evals = this.state.evaluaciones[this.selectedEvalSubjectId] || [];
    const item = evals[index];
    if (!item) return;

    document.getElementById("edit-eval-id").value = index;
    document.getElementById("modal-eval-title").textContent = "Editar Evaluación";
    document.getElementById("edit-eval-name").value = item.nombre;
    document.getElementById("edit-eval-weight").value = item.ponderacion;
    document.getElementById("edit-eval-score").value = item.nota !== null ? item.nota : "";
    document.getElementById("edit-eval-date").value = item.fecha || "";
    document.getElementById("edit-eval-completed").checked = item.completada || false;

    this.openModal("modal-edit-eval");
  }

  saveEvaluation(event) {
    event.preventDefault();
    if (!this.selectedEvalSubjectId) return;

    const scrollPos = window.scrollY;
    const evalIdIndex = document.getElementById("edit-eval-id").value;
    const name = document.getElementById("edit-eval-name").value;
    const weight = Number.parseFloat(document.getElementById("edit-eval-weight").value);
    const scoreVal = document.getElementById("edit-eval-score").value;
    const score = scoreVal !== "" ? Number.parseFloat(scoreVal) : null;
    const date = document.getElementById("edit-eval-date").value;
    const completed = document.getElementById("edit-eval-completed").checked;

    if (!this.state.evaluaciones[this.selectedEvalSubjectId]) {
      this.state.evaluaciones[this.selectedEvalSubjectId] = [];
    }

    const evalObj = {
      id: "eval-" + Date.now(),
      nombre: name,
      ponderacion: weight,
      nota: score,
      fecha: date,
      completada: completed
    };

    if (evalIdIndex !== "") {
      this.state.evaluaciones[this.selectedEvalSubjectId][Number.parseInt(evalIdIndex, 10)] = evalObj;
    } else {
      this.state.evaluaciones[this.selectedEvalSubjectId].push(evalObj);
    }

    this.saveState();
    this.closeModal("modal-edit-eval");
    this.loadEvaluationsForSubject(this.selectedEvalSubjectId);
    window.scrollTo({ top: scrollPos, behavior: "instant" });
  }

  deleteEvaluation(index) {
    this.state.evaluaciones[this.selectedEvalSubjectId].splice(index, 1);
    this.saveState();
    this.loadEvaluationsForSubject(this.selectedEvalSubjectId);
    this.renderSubjectDetailContent(this.selectedEvalSubjectId);
    this.showToast("Evaluación eliminada.", "info");
  }

  getScheduleList() {
    if (!this.state.horario || typeof this.state.horario !== "object") {
      this.state.horario = { ADM: { A: [], B: [] }, INF: { A: [], B: [] } };
    }
    if (!this.state.horario[this.currentCareer]) {
      this.state.horario[this.currentCareer] = { A: [], B: [] };
    }
    if (!this.state.horario[this.currentCareer][this.currentWeek]) {
      this.state.horario[this.currentCareer][this.currentWeek] = [];
    }
    return this.state.horario[this.currentCareer][this.currentWeek];
  }

  renderSchedule() {
    const container = document.getElementById("schedule-cards-container");
    const weekTitle = document.getElementById("horario-week-title");
    const careerName = this.currentCareer === "ADM" ? "Administración" : "Informática";
    if (weekTitle) {
      weekTitle.textContent = `Semana ${this.currentWeek} (${careerName})`;
    }

    const items = this.getScheduleList();
    const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    let html = "";

    days.forEach(day => {
      const dayClasses = items.filter(i => i.dia === day);
      html += `
        <div class="schedule-day-card">
          <div class="schedule-day-title">${day}</div>
      `;

      if (dayClasses.length === 0) {
        html += '<div style="font-size:0.8rem; color:var(--text-muted); padding: 10px 0;">Sin clases programadas.</div>';
      } else {
        dayClasses.forEach(c => {
          const shiftBadge = c.turno ? `<span style="font-size: 0.75rem; background: #EAECEE; color: #2C3E50; padding: 2px 6px; border-radius: 4px; font-weight: bold; margin-left: 4px;">${c.turno}</span>` : '';
          html += `
            <div class="schedule-item" style="position: relative; margin-bottom: 8px;">
              <div class="schedule-item-time">${c.hora} ${shiftBadge} • ${c.aula || 'Aula por definir'}</div>
              <div class="schedule-item-title">${c.materia}</div>
              <button type="button" onclick="app.deleteScheduleClass('${c.id}')" style="position: absolute; right: 5px; top: 5px; background: transparent; border: none; color: #C0392B; cursor: pointer; font-size: 1.1rem; line-height: 1;" title="Eliminar clase">&times;</button>
            </div>
          `;
        });
      }

      html += `</div>`;
    });

    container.innerHTML = html;
    this.renderNotifications();
  }

  clearCurrentSchedule() {
    const items = this.getScheduleList();
    items.length = 0;
    this.saveState();
    this.renderSchedule();
    this.showToast("Horario limpiado correctamente.", "info");
  }

  deleteScheduleClass(classId) {
    const items = this.getScheduleList();
    const idx = items.findIndex(i => i.id === classId);
    if (idx !== -1) {
      items.splice(idx, 1);
    } else if (typeof classId === "number") {
      items.splice(classId, 1);
    }
    this.saveState();
    this.renderSchedule();
  }

  openAddScheduleModal() {
    document.getElementById("sched-time").value = "";
    document.getElementById("sched-subject").value = "";
    document.getElementById("sched-room").value = "";

    const datalist = document.getElementById("sched-subjects-datalist");
    if (datalist) {
      const pensum = this.state.pensum[this.currentCareer];
      let opts = "";
      pensum.trayectos.forEach(t => {
        t.materias.forEach(m => {
          opts += `<option value="${m.nombre} (${m.codigo})">`;
        });
      });
      datalist.innerHTML = opts;
    }

    this.openModal("modal-add-schedule");
  }

  saveScheduleClass(event) {
    event.preventDefault();
    const day = document.getElementById("sched-day").value;
    const shift = document.getElementById("sched-shift")?.value || "Mañana";
    const time = document.getElementById("sched-time").value;
    const subject = document.getElementById("sched-subject").value;
    const room = document.getElementById("sched-room").value;

    const items = this.getScheduleList();
    items.push({
      id: "h-" + Date.now(),
      dia: day,
      turno: shift,
      hora: time,
      materia: subject,
      aula: room
    });

    this.saveState();
    this.closeModal("modal-add-schedule");
    this.renderSchedule();
  }

  renderNotifications() {
    const container = document.getElementById("notif-list-container");
    if (!container) return;
    const notifs = this.state.notificaciones || [];
    const badge = document.getElementById("badge-notif-count");

    if (badge) {
      badge.textContent = notifs.length;
      badge.style.display = notifs.length > 0 ? "inline-block" : "none";
    }

    let html = "";
    if (notifs.length === 0) {
      html = '<div style="padding:20px; text-align:center; color:var(--text-muted); font-size:0.8rem;">No tienes alertas o tareas pendientes registradas. Toca <strong>+ Nueva Alerta</strong> para agregar una.</div>';
    } else {
      notifs.forEach(n => {
        const urgentClass = n.prioridad === "urgente" ? "urgent" : "";
        html += `
          <div class="notification-item ${urgentClass}" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; padding:8px 10px; border-radius:8px; background:white; border:1px solid var(--border-color);">
            <div>
              <div class="notification-title" style="font-weight:800; font-size:0.85rem; color:var(--text-primary);">${n.titulo}</div>
              <div class="notification-desc" style="font-size:0.75rem; color:var(--text-secondary); margin-top:2px;">${n.desc}</div>
            </div>
            <div>
              <button type="button" class="btn-action" style="color:#C0392B; border-color:#FECDD3; font-size:0.72rem; padding:3px 8px;" onclick="app.deleteNotification('${n.id}')">Completada &times;</button>
            </div>
          </div>
        `;
      });
    }

    container.innerHTML = html;
  }

  openAddTaskModal() {
    document.getElementById("task-title").value = "";
    document.getElementById("task-desc").value = "";
    document.getElementById("task-priority").value = "normal";
    this.openModal("modal-add-task");
  }

  saveTaskNotification(event) {
    event.preventDefault();
    const title = document.getElementById("task-title").value;
    const desc = document.getElementById("task-desc").value;
    const priority = document.getElementById("task-priority").value;

    this.state.notificaciones.unshift({
      id: "n-" + Date.now(),
      titulo: title,
      desc: desc,
      prioridad: priority
    });

    this.saveState();
    this.closeModal("modal-add-task");
    this.renderNotifications();
    this.renderDashboard();
  }

  deleteNotification(notifId) {
    const idx = this.state.notificaciones.findIndex(n => n.id === notifId);
    if (idx !== -1) {
      this.state.notificaciones.splice(idx, 1);
    } else if (typeof notifId === "number") {
      this.state.notificaciones.splice(notifId, 1);
    }
    this.saveState();
    this.renderNotifications();
    this.renderDashboard();
  }

  openPrintRecordModal() {
    this.renderPrintRecordContent();
    this.openModal("modal-print-record");
  }

  renderPrintRecordContent() {
    const container = document.getElementById("print-record-content");
    if (!container) return;

    const activeCareer = this.currentCareer;
    const pensum = this.state.pensum[activeCareer];
    const stats = this.getCalculatedStats(activeCareer);
    const dateStr = new Date().toLocaleDateString("es-VE", { year: "numeric", month: "long", day: "numeric" });

    let rowsHtml = "";
    let approvedCount = 0;
    let totalUCAcc = 0;

    pensum.trayectos.forEach(t => {
      rowsHtml += `
        <tr style="background: #EAECEE; font-weight: bold;">
          <td colspan="5" style="padding: 6px 10px; color: #0A4D40;">${t.nombre} (${t.totalUC} UC)</td>
        </tr>
      `;
      t.materias.forEach(m => {
        const isAprob = m.estatus === "aprobada";
        if (isAprob) {
          approvedCount++;
          totalUCAcc += m.uc;
        }
        const statusMap = {
          aprobada: "APROBADA",
          en_curso: "EN CURSO",
          repetir: "POR REPETIR",
          intensivo_verano: "INTENSIVO",
          pendiente_consulta: "EN CONSULTA",
          por_cursar: "POR CURSAR"
        };
        rowsHtml += `
          <tr>
            <td style="font-family: monospace; font-weight: bold;">${m.codigo}</td>
            <td>${m.nombre}</td>
            <td style="text-align: center;">${m.uc}</td>
            <td style="text-align: center; font-weight: bold;">${m.nota !== null ? `${m.nota} pts` : "-"}</td>
            <td><span style="font-size:0.75rem;">${statusMap[m.estatus] || m.estatus}</span></td>
          </tr>
        `;
      });
    });

    const html = `
      <div class="academic-record-sheet">
        <div class="record-header">
          <div class="record-institution">UNIVERSIDAD NACIONAL EXPERIMENTAL DE LA GRAN CARACAS (UNEXCA)</div>
          <div class="record-title">CONSTANCIA DE HISTORIAL & RÉCORD ACADÉMICO</div>
          <div style="font-size: 0.85rem; color: #566573;">Sistema Automatizado de Gestión Curricular Multicarrera</div>
        </div>

        <div class="record-meta-grid">
          <div>
            <div><strong>Carrera:</strong> ${pensum.carrera}</div>
            <div><strong>Nivel de Formación:</strong> TSU (Meta ${pensum.metaUC_TSU} UC) / Lic-Ing (Meta ${pensum.metaUC_Lic} UC)</div>
            <div><strong>Fecha de Emisión:</strong> ${dateStr}</div>
          </div>
          <div>
            <div><strong>Promedio Ponderado Acumulado (IRA):</strong> <span style="font-size: 1.1rem; color: #0A4D40; font-weight: bold;">${stats.promedioPonderado} / 20 pts</span></div>
            <div><strong>Promedio Simple:</strong> ${stats.promedioSimple} pts</div>
            <div><strong>Eficiencia de Aprobación:</strong> ${stats.eficiencia}%</div>
          </div>
        </div>

        <table class="record-table">
          <thead>
            <tr>
              <th style="width: 12%;">Código</th>
              <th style="width: 48%;">Asignatura</th>
              <th style="width: 10%; text-align: center;">UC</th>
              <th style="width: 15%; text-align: center;">Calificación</th>
              <th style="width: 15%;">Estatus</th>
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
          </tbody>
        </table>

        <div class="record-summary-box">
          <div>Créditos Acumulados Aprobados: ${totalUCAcc} UC / ${pensum.metaUC_Lic} UC</div>
          <div>Total Asignaturas Aprobadas: ${approvedCount}</div>
          <div>Índice Académico Oficial: ${stats.promedioPonderado} pts</div>
        </div>
      </div>
    `;

    container.innerHTML = html;
  }


  async syncGitRemote() {
    const msgBox = document.getElementById("git-sync-status-msg");
    if (msgBox) {
      msgBox.style.display = "block";
      msgBox.textContent = "Sincronizando automáticamente con GitHub...";
    }

    try {
      const response = await fetch("/api/git-sync", { method: "POST" });
      if (response.ok) {
        await response.json();
        if (msgBox) {
          msgBox.style.background = "#E8F8F5";
          msgBox.style.color = "#117A65";
          msgBox.textContent = "¡Sincronizado automáticamente en GitHub!";
        }
      } else {
        throw new Error("Servidor no respondió");
      }
    } catch (e) {
      // Si la sincronización con Git falla por error de red o servidor, se le notifica al usuario que sus datos se guardaron localmente.
      console.warn("Error de sincronización con Git (usando respaldo local):", e);
      if (msgBox) {
        msgBox.style.background = "#FEF9E7";
        msgBox.style.color = "#B7950B";
        msgBox.textContent = "Datos guardados en navegador.";
      }
    }
  }

  showConfirmDialog({ title, message, icon = '🎓', acceptText = 'Confirmar', cancelText = 'Cancelar', acceptColor = '#0A4D40' }) {
    return new Promise((resolve) => {
      const modal = document.getElementById("modal-app-confirm");
      const titleEl = document.getElementById("confirm-modal-title");
      const msgEl = document.getElementById("confirm-modal-message");
      const iconEl = document.getElementById("confirm-modal-icon");
      const iconWrap = document.getElementById("confirm-modal-icon-wrap");
      const btnAccept = document.getElementById("confirm-modal-btn-accept");
      const btnCancel = document.getElementById("confirm-modal-btn-cancel");

      if (!modal || !btnAccept || !btnCancel) {
        resolve(window.confirm(`${title}\n\n${message}`));
        return;
      }

      if (titleEl) titleEl.textContent = title;
      if (msgEl) msgEl.innerHTML = message.replace(/\n/g, "<br>");
      if (iconEl) iconEl.textContent = icon;
      btnAccept.textContent = acceptText;
      btnCancel.textContent = cancelText;

      btnAccept.style.background = acceptColor;
      btnAccept.style.borderColor = acceptColor;
      btnAccept.style.color = "#FFFFFF";

      if (iconWrap) {
        if (acceptColor === "#EF4444" || acceptColor === "#DC2626") {
          iconWrap.style.background = "#FEE2E2";
          iconWrap.style.color = "#DC2626";
          iconWrap.style.boxShadow = "0 4px 12px rgba(220, 38, 38, 0.15)";
        } else if (acceptColor === "#1E40AF" || acceptColor === "#2563EB" || acceptColor === "#104c91") {
          iconWrap.style.background = "#EFF6FF";
          iconWrap.style.color = "#1E40AF";
          iconWrap.style.boxShadow = "0 4px 12px rgba(30, 64, 175, 0.15)";
        } else {
          iconWrap.style.background = "#E6F4F1";
          iconWrap.style.color = "#0A4D40";
          iconWrap.style.boxShadow = "0 4px 12px rgba(10, 77, 64, 0.15)";
        }
      }

      const cleanup = () => {
        modal.classList.remove("active");
        btnAccept.removeEventListener("click", onAccept);
        btnCancel.removeEventListener("click", onCancel);
        modal.removeEventListener("click", onOverlay);
        document.removeEventListener("keydown", onKey);
      };

      const onAccept = () => {
        cleanup();
        resolve(true);
      };

      const onCancel = () => {
        cleanup();
        resolve(false);
      };

      const onOverlay = (e) => {
        if (e.target === modal) {
          cleanup();
          resolve(false);
        }
      };

      const onKey = (e) => {
        if (e.key === "Escape") {
          cleanup();
          resolve(false);
        }
      };

      btnAccept.addEventListener("click", onAccept);
      btnCancel.addEventListener("click", onCancel);
      modal.addEventListener("click", onOverlay);
      document.addEventListener("keydown", onKey);

      modal.classList.add("active");
    });
  }

  showToast(message, type = "success", duration = 3500) {
    let container = document.getElementById("app-toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "app-toast-container";
      container.className = "app-toast-container";
      document.body.appendChild(container);
    }

    const toast = document.createElement("div");
    toast.className = `app-toast app-toast-${type}`;

    let icon = "✓";
    if (type === "warning") icon = "⚠️";
    if (type === "error") icon = "✕";
    if (type === "info") icon = "ℹ️";

    toast.innerHTML = `
      <span style="font-size: 1.15rem; line-height: 1;">${icon}</span>
      <span style="flex: 1; line-height: 1.3;">${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => toast.classList.add("show"), 10);

    setTimeout(() => {
      toast.classList.remove("show");
      setTimeout(() => toast.remove(), 300);
    }, duration);
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add("active");
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove("active");
  }

  async forceReloadUpdate() {
    try {
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
        }
      }
      if ('caches' in window) {
        const keys = await caches.keys();
        for (const key of keys) {
          await caches.delete(key);
        }
      }
    } catch (e) {
      console.warn("Error al limpiar caché:", e);
    }
    window.location.reload(true);
  }

  exportDataJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.state, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `Respaldo_Sistema_Universitario_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  async importDataJSON(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const imported = JSON.parse(text);
      if (imported.pensum) this.state.pensum = imported.pensum;
      if (imported.evaluaciones) this.state.evaluaciones = imported.evaluaciones;
      if (imported.horario) this.state.horario = imported.horario;
      if (imported.notificaciones) this.state.notificaciones = imported.notificaciones;

      this.saveState();
      this.showToast("¡Datos importados con éxito!", "success");
      this.render();
    } catch (err) {
      console.error("Error al importar datos:", err);
      this.showToast("Error al leer el archivo de respaldo JSON.", "error");
    }
  }

  render() {
    this.updateCareerHeaderUI();
    this.renderDashboard();
    if (this.currentTab === "semestre") this.renderSemestreActual();
    if (this.currentTab === "pensum") this.renderPensum();
    if (this.currentTab === "horario") this.renderSchedule();
  }
}

let app;
function initUniversityApp() {
  if (!window.app) {
    app = new UniversityApp();
    window.app = app;
  }
  // Interceptar cualquier alert() nativo para mostrar toast visual en pantalla
  window.alert = (msg) => {
    if (window.app && typeof window.app.showToast === "function") {
      window.app.showToast(msg, "info");
    } else {
      console.log("Alert:", msg);
    }
  };
}

if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initUniversityApp);
  } else {
    initUniversityApp();
  }
}