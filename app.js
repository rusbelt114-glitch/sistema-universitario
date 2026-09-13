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
  storageKey = "SISTEMA_UNIVERSITARIO_DATA_V2";
  currentCareer = "ADM"; // "ADM" o "INF"
  currentWeek = "A"; // "A" (Administración) o "B" (Informática)
  currentTab = "dashboard";
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
        { id: "n1", titulo: "Materias por Repetir en Adm", desc: "Fundamentos de Adm I y II, Contabilidad I y II, Formación Socio Crítica I (MI y MII). Revisa reprogramación.", prioridad: "urgente" },
        { id: "n2", titulo: "Intensivo de Verano Próximo", desc: "Inscripción en Teoría y Práctica del Mercadeo y Deberes Formales del Contribuyente.", prioridad: "normal" },
        { id: "n3", titulo: "Consultar Notas Oficiales", desc: "Estadística, Expresión Oral, Marco Jurídico I y II, Electiva I, Fundamentos de Economía.", prioridad: "normal" }
      ]
    };

    this.init();
  }

  init() {
    this.loadState();
    this.updateWeekUI();
    this.render();
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
      alert("📱 PARA INSTALAR COMO APP EN TU TELÉFONO:\n\n• Android (Chrome): Toca los 3 puntos (⋮) arriba a la derecha y presiona 'Agregar a la pantalla principal' o 'Instalar aplicación'.\n\n• iPhone (Safari): Toca el botón Compartir (⎋) abajo y selecciona 'Agregar a inicio'.");
    }
  }

  // --- PERSISTENCIA & AUTO-SYNC INSTANTÁNEO ---
  loadState() {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (parsed.pensum) this.state.pensum = parsed.pensum;
        if (parsed.evaluaciones) this.state.evaluaciones = parsed.evaluaciones;
        if (parsed.horario) this.state.horario = parsed.horario;
        if (parsed.notificaciones) this.state.notificaciones = parsed.notificaciones;
        if (parsed.currentCareer) this.currentCareer = parsed.currentCareer;
        if (parsed.currentWeek) this.currentWeek = parsed.currentWeek;
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
      currentWeek: this.currentWeek
    };
    localStorage.setItem(this.storageKey, JSON.stringify(toSave));

    fetch('/api/git-sync', { method: 'POST' }).catch(() => {});
  }

  // --- CONTROL DE NAVEGACIÓN Y CARRERA ---
  selectCareer(careerCode) {
    this.currentCareer = careerCode;
    this.selectedEvalSubjectId = null;
    this.saveState();

    const landing = document.getElementById("landing-screen");
    if (landing) landing.style.display = "none";
    const mainApp = document.getElementById("main-app-screen");
    if (mainApp) mainApp.style.display = "block";

    this.updateCareerHeaderUI();
    this.switchTab("dashboard");
  }

  goToSubjectEvaluations(subjectId) {
    this.selectedEvalSubjectId = subjectId;
    this.switchTab("evaluaciones");
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
      "btn-toggle-week-landing": isWeekA ? "⚡ Cambiar a Semana B (Informática)" : "⚡ Cambiar a Semana A (Administración)",
      "header-week-text": isWeekA ? "SEMANA A (ADM)" : "SEMANA B (INF)",
      "home-week-text": isWeekA ? "SEMANA A (ADM)" : "SEMANA B (INF)",
      "horario-week-title": isWeekA ? "Semana A (Administración)" : "Semana B (Informática)"
    };

    Object.entries(elementTexts).forEach(([id, text]) => {
      const el = document.getElementById(id);
      if (el) el.textContent = text;
    });
  }

  updateCareerHeaderUI() {
    const headerTitle = document.getElementById("header-career-title");
    const homeCareerBadge = document.getElementById("home-career-badge");
    const activeData = this.state.pensum[this.currentCareer];
    if (activeData) {
      if (headerTitle) headerTitle.textContent = activeData.carrera + " (" + activeData.institucion + ")";
      if (homeCareerBadge) homeCareerBadge.textContent = `${activeData.carrera} (${this.currentCareer})`;
    }
  }

  switchTab(tabId) {
    this.currentTab = tabId;

    document.querySelectorAll(".nav-tabs .tab-btn").forEach(btn => {
      btn.classList.remove("active");
    });
    const targetBtn = Array.from(document.querySelectorAll(".nav-tabs .tab-btn")).find(b => b.getAttribute("onclick")?.includes(tabId));
    if (targetBtn) targetBtn.classList.add("active");

    document.querySelectorAll(".tab-section").forEach(sec => {
      sec.style.display = "none";
    });

    const activeSec = document.getElementById(`tab-${tabId}`);
    if (activeSec) activeSec.style.display = "block";

    if (tabId === "dashboard") this.renderDashboard();
    if (tabId === "pensum") this.renderPensum();
    if (tabId === "evaluaciones") this.renderEvaluationsSection();
    if (tabId === "consultas") this.renderConsultas();
    if (tabId === "horario") this.renderSchedule();
    if (tabId === "notificaciones") this.renderNotifications();
  }

  // --- METRICAS Y DASHBOARD ---
  getCalculatedStats(careerCode) {
    const pensum = this.state.pensum[careerCode];
    let ucTSUAprobadas = 0;
    let ucTotalAprobadas = 0;
    let materiasEnCurso = 0;
    let materiasRepetir = 0;
    let materiasConsulta = 0;

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
      });
    });

    return {
      ucTSUAprobadas,
      metaUC_TSU: pensum.metaUC_TSU,
      ucTotalAprobadas,
      metaUC_Lic: pensum.metaUC_Lic,
      materiasEnCurso,
      materiasRepetir,
      materiasConsulta
    };
  }

  renderDashboard() {
    const stats = this.getCalculatedStats(this.currentCareer);

    const pctTSU = Math.min(100, Math.round((stats.ucTSUAprobadas / stats.metaUC_TSU) * 100));
    const tsuVal = document.getElementById("stat-uc-tsu-val");
    if (tsuVal) tsuVal.textContent = `${stats.ucTSUAprobadas} / ${stats.metaUC_TSU}`;
    const tsuBar = document.getElementById("stat-uc-tsu-bar");
    if (tsuBar) tsuBar.style.width = `${pctTSU}%`;
    const tsuPct = document.getElementById("stat-uc-tsu-pct");
    if (tsuPct) tsuPct.textContent = `${pctTSU}% completado del TSU`;

    const pctLic = Math.min(100, Math.round((stats.ucTotalAprobadas / stats.metaUC_Lic) * 100));
    const licVal = document.getElementById("stat-uc-lic-val");
    if (licVal) licVal.textContent = `${stats.ucTotalAprobadas} / ${stats.metaUC_Lic}`;
    const licBar = document.getElementById("stat-uc-lic-bar");
    if (licBar) licBar.style.width = `${pctLic}%`;
    const licPct = document.getElementById("stat-uc-lic-pct");
    if (licPct) licPct.textContent = `${pctLic}% acumulado total`;

    const matCurso = document.getElementById("stat-materias-curso");
    if (matCurso) matCurso.textContent = String(stats.materiasEnCurso);
    const matRepetir = document.getElementById("stat-materias-repetir");
    if (matRepetir) matRepetir.textContent = String(stats.materiasRepetir);
    const matConsulta = document.getElementById("stat-consultas-count");
    if (matConsulta) matConsulta.textContent = String(stats.materiasConsulta);
    const notifsCount = document.getElementById("stat-eval-pendientes");
    if (notifsCount) notifsCount.textContent = String(this.state.notificaciones.length);

    // Render Dashboard Trayectos Summary
    const summaryContainer = document.getElementById("dashboard-trayectos-summary");
    if (summaryContainer) {
      const pensum = this.state.pensum[this.currentCareer];
      let trayectosHtml = "";

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
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; border-bottom: 1px dashed var(--border-color); flex-wrap: wrap; gap: 8px;">
              <div>
                <strong style="color: var(--text-dark);">${m.nombre}</strong>
                <span style="font-size: 0.8rem; color: var(--text-muted); margin-left: 6px;">(${m.uc} UC)</span>
                ${m.nota ? `<span style="font-size: 0.85rem; font-weight: 700; color: var(--primary-marine); margin-left: 8px;">• ${m.nota} pts</span>` : ''}
              </div>
              <div style="display: flex; align-items: center; gap: 8px;">
                <span class="status-badge status-${m.estatus}">${statusTextMap[m.estatus] || m.estatus}</span>
                <button class="btn-action" onclick="app.openEditSubjectModal('${m.id}')">✏️ Editar</button>
              </div>
            </div>
          `;
        });

        trayectosHtml += `
          <div style="background: white; border-radius: 10px; padding: 15px; margin-bottom: 15px; border: 1px solid var(--border-color); box-shadow: var(--shadow-sm);">
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; border-bottom: 2px solid var(--primary-marine); padding-bottom: 8px; margin-bottom: 10px;">
              <h3 style="margin: 0; font-size: 1.05rem; color: var(--primary-marine);">📍 ${t.nombre}</h3>
              <div style="font-size: 0.85rem; color: var(--text-secondary);">
                ✅ Aprobadas: <strong>${aprobadas}</strong> | 🔄 Repetir: <strong>${repetir}</strong> | 🔥 En Curso: <strong>${enCurso}</strong> | 🎓 UC: <strong>${ucGanadas} / ${t.totalUC}</strong>
              </div>
            </div>
            <div>${matListHtml}</div>
          </div>
        `;
      });

      summaryContainer.innerHTML = trayectosHtml;
    }

    const alertsContainer = document.getElementById("dashboard-alerts-list");
    let html = `
      <div class="notification-item urgent">
        <div>
          <div class="notification-title">📌 Estado Académico de la Carrera</div>
          <div class="notification-desc">Puedes editar el estatus de cualquier materia anterior o actual directamente en el resumen superior.</div>
        </div>
      </div>
      <div class="notification-item urgent">
        <div>
          <div class="notification-title">⚠️ Asignaturas Pendientes por Repetir</div>
          <div class="notification-desc">Las materias marcadas como "Por Repetir" se mantienen visibles en el resumen para su reprogramación.</div>
        </div>
      </div>
    `;
    if (alertsContainer) alertsContainer.innerHTML = html;
  }

  renderPensum() {
    const container = document.getElementById("pensum-trayectos-container");
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

      html += `
        <div class="trayecto-block">
          <div class="trayecto-header">
            <div class="trayecto-title">
              <span>${t.nombre}</span>
              ${t.actual ? '<span class="status-badge status-en_curso">ACTUAL EN CURSO</span>' : ''}
            </div>
            <span class="trayecto-badge-uc">${t.totalUC} UC</span>
          </div>

          <div class="subject-table-wrapper">
            <table class="subject-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Asignatura</th>
                  <th>UC</th>
                  <th>Estatus</th>
                  <th>Nota / Reg.</th>
                  <th>Ref. Documento</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
      `;

      filteredMaterias.forEach(m => {
        const statusClass = `status-${m.estatus}`;
        const statusTextMap = {
          aprobada: "Aprobada",
          en_curso: "En Curso (2-2)",
          repetir: "Por Repetir",
          intensivo_verano: "Intensivo Verano",
          pendiente_consulta: "Pendiente Consulta",
          por_cursar: "Por Cursar"
        };

        const notaDisplay = m.nota ? `<strong>${m.nota} pts</strong>` : "-";

        html += `
          <tr>
            <td class="subject-code">${m.codigo}</td>
            <td class="subject-name">${m.nombre}</td>
            <td><strong>${m.uc}</strong></td>
            <td><span class="status-badge ${statusClass}">${statusTextMap[m.estatus] || m.estatus}</span></td>
            <td>${notaDisplay}</td>
            <td style="font-size: 0.8rem; color: var(--text-secondary);">${m.refDoc || "-"}</td>
            <td>
              <button class="btn-action" style="color: var(--primary-marine);" onclick="app.goToSubjectEvaluations('${m.id}')">📝 Evaluaciones</button>
              <button class="btn-action" onclick="app.openEditSubjectModal('${m.id}')">Editar</button>
              <button class="btn-action" style="color:#C0392B; border-color:#FDEDEC;" onclick="app.deleteSubject('${m.id}')">Eliminar</button>
            </td>
          </tr>
        `;
      });

      html += `
              </tbody>
            </table>
          </div>
        </div>
      `;
    });

    if (!html) {
      html = '<div style="padding: 30px; text-align: center; color: var(--text-muted);">No se encontraron asignaturas con los filtros seleccionados.</div>';
    }

    container.innerHTML = html;
  }

  filterSubjects() {
    this.renderPensum();
  }

  openAddSubjectModal() {
    document.getElementById("edit-subject-id").value = "";
    document.getElementById("modal-subject-title").textContent = "Agregar Nueva Asignatura";
    document.getElementById("edit-subject-name").value = "";
    document.getElementById("edit-subject-code").value = "";
    document.getElementById("edit-subject-uc").value = "2";
    document.getElementById("edit-subject-trayecto").value = "2-2";
    document.getElementById("edit-subject-status").value = "en_curso";
    document.getElementById("edit-subject-grade").value = "";
    document.getElementById("edit-subject-ref").value = "";

    this.openModal("modal-edit-subject");
  }

  openEditSubjectModal(subjectId) {
    const pensum = this.state.pensum[this.currentCareer];
    let foundMat = null;

    pensum.trayectos.forEach(t => {
      t.materias.forEach(m => {
        if (m.id === subjectId) foundMat = m;
      });
    });

    if (!foundMat) return;

    document.getElementById("edit-subject-id").value = foundMat.id;
    document.getElementById("modal-subject-title").textContent = `Editar: ${foundMat.nombre}`;
    document.getElementById("edit-subject-name").value = foundMat.nombre;
    document.getElementById("edit-subject-code").value = foundMat.codigo;
    document.getElementById("edit-subject-uc").value = foundMat.uc;
    document.getElementById("edit-subject-status").value = foundMat.estatus;
    document.getElementById("edit-subject-grade").value = foundMat.nota !== null ? foundMat.nota : "";
    document.getElementById("edit-subject-ref").value = foundMat.refDoc || "";

    this.openModal("modal-edit-subject");
  }

  saveSubjectEdit(event) {
    event.preventDefault();
    const id = document.getElementById("edit-subject-id").value;
    const name = document.getElementById("edit-subject-name").value;
    const code = document.getElementById("edit-subject-code").value;
    const uc = Number.parseInt(document.getElementById("edit-subject-uc").value, 10);
    const trayectoTarget = document.getElementById("edit-subject-trayecto").value;
    const newStatus = document.getElementById("edit-subject-status").value;
    const newGradeVal = document.getElementById("edit-subject-grade").value;
    const newRef = document.getElementById("edit-subject-ref").value;

    const pensum = this.state.pensum[this.currentCareer];

    if (id !== "") {
      pensum.trayectos.forEach(t => {
        t.materias.forEach(m => {
          if (m.id === id) {
            m.nombre = name;
            m.codigo = code;
            m.uc = uc;
            m.estatus = newStatus;
            m.nota = newGradeVal !== "" ? Number.parseFloat(newGradeVal) : null;
            m.refDoc = newRef;
          }
        });
      });
    } else {
      const newSubject = {
        id: "mat-" + Date.now(),
        codigo: code,
        nombre: name,
        uc: uc,
        estatus: newStatus,
        nota: newGradeVal !== "" ? Number.parseFloat(newGradeVal) : null,
        refDoc: newRef
      };

      const targetTrayectoObj = pensum.trayectos.find(t => t.id === trayectoTarget);
      if (targetTrayectoObj) {
        targetTrayectoObj.materias.push(newSubject);
      }
    }

    this.saveState();
    this.closeModal("modal-edit-subject");
    this.renderPensum();
    this.renderDashboard();
  }

  deleteSubject(subjectId) {
    if (!confirm("¿Deseas eliminar esta asignatura del pensum?")) return;
    const pensum = this.state.pensum[this.currentCareer];
    pensum.trayectos.forEach(t => {
      t.materias = t.materias.filter(m => m.id !== subjectId);
    });

    this.saveState();
    this.renderPensum();
    this.renderDashboard();
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
                <button class="btn-action" onclick="app.openEditSubjectModal('${m.id}')">✏️ Editar Estatus / Nota</button>
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

        const statusPrefixMap = {
          en_curso: "🔥 [EN CURSO]",
          repetir: "🔄 [REPETIR]",
          intensivo_verano: "☀️ [INTENSIVO]",
          pendiente_consulta: "🔍 [EN CONSULTA]",
          aprobada: "✅ [APROBADA]",
          por_cursar: "📌 [POR CURSAR]"
        };
        const statusPrefix = statusPrefixMap[m.estatus] || "📘";

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
              📍 ${foundTrayecto ? foundTrayecto.nombre : 'Pensum Académico'} • ${foundSubject.uc} UC
            </div>
            <h2 style="margin: 0; font-size: 1.35rem; color: var(--text-dark);">
              📚 ${foundSubject.nombre}
            </h2>
            ${foundSubject.refDoc ? `<p style="margin: 6px 0 0 0; font-size: 0.85rem; color: var(--text-secondary);">📝 <strong>Detalles / Profesor / Soporte:</strong> ${foundSubject.refDoc}</p>` : ''}
          </div>
          <div>
            <span class="status-badge status-${foundSubject.estatus}">${statusTextMap[foundSubject.estatus] || foundSubject.estatus}</span>
          </div>
        </div>
      `;
    }

    let html = `
      ${subjectHeaderHtml}
      <div class="eval-panel">
        <div class="eval-summary-bar">
          <div>
            <span>PONDERACIÓN ACUMULADA: <strong>${totalWeight}%</strong> de 100%</span>
          </div>
          <div class="eval-score-total">
            NOTA ACUMULADA: ${totalScoreWeighted.toFixed(2)} / 20 pts
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
              <button class="btn-action" onclick="app.openEditEvalModal('${idx}')">Editar</button>
              <button class="btn-action" style="color:#C0392B; border-color:#FDEDEC;" onclick="app.deleteEvaluation('${idx}')">Eliminar</button>
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

  openAddEvalModal() {
    if (!this.selectedEvalSubjectId) {
      alert("Por favor selecciona una materia primero.");
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
  }

  deleteEvaluation(index) {
    if (!confirm("¿Deseas eliminar esta evaluación?")) return;
    this.state.evaluaciones[this.selectedEvalSubjectId].splice(index, 1);
    this.saveState();
    this.loadEvaluationsForSubject(this.selectedEvalSubjectId);
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
        dayClasses.forEach((c, idx) => {
          const shiftBadge = c.turno ? `<span style="font-size: 0.75rem; background: #EAECEE; color: #2C3E50; padding: 2px 6px; border-radius: 4px; font-weight: bold; margin-left: 4px;">${c.turno}</span>` : '';
          html += `
            <div class="schedule-item" style="position: relative; margin-bottom: 8px;">
              <div class="schedule-item-time">⏰ ${c.hora} ${shiftBadge} • 📍 ${c.aula || 'Aula por definir'}</div>
              <div class="schedule-item-title">${c.materia}</div>
              <button type="button" onclick="app.deleteScheduleClass(${idx})" style="position: absolute; right: 5px; top: 5px; background: transparent; border: none; color: #C0392B; cursor: pointer; font-size: 1rem; line-height: 1;" title="Eliminar clase">&times;</button>
            </div>
          `;
        });
      }

      html += `</div>`;
    });

    container.innerHTML = html;
  }

  clearCurrentSchedule() {
    const careerName = this.currentCareer === "ADM" ? "Administración" : "Informática";
    if (!confirm(`¿Estás seguro de limpiar todo el horario de la Semana ${this.currentWeek} en ${careerName}?`)) return;
    const items = this.getScheduleList();
    items.length = 0;
    this.saveState();
    this.renderSchedule();
  }

  deleteScheduleClass(index) {
    const items = this.getScheduleList();
    items.splice(index, 1);
    this.saveState();
    this.renderSchedule();
  }

  openAddScheduleModal() {
    document.getElementById("sched-time").value = "";
    document.getElementById("sched-subject").value = "";
    document.getElementById("sched-room").value = "";
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
    const notifs = this.state.notificaciones || [];
    const badge = document.getElementById("badge-notif-count");

    if (badge) {
      badge.textContent = notifs.length;
      badge.style.display = notifs.length > 0 ? "inline-block" : "none";
    }

    let html = "";
    if (notifs.length === 0) {
      html = '<div style="padding:30px; text-align:center; color:var(--text-muted);">No tienes notificaciones o tareas registradas.</div>';
    } else {
      notifs.forEach((n, idx) => {
        const urgentClass = n.prioridad === "urgente" ? "urgent" : "";
        html += `
          <div class="notification-item ${urgentClass}">
            <div>
              <div class="notification-title">${n.titulo}</div>
              <div class="notification-desc">${n.desc}</div>
            </div>
            <div>
              <button class="btn-action" style="color:#C0392B; border-color:#FDEDEC;" onclick="app.deleteNotification(${idx})">Completada &times;</button>
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
  }

  deleteNotification(index) {
    this.state.notificaciones.splice(index, 1);
    this.saveState();
    this.renderNotifications();
  }

  async syncGitRemote() {
    const msgBox = document.getElementById("git-sync-status-msg");
    if (msgBox) {
      msgBox.style.display = "block";
      msgBox.textContent = "⏳ Sincronizando automáticamente con GitHub...";
    }

    try {
      const response = await fetch("/api/git-sync", { method: "POST" });
      if (response.ok) {
        await response.json();
        if (msgBox) {
          msgBox.style.background = "#E8F8F5";
          msgBox.style.color = "#117A65";
          msgBox.textContent = "✅ ¡Sincronizado automáticamente en GitHub!";
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
        msgBox.textContent = "⚡ Datos guardados en navegador.";
      }
    }
  }

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add("active");
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.remove("active");
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
      alert("¡Datos importados con éxito!");
      this.render();
    } catch (err) {
      console.error("Error al importar datos:", err);
      alert("Error al leer el archivo de respaldo JSON.");
    }
  }

  render() {
    this.updateCareerHeaderUI();
    this.renderDashboard();
  }
}

let app;
document.addEventListener("DOMContentLoaded", () => {
  app = new UniversityApp();
  window.app = app;
});
