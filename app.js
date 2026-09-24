/**
 * SISTEMA UNIVERSITARIO DE GESTIÓN ACADÉMICA - APP LOGIC
 * Control de Estado Interactivo con Auto-Sync Instantáneo y PWA Instalable
 */
/* global PENSUM_ADMINISTRACION, PENSUM_INFORMATICA, EVALUACIONES_INICIALES, HORARIO_DEFECTO */

const SUPABASE_CONFIG = {
  url: "https://cnpqkrgobykztuyywkee.supabase.co",
  anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNucHFrcmdvYnlrenR1eXl3a2VlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAyMzA5NjQsImV4cCI6MjEwNTgwNjk2NH0.jGu_tiQSodQ2Bj5yhSwdPZIgst-uY7dn6SB1yRUX5LY"
};

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
  isAdmin = false;
  currentUser = null;
  supabaseClient = null;
  cloudSyncTimer = null;

  constructor() {
    if (window.supabase && SUPABASE_CONFIG.url) {
      try {
        this.supabaseClient = window.supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
      } catch (err) {
        console.warn("Supabase init error:", err);
      }
    }

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
    this.updateAuthUI();
    this.initSupabaseAuthAndSync();

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
    this.setupSwipeAndDragHandlers();
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

  setupSwipeAndDragHandlers() {
    // 1. Deslizamiento / Arrastre fluido con Mouse en PC para carruseles y pestañas
    let isMouseDown = false;
    let startX = 0;
    let scrollStart = 0;
    let activeTrack = null;
    let dragDistance = 0;
    let preventClickTimer = 0;

    document.addEventListener("mousedown", (e) => {
      // Solo botón izquierdo del mouse
      if (e.button !== 0) return;
      const track = e.target.closest(".snap-carousel-track, .nav-tabs");
      if (!track) return;

      activeTrack = track;
      isMouseDown = true;
      startX = e.pageX - track.offsetLeft;
      scrollStart = track.scrollLeft;
      dragDistance = 0;
    });

    document.addEventListener("mousemove", (e) => {
      if (!isMouseDown || !activeTrack) return;
      const x = e.pageX - activeTrack.offsetLeft;
      const walk = (x - startX);
      dragDistance = Math.abs(walk);

      if (dragDistance > 6) {
        activeTrack.style.cursor = "grabbing";
        activeTrack.style.scrollSnapType = "none";
        activeTrack.style.scrollBehavior = "auto";
        activeTrack.scrollLeft = scrollStart - (walk * 1.3);
      }
    });

    const finishDrag = () => {
      if (isMouseDown && activeTrack) {
        activeTrack.style.cursor = "";
        activeTrack.style.scrollSnapType = "";
        activeTrack.style.scrollBehavior = "";
        if (dragDistance > 8) {
          preventClickTimer = Date.now() + 280;
        }
      }
      isMouseDown = false;
      activeTrack = null;
    };

    document.addEventListener("mouseup", finishDrag);
    window.addEventListener("blur", finishDrag);

    // Evitar que el click accione botones/fichas si el usuario estaba arrastrando/deslizando
    document.addEventListener("click", (e) => {
      if (Date.now() < preventClickTimer) {
        e.stopPropagation();
        e.preventDefault();
      }
    }, true);

    // 2. Rueda del Mouse en PC para desplazamiento horizontal inteligente
    document.addEventListener("wheel", (e) => {
      const track = e.target.closest(".snap-carousel-track, .nav-tabs");
      if (!track) return;

      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        const maxScroll = track.scrollWidth - track.clientWidth;
        if (maxScroll > 6) {
          const atStart = track.scrollLeft <= 0;
          const atEnd = track.scrollLeft >= maxScroll - 2;
          if ((e.deltaY < 0 && !atStart) || (e.deltaY > 0 && !atEnd)) {
            e.preventDefault();
            track.scrollBy({ left: e.deltaY * 1.1, behavior: 'auto' });
          }
        }
      }
    }, { passive: false });

    // 3. Deslizamiento táctil horizontal entre Pestañas Principales
    let touchStartX = 0;
    let touchStartY = 0;
    let touchStartTime = 0;
    const tabArea = document.getElementById("tab-content-area");

    if (tabArea) {
      tabArea.addEventListener("touchstart", (e) => {
        if (e.touches.length !== 1) return;
        // Si el toque inicia dentro de un carrusel o elemento de formulario, no cambiar de pestaña
        if (e.target.closest(".snap-carousel-track, input, select, textarea, button, .modal-card, table")) {
          touchStartX = 0;
          return;
        }
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
        touchStartTime = Date.now();
      }, { passive: true });

      tabArea.addEventListener("touchend", (e) => {
        if (!touchStartX || !this.hasEnteredApp) return;
        const diffX = e.changedTouches[0].clientX - touchStartX;
        const diffY = e.changedTouches[0].clientY - touchStartY;
        const elapsed = Date.now() - touchStartTime;

        // Validar gesto de swipe horizontal rápido y claro
        if (elapsed < 600 && Math.abs(diffX) > 65 && Math.abs(diffX) > Math.abs(diffY) * 1.6) {
          const tabs = ["dashboard", "semestre", "pensum", "horario"];
          const curIndex = tabs.indexOf(this.currentTab);
          if (curIndex !== -1) {
            if (diffX < 0 && curIndex < tabs.length - 1) {
              // Deslizar a la izquierda -> Siguiente pestaña
              this.switchTab(tabs[curIndex + 1]);
            } else if (diffX > 0 && curIndex > 0) {
              // Deslizar a la derecha -> Pestaña anterior
              this.switchTab(tabs[curIndex - 1]);
            }
          }
        }
        touchStartX = 0;
      }, { passive: true });
    }
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
      saved = this.migrateV2Data();
    }

    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        this.applySavedState(parsed);
      } catch (e) {
        console.error("Error al cargar estado local", e);
      }
    }
  }

  migrateV2Data() {
    const oldV2 = localStorage.getItem("SISTEMA_UNIVERSITARIO_DATA_V2");
    if (!oldV2) return null;

    try {
      const parsedV2 = JSON.parse(oldV2);
      const migrated = this.buildV2MigrationPayload(parsedV2);
      this.migratePensumGrades(parsedV2.pensum, migrated.pensum);

      const serialized = JSON.stringify(migrated);
      localStorage.setItem(this.storageKey, serialized);
      return serialized;
    } catch (e) {
      console.error("Error en migración V2 a V3:", e);
      return null;
    }
  }

  buildV2MigrationPayload(parsedV2) {
    return {
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
      evaluaciones: { ...structuredClone(EVALUACIONES_INICIALES), ...parsedV2.evaluaciones }
    };
  }

  migratePensumGrades(oldPensum, newPensum) {
    if (!oldPensum) return;

    ['ADM', 'INF'].forEach(c => {
      const oldCareer = oldPensum[c];
      const newCareer = newPensum[c];
      if (!oldCareer?.trayectos || !newCareer?.trayectos) return;

      const oldSubjectsMap = new Map();
      oldCareer.trayectos.forEach(t => {
        (t.materias || []).forEach(m => {
          if (m.codigo) oldSubjectsMap.set(m.codigo, m);
        });
      });

      newCareer.trayectos.forEach(t => {
        (t.materias || []).forEach(newM => {
          const oldM = oldSubjectsMap.get(newM.codigo);
          if (oldM?.estatus && oldM.estatus !== newM.estatus) {
            newM.estatus = oldM.estatus;
            newM.nota = oldM.nota;
            newM.refDoc = oldM.refDoc || newM.refDoc;
          }
        });
      });
    });
  }

  applySavedState(parsed) {
    if (parsed.pensum) {
      this.restorePensums(parsed.pensum);
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
  }

  isPensumHomologated(trayectos) {
    return trayectos.every(t =>
      t.materias && t.materias.length > 0 &&
      (t.materias[0].codigo.startsWith("PSI-") || t.materias[0].codigo.startsWith("PST-"))
    );
  }

  syncTrayectosMetadata(targetTrayectos, seedTrayectos) {
    seedTrayectos.forEach(seedT => {
      const existingT = targetTrayectos.find(t => t.id === seedT.id);
      if (existingT) {
        existingT.nombre = seedT.nombre;
        existingT.nivel = seedT.nivel;
        existingT.totalUC = seedT.totalUC;
      } else {
        targetTrayectos.push(structuredClone(seedT));
      }
    });
  }

  restorePensums(parsedPensum) {
    ['ADM', 'INF'].forEach(c => {
      const seedCareer = c === 'ADM' ? PENSUM_ADMINISTRACION : PENSUM_INFORMATICA;
      if (!this.state.pensum[c]) {
        this.state.pensum[c] = structuredClone(seedCareer);
      }

      const careerData = parsedPensum[c];
      if (!careerData?.trayectos) return;

      if (!this.isPensumHomologated(careerData.trayectos)) {
        careerData.trayectos = structuredClone(seedCareer.trayectos);
      } else {
        this.syncTrayectosMetadata(careerData.trayectos, seedCareer.trayectos);
      }

      careerData.metaUC_TSU = seedCareer.metaUC_TSU;
      careerData.metaUC_Lic = seedCareer.metaUC_Lic;
      this.state.pensum[c] = careerData;
    });
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

    if (this.isAdmin) {
      if (this.cloudSyncTimer) clearTimeout(this.cloudSyncTimer);
      this.cloudSyncTimer = setTimeout(() => {
        this.syncToCloud();
      }, 600);
    }
  }

  // --- CONTROL DE SEGURIDAD & NUBE (SUPABASE) ---
  requireAdmin(actionDescription = "realizar modificaciones") {
    if (!this.isAdmin) {
      this.showToast(`🔒 Modo Lectura. Inicia sesión como administrador para ${actionDescription}.`, "warning");
      this.openAdminLoginModal();
      return false;
    }
    return true;
  }

  async initSupabaseAuthAndSync() {
    if (!this.supabaseClient) return;

    this.supabaseClient.auth.onAuthStateChange((event, session) => {
      this.handleAuthStateChange(session);
    });

    try {
      const { data } = await this.supabaseClient.auth.getSession();
      this.handleAuthStateChange(data?.session);
    } catch (e) {
      console.warn("Error leyendo sesión Supabase:", e);
    }

    await this.fetchFromCloud();
  }

  handleAuthStateChange(session) {
    if (session && session.user) {
      this.isAdmin = true;
      this.currentUser = session.user;
    } else {
      this.isAdmin = false;
      this.currentUser = null;
    }
    this.updateAuthUI();
  }

  updateAuthUI() {
    // 1. Alternar clases en body para ocultar/mostrar botones de edición
    document.body.classList.toggle('is-admin-mode', this.isAdmin);
    document.body.classList.toggle('is-readonly-mode', !this.isAdmin);

    const userDisplay = this.currentUser?.email?.split('@')[0] || 'rusbelt';

    // 2. Botón píldora en cabecera
    const btn = document.getElementById("btn-admin-auth");
    const indicator = document.getElementById("admin-auth-indicator");
    const text = document.getElementById("admin-auth-status-text");
    if (btn) {
      if (this.isAdmin) {
        btn.style.background = "rgba(16, 185, 129, 0.35)";
        btn.style.borderColor = "#10B981";
        btn.style.color = "#FFFFFF";
        btn.title = `Conectado como: ${userDisplay}. Clic para cerrar sesión.`;
        if (indicator) indicator.textContent = "🟢";
        if (text) text.textContent = `Admin (${userDisplay})`;
      } else {
        btn.style.background = "rgba(255, 255, 255, 0.15)";
        btn.style.borderColor = "rgba(255, 255, 255, 0.35)";
        btn.style.color = "#FFFFFF";
        btn.title = "Modo Lectura. Clic para Iniciar Sesión de Administrador.";
        if (indicator) indicator.textContent = "🔒";
        if (text) text.textContent = "Modo Lectura";
      }
    }

    // 3. Banner Visual Permanente debajo de cabecera
    const banner = document.getElementById("mode-status-banner");
    if (banner) {
      if (this.isAdmin) {
        banner.className = "mode-status-banner mode-banner-admin";
        banner.innerHTML = `
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="font-size:1.25rem;">🟢</span>
            <span><strong>MODO ADMINISTRADOR ACTIVO</strong> — Conectado como <strong>${userDisplay}</strong>. Edición completa y guardado automático en la nube.</span>
          </div>
          <button type="button" onclick="app.logoutAdmin()" class="mode-banner-btn" style="color:#065F46;border-color:#10B981;background:#D1FAE5;">
            🚪 Cerrar Sesión Admin
          </button>
        `;
      } else {
        banner.className = "mode-status-banner mode-banner-readonly";
        banner.innerHTML = `
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="font-size:1.25rem;">👁️</span>
            <span><strong>MODO SOLO LECTURA</strong> — Consulta de pensum, notas y horarios. Opciones de edición bloqueadas.</span>
          </div>
          <button type="button" onclick="app.openAdminLoginModal()" class="mode-banner-btn" style="color:#92400E;border-color:#F59E0B;background:#FEF3C7;">
            🔑 Iniciar Sesión como Administrador
          </button>
        `;
      }
    }

    // 4. Insignia en pantalla de inicio (landing)
    const landingBadge = document.getElementById("landing-auth-badge");
    if (landingBadge) {
      if (this.isAdmin) {
        landingBadge.innerHTML = `
          <div style="display:inline-flex;align-items:center;gap:8px;background:#ECFDF5;border:1px solid #A7F3D0;padding:6px 14px;border-radius:20px;">
            <span style="color:#065F46;font-size:0.82rem;font-weight:700;">🟢 Administrador: <strong>${userDisplay}</strong></span>
            <button type="button" onclick="app.logoutAdmin()" style="background:none;border:none;color:#BE123C;font-size:0.8rem;cursor:pointer;text-decoration:underline;font-weight:bold;margin-left:4px;">Cerrar Sesión</button>
          </div>
        `;
      } else {
        landingBadge.innerHTML = `
          <div style="display:inline-flex;align-items:center;gap:8px;background:#F8FAFC;border:1px solid #E2E8F0;padding:6px 14px;border-radius:20px;">
            <span style="color:#64748b;font-size:0.8rem;font-weight:600;">👁️ Modo Consulta (Público)</span>
            <button type="button" onclick="app.openAdminLoginModal()" style="background:none;border:none;color:#0A4D40;font-size:0.82rem;cursor:pointer;text-decoration:underline;font-weight:bold;margin-left:4px;">🔑 Acceso Administrador</button>
          </div>
        `;
      }
    }
  }

  handleAuthButtonClick() {
    if (this.isAdmin) {
      const email = this.currentUser ? this.currentUser.email : "Admin";
      if (confirm(`Estás conectado en Modo Administrador (${email}).\n¿Deseas cerrar sesión y volver a Modo Lectura?`)) {
        this.logoutAdmin();
      }
    } else {
      this.openAdminLoginModal();
    }
  }

  openAdminLoginModal() {
    const errorBox = document.getElementById("admin-login-error");
    if (errorBox) {
      errorBox.style.display = "none";
      errorBox.textContent = "";
    }
    const emailInput = document.getElementById("admin-login-email");
    const passInput = document.getElementById("admin-login-password");
    if (emailInput) {
      const savedUser = localStorage.getItem("last_admin_username") || "rusbelt";
      emailInput.value = savedUser;
    }
    if (passInput) {
      passInput.value = "";
    }
    this.openModal("modal-admin-login");
    setTimeout(() => {
      if (passInput && document.getElementById("admin-login-email")?.value) {
        passInput.focus();
      } else if (emailInput) {
        emailInput.focus();
      }
    }, 150);
  }

  quickFillAdminUser(username = "rusbelt") {
    const emailInput = document.getElementById("admin-login-email");
    const passInput = document.getElementById("admin-login-password");
    if (emailInput) {
      emailInput.value = username;
      emailInput.dispatchEvent(new Event("input", { bubbles: true }));
      emailInput.dispatchEvent(new Event("change", { bubbles: true }));
    }
    if (passInput) {
      passInput.focus();
    }
  }

  async submitAdminLogin(event) {
    event.preventDefault();
    if (!this.supabaseClient) {
      alert("Error: Conexión con Supabase no inicializada.");
      return;
    }

    const rawInput = document.getElementById("admin-login-email").value.trim();
    localStorage.setItem("last_admin_username", rawInput);
    let email = rawInput;
    if (!email.includes("@")) {
      email = "rusbelt.114@gmail.com";
    }
    const password = document.getElementById("admin-login-password").value;
    const errorBox = document.getElementById("admin-login-error");
    const btnSubmit = document.getElementById("btn-submit-admin-login");

    if (btnSubmit) {
      btnSubmit.disabled = true;
      btnSubmit.textContent = "Verificando...";
    }

    try {
      const { data, error } = await this.supabaseClient.auth.signInWithPassword({
        email: email,
        password: password
      });

      if (error) {
        if (errorBox) {
          errorBox.style.display = "block";
          errorBox.textContent = "Error: " + (error.message || "Credenciales incorrectas.");
        }
      } else {
        this.handleAuthStateChange(data.session);
        this.closeModal("modal-admin-login");
        this.showToast("¡Sesión iniciada con éxito! Modo Administrador activado.", "success");
        await this.syncToCloud(true);
      }
    } catch (err) {
      if (errorBox) {
        errorBox.style.display = "block";
        errorBox.textContent = "Error de conexión: " + err.message;
      }
    } finally {
      if (btnSubmit) {
        btnSubmit.disabled = false;
        btnSubmit.textContent = "Entrar y Activar Edición";
      }
    }
  }

  async logoutAdmin() {
    if (this.supabaseClient) {
      try {
        await this.supabaseClient.auth.signOut();
      } catch (e) {
        console.warn(e);
      }
    }
    this.isAdmin = false;
    this.currentUser = null;
    this.updateAuthUI();
    this.render();
    this.showToast("Sesión de Administrador cerrada. Ahora estás en Modo Lectura.", "info");
  }

  async fetchFromCloud() {
    if (!this.supabaseClient) return;
    try {
      const { data, error } = await this.supabaseClient
        .from('app_state')
        .select('data, updated_at')
        .eq('id', 'master_data')
        .single();

      if (!error && data && data.data && Object.keys(data.data).length > 0) {
        if (data.data.pensum) {
          this.applySavedState(data.data);
          this.render();
          console.log("☁️ Datos sincronizados desde Supabase:", data.updated_at);
        }
      } else if (this.isAdmin) {
        await this.syncToCloud(true);
      }
    } catch (e) {
      console.warn("No se pudo cargar desde Supabase:", e);
    }
  }

  async syncToCloud(force = false) {
    if (!this.supabaseClient) return;
    if (!this.isAdmin && !force) return;

    const payload = {
      pensum: this.state.pensum,
      evaluaciones: this.state.evaluaciones,
      horario: this.state.horario,
      notificaciones: this.state.notificaciones,
      currentCareer: this.currentCareer,
      currentWeek: this.currentWeek,
      currentTab: this.currentTab
    };

    try {
      const statusText = document.getElementById("admin-auth-status-text");
      if (statusText && this.isAdmin) statusText.textContent = "Admin (Guardando...)";

      const { error } = await this.supabaseClient
        .from('app_state')
        .upsert({
          id: 'master_data',
          data: payload,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.warn("Fallo al guardar en Supabase:", error.message);
      }
    } catch (e) {
      console.warn("Error en syncToCloud:", e);
    } finally {
      const statusText = document.getElementById("admin-auth-status-text");
      if (statusText && this.isAdmin) statusText.textContent = "Admin (Activo)";
    }
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

  async logout() {
    await this.logoutAdmin();
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
    if (!sel?.value) return;
    this.activateTrayecto(sel.value);
  }

  promptSwitchSemester() {
    const pensum = this.state.pensum[this.currentCareer];
    const select = document.getElementById("select-switch-semester-picker");
    if (!select) return;
    select.innerHTML = pensum.trayectos.map(t => {
      let statusText = "";
      if (t.actual) {
        statusText = " — [ACTIVO EN CURSO]";
      } else if (t.culminado) {
        statusText = " — [CULMINADO]";
      }
      return `<option value="${t.id}" ${t.actual ? "selected" : ""}>${t.nombre}${statusText}</option>`;
    }).join("");
    this.openModal("modal-switch-semester");
  }

  confirmSwitchSemesterFromModal() {
    const select = document.getElementById("select-switch-semester-picker");
    if (!select?.value) return;
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

    // --- BLOQUE 1: ASIGNATURAS DEL SEMESTRE EN CURSO (SNAP HORIZONTAL TÁCTIL) ---
    html += `
      <div class="trayecto-block" style="margin-bottom: 12px; border-radius: 12px; overflow: hidden; border: 1px solid var(--border-color); background: white;">
        <div class="trayecto-header" style="background: #F8FAFC; border-bottom: 1px solid var(--border-color); padding: 10px 12px; display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="font-size: 1rem;">📚</span>
            <strong style="font-size: 0.88rem; color: var(--text-primary);">Materias del Semestre en Curso</strong>
            <span class="status-badge status-en_curso" style="margin-left: 4px;">${currentSemesterMaterias.length} materias</span>
          </div>
          <span class="swipe-hint">Desliza ↔</span>
        </div>
        <div style="padding: 10px 12px 6px 12px;">
    `;

    if (!activeTrayecto || currentSemesterMaterias.length === 0) {
      html += `
        <div style="text-align: center; padding: 20px 10px; color: var(--text-muted); font-size: 0.85rem;">
          No hay asignaturas en curso actualmente. Inicia un nuevo semestre arriba para ver sus materias aquí.
        </div>
      `;
    } else {
      html += `<section class="snap-carousel-track" aria-label="Materias en curso">`;
      currentSemesterMaterias.forEach(m => {
        const statusTextMap = {
          aprobada: "Aprobada",
          en_curso: "En Curso",
          repetir: "Por Repetir",
          intensivo_verano: "Intensivo Verano",
          pendiente_consulta: "Pendiente Consulta",
          por_cursar: "Por Cursar"
        };
        const isProyecto = (m.nombre.toLowerCase().includes("proyecto socio") || m.codigo.toLowerCase().includes("psi") || m.codigo.toLowerCase().includes("pst"));
        const minPass = isProyecto ? 16 : 13;

        html += `
          <article class="snap-card" style="display: flex; flex-direction: column; justify-content: space-between; cursor: pointer;" onclick="app.openSubjectDetailModal('${m.id}')">
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <span style="font-size: 0.7rem; font-weight: 800; color: var(--text-muted);">${m.codigo} • ${m.uc} UC</span>
                <span class="status-badge status-${m.estatus}">${statusTextMap[m.estatus] || m.estatus}</span>
              </div>
              <h3 style="font-size: 0.88rem; font-weight: 800; color: var(--text-primary); line-height: 1.25; margin: 4px 0 8px 0;">${m.nombre}</h3>
            </div>
            <div>
              <div style="display: flex; justify-content: space-between; align-items: center; background: var(--bg-app); padding: 4px 8px; border-radius: 6px; margin-bottom: 8px;">
                <span style="font-size: 0.72rem; color: var(--text-secondary);">Nota Oficial:</span>
                <strong style="font-size: 0.92rem; color: var(--primary-marine);">${m.nota ? `${m.nota} pts` : 'Pendiente'}</strong>
              </div>
              <div style="font-size: 0.65rem; color: #166534; font-weight: 700; margin-bottom: 6px;">Mín. para aprobar: ${minPass} pts</div>
              <button type="button" class="btn-primary" style="width: 100%; min-height: 38px; font-size: 0.75rem; padding: 6px;" onclick="event.stopPropagation(); app.openSubjectDetailModal('${m.id}')">
                Ficha & Notas →
              </button>
            </div>
          </article>
        `;
      });
      html += `</section>`;
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
    const pensum = this.state.pensum[this.currentCareer];

    this._updateDashboardStats(stats);
    this._updateDashboardSemesterStatus(pensum);
    this._renderDashboardTrayectosSummary(pensum);
  }

  _updateDashboardStats(stats) {
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
  }

  _updateDashboardSemesterStatus(pensum) {
    const activeTrayecto = pensum.trayectos.find(t => t.actual);

    let countRepetir = 0;
    pensum.trayectos.forEach(t => {
      t.materias.forEach(m => {
        if (m.estatus === "repetir") countRepetir++;
      });
    });

    const semNameEl = document.getElementById("home-semester-name");
    const semDetailsEl = document.getElementById("home-semester-details");
    const semBadgeEl = document.getElementById("home-semester-active-badge");

    const enCursoCount = activeTrayecto ? activeTrayecto.materias.filter(m => m.estatus === "en_curso").length : 0;

    if (semNameEl) {
      semNameEl.textContent = activeTrayecto ? activeTrayecto.nombre : "Semestre Culminado / Sin Semestre Activo";
    }
    if (semDetailsEl) {
      semDetailsEl.textContent = activeTrayecto
        ? `${enCursoCount} materias en curso de este semestre • ${countRepetir} pendientes por repetir`
        : `Selecciona tu próximo semestre en 'Mi Semestre' • ${countRepetir} pendientes por repetir`;
    }
    if (semBadgeEl) {
      semBadgeEl.className = activeTrayecto ? "status-badge status-en_curso" : "status-badge status-aprobada";
      semBadgeEl.textContent = activeTrayecto ? "En Curso" : "Culminado";
    }
  }

  _getTrayectoSummaryMetrics(trayecto) {
    let aprobadas = 0;
    let repetir = 0;
    let enCurso = 0;
    let ucGanadas = 0;

    trayecto.materias.forEach(m => {
      if (m.estatus === "aprobada") {
        aprobadas++;
        ucGanadas += m.uc;
      } else if (m.estatus === "repetir") {
        repetir++;
      } else if (m.estatus === "en_curso") {
        enCurso++;
      }
    });

    return { aprobadas, repetir, enCurso, ucGanadas };
  }

  _createDashboardSubjectItemHtml(m) {
    const statusTextMap = {
      aprobada: "Aprobada",
      en_curso: "En Curso",
      repetir: "Por Repetir",
      intensivo_verano: "Intensivo Verano",
      pendiente_consulta: "Pendiente Consulta",
      por_cursar: "Por Cursar"
    };

    const notaHtml = m.nota
      ? `<span style="font-size: 0.78rem; font-weight: 700; color: var(--primary-blue); margin-left: 6px;">• ${m.nota} pts</span>`
      : "";

    return `
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 6px 8px; border-bottom: 1px dashed var(--border-color); flex-wrap: wrap; gap: 6px; cursor: pointer;" onclick="app.openSubjectDetailModal('${m.id}')">
        <div>
          <strong style="color: var(--text-dark); font-size: 0.8rem;">${m.nombre}</strong>
          <span style="font-size: 0.72rem; color: var(--text-muted); margin-left: 4px;">(${m.uc} UC)</span>
          ${notaHtml}
        </div>
        <div style="display: flex; align-items: center; gap: 6px;">
          <span class="status-badge status-${m.estatus}">${statusTextMap[m.estatus] || m.estatus}</span>
          <button type="button" class="btn-action" onclick="event.stopPropagation(); app.openSubjectDetailModal('${m.id}')">Notas</button>
        </div>
      </div>
    `;
  }

  _createDashboardTrayectoActions(t, isCurrentActive, aprobadas) {
    if (isCurrentActive) {
      return `
        <span style="font-size: 0.72rem; background: #E8F8F5; color: #117A65; border: 1px solid #A3E4D7; padding: 1px 6px; border-radius: 4px; font-weight: bold;">En Curso</span>
        <button type="button" class="btn-action" style="background: #117A65; color: white; border: none; font-weight: bold; font-size: 0.72rem; margin-left: 4px;" onclick="app.culminateTrayecto('${t.id}', event)">Culminar</button>
      `;
    }

    const isAllApproved = t.materias.length > 0 && aprobadas === t.materias.length;
    if (t.culminado || isAllApproved) {
      return `
        <span style="font-size: 0.72rem; background: #D1F2EB; color: #0E6251; padding: 1px 6px; border-radius: 4px; font-weight: bold;">Culminado</span>
        <button type="button" class="btn-action" style="color: var(--primary-blue); border-color: var(--primary-blue); font-size: 0.72rem; margin-left: 4px;" onclick="app.activateTrayecto('${t.id}', event)">Iniciar</button>
        <button type="button" class="btn-action" style="background: #117A65; color: white; border: none; font-weight: bold; font-size: 0.72rem; margin-left: 4px;" onclick="app.culminateTrayecto('${t.id}', event)">Culminar</button>
      `;
    }

    return `
      <button type="button" class="btn-action" style="color: var(--primary-blue); border-color: var(--primary-blue); font-weight: bold; font-size: 0.72rem;" onclick="app.activateTrayecto('${t.id}', event)">Iniciar</button>
      <button type="button" class="btn-action" style="background: #117A65; color: white; border: none; font-weight: bold; font-size: 0.72rem; margin-left: 4px;" onclick="app.culminateTrayecto('${t.id}', event)">Culminar</button>
    `;
  }

  openTrayectoDetailModal(trayectoId) {
    const pensum = this.state.pensum[this.currentCareer];
    const targetTrayecto = pensum.trayectos.find(t => t.id === trayectoId);
    if (!targetTrayecto) return;

    const modalTitle = document.getElementById("modal-trayecto-title");
    const statusBadge = document.getElementById("modal-trayecto-status-badge");
    const content = document.getElementById("modal-trayecto-content");

    if (modalTitle) {
      modalTitle.textContent = targetTrayecto.nombre;
    }

    const { aprobadas, repetir, enCurso, ucGanadas } = this._getTrayectoSummaryMetrics(targetTrayecto);
    const isCurrentActive = targetTrayecto.actual || (enCurso > 0);

    if (statusBadge) {
      if (isCurrentActive) {
        statusBadge.className = "status-badge status-en_curso";
        statusBadge.textContent = "EN CURSO";
      } else if (targetTrayecto.culminado || (targetTrayecto.materias.length > 0 && aprobadas === targetTrayecto.materias.length)) {
        statusBadge.className = "status-badge status-aprobada";
        statusBadge.textContent = "CULMINADO";
      } else {
        statusBadge.className = "status-badge status-por_cursar";
        statusBadge.textContent = "POR CURSAR";
      }
    }

    const statusTextMap = {
      aprobada: "Aprobada",
      en_curso: "En Curso",
      repetir: "Por Repetir",
      intensivo_verano: "Intensivo Verano",
      pendiente_consulta: "Pendiente Consulta",
      por_cursar: "Por Cursar"
    };

    let actionsHtml = "";
    if (isCurrentActive) {
      actionsHtml = `
        <button type="button" class="btn-primary" style="padding: 7px 14px; font-size: 0.8rem; border-radius: 8px;" onclick="app.culminateTrayecto('${targetTrayecto.id}', event); app.closeModal('modal-trayecto-detail');">
          ✓ Culminar Semestre
        </button>
      `;
    } else if (targetTrayecto.culminado) {
      actionsHtml = `
        <button type="button" class="btn-secondary" style="padding: 7px 14px; font-size: 0.8rem; border-radius: 8px;" onclick="app.activateTrayecto('${targetTrayecto.id}', event); app.closeModal('modal-trayecto-detail');">
          Reactivar Semestre
        </button>
      `;
    } else {
      actionsHtml = `
        <button type="button" class="btn-primary" style="padding: 7px 14px; font-size: 0.8rem; border-radius: 8px;" onclick="app.activateTrayecto('${targetTrayecto.id}', event); app.closeModal('modal-trayecto-detail');">
          ▶ Iniciar Este Semestre
        </button>
      `;
    }

    let subjectsHtml = "";
    targetTrayecto.materias.forEach(m => {
      const isProyecto = (m.nombre.toLowerCase().includes("proyecto socio") || m.codigo.toLowerCase().includes("psi") || m.codigo.toLowerCase().includes("pst"));
      const minPass = isProyecto ? 16 : 13;
      const notaStr = m.nota !== null && m.nota !== undefined ? `${m.nota} pts` : "Sin nota";

      subjectsHtml += `
        <div class="modal-subject-item" onclick="app.closeModal('modal-trayecto-detail'); app.openSubjectDetailModal('${m.id}');">
          <div class="modal-subject-item-left">
            <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
              <span style="font-size: 0.72rem; font-weight: 800; color: var(--text-muted); background: white; border: 1px solid var(--border-color); padding: 2px 7px; border-radius: 4px;">
                ${m.codigo} • ${m.uc} UC
              </span>
              <span class="status-badge status-${m.estatus}" style="font-size: 0.65rem;">
                ${statusTextMap[m.estatus] || m.estatus}
              </span>
            </div>
            <strong style="font-size: 0.94rem; color: var(--text-primary); margin-top: 3px;">${m.nombre}</strong>
            <span style="font-size: 0.72rem; color: #166534; font-weight: 700;">Mín. aprobatorio: ${minPass} pts</span>
          </div>

          <div class="modal-subject-item-right">
            <div style="text-align: right;">
              <div style="font-size: 0.68rem; color: var(--text-muted); font-weight: 700; text-transform: uppercase;">Nota Oficial</div>
              <strong style="font-size: 0.98rem; font-family: var(--font-family-heading); color: var(--primary-marine);">${notaStr}</strong>
            </div>
            <button type="button" class="btn-action" style="color: var(--primary-marine); border-color: var(--primary-accent); font-weight: 700;" onclick="event.stopPropagation(); app.closeModal('modal-trayecto-detail'); app.openSubjectDetailModal('${m.id}');">
              Ficha & Notas →
            </button>
          </div>
        </div>
      `;
    });

    if (content) {
      content.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; background: #F8FAFC; border: 1.5px solid var(--border-color); border-radius: 12px; padding: 12px 14px; margin-bottom: 14px; flex-wrap: wrap; gap: 10px;">
          <div>
            <div style="font-size: 0.72rem; color: var(--text-muted); font-weight: 800; text-transform: uppercase; letter-spacing: 0.03em;">Resumen del Trayecto</div>
            <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-top: 4px;">
              <span class="meta-pill meta-aprobadas">✓ ${aprobadas} Aprobadas</span>
              ${repetir > 0 ? `<span class="meta-pill meta-repetir">⚠️ ${repetir} Por Repetir</span>` : ''}
              <span class="meta-pill meta-uc">🎯 ${ucGanadas} / ${targetTrayecto.totalUC} UC</span>
            </div>
          </div>
          <div>${actionsHtml}</div>
        </div>

        <div style="margin-bottom: 4px;">
          <div style="font-size: 0.78rem; font-weight: 800; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.03em; margin-bottom: 8px;">
            Asignaturas del Trayecto (${targetTrayecto.materias.length}):
          </div>
          <div style="max-height: 52vh; overflow-y: auto; padding-right: 4px;">
            ${subjectsHtml}
          </div>
        </div>
      `;
    }

    this.openModal("modal-trayecto-detail");
  }

  _renderDashboardTrayectosSummary(pensum) {
    const summaryContainer = document.getElementById("dashboard-trayectos-summary");
    if (!summaryContainer) return;

    let trayectosHtml = "";
    let activeTrayectoName = "";

    pensum.trayectos.forEach(t => {
      const { aprobadas, repetir, enCurso, ucGanadas } = this._getTrayectoSummaryMetrics(t);
      const isCurrentActive = t.actual || (enCurso > 0);
      if (isCurrentActive && !activeTrayectoName) {
        activeTrayectoName = `${t.nombre} (En Curso)`;
      }

      let statusChip = "";
      if (isCurrentActive) {
        statusChip = `<span class="status-badge status-en_curso" style="font-size: 0.68rem;">EN CURSO</span>`;
      } else if (t.culminado || (t.materias.length > 0 && aprobadas === t.materias.length)) {
        statusChip = `<span class="status-badge status-aprobada" style="font-size: 0.68rem;">CULMINADO</span>`;
      }

      trayectosHtml += `
        <div class="trayecto-summary-card" onclick="app.openTrayectoDetailModal('${t.id}')">
          <div class="trayecto-summary-card-header">
            <div class="trayecto-summary-title-wrap">
              <span class="trayecto-folder-icon">📚</span>
              <div>
                <div style="display: flex; align-items: center; gap: 6px; flex-wrap: wrap;">
                  <h3 class="trayecto-card-title">${t.nombre}</h3>
                  ${statusChip}
                </div>
                <div class="trayecto-card-meta">
                  <span class="meta-pill meta-aprobadas">✓ ${aprobadas} Aprobadas</span>
                  ${repetir > 0 ? `<span class="meta-pill meta-repetir">⚠️ ${repetir} Por Repetir</span>` : ''}
                  <span class="meta-pill meta-uc">🎯 ${ucGanadas}/${t.totalUC} UC</span>
                </div>
              </div>
            </div>

            <div class="trayecto-summary-actions">
              <button type="button" class="btn-primary" style="padding: 7px 14px; font-size: 0.78rem; border-radius: 8px; font-weight: 700;" onclick="event.stopPropagation(); app.openTrayectoDetailModal('${t.id}')">
                Ver Materias (${t.materias.length}) ▾
              </button>
            </div>
          </div>
        </div>
      `;
    });

    summaryContainer.innerHTML = trayectosHtml;

    const phaseDesc = document.getElementById("home-phase-desc");
    if (phaseDesc && activeTrayectoName) {
      phaseDesc.textContent = activeTrayectoName;
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

      html += filteredMaterias.map(m => this.renderPensumSubjectRow(m)).join("");

      html += `
              </tbody>
            </table>
          </div>
        </details>
      `;
    });

    container.innerHTML = html || '<div style="text-align:center; padding:20px; color:var(--text-muted);">No hay asignaturas que coincidan con la búsqueda.</div>';
  }

  renderSubjectPrelacionTags(subjectId) {
    if (typeof MAPA_PRELACIONES === "undefined" || !MAPA_PRELACIONES[this.currentCareer]) {
      return "";
    }

    const careerPrela = MAPA_PRELACIONES[this.currentCareer];
    let prelaHtml = "";

    if (careerPrela[subjectId]) {
      prelaHtml += `<div class="prela-tag">Requisito clave</div>`;
    }

    for (const [reqId, info] of Object.entries(careerPrela)) {
      if (info.prelaA?.includes(subjectId)) {
        const { foundSubject: reqSub } = this.findSubjectAndTrayecto(reqId);
        if (reqSub?.estatus === "repetir") {
          prelaHtml += `<div class="prela-warning-tag">Prelada por: ${reqSub.nombre} (Por Repetir)</div>`;
        }
      }
    }

    return prelaHtml;
  }

  renderPensumSubjectRow(m) {
    const statusTextMap = {
      aprobada: "Aprobada",
      en_curso: "En Curso",
      repetir: "Por Repetir",
      intensivo_verano: "Intensivo Verano",
      pendiente_consulta: "Pendiente Consulta",
      por_cursar: "Por Cursar"
    };

    const statusClass = `status-${m.estatus}`;
    const notaDisplay = m.nota ? `<strong>${m.nota} pts</strong>` : "-";
    const prelaHtml = this.renderSubjectPrelacionTags(m.id);
    const statusLabel = statusTextMap[m.estatus] || m.estatus;

    return `
      <tr style="cursor: pointer;" onclick="app.openSubjectDetailModal('${m.id}')">
        <td class="subject-code">${m.codigo}</td>
        <td class="subject-name">
          ${m.nombre}
          ${prelaHtml}
        </td>
        <td><strong>${m.uc}</strong></td>
        <td><span class="status-badge ${statusClass}">${statusLabel}</span></td>
        <td>${notaDisplay}</td>
        <td>
          <button type="button" class="btn-action" style="color: var(--primary-blue); font-weight: bold;" onclick="event.stopPropagation(); app.openSubjectDetailModal('${m.id}')">Ficha / Notas →</button>
        </td>
      </tr>
    `;
  }

  filterSubjects() {
    this.renderPensum();
  }

  openSubjectDetailModal(subjectId) {
    this.selectedEvalSubjectId = subjectId;
    this.renderSubjectDetailContent(subjectId);
    this.openModal("modal-subject-detail");
  }

  findSubjectAndTrayecto(subjectId) {
    const pensum = this.state.pensum[this.currentCareer];
    if (!pensum?.trayectos) return { foundSubject: null, foundTrayecto: null };

    for (const t of pensum.trayectos) {
      const found = t.materias?.find(m => m.id === subjectId);
      if (found) {
        return { foundSubject: found, foundTrayecto: t };
      }
    }
    return { foundSubject: null, foundTrayecto: null };
  }

  isProyectoSubject(subject) {
    if (!subject) return false;
    const name = (subject.nombre || "").toLowerCase();
    const code = (subject.codigo || "").toLowerCase();
    return name.includes("proyecto socio") || code.includes("psi") || code.includes("pst");
  }

  calcSubjectEvaluations(evals = []) {
    let totalWeight = 0;
    let totalScoreWeighted = 0;

    for (const e of evals) {
      const weight = Number.parseFloat(e.ponderacion || 0);
      totalWeight += weight;
      if (e.nota !== null && e.nota !== undefined) {
        totalScoreWeighted += Number.parseFloat(e.nota) * (weight / 100);
      }
    }

    const remainingWeight = Math.max(0, 100 - totalWeight);
    return { totalWeight, totalScoreWeighted, remainingWeight };
  }

  formatPredictiveScore(reqGrade, successLabel) {
    if (reqGrade === "N/A") return "N/A";
    const gradeNum = Number.parseFloat(reqGrade);
    if (gradeNum <= 0) return successLabel;
    if (gradeNum > 20) return "No alcanza";
    return `${reqGrade} pts prom.`;
  }

  calcPredictiveTarget(targetScore, totalScoreWeighted, remainingWeight, successLabel) {
    const needed = Math.max(0, targetScore - totalScoreWeighted);
    const reqGrade = remainingWeight > 0 ? (needed / (remainingWeight / 100)).toFixed(1) : "N/A";
    return {
      needed,
      displayScore: this.formatPredictiveScore(reqGrade, successLabel)
    };
  }

  renderPredictiveBox(subject, evalCalc) {
    const { totalWeight, totalScoreWeighted, remainingWeight } = evalCalc;
    if (totalWeight >= 100 && subject.estatus === "aprobada") {
      return "";
    }

    const isProyecto = this.isProyectoSubject(subject);
    const minPassScore = isProyecto ? 16 : 13;
    const goodScore = isProyecto ? 18 : 16;
    const excelScore = 20;

    const minTarget = this.calcPredictiveTarget(minPassScore, totalScoreWeighted, remainingWeight, "¡Aprobado!");
    const goodTarget = this.calcPredictiveTarget(goodScore, totalScoreWeighted, remainingWeight, "¡Alcanzado!");
    const excelTarget = this.calcPredictiveTarget(excelScore, totalScoreWeighted, remainingWeight, "¡Alcanzado!");

    return `
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
            <div class="predictive-target-score">${minTarget.displayScore}</div>
            <div style="font-size:0.68rem; color:var(--text-muted); margin-top: 2px;">Faltan ${minTarget.needed.toFixed(2)} pts</div>
          </div>
          <div class="predictive-target-card">
            <div class="predictive-target-name">Meta Rendimiento (${goodScore} pts)</div>
            <div class="predictive-target-score">${goodTarget.displayScore}</div>
            <div style="font-size:0.68rem; color:var(--text-muted); margin-top: 2px;">Faltan ${goodTarget.needed.toFixed(2)} pts</div>
          </div>
          <div class="predictive-target-card">
            <div class="predictive-target-name">Sobresaliente (${excelScore} pts)</div>
            <div class="predictive-target-score">${excelTarget.displayScore}</div>
            <div style="font-size:0.68rem; color:var(--text-muted); margin-top: 2px;">Faltan ${excelTarget.needed.toFixed(2)} pts</div>
          </div>
        </div>
      </div>
    `;
  }

  renderEvalTableRows(evals = []) {
    if (evals.length === 0) {
      return '<tr><td colspan="6" style="text-align:center; padding:16px; color:var(--text-muted); font-size:0.8rem;">Sin evaluaciones registradas aún. Presiona <strong>+ Nueva Evaluación</strong> para agregar una.</td></tr>';
    }

    return evals.map((e, idx) => {
      const ptsGanados = (e.nota !== null && e.nota !== undefined)
        ? ((e.nota * e.ponderacion) / 100).toFixed(2)
        : "-";
      const statusBadge = e.completada
        ? '<span class="status-badge status-aprobada" style="font-size:0.68rem;">Completada</span>'
        : '<span class="status-badge status-intensivo_verano" style="font-size:0.68rem;">Pendiente</span>';
      const notaDisplay = (e.nota !== null && e.nota !== undefined) ? `<strong>${e.nota} pts</strong>` : "-";

      return `
        <tr>
          <td class="subject-name" style="font-size:0.82rem;">${e.nombre}</td>
          <td style="font-size:0.8rem;"><strong>${e.ponderacion}%</strong></td>
          <td style="font-size:0.8rem;">${notaDisplay}</td>
          <td style="font-size:0.8rem;"><strong style="color: var(--primary-blue);">${ptsGanados} pts</strong></td>
          <td>${statusBadge}</td>
          <td>
            <div style="display:flex; gap:4px;">
              <button type="button" class="btn-action admin-only-btn" style="padding:2px 6px; font-size:0.7rem;" onclick="app.openEditEvalModal('${idx}')">Editar</button>
              <button type="button" class="btn-action admin-only-btn" style="padding:2px 6px; font-size:0.7rem; color:#BE123C; border-color:#FECDD3;" onclick="app.deleteEvaluation('${idx}')">&times;</button>
            </div>
          </td>
        </tr>
      `;
    }).join("");
  }

  renderSubjectDetailContent(subjectId) {
    const container = document.getElementById("detail-subject-content");
    const titleEl = document.getElementById("detail-subject-title");
    if (!container) return;

    const { foundSubject, foundTrayecto } = this.findSubjectAndTrayecto(subjectId);

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

    const evals = this.state.evaluaciones[subjectId] || [];
    const evalCalc = this.calcSubjectEvaluations(evals);
    const predictiveHtml = this.renderPredictiveBox(foundSubject, evalCalc);
    const evalRows = this.renderEvalTableRows(evals);

    const trayectoName = foundTrayecto ? foundTrayecto.nombre : "Pensum";
    const notaOficial = foundSubject.nota !== null ? `${foundSubject.nota} pts` : "Sin calificar";
    const refDocHtml = foundSubject.refDoc
      ? `<div style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 2px;"><strong>Profesor / Nota:</strong> ${foundSubject.refDoc}</div>`
      : "";
    const statusText = statusTextMap[foundSubject.estatus] || foundSubject.estatus;

    container.innerHTML = `
      <div style="display: flex; flex-direction: column; gap: 8px;">
        <div style="background: var(--bg-hover); border-radius: 8px; padding: 10px 12px; border: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 8px;">
          <div>
            <div style="font-size: 0.72rem; font-weight: bold; color: var(--primary-blue); text-transform: uppercase;">
              ${trayectoName} • ${foundSubject.uc} UC • Nota Oficial: <strong>${notaOficial}</strong>
            </div>
            ${refDocHtml}
          </div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span class="status-badge status-${foundSubject.estatus}">${statusText}</span>
            <button type="button" class="btn-action admin-only-btn" style="font-size: 0.72rem; padding: 3px 8px;" onclick="app.openEditSubjectModal('${foundSubject.id}')">Editar Datos</button>
          </div>
        </div>

        ${predictiveHtml}

        <div style="background: white; border: 1px solid var(--border-color); border-radius: 8px; overflow: hidden; margin-top: 4px;">
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 8px 10px; background: var(--bg-hover); border-bottom: 1px solid var(--border-color); flex-wrap: wrap; gap: 6px;">
            <div style="font-size: 0.78rem; font-weight: bold; color: var(--text-dark);">
              Ponderación: ${evalCalc.totalWeight}% / 100% • Acumulado: <span style="color: var(--primary-blue);">${evalCalc.totalScoreWeighted.toFixed(2)} / 20 pts</span>
            </div>
            <div style="display: flex; gap: 6px;">
              <button type="button" class="btn-primary admin-only-btn" style="padding: 3px 8px; font-size: 0.72rem;" onclick="app.openAddEvalModal()">+ Nueva Evaluación</button>
              <button type="button" class="btn-action admin-only-btn" style="background: #117A65; color: white; border: none; font-weight: bold; padding: 3px 8px; font-size: 0.72rem;" onclick="app.syncEvalGradeToPensum('${subjectId}')">Sincronizar Nota</button>
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
    const { foundSubject: foundMat, foundTrayecto } = this.findSubjectAndTrayecto(subjectId);

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

  getSubjectFormData() {
    const id = document.getElementById("edit-subject-id").value;
    const name = (document.getElementById("edit-subject-name").value || "").trim();
    if (!name) {
      this.showToast("Por favor ingresa el nombre de la asignatura.", "warning");
      return null;
    }

    const rawCode = (document.getElementById("edit-subject-code").value || "").trim();
    const randomSuffix = (typeof crypto !== "undefined" && crypto.getRandomValues)
      ? 100 + (crypto.getRandomValues(new Uint32Array(1))[0] % 900)
      : 100 + (Date.now() % 900);
    const code = rawCode || `${name.substring(0, 3).toUpperCase()}-${randomSuffix}`;
    const ucVal = document.getElementById("edit-subject-uc").value;
    const uc = ucVal ? Number.parseInt(ucVal, 10) : 2;

    return {
      id,
      name,
      code,
      uc,
      trayectoTarget: document.getElementById("edit-subject-trayecto").value,
      status: document.getElementById("edit-subject-status").value,
      gradeVal: document.getElementById("edit-subject-grade").value,
      refDoc: (document.getElementById("edit-subject-ref").value || "").trim()
    };
  }

  calculateFinalStatusAndGrade(name, code, status, gradeVal) {
    if (gradeVal === "" || gradeVal === null || gradeVal === undefined) {
      return { gradeNum: null, finalStatus: status };
    }

    const gradeNum = Number.parseFloat(gradeVal);
    const minPass = this.isProyectoSubject({ nombre: name, codigo: code }) ? 16 : 13;
    const pendingStatuses = ["en_curso", "por_cursar", "repetir"];

    if (gradeNum >= minPass && pendingStatuses.includes(status)) {
      return { gradeNum, finalStatus: "aprobada" };
    }
    if (gradeNum < minPass && status === "aprobada") {
      return { gradeNum, finalStatus: "repetir" };
    }

    return { gradeNum, finalStatus: status };
  }

  updateExistingSubject(id, subjectData, trayectoTarget, pensum) {
    const { foundSubject: existingMat, foundTrayecto: currentTrayecto } = this.findSubjectAndTrayecto(id);
    if (!existingMat) return;

    Object.assign(existingMat, subjectData);

    if (currentTrayecto && currentTrayecto.id !== trayectoTarget) {
      currentTrayecto.materias = currentTrayecto.materias.filter(m => m.id !== id);
      const newTrayecto = pensum.trayectos.find(t => t.id === trayectoTarget) || currentTrayecto;
      newTrayecto.materias.push(existingMat);
    }
  }

  createNewSubject(subjectData, trayectoTarget, pensum) {
    const prefix = this.currentCareer === "ADM" ? "adm-" : "inf-";
    const newSubject = {
      id: `${prefix}${Date.now()}`,
      ...subjectData
    };

    const targetTrayecto = pensum.trayectos.find(t => t.id === trayectoTarget)
      || pensum.trayectos.find(t => t.actual)
      || pensum.trayectos[0];

    if (targetTrayecto) {
      targetTrayecto.materias.push(newSubject);
    }
  }

  refreshSubjectViews(targetId, scrollPos, subjectName) {
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

    if (targetId) {
      this.renderSubjectDetailContent(targetId);
      this.loadEvaluationsForSubject(targetId);
    }
    window.scrollTo({ top: scrollPos, behavior: "instant" });
    this.showToast(`¡Asignatura "${subjectName}" guardada con éxito!`, "success");
  }

  saveSubjectEdit(event) {
    event.preventDefault();
    if (!this.requireAdmin("editar o crear asignaturas")) return;
    const scrollPos = window.scrollY;
    const formData = this.getSubjectFormData();
    if (!formData) return;

    const { id, name, code, uc, trayectoTarget, status, gradeVal, refDoc } = formData;
    const { gradeNum, finalStatus } = this.calculateFinalStatusAndGrade(name, code, status, gradeVal);
    const pensum = this.state.pensum[this.currentCareer];

    const subjectData = {
      nombre: name,
      codigo: code,
      uc,
      estatus: finalStatus,
      nota: gradeNum,
      refDoc
    };

    if (id) {
      this.updateExistingSubject(id, subjectData, trayectoTarget, pensum);
    } else {
      this.createNewSubject(subjectData, trayectoTarget, pensum);
    }

    const targetId = id || this.selectedEvalSubjectId;
    this.refreshSubjectViews(targetId, scrollPos, name);
  }

  deleteSubject(subjectId) {
    if (!this.requireAdmin("eliminar asignaturas del pensum")) return;
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

  renderEvalSubjectHeader(foundSubject, foundTrayecto) {
    if (!foundSubject) return "";

    const statusTextMap = {
      aprobada: "Aprobada",
      en_curso: "En Curso",
      repetir: "Por Repetir",
      intensivo_verano: "Intensivo Verano",
      pendiente_consulta: "Pendiente Consulta",
      por_cursar: "Por Cursar"
    };

    const trayectoName = foundTrayecto ? foundTrayecto.nombre : "Pensum Académico";
    const refDocHtml = foundSubject.refDoc
      ? `<p style="margin: 6px 0 0 0; font-size: 0.85rem; color: var(--text-secondary);"><strong>Detalles / Profesor / Soporte:</strong> ${foundSubject.refDoc}</p>`
      : "";
    const statusLabel = statusTextMap[foundSubject.estatus] || foundSubject.estatus;

    return `
      <div class="subject-eval-header-card" style="background: white; border-radius: 12px; padding: 18px 22px; margin-bottom: 20px; border: 1px solid var(--border-color); box-shadow: var(--shadow-sm); display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 15px;">
        <div>
          <div style="font-size: 0.8rem; font-weight: 700; text-transform: uppercase; color: var(--primary-marine); letter-spacing: 0.5px; margin-bottom: 4px;">
            ${trayectoName} • ${foundSubject.uc} UC
          </div>
          <h2 style="margin: 0; font-size: 1.35rem; color: var(--text-dark);">
            ${foundSubject.nombre}
          </h2>
          ${refDocHtml}
        </div>
        <div>
          <span class="status-badge status-${foundSubject.estatus}">${statusLabel}</span>
        </div>
      </div>
    `;
  }

  renderEvalPredictiveBox(foundSubject, evalCalc) {
    const { totalWeight, totalScoreWeighted, remainingWeight } = evalCalc;
    if (totalWeight >= 100 && foundSubject?.estatus === "aprobada") {
      return "";
    }

    const isProyecto = this.isProyectoSubject(foundSubject);
    const minPassScore = isProyecto ? 16 : 13;
    const goodScore = isProyecto ? 18 : 16;
    const excelScore = 20;

    const minTarget = this.calcPredictiveTarget(minPassScore, totalScoreWeighted, remainingWeight, "¡Aprobado!");
    const goodTarget = this.calcPredictiveTarget(goodScore, totalScoreWeighted, remainingWeight, "¡Alcanzado!");
    const excelTarget = this.calcPredictiveTarget(excelScore, totalScoreWeighted, remainingWeight, "¡Alcanzado!");

    const subtitle = isProyecto ? "Proyecto: Mínimo 16 pts" : "Materia General: Mínimo 13 pts";

    return `
      <div class="eval-predictive-box">
        <div class="predictive-header">
          <div class="predictive-title">
            <span>Simulador de Calificación Necesaria (${subtitle})</span>
          </div>
          <div style="font-size: 0.8rem; color: #166534; font-weight: bold;">
            Ponderación restante por evaluar: ${remainingWeight}%
          </div>
        </div>
        <div class="predictive-targets-grid">
          <div class="predictive-target-card">
            <div class="predictive-target-name">Mínimo para Aprobar (${minPassScore} pts)</div>
            <div class="predictive-target-score">${minTarget.displayScore}</div>
            <div style="font-size:0.72rem; color:var(--text-muted); margin-top: 3px;">Faltan ${minTarget.needed.toFixed(2)} pts acumulados</div>
          </div>
          <div class="predictive-target-card">
            <div class="predictive-target-name">Meta Rendimiento Bueno (${goodScore} pts)</div>
            <div class="predictive-target-score">${goodTarget.displayScore}</div>
            <div style="font-size:0.72rem; color:var(--text-muted); margin-top: 3px;">Faltan ${goodTarget.needed.toFixed(2)} pts acumulados</div>
          </div>
          <div class="predictive-target-card">
            <div class="predictive-target-name">Meta Distinción / Sobresaliente (${excelScore} pts)</div>
            <div class="predictive-target-score">${excelTarget.displayScore}</div>
            <div style="font-size:0.72rem; color:var(--text-muted); margin-top: 3px;">Faltan ${excelTarget.needed.toFixed(2)} pts acumulados</div>
          </div>
        </div>
      </div>
    `;
  }

  renderMainEvalTableRows(evals = []) {
    if (evals.length === 0) {
      return `<tr><td colspan="7" style="text-align:center; padding:30px; color:var(--text-muted);">No hay evaluaciones registradas para esta asignatura aún.<br><span style="font-size:0.85rem; margin-top:5px; display:inline-block;">Haz clic en <strong>+ Nueva Evaluación</strong> arriba para registrar lo acordado con el profesor.</span></td></tr>`;
    }

    return evals.map((e, idx) => {
      const ptsGanados = (e.nota !== null && e.nota !== undefined)
        ? ((Number.parseFloat(e.nota) * Number.parseFloat(e.ponderacion || 0)) / 100).toFixed(2)
        : "-";
      const statusBadge = e.completada
        ? '<span class="status-badge status-aprobada">COMPLETADA</span>'
        : '<span class="status-badge status-intensivo_verano">PENDIENTE</span>';
      const notaDisplay = (e.nota !== null && e.nota !== undefined) ? `<strong>${e.nota} pts</strong>` : "-";

      return `
        <tr>
          <td class="subject-name">${e.nombre}</td>
          <td><strong>${e.ponderacion}%</strong></td>
          <td>${notaDisplay}</td>
          <td><strong style="color: var(--primary-marine);">${ptsGanados} pts</strong></td>
          <td>${e.fecha || "-"}</td>
          <td>${statusBadge}</td>
          <td>
            <button type="button" class="btn-action" onclick="app.openEditEvalModal('${idx}')">Editar</button>
            <button type="button" class="btn-action" style="color:#C0392B; border-color:#FDEDEC;" onclick="app.deleteEvaluation('${idx}')">Eliminar</button>
          </td>
        </tr>
      `;
    }).join("");
  }

  loadEvaluationsForSubject(subjectId) {
    this.selectedEvalSubjectId = subjectId;
    this.renderSubjectDetailContent(subjectId);
    const container = document.getElementById("eval-panel-container");
    if (!container) return;

    const { foundSubject, foundTrayecto } = this.findSubjectAndTrayecto(subjectId);
    const evals = this.state.evaluaciones[subjectId] || [];
    const evalCalc = this.calcSubjectEvaluations(evals);

    const subjectHeaderHtml = this.renderEvalSubjectHeader(foundSubject, foundTrayecto);
    const predictiveHtml = this.renderEvalPredictiveBox(foundSubject, evalCalc);
    const tableRowsHtml = this.renderMainEvalTableRows(evals);

    container.innerHTML = `
      ${subjectHeaderHtml}
      ${predictiveHtml}
      <div class="eval-panel">
        <div class="eval-summary-bar">
          <div>
            <span>PONDERACIÓN ACUMULADA: <strong>${evalCalc.totalWeight}%</strong> de 100%</span>
          </div>
          <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
            <div class="eval-score-total">
              NOTA ACUMULADA: ${evalCalc.totalScoreWeighted.toFixed(2)} / 20 pts
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
              ${tableRowsHtml}
            </tbody>
          </table>
        </div>
      </div>
    `;
  }

  syncEvalGradeToPensum(subjectId) {
    if (!this.requireAdmin("sincronizar notas al pensum")) return;
    const scrollPos = window.scrollY;
    const { foundSubject: found } = this.findSubjectAndTrayecto(subjectId);
    if (!found) return;

    const evals = this.state.evaluaciones[subjectId] || [];
    const { totalWeight, totalScoreWeighted } = this.calcSubjectEvaluations(evals);

    const finalGrade = Math.round(totalScoreWeighted * 10) / 10;
    found.nota = finalGrade;

    const isProyecto = this.isProyectoSubject(found);
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
    if (!this.requireAdmin("guardar evaluaciones")) return;
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
    if (!this.requireAdmin("eliminar evaluaciones")) return;
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
    if (!this.requireAdmin("limpiar el horario")) return;
    const items = this.getScheduleList();
    items.length = 0;
    this.saveState();
    this.renderSchedule();
    this.showToast("Horario limpiado correctamente.", "info");
  }

  deleteScheduleClass(classId) {
    if (!this.requireAdmin("eliminar clases del horario")) return;
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
    if (!this.requireAdmin("guardar clases en el horario")) return;
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
    if (!this.requireAdmin("crear tareas o alertas")) return;
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
    if (!this.requireAdmin("eliminar alertas o tareas")) return;
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
      if (msgEl) msgEl.innerHTML = message.replaceAll("\n", "<br>");
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
    if (!this.requireAdmin("importar datos de respaldo")) return;
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