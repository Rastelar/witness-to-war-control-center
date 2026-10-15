/**
 * WITNESS TO WAR & VIOLENCE (WTWV) - APPLICATION CONTROLLER & REACTIVE ENGINE
 * 
 * Gestiona el estado reactivo, la persistencia en LocalStorage,
 * los filtros por rol (Lachlan, onmove, Equipo Interno, Luis),
 * la edición inline de timeframes de la agencia, el motor anti-cuellos de botella,
 * el seguimiento de Meta Ads / Telefonía y la gestión de merchandising.
 */

// Key para persistencia local
const STORAGE_KEY = "wtwv_control_center_state_v1";

// Estado global de la aplicación
let AppState = {
  data: null,
  currentRole: "executive", // "executive" | "agency" | "operations" | "media" | "merch"
  activeTab: "radar",       // "radar" | "agency" | "workflow" | "media" | "merch" | "raci" | "timeline"
  filters: {
    search: "",
    assignee: "all",
    priority: "all",
    onlyBlocked: false
  },
  modalOpen: null, // null | "taskModal" | "merchModal" | "emailModal" | "exportModal" | "shareModal"
  isServerSyncActive: false
};

// Inicialización de la app
document.addEventListener("DOMContentLoaded", async () => {
  parseUrlParameters();
  setupEventListeners();
  await initAppState();
  console.log("Witness to War Control Center initialized successfully.");
});

/**
 * Lee parámetros de la URL (?role=agency, ?tab=agency) para compartir vistas directas
 */
function parseUrlParameters() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const roleParam = urlParams.get('role');
    const tabParam = urlParams.get('tab');

    if (roleParam && ["executive", "agency", "operations", "media", "merch"].includes(roleParam)) {
      AppState.currentRole = roleParam;
    }
    
    if (tabParam && ["radar", "agency", "workflow", "media", "merch", "raci", "timeline"].includes(tabParam)) {
      AppState.activeTab = tabParam;
    } else if (roleParam) {
      if (roleParam === "agency") AppState.activeTab = "agency";
      else if (roleParam === "operations") AppState.activeTab = "workflow";
      else if (roleParam === "media") AppState.activeTab = "media";
      else if (roleParam === "merch") AppState.activeTab = "merch";
      else if (roleParam === "executive") AppState.activeTab = "radar";
    }
  } catch (err) {
    console.warn("Error parseando parámetros URL:", err);
  }
}

/**
 * Carga los datos desde el servidor API o usa LocalStorage / data.js como respaldo
 */
async function initAppState() {
  let loadedFromServer = false;

  // 1. Intentar cargar desde el Servidor API (/api/data)
  try {
    const response = await fetch('/api/data', { cache: 'no-store' });
    if (response.ok) {
      const serverData = await response.json();
      if (serverData && serverData.project) {
        AppState.data = serverData;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(serverData));
        loadedFromServer = true;
        updateSyncBadge(true, "En Vivo (Sync Servidor)");
        console.log("Datos sincronizados con éxito desde el Servidor API.");
      }
    }
  } catch (apiErr) {
    console.warn("Servidor API no disponible o estático, usando modo local:", apiErr);
  }

  // 2. Si no se pudo cargar del servidor, usar LocalStorage o datos iniciales
  if (!loadedFromServer) {
    updateSyncBadge(false, "Modo Local");
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        AppState.data = JSON.parse(saved);
        console.log("Cargados datos guardados en LocalStorage.");
      } else if (window.WTW_INITIAL_DATA) {
        AppState.data = JSON.parse(JSON.stringify(window.WTW_INITIAL_DATA));
        saveAppState();
      }
    } catch (err) {
      console.error("Error al cargar estado local, usando datos iniciales:", err);
      AppState.data = JSON.parse(JSON.stringify(window.WTW_INITIAL_DATA));
    }
  }

  // 3. Conectar a Server-Sent Events (SSE) para sincronización en tiempo real
  initLiveSync();
  renderApp();
}

/**
 * Escucha eventos SSE del servidor para reflejar cambios hechos por otros usuarios
 */
function initLiveSync() {
  if (typeof EventSource !== 'undefined') {
    try {
      const evtSource = new EventSource('/api/events');

      evtSource.addEventListener('data_updated', async (e) => {
        try {
          const res = await fetch('/api/data', { cache: 'no-store' });
          if (res.ok) {
            const updated = await res.json();
            AppState.data = updated;
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            renderApp();
            showToast("Actualización recibida del equipo o agencia en tiempo real", "info");
          }
        } catch (err) {
          console.warn("Error refrescando tras evento SSE:", err);
        }
      });

      evtSource.onopen = () => {
        AppState.isServerSyncActive = true;
        updateSyncBadge(true, "En Vivo (Sync)");
      };

      evtSource.onerror = () => {
        AppState.isServerSyncActive = false;
        updateSyncBadge(false, "Sin Conexión");
      };
    } catch (e) {
      console.warn("SSE no soportado o fallido:", e);
    }
  }
}

function updateSyncBadge(isConnected, text) {
  const syncBadge = document.getElementById("syncBadge");
  const syncStatusText = document.getElementById("syncStatusText");
  if (!syncBadge || !syncStatusText) return;

  syncStatusText.textContent = text;
  if (isConnected) {
    syncBadge.className = "hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-emerald-300 border border-slate-700";
    syncBadge.querySelector("span").className = "w-2 h-2 rounded-full bg-emerald-400 animate-pulse";
  } else {
    syncBadge.className = "hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-slate-400 border border-slate-700";
    syncBadge.querySelector("span").className = "w-2 h-2 rounded-full bg-slate-500";
  }
}

/**
 * Guarda el estado actual en LocalStorage y en el Servidor API
 */
async function saveAppState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(AppState.data));
    showToast("Cambios guardados", "success");

    // Guardar en servidor para sincronización de todo el equipo
    fetch('/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(AppState.data)
    }).then(res => {
      if (res.ok) {
        updateSyncBadge(true, "En Vivo (Sync)");
      }
    }).catch(err => {
      console.warn("No se pudo persistir en el servidor API (posible modo estático):", err);
    });
  } catch (err) {
    console.error("Error guardando en LocalStorage:", err);
    showToast("Error al guardar en almacenamiento local", "error");
  }
}

/**
 * Restaura los datos originales de fábrica
 */
async function resetToDefaultData() {
  if (confirm("¿Estás seguro de restablecer el tablero a los datos iniciales? Se perderán las modificaciones no respaldadas.")) {
    try {
      await fetch('/api/reset', { method: 'POST' });
    } catch (e) {}

    AppState.data = JSON.parse(JSON.stringify(window.WTW_INITIAL_DATA));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(AppState.data));
    renderApp();
    showToast("Tablero restablecido a los datos originales.", "info");
  }
}

/**
 * Configuración de eventos globales
 */
function setupEventListeners() {
  // Selector de Rol
  const roleSelect = document.getElementById("roleSelector");
  if (roleSelect) {
    roleSelect.addEventListener("change", (e) => {
      setRole(e.target.value);
    });
  }

  // Navegación por Pestañas
  document.querySelectorAll("[data-nav-tab]").forEach(button => {
    button.addEventListener("click", (e) => {
      const tab = e.currentTarget.getAttribute("data-nav-tab");
      setActiveTab(tab);
    });
  });

  // Filtros de búsqueda y cuellos de botella
  const searchInput = document.getElementById("globalSearchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      AppState.filters.search = e.target.value.toLowerCase();
      renderCurrentTab();
    });
  }

  const blockedFilterToggle = document.getElementById("filterOnlyBlocked");
  if (blockedFilterToggle) {
    blockedFilterToggle.addEventListener("change", (e) => {
      AppState.filters.onlyBlocked = e.target.checked;
      renderCurrentTab();
    });
  }

  // Atajos de Teclado
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && AppState.modalOpen) {
      closeModal();
    }
  });
}

/**
 * Cambia el rol activo y adapta la vista
 */
function setRole(role) {
  AppState.currentRole = role;
  
  // Cambiar pestaña recomendada según rol
  if (role === "agency") {
    AppState.activeTab = "agency";
  } else if (role === "operations") {
    AppState.activeTab = "workflow";
  } else if (role === "media") {
    AppState.activeTab = "media";
  } else if (role === "merch") {
    AppState.activeTab = "merch";
  } else if (role === "executive") {
    AppState.activeTab = "radar";
  }

  updateNavigationUI();
  renderApp();
  showToast(`Vista cambiada a: ${getRoleDisplayName(role)}`, "info");
}

function getRoleDisplayName(role) {
  switch (role) {
    case "executive": return "👑 Vista Ejecutiva (Lachlan)";
    case "agency": return "🏢 Vista Agencia (onmove)";
    case "operations": return "👥 Vista Operativa (Equipo W2W)";
    case "media": return "📈 Vista Growth & Redes (Luis)";
    case "merch": return "📦 Vista Merchandising & Eventos";
    default: return "Vista General";
  }
}

/**
 * Cambia la pestaña activa
 */
function setActiveTab(tab) {
  AppState.activeTab = tab;
  updateNavigationUI();
  renderCurrentTab();
}

function updateNavigationUI() {
  document.querySelectorAll("[data-nav-tab]").forEach(btn => {
    const tabName = btn.getAttribute("data-nav-tab");
    if (tabName === AppState.activeTab) {
      btn.className = "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-[#323B3F] text-[#96EE89] shadow-sm transition-all";
    } else {
      btn.className = "flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all";
    }
  });

  // Selector de Rol sincronizado
  const roleSelect = document.getElementById("roleSelector");
  if (roleSelect && roleSelect.value !== AppState.currentRole) {
    roleSelect.value = AppState.currentRole;
  }
}

/**
 * Render general del aplicativo
 */
function renderApp() {
  updateNavigationUI();
  renderHeaderMetrics();
  renderCurrentTab();
}

/**
 * Renderiza métricas rápidas del header
 */
function renderHeaderMetrics() {
  const container = document.getElementById("headerMetrics");
  if (!container) return;

  const data = AppState.data;
  const totalTasks = data.teamOperations.tasks.length;
  const blockedTasks = data.teamOperations.tasks.filter(t => t.isBlocked).length;
  const metaSpent = data.paidMedia.phase1Meta.spentToDate;
  const metaBudget = data.paidMedia.phase1Meta.totalBudget;
  const websiteProgress = Math.round(
    data.agencyRoadmap.phases.reduce((acc, p) => acc + p.progress, 0) / data.agencyRoadmap.phases.length
  );

  container.innerHTML = `
    <div class="flex items-center gap-3">
      <div class="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold ${
        blockedTasks > 0 ? "bg-amber-100 text-amber-800 border border-amber-200" : "bg-emerald-100 text-emerald-800"
      }">
        <span class="w-2 h-2 rounded-full ${blockedTasks > 0 ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}"></span>
        ${blockedTasks > 0 ? `${blockedTasks} Cuellos de Botella` : "Flujo Despejado"}
      </div>

      <div class="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
        <span class="text-slate-400">Sitio Web:</span>
        <span class="font-bold text-slate-900">${websiteProgress}%</span>
      </div>

      <div class="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
        <span class="text-slate-400">Meta Ads:</span>
        <span class="font-bold text-slate-900">$${metaSpent.toFixed(0)} / $${metaBudget}</span>
      </div>
    </div>
  `;
}

/**
 * Renderiza la pestaña seleccionada
 */
function renderCurrentTab() {
  const mainContent = document.getElementById("mainContentContainer");
  if (!mainContent) return;

  switch (AppState.activeTab) {
    case "radar":
      mainContent.innerHTML = renderRadarView();
      break;
    case "agency":
      mainContent.innerHTML = renderAgencyView();
      break;
    case "workflow":
      mainContent.innerHTML = renderWorkflowView();
      break;
    case "media":
      mainContent.innerHTML = renderMediaView();
      break;
    case "merch":
      mainContent.innerHTML = renderMerchView();
      break;
    case "raci":
      mainContent.innerHTML = renderRaciView();
      break;
    case "timeline":
      mainContent.innerHTML = renderTimelineView();
      break;
    default:
      mainContent.innerHTML = renderRadarView();
  }

  // Refrescar listeners de la vista recién inyectada
  attachTabSpecificListeners();
}

// =========================================================================
// MÓDULO 1: RADAR ESTRATÉGICO ("Dónde estamos, Dónde vamos, Próximo paso")
// =========================================================================
function renderRadarView() {
  const radar = AppState.data.strategicRadar;
  const tasks = AppState.data.teamOperations.tasks;
  const blockedTasks = tasks.filter(t => t.isBlocked);

  return `
    <div class="space-y-8 animate-fadeIn">
      <!-- Banner de Alerta de Cuello de Botella Crítico -->
      ${blockedTasks.length > 0 ? `
        <div class="bg-gradient-to-r from-amber-50 via-amber-100/60 to-red-50 border-l-4 border-amber-500 p-5 rounded-xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-start gap-3">
            <div class="p-2 bg-amber-500 text-white rounded-lg shadow-sm">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
            </div>
            <div>
              <h4 class="text-sm font-bold text-amber-900 uppercase tracking-wider">Atención de Liderazgo Requerida</h4>
              <p class="text-slate-800 text-sm mt-0.5">
                Hay <strong>${blockedTasks.length} tareas detenidas</strong> afectando el cronograma del sitio web y la presentación de Lachlan. 
                Principal bloqueo: <span class="underline font-semibold">${blockedTasks[0].title}</span> (${blockedTasks[0].blockerReason})
              </p>
            </div>
          </div>
          <button onclick="setActiveTab('workflow'); AppState.filters.onlyBlocked=true; renderCurrentTab();" 
                  class="whitespace-nowrap px-4 py-2 bg-[#323B3F] hover:bg-slate-900 text-[#96EE89] text-xs font-bold rounded-lg shadow transition-all">
            Desbloquear Cuellos de Botella &rarr;
          </button>
        </div>
      ` : ''}

      <!-- TRIADA ESTRATÉGICA: 3 COLUMNAS CLAVE -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- 1. DÓNDE ESTAMOS HOY -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
          <div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 to-[#96EE89]"></div>
          <div>
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Fase Actual</span>
              <span class="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800">
                Octubre 2026
              </span>
            </div>
            <h3 class="text-xl font-bold text-[#323B3F] mb-1">${radar.whereWeAre.title}</h3>
            <p class="text-xs text-slate-500 mb-5">${radar.whereWeAre.headline}</p>

            <div class="space-y-4">
              ${radar.whereWeAre.points.map(pt => `
                <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-xs font-bold text-slate-800">${pt.label}</span>
                    <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      pt.badgeColor === 'emerald' ? 'bg-emerald-100 text-emerald-800' :
                      pt.badgeColor === 'amber' ? 'bg-amber-100 text-amber-800' :
                      pt.badgeColor === 'blue' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'
                    }">${pt.badge}</span>
                  </div>
                  <p class="text-xs text-slate-600 leading-relaxed">${pt.desc}</p>
                </div>
              `).join('')}
            </div>
          </div>
          <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Presupuesto Ejecutado:</span>
            <span class="font-bold text-slate-800">$${AppState.data.project.budget.spent.toLocaleString()} / $${AppState.data.project.budget.totalApproved.toLocaleString()} AUD</span>
          </div>
        </div>

        <!-- 2. DÓNDE VAMOS A ESTAR -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
          <div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#96EE89] to-emerald-500"></div>
          <div>
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">Horizonte de Entrega</span>
              <span class="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">
                Hitos Clave
              </span>
            </div>
            <h3 class="text-xl font-bold text-[#323B3F] mb-1">${radar.whereWeAreGoing.title}</h3>
            <p class="text-xs text-slate-500 mb-5">${radar.whereWeAreGoing.headline}</p>

            <div class="space-y-4">
              ${radar.whereWeAreGoing.milestones.map((ms, idx) => `
                <div class="relative pl-6 pb-2 border-l-2 ${idx === 0 ? 'border-amber-400' : 'border-slate-200'} last:border-transparent">
                  <div class="absolute -left-1.5 top-0.5 w-3 h-3 rounded-full ${
                    idx === 0 ? 'bg-amber-500 ring-4 ring-amber-100' : 'bg-slate-400'
                  }"></div>
                  <span class="text-[11px] font-bold text-slate-400 block uppercase">${ms.timeframe}</span>
                  <h5 class="text-xs font-bold text-slate-900 mt-0.5">${ms.title}</h5>
                  <p class="text-xs text-slate-600 mt-1 leading-relaxed">${ms.desc}</p>
                  <div class="mt-2 flex items-center gap-2">
                    <span class="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">Líder: ${ms.owner}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          <div class="mt-6 pt-4 border-t border-slate-100 text-center">
            <button onclick="setActiveTab('agency')" class="text-xs font-bold text-[#323B3F] hover:text-emerald-700 flex items-center justify-center gap-1 w-full">
              Ver Cronograma de la Agencia onmove &rarr;
            </button>
          </div>
        </div>

        <!-- 3. CUÁL ES EL PASO A SEGUIR (INMEDIATO) -->
        <div class="bg-gradient-to-br from-slate-900 to-[#323B3F] text-white rounded-2xl shadow-xl p-6 relative overflow-hidden flex flex-col justify-between">
          <div class="absolute top-0 right-0 transform translate-x-4 -translate-y-4 opacity-10">
            <svg class="w-48 h-48 text-[#96EE89]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
          </div>
          <div>
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-bold text-[#96EE89] uppercase tracking-wider">Acción Inmediata</span>
              <span class="px-2.5 py-1 text-xs font-bold rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                Prioridad Crítica
              </span>
            </div>
            <h3 class="text-xl font-bold text-white mb-1">${radar.nextStep.title}</h3>
            <p class="text-xs text-slate-300 mb-5">${radar.nextStep.headline}</p>

            <div class="space-y-4">
              ${radar.nextStep.actions.map(act => `
                <div class="p-4 bg-slate-800/80 backdrop-blur rounded-xl border border-slate-700/60 hover:border-[#96EE89]/60 transition-all">
                  <div class="flex items-center justify-between mb-1.5">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-[#96EE89]">${act.owner}</span>
                    <span class="text-[10px] font-semibold text-amber-300 bg-amber-900/40 px-2 py-0.5 rounded border border-amber-700/50">
                      SLA: ${act.sla}
                    </span>
                  </div>
                  <h5 class="text-sm font-bold text-white mb-1">${act.title}</h5>
                  <p class="text-xs text-slate-300 mb-3 leading-relaxed">${act.desc}</p>
                  
                  ${act.emailTemplate ? `
                    <button onclick="openEmailModal('${act.id}')" 
                            class="w-full py-2 px-3 bg-[#96EE89] hover:bg-[#85de79] text-[#323B3F] text-xs font-bold rounded-lg flex items-center justify-center gap-2 shadow transition-all">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                      </svg>
                      ${act.actionBtnText}
                    </button>
                  ` : `
                    <button onclick="setActiveTab('merch')" 
                            class="w-full py-2 px-3 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all">
                      ${act.actionBtnText} &rarr;
                    </button>
                  `}
                </div>
              `).join('')}
            </div>
          </div>
          <div class="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400">
            <span>Regla de Oro:</span> Un solo responsable por acción para evitar dispersión.
          </div>
        </div>

      </div>

      <!-- RESUMEN DE PROGRESO DE LOS 5 FRENTES DEL PROYECTO -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h4 class="text-base font-bold text-[#323B3F] mb-4">Estado Consolidado por Frentes de Trabajo</h4>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Frente 1: Branding -->
          <div class="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span class="font-bold text-slate-800">1. Branding & Identidad</span>
                <span class="font-bold text-emerald-600">100%</span>
              </div>
              <div class="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-2">
                <div class="bg-emerald-500 h-2 rounded-full" style="width: 100%"></div>
              </div>
              <p class="text-[11px] text-slate-600">Logos multilingües, guía de estilo y mockups recibidos en Drive.</p>
            </div>
            <span class="mt-3 text-[10px] text-emerald-700 font-bold flex items-center gap-1">
              ✓ Entregado por onmove
            </span>
          </div>

          <!-- Frente 2: Sitio Web -->
          <div class="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span class="font-bold text-slate-800">2. Sitio Web (onmove)</span>
                <span class="font-bold text-amber-600">35%</span>
              </div>
              <div class="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-2">
                <div class="bg-amber-500 h-2 rounded-full" style="width: 35%"></div>
              </div>
              <p class="text-[11px] text-slate-600">Fase 1 al 85%. Falta validación clínica de 'Get Help' y cronograma.</p>
            </div>
            <button onclick="setActiveTab('agency')" class="mt-3 text-[10px] text-amber-700 font-bold hover:underline flex items-center gap-1">
              Ver Timeframes &rarr;
            </button>
          </div>

          <!-- Frente 3: Meta Ads -->
          <div class="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span class="font-bold text-slate-800">3. Campaña Meta Ads</span>
                <span class="font-bold text-blue-600">Activa ($2.5k)</span>
              </div>
              <div class="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-2">
                <div class="bg-blue-500 h-2 rounded-full" style="width: 42%"></div>
              </div>
              <p class="text-[11px] text-slate-600">7 conjuntos activos. Monitoreo del volumen de llamadas fuera de NSW.</p>
            </div>
            <button onclick="setActiveTab('media')" class="mt-3 text-[10px] text-blue-700 font-bold hover:underline flex items-center gap-1">
              Ver Rendimiento &rarr;
            </button>
          </div>

          <!-- Frente 4: Merch & Eventos -->
          <div class="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span class="font-bold text-slate-800">4. Merchandising</span>
                <span class="font-bold text-indigo-600">55%</span>
              </div>
              <div class="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-2">
                <div class="bg-indigo-500 h-2 rounded-full" style="width: 55%"></div>
              </div>
              <p class="text-[11px] text-slate-600">Snap impreso ($905.34). 4 proveedores en cotización de manteles y kits.</p>
            </div>
            <button onclick="setActiveTab('merch')" class="mt-3 text-[10px] text-indigo-700 font-bold hover:underline flex items-center gap-1">
              Ver Cotizaciones &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// =========================================================================
// MÓDULO 2: AGENCIA WEB (onmove) - ROADMAP, TIMEFRAMES Y SEGUIMIENTO
// =========================================================================
function renderAgencyView() {
  const agency = AppState.data.agencyRoadmap;

  return `
    <div class="space-y-6 animate-fadeIn">
      <!-- Header de la Agencia y Solución al Problema del Timeframe -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div class="flex items-center gap-3">
              <span class="px-3 py-1 bg-slate-900 text-[#96EE89] rounded-lg text-xs font-bold uppercase tracking-wider">
                Desarrollo Web & CMS
              </span>
              <span class="text-xs text-slate-500">Agencia Contratada: <strong>${agency.agencyName}</strong> (${agency.website})</span>
            </div>
            <h2 class="text-2xl font-bold text-[#323B3F] mt-2">Seguimiento de Entregables, Horas & Cronograma Oficial</h2>
            <p class="text-sm text-slate-600 mt-1">
              Propuesta aprobada: <strong>165 horas @ $130/h + GST ($21,450 AUD)</strong> en WordPress con Bricks Builder para 6 idiomas.
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <button onclick="openEmailModal('act-1')" class="px-4 py-2.5 bg-[#323B3F] hover:bg-slate-900 text-[#96EE89] text-xs font-bold rounded-xl shadow flex items-center gap-2 transition-all">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Exigir Timeframe a onmove
            </button>

            <a href="https://www.figma.com/design/LH0VieeERNHhgVh4La9TtB/Witness-to-war" target="_blank" 
               class="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-2 transition-all">
              <svg class="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/>
              </svg>
              Abrir Figma de onmove
            </a>
          </div>
        </div>

        <!-- Tarjetas de Información Clave sobre la Agencia -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 pt-6">
          <div class="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <span class="text-xs font-bold text-slate-500 uppercase">Horas Contratadas</span>
            <div class="text-2xl font-black text-[#323B3F] mt-1">${agency.totalHours} hrs</div>
            <span class="text-[11px] text-slate-500">Tarifa fija de $130/hr + GST</span>
          </div>

          <div class="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <span class="text-xs font-bold text-slate-500 uppercase">Presupuesto Web</span>
            <div class="text-2xl font-black text-[#323B3F] mt-1">$${agency.totalBudgetExGst.toLocaleString()} AUD</div>
            <span class="text-[11px] text-slate-500">Excluye licencias y hosting</span>
          </div>

          <div class="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <span class="text-xs font-bold text-slate-500 uppercase">Stack Tecnológico</span>
            <div class="text-base font-bold text-slate-800 mt-1">Bricks Builder</div>
            <span class="text-[11px] text-slate-500">WordPress CMS + WCAG 2.1 AA</span>
          </div>

          <div class="p-4 bg-amber-50 rounded-xl border border-amber-200">
            <span class="text-xs font-bold text-amber-800 uppercase flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              Alerta de Gestión
            </span>
            <div class="text-xs font-semibold text-amber-900 mt-1 leading-snug">
              Falta confirmación de fechas de desarrollo para presentar a Lachlan.
            </div>
          </div>
        </div>
      </div>

      <!-- FASES DEL PROYECTO WEB CON EDICIÓN DIRECTA DE FECHAS (ETAs) -->
      <div class="space-y-6">
        ${agency.phases.map((phase, pIdx) => `
          <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:border-slate-300 transition-all">
            <div class="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div class="flex items-center gap-2">
                  <span class="px-2.5 py-0.5 rounded text-[11px] font-bold ${
                    phase.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                    phase.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                    phase.status === 'attention' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
                  }">
                    ${phase.status === 'completed' ? 'Completada' :
                      phase.status === 'in_progress' ? 'En Curso' :
                      phase.status === 'attention' ? 'Requiere Atención' : 'Pendiente de Fechas'}
                  </span>
                  <span class="text-xs text-slate-400 font-medium">${phase.hours} Horas | $${phase.budget.toLocaleString()} AUD</span>
                </div>
                <h3 class="text-lg font-bold text-[#323B3F] mt-1">${phase.name}</h3>
              </div>

              <!-- Input editable para la fecha comprometida (ETA) -->
              <div class="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <span class="text-xs font-bold text-slate-600">Fecha Comprometida (ETA):</span>
                <input type="text" 
                       value="${phase.eta}" 
                       onchange="updatePhaseEta(${pIdx}, this.value)" 
                       class="text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded px-2 py-1 w-32 focus:outline-none focus:ring-2 focus:ring-[#96EE89]"
                       placeholder="YYYY-MM-DD o TBD" />
              </div>
            </div>

            <!-- Barra de Progreso de la Fase -->
            <div class="my-4">
              <div class="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>Progreso estimado de esta fase:</span>
                <span class="font-bold text-slate-800">${phase.progress}%</span>
              </div>
              <div class="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div class="h-2.5 rounded-full ${
                  phase.progress === 100 ? 'bg-emerald-500' :
                  phase.progress > 50 ? 'bg-[#96EE89]' :
                  phase.progress > 0 ? 'bg-amber-400' : 'bg-slate-300'
                }" style="width: ${phase.progress}%"></div>
              </div>
            </div>

            <!-- Lista de Entregables de la Fase -->
            <div class="mt-4">
              <h5 class="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Entregables Clave de esta fase:</h5>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                ${phase.deliverables.map((del, dIdx) => `
                  <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start justify-between gap-2">
                    <div class="flex items-start gap-2">
                      <input type="checkbox" 
                             ${del.status === 'completed' ? 'checked' : ''} 
                             onchange="toggleDeliverableStatus(${pIdx}, ${dIdx})"
                             class="mt-1 rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4 border-slate-300 cursor-pointer" />
                      <div>
                        <span class="text-xs font-semibold ${del.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-800'}">
                          ${del.name}
                        </span>
                        ${del.note ? `<p class="text-[11px] text-slate-500 mt-0.5">${del.note}</p>` : ''}
                      </div>
                    </div>
                    <span class="text-[10px] font-bold text-slate-400 whitespace-nowrap">${del.date || 'TBD'}</span>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Dependencia de STARTTS (Qué nos pide la agencia a nosotros) -->
            ${phase.clientDependencies ? `
              <div class="mt-4 p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-start gap-2 text-xs text-blue-900">
                <svg class="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <div>
                  <strong>Dependencia interna de STARTTS:</strong> ${phase.clientDependencies}
                </div>
              </div>
            ` : ''}

          </div>
        `).join('')}
      </div>
    </div>
  `;
}

/**
 * Actualiza la fecha comprometida (ETA) de una fase
 */
function updatePhaseEta(phaseIndex, newEta) {
  if (AppState.data.agencyRoadmap.phases[phaseIndex]) {
    AppState.data.agencyRoadmap.phases[phaseIndex].eta = newEta;
    saveAppState();
    showToast(`Fecha de entrega actualizada para ${AppState.data.agencyRoadmap.phases[phaseIndex].name}`, "success");
  }
}

/**
 * Marca o desmarca un entregable de la agencia
 */
function toggleDeliverableStatus(phaseIndex, deliverableIndex) {
  const phase = AppState.data.agencyRoadmap.phases[phaseIndex];
  if (phase && phase.deliverables[deliverableIndex]) {
    const current = phase.deliverables[deliverableIndex].status;
    phase.deliverables[deliverableIndex].status = current === "completed" ? "pending" : "completed";
    
    // Recalcular progreso
    const completedCount = phase.deliverables.filter(d => d.status === "completed").length;
    phase.progress = Math.round((completedCount / phase.deliverables.length) * 100);

    saveAppState();
    renderAgencyView();
    showToast("Estado del entregable actualizado", "success");
  }
}

// =========================================================================
// MÓDULO 3: FLUJO INTERNO & MOTOR ANTI-CUELLOS DE BOTELLA
// =========================================================================
function renderWorkflowView() {
  const ops = AppState.data.teamOperations;
  let tasks = [...ops.tasks];

  // Aplicar filtros
  if (AppState.filters.onlyBlocked) {
    tasks = tasks.filter(t => t.isBlocked);
  }
  if (AppState.filters.assignee !== "all") {
    tasks = tasks.filter(t => t.assignee === AppState.filters.assignee);
  }
  if (AppState.filters.priority !== "all") {
    tasks = tasks.filter(t => t.priority === AppState.filters.priority);
  }
  if (AppState.filters.search) {
    tasks = tasks.filter(t => 
      t.title.toLowerCase().includes(AppState.filters.search) ||
      (t.notes && t.notes.toLowerCase().includes(AppState.filters.search))
    );
  }

  const stages = [
    { id: "requested", label: "1. Solicitado", color: "slate" },
    { id: "in_prep", label: "2. En Redacción / Prep", color: "blue" },
    { id: "tech_review", label: "3. Revisión Técnica (Luis)", color: "indigo" },
    { id: "clinical_review", label: "4. Revisión Clínica (Joshua)", color: "amber" },
    { id: "area_approval", label: "5. Aprobación Área (Lachlan)", color: "purple" },
    { id: "completed", label: "6. Listo / En Producción", color: "emerald" }
  ];

  return `
    <div class="space-y-6 animate-fadeIn">
      <!-- Reglas Anti-Caos -->
      <div class="bg-gradient-to-r from-slate-900 to-[#323B3F] text-white p-5 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span class="text-[10px] font-bold text-[#96EE89] uppercase tracking-wider">Protocolo de Eficiencia</span>
          <h3 class="text-lg font-bold text-white mt-0.5">Motor Operativo Anti-Cuellos de Botella</h3>
          <p class="text-xs text-slate-300 mt-1 max-w-2xl">
            Solución al problema histórico: <strong>cada tarea tiene UN solo dueño</strong>, SLA estricto de revisión de 48h, y prohibición de pasos circulares.
          </p>
        </div>
        <button onclick="openNewTaskModal()" class="px-4 py-2 bg-[#96EE89] hover:bg-[#85de79] text-[#323B3F] text-xs font-bold rounded-xl shadow transition-all flex items-center gap-1.5 whitespace-nowrap">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          Nueva Tarea / Aprobación
        </button>
      </div>

      <!-- Barra de Filtros Rápidos -->
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div class="flex flex-wrap items-center gap-3">
          <!-- Filtro por Responsable -->
          <div class="flex items-center gap-1.5">
            <span class="font-bold text-slate-600">Responsable:</span>
            <select onchange="AppState.filters.assignee=this.value; renderWorkflowView();" 
                    class="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#96EE89]">
              <option value="all">Todos los miembros</option>
              ${ops.members.map(m => `
                <option value="${m.id}" ${AppState.filters.assignee === m.id ? 'selected' : ''}>${m.name} (${m.role.split(' ')[0]})</option>
              `).join('')}
            </select>
          </div>

          <!-- Filtro por Prioridad -->
          <div class="flex items-center gap-1.5">
            <span class="font-bold text-slate-600">Prioridad:</span>
            <select onchange="AppState.filters.priority=this.value; renderWorkflowView();" 
                    class="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#96EE89]">
              <option value="all">Todas</option>
              <option value="critical" ${AppState.filters.priority === 'critical' ? 'selected' : ''}>Crítica</option>
              <option value="high" ${AppState.filters.priority === 'high' ? 'selected' : ''}>Alta</option>
              <option value="medium" ${AppState.filters.priority === 'medium' ? 'selected' : ''}>Media</option>
            </select>
          </div>

          <!-- Toggle Solo Cuellos de Botella -->
          <label class="flex items-center gap-2 cursor-pointer font-bold text-slate-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
            <input type="checkbox" 
                   ${AppState.filters.onlyBlocked ? 'checked' : ''} 
                   onchange="AppState.filters.onlyBlocked=this.checked; renderWorkflowView();"
                   class="rounded text-amber-600 focus:ring-amber-500 h-4 w-4" />
            <span class="text-amber-900">Solo Cuellos de Botella (${ops.tasks.filter(t => t.isBlocked).length})</span>
          </label>
        </div>

        <div class="text-slate-400 font-medium">
          Mostrando ${tasks.length} de ${ops.tasks.length} tareas
        </div>
      </div>

      <!-- KANBAN BOARD / PIPELINE DE ETAPAS -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start">
        ${stages.map(st => {
          const stageTasks = tasks.filter(t => t.stage === st.id);
          return `
            <div class="bg-slate-100/80 rounded-2xl p-3 border border-slate-200 flex flex-col min-h-[500px]">
              <div class="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
                <span class="text-xs font-bold text-slate-800">${st.label}</span>
                <span class="text-[10px] font-bold bg-white text-slate-600 px-2 py-0.5 rounded-full shadow-sm">
                  ${stageTasks.length}
                </span>
              </div>

              <!-- Lista de Tarjetas de Tarea -->
              <div class="space-y-3 flex-1">
                ${stageTasks.map(task => renderTaskCard(task)).join('')}
                ${stageTasks.length === 0 ? `
                  <div class="h-24 border-2 border-dashed border-slate-200 rounded-xl flex items-center justify-center text-[11px] text-slate-400 font-medium">
                    Sin tareas pendientes
                  </div>
                ` : ''}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

/**
 * Renderiza una tarjeta individual de tarea en el Kanban
 */
function renderTaskCard(task) {
  const member = AppState.data.teamOperations.members.find(m => m.id === task.assignee) || { name: task.assignee, avatar: "?" };

  return `
    <div class="bg-white rounded-xl p-3.5 border ${
      task.isBlocked ? 'border-amber-400 ring-2 ring-amber-100' : 'border-slate-200 hover:border-slate-300'
    } shadow-sm transition-all hover:shadow">
      
      <!-- Badges de Estado y Prioridad -->
      <div class="flex items-center justify-between gap-1 mb-2">
        <span class="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
          task.priority === 'critical' ? 'bg-red-100 text-red-800' :
          task.priority === 'high' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700'
        }">${task.priority}</span>

        ${task.isBlocked ? `
          <span class="text-[9px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
            Trabado (${task.daysInStage}d)
          </span>
        ` : `
          <span class="text-[10px] text-slate-400 font-medium">${task.dueDate}</span>
        `}
      </div>

      <!-- Título de la tarea -->
      <h4 class="text-xs font-bold text-slate-900 leading-snug mb-1.5">${task.title}</h4>

      <!-- Motivo de bloqueo si existe -->
      ${task.isBlocked ? `
        <div class="p-2 bg-amber-50 rounded-lg border border-amber-200 text-[10px] text-amber-900 font-medium mb-2 leading-relaxed">
          <strong>Cuello de botella:</strong> ${task.blockerReason}
        </div>
      ` : ''}

      <!-- Responsable Único (RACI) -->
      <div class="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
        <div class="flex items-center gap-1.5">
          <span class="w-5 h-5 rounded-full bg-[#323B3F] text-[#96EE89] flex items-center justify-center text-[9px] font-bold">
            ${member.avatar}
          </span>
          <span class="font-semibold text-slate-700 truncate max-w-[90px]">${member.name.split(' ')[0]}</span>
        </div>

        <!-- Botones de Acción de Etapa -->
        <div class="flex items-center gap-1">
          <button onclick="advanceTaskStage('${task.id}')" title="Avanzar etapa" 
                  class="p-1 hover:bg-slate-100 rounded text-slate-600 hover:text-slate-900">
            <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Avanza una tarea a la siguiente etapa del flujo
 */
function advanceTaskStage(taskId) {
  const task = AppState.data.teamOperations.tasks.find(t => t.id === taskId);
  if (!task) return;

  const stageOrder = ["requested", "in_prep", "tech_review", "clinical_review", "area_approval", "completed"];
  const currentIndex = stageOrder.indexOf(task.stage);

  if (currentIndex < stageOrder.length - 1) {
    task.stage = stageOrder[currentIndex + 1];
    task.daysInStage = 0;
    if (task.stage === "completed") {
      task.isBlocked = false;
      task.blockerReason = null;
    }
    saveAppState();
    renderWorkflowView();
    showToast(`Tarea avanzada a: ${task.stage}`, "success");
  }
}

// =========================================================================
// MÓDULO 4: REDES SOCIALES & GOOGLE (Meta Ads Fase 1 + Google Reserva)
// =========================================================================
function renderMediaView() {
  const media = AppState.data.paidMedia;
  const meta = media.phase1Meta;
  const google = media.phase2Google;

  return `
    <div class="space-y-6 animate-fadeIn">
      <!-- Encabezado de Estrategia de Medios -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div class="flex items-center gap-2">
              <span class="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider">
                Estrategia de Crecimiento & Telefonía
              </span>
              <span class="text-xs text-slate-500">Campaña Activa: <strong>${meta.startDate} a ${meta.endDate}</strong></span>
            </div>
            <h2 class="text-2xl font-bold text-[#323B3F] mt-2">Campaña Meta Ads Fase 1 & Reserva Google Ads</h2>
            <p class="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Objetivo: <strong>100% Llamadas directas al conmutador</strong>. Segmentación por idiomas y regionalización estratégica 
              para romper el monopolio histórico de llamadas de NSW y alcanzar comunidades vulnerables en Victoria y South Australia.
            </p>
          </div>

          <div class="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <div>
              <span class="text-slate-400 block font-semibold">Inversión Fase 1:</span>
              <span class="text-lg font-black text-slate-900">$${meta.spentToDate.toFixed(2)} / $${meta.totalBudget} AUD</span>
            </div>
          </div>
        </div>

        <!-- Métricas de Impacto Telefónico Real (Reporte 2025 vs Actual) -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 pt-6">
          <div class="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <span class="text-xs font-bold text-slate-500 uppercase">Llamadas Línea Base</span>
            <div class="text-2xl font-black text-slate-800 mt-1">${meta.benchmarks.baselineCallsPerWeek} / sem</div>
            <span class="text-[11px] text-slate-500">Promedio sin publicidad activa</span>
          </div>

          <div class="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <span class="text-xs font-bold text-emerald-800 uppercase">Impacto Campaña</span>
            <div class="text-2xl font-black text-emerald-700 mt-1">${meta.benchmarks.campaignLiftCallsPerWeek} / sem</div>
            <span class="text-[11px] text-emerald-600 font-bold">+${meta.benchmarks.percentageLift}% de aumento real</span>
          </div>

          <div class="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <span class="text-xs font-bold text-slate-500 uppercase">Costo Real x Llamada</span>
            <div class="text-2xl font-black text-[#323B3F] mt-1">~$${meta.benchmarks.estimatedCostPerCall.toFixed(2)} AUD</div>
            <span class="text-[11px] text-slate-500">Medido contra registro de llamadas</span>
          </div>

          <div class="p-4 bg-purple-50 rounded-xl border border-purple-100">
            <span class="text-xs font-bold text-purple-800 uppercase">Reserva Google Ads</span>
            <div class="text-2xl font-black text-purple-700 mt-1">$${google.plannedBudget.toLocaleString()} AUD</div>
            <span class="text-[11px] text-purple-600">Decisión Enero 2027</span>
          </div>
        </div>
      </div>

      <!-- DESGLOSE DE LOS 7 CONJUNTOS DE ANUNCIOS ACTIVOS (META) -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-lg font-bold text-[#323B3F]">Rendimiento por Idioma & Región (7 Conjuntos de Anuncios)</h3>
            <p class="text-xs text-slate-500">Presupuestos protegidos mediante ABO para garantizar presencia equitativa.</p>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase font-bold">
                <th class="py-3 px-4">Idioma & Enfoque</th>
                <th class="py-3 px-4">Área Geográfica</th>
                <th class="py-3 px-4 text-right">Presupuesto</th>
                <th class="py-3 px-4 text-right">Gastado</th>
                <th class="py-3 px-4 text-right">Clics</th>
                <th class="py-3 px-4 text-right">Llamadas Estimadas</th>
                <th class="py-3 px-4 text-center">Estado</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-medium">
              ${meta.adSets.map(ad => `
                <tr class="hover:bg-slate-50 transition-colors">
                  <td class="py-3 px-4">
                    <div class="font-bold text-slate-900">${ad.name}</div>
                    <div class="text-[11px] text-slate-500">${ad.notes}</div>
                  </td>
                  <td class="py-3 px-4 text-slate-700 font-semibold">${ad.geo}</td>
                  <td class="py-3 px-4 text-right font-bold text-slate-800">$${ad.budget}</td>
                  <td class="py-3 px-4 text-right text-slate-600">$${ad.spent.toFixed(2)}</td>
                  <td class="py-3 px-4 text-right font-semibold text-blue-600">${ad.clicks}</td>
                  <td class="py-3 px-4 text-right font-bold text-emerald-600">${ad.callsReported}</td>
                  <td class="py-3 px-4 text-center">
                    <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      Activo
                    </span>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- CRITERIO DE ACTIVACIÓN PARA GOOGLE ADS EN ENERO -->
      <div class="bg-gradient-to-r from-purple-900 to-indigo-900 text-white rounded-2xl shadow-sm p-6">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span class="text-[10px] font-bold text-[#96EE89] uppercase tracking-wider">Fase 2 Planificada</span>
            <h3 class="text-xl font-bold text-white mt-1">Estrategia de Reserva Google Ads ($2,500 AUD)</h3>
            <p class="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Criterio de decisión acordado con Luis y Lachlan: Al cierre de la Fase 1 en Diciembre, evaluaremos el registro de llamadas. 
              Si Meta mantiene un costo por llamada incremental menor a $100 AUD en árabe y farsi, escalamos Meta. Si no, activamos Google Search Call-Only.
            </p>
          </div>
          <div class="bg-purple-800/60 p-4 rounded-xl border border-purple-700/60 text-xs">
            <span class="text-purple-300 font-semibold block">Palabras Clave Preparadas:</span>
            <div class="flex flex-wrap gap-1.5 mt-2">
              ${google.targetKeywords.map(kw => `
                <span class="px-2 py-0.5 bg-purple-700 text-purple-100 rounded text-[10px] font-medium">${kw}</span>
              `).join('')}
            </div>
          </div>
        </div>
      </div>

    </div>
  `;
}

// =========================================================================
// MÓDULO 5: MERCHANDISING, IMPRESIÓN Y PRESUPUESTOS
// =========================================================================
function renderMerchView() {
  const merch = AppState.data.merchandising;

  return `
    <div class="space-y-6 animate-fadeIn">
      <!-- Resumen Financiero y Proveedores -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div class="flex items-center gap-2">
              <span class="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider">
                Eventos & Materiales
              </span>
              <span class="text-xs text-slate-500">Gestión de Proveedores, Cotizaciones e Inventario</span>
            </div>
            <h2 class="text-2xl font-bold text-[#323B3F] mt-2">Control de Merchandising, Impresión & Presupuestos</h2>
            <p class="text-sm text-slate-600 mt-1">
              Colores oficiales: <strong>Renewal Green (#96EE89 / Pantone 2267 C)</strong> y <strong>Grounded Slate (#323B3F)</strong>.
            </p>
          </div>

          <div class="flex items-center gap-2">
            <button onclick="openNewMerchModal()" class="px-4 py-2.5 bg-[#323B3F] hover:bg-slate-900 text-[#96EE89] text-xs font-bold rounded-xl shadow flex items-center gap-2 transition-all">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              Agregar Item de Merch
            </button>
          </div>
        </div>

        <!-- Indicadores Financieros de Merchandising -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 pt-6">
          <div class="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <span class="text-xs font-bold text-slate-500 uppercase">Presupuesto Merch</span>
            <div class="text-2xl font-black text-[#323B3F] mt-1">$${merch.totalBudget.toLocaleString()} AUD</div>
            <span class="text-[11px] text-slate-500">Asignación para eventos y lanzamientos</span>
          </div>

          <div class="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <span class="text-xs font-bold text-emerald-800 uppercase">Pagado / Facturado</span>
            <div class="text-2xl font-black text-emerald-700 mt-1">$${merch.spentToDate.toLocaleString()} AUD</div>
            <span class="text-[11px] text-emerald-600 font-semibold">Factura Snap #29460 pagada</span>
          </div>

          <div class="p-4 bg-amber-50 rounded-xl border border-amber-100">
            <span class="text-xs font-bold text-amber-800 uppercase">Cotizaciones en Curso</span>
            <div class="text-2xl font-black text-amber-700 mt-1">~$${merch.committedQuotes.toLocaleString()} AUD</div>
            <span class="text-[11px] text-amber-600">4 proveedores consultados</span>
          </div>

          <div class="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <span class="text-xs font-bold text-slate-500 uppercase">Saldo Disponible</span>
            <div class="text-2xl font-black text-slate-800 mt-1">$${(merch.totalBudget - merch.spentToDate).toLocaleString()} AUD</div>
            <span class="text-[11px] text-slate-500">Margen restante para aprobar</span>
          </div>
        </div>
      </div>

      <!-- TABLA DE ARTÍCULOS PEDIDOS, CANTIDADES Y ESTADO -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 class="text-lg font-bold text-[#323B3F] mb-4">Inventario de Materiales & Artículos Solicitados</h3>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase font-bold">
                <th class="py-3 px-4">Artículo & Especificaciones</th>
                <th class="py-3 px-4">Categoría</th>
                <th class="py-3 px-4 text-center">Cantidad</th>
                <th class="py-3 px-4">Proveedor</th>
                <th class="py-3 px-4 text-right">Costo Est.</th>
                <th class="py-3 px-4 text-center">Estado</th>
                <th class="py-3 px-4 text-center">Acción</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-medium">
              ${merch.items.map((item, idx) => {
                const supp = merch.suppliers.find(s => s.id === item.supplier) || { name: item.supplier };
                return `
                  <tr class="hover:bg-slate-50 transition-colors">
                    <td class="py-3 px-4">
                      <div class="font-bold text-slate-900">${item.item}</div>
                      <div class="text-[11px] text-slate-500">${item.specs}</div>
                      <div class="text-[10px] text-indigo-600 font-semibold mt-0.5">Color: ${item.brandColor}</div>
                    </td>
                    <td class="py-3 px-4 text-slate-600 font-semibold">${item.category}</td>
                    <td class="py-3 px-4 text-center font-bold text-slate-800">${item.quantity.toLocaleString()}</td>
                    <td class="py-3 px-4 text-slate-700 font-semibold">${supp.name}</td>
                    <td class="py-3 px-4 text-right font-bold text-slate-900">$${item.totalCost.toFixed(2)}</td>
                    <td class="py-3 px-4 text-center">
                      <span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        item.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                        item.status === 'in_production' ? 'bg-blue-100 text-blue-800' :
                        item.status === 'approved' ? 'bg-purple-100 text-purple-800' : 'bg-amber-100 text-amber-800'
                      }">
                        ${item.status === 'delivered' ? '✓ Entregado' :
                          item.status === 'in_production' ? 'En Producción' :
                          item.status === 'approved' ? 'Aprobado' : 'Cotización Pedida'}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-center">
                      <button onclick="toggleMerchItemStatus(${idx})" class="text-[11px] font-bold text-indigo-600 hover:text-indigo-900 hover:underline">
                        Cambiar Estado
                      </button>
                    </td>
                  </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- DIRECTORIO DE LOS 5 PROVEEDORES COMPARADOS -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 class="text-lg font-bold text-[#323B3F] mb-4">Directorio de Proveedores & Contactos</h3>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          ${merch.suppliers.map(s => `
            <div class="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between mb-2">
                  <h4 class="font-bold text-slate-900 text-sm">${s.name}</h4>
                  <span class="text-[9px] font-bold px-2 py-0.5 rounded ${
                    s.status === 'invoiced_and_paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }">${s.status === 'invoiced_and_paid' ? 'Facturado' : 'En Cotización'}</span>
                </div>
                <p class="text-xs text-slate-600 mb-1">Contacto: <strong>${s.contact}</strong></p>
                <p class="text-xs text-slate-500 mb-1">Email: <a href="mailto:${s.email}" class="text-blue-600 hover:underline">${s.email}</a></p>
                <p class="text-xs text-slate-500">Teléfono: ${s.phone}</p>
                <p class="text-[11px] text-slate-600 mt-2 bg-white p-2 rounded border border-slate-200 leading-snug">${s.notes}</p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

    </div>
  `;
}

/**
 * Alterna el estado de un artículo de merchandising
 */
function toggleMerchItemStatus(itemIndex) {
  const item = AppState.data.merchandising.items[itemIndex];
  if (!item) return;

  const order = ["quote_requested", "approved", "in_production", "delivered"];
  const curr = order.indexOf(item.status);
  item.status = order[(curr + 1) % order.length];

  saveAppState();
  renderMerchView();
  showToast(`Estado cambiado a: ${item.status}`, "success");
}

// =========================================================================
// MÓDULO 6: MATRIZ DE RESPONSABILIDADES (RACI) & DIRECTORIO
// =========================================================================
function renderRaciView() {
  const members = AppState.data.teamOperations.members;

  return `
    <div class="space-y-6 animate-fadeIn">
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 class="text-2xl font-bold text-[#323B3F] mb-1">Matriz RACI & Equipo de Witness to War</h2>
        <p class="text-sm text-slate-600 mb-6">
          Definición clara de roles para evitar que las tareas reboten entre "miles de personas".
        </p>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${members.map(m => `
            <div class="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between">
              <div>
                <div class="flex items-center gap-3 mb-3">
                  <span class="w-10 h-10 rounded-full bg-[#323B3F] text-[#96EE89] flex items-center justify-center font-bold text-sm shadow">
                    ${m.avatar}
                  </span>
                  <div>
                    <h4 class="font-bold text-slate-900 text-base">${m.name}</h4>
                    <span class="text-xs text-slate-500 block">${m.role}</span>
                  </div>
                </div>

                <div class="text-xs text-slate-600 space-y-1.5 mt-3 pt-3 border-t border-slate-200">
                  <p><strong>Email:</strong> <a href="mailto:${m.email}" class="text-blue-600 hover:underline">${m.email}</a></p>
                  ${m.phone ? `<p><strong>Teléfono:</strong> ${m.phone}</p>` : ''}
                </div>
              </div>

              <div class="mt-4 pt-3 border-t border-slate-200">
                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">Responsabilidad Primaria:</span>
                <p class="text-[11px] text-slate-700 font-medium">
                  ${m.id === 'lachlan' ? 'Aprobación final de presupuestos, cronogramas y escalamiento institucional al directorio.' :
                    m.id === 'luis' ? 'Gestión técnica y de marketing, pauta publicitaria en Meta/Google, relación con agencia onmove y compras.' :
                    m.id === 'joshua' ? 'Aprobación clínica estricta de contenidos de salud mental, técnicas de respiración y sentimientos.' :
                    m.id === 'yassmen' ? 'Operación del servicio telefónico de Witness to War, registro de llamadas e insumos comunitarios.' :
                    m.id === 'jasmina' ? 'Coordinación comunitaria en STARTTS y alineación estratégica de fondos y alianzas.' :
                    m.id === 'maria' ? 'Soporte operativo, becas ucranianas, cotizaciones de merchandising y redes sociales.' :
                    'Entrega técnica de diseño en Figma y desarrollo WordPress en Bricks Builder con compromiso de fechas.'}
                </p>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </div>
  `;
}

// =========================================================================
// MÓDULO 7: CRONOGRAMA INTEGRAL & ROADMAP GANTT (Ago 2026 - Ene 2027)
// =========================================================================
function renderTimelineView() {
  const roadmap = AppState.data.agencyRoadmap;
  const meta = AppState.data.paidMedia.phase1Meta;
  const merch = AppState.data.merchandising;

  return `
    <div class="space-y-6 animate-fadeIn">
      <!-- Encabezado del Roadmap -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div class="flex items-center gap-2">
              <span class="px-3 py-1 bg-slate-900 text-[#96EE89] rounded-lg text-xs font-bold uppercase tracking-wider">
                Plan Maestro
              </span>
              <span class="text-xs text-slate-500">Horizonte de 6 Meses: <strong>Agosto 2026 — Enero 2027</strong></span>
            </div>
            <h2 class="text-2xl font-bold text-[#323B3F] mt-2">Cronograma de Ejecución & Roadmap de Hitos</h2>
            <p class="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              Mapa visual que sincroniza las 4 fases de la agencia web onmove, la campaña activa de Meta Ads, 
              la compra de merchandising y el hito de decisión de Google Ads para presentar a Lachlan y al directorio de STARTTS.
            </p>
          </div>

          <div class="flex items-center gap-2">
            <button onclick="openShareModal()" class="px-4 py-2.5 bg-[#323B3F] hover:bg-slate-900 text-[#96EE89] text-xs font-bold rounded-xl shadow flex items-center gap-2 transition-all">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
              </svg>
              Compartir Cronograma
            </button>
          </div>
        </div>

        <!-- Indicadores de Estado por Línea de Tiempo -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 text-xs">
          <div class="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <span class="font-bold text-emerald-800 uppercase text-[10px] block">Hito 1: Identidad</span>
            <div class="text-base font-bold text-emerald-950 mt-1">100% Completado</div>
            <span class="text-slate-500 text-[11px]">Agosto 2026 · Logos multilingües & manual</span>
          </div>

          <div class="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <span class="font-bold text-blue-800 uppercase text-[10px] block">Hito 2: Pauta Meta Fase 1</span>
            <div class="text-base font-bold text-blue-950 mt-1">En Ejecución (42%)</div>
            <span class="text-slate-500 text-[11px]">7 Sep — 13 Dic 2026 · +75.5% llamadas</span>
          </div>

          <div class="p-4 bg-amber-50 rounded-xl border border-amber-200">
            <span class="font-bold text-amber-800 uppercase text-[10px] block flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              Hito 3: Sitio Web CMS
            </span>
            <div class="text-base font-bold text-amber-950 mt-1">35% (Cuello de Botella)</div>
            <span class="text-slate-600 text-[11px]">Falta confirmación de fechas onmove</span>
          </div>

          <div class="p-4 bg-purple-50 rounded-xl border border-purple-100">
            <span class="font-bold text-purple-800 uppercase text-[10px] block">Hito 4: Decisión Google Ads</span>
            <div class="text-base font-bold text-purple-950 mt-1">Enero 2027 ($2,500)</div>
            <span class="text-slate-500 text-[11px]">Criterio: Costo incremental de Meta</span>
          </div>
        </div>
      </div>

      <!-- DIAGRAMA VISUAL GANTT / TIMELINE MENSUAL -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-x-auto">
        <h3 class="text-lg font-bold text-[#323B3F] mb-6">Mapa Mensual de Sprints & Entregables</h3>

        <div class="min-w-[760px] space-y-5">
          <!-- Encabezado de Meses -->
          <div class="grid grid-cols-6 gap-2 text-center text-xs font-bold pb-3 border-b-2 border-slate-200">
            <div class="text-slate-400">Agosto 2026</div>
            <div class="text-slate-400">Septiembre 2026</div>
            <div class="text-emerald-700 bg-emerald-50 py-1 rounded-lg border border-emerald-200">
              Octubre 2026 (HOY)
            </div>
            <div class="text-slate-700">Noviembre 2026</div>
            <div class="text-slate-700">Diciembre 2026</div>
            <div class="text-purple-700 bg-purple-50 py-1 rounded-lg border border-purple-200">
              Enero 2027 (Lanzamiento)
            </div>
          </div>

          <!-- Barra 1: Identidad & Branding onmove -->
          <div class="space-y-1">
            <div class="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>1. Identidad, Branding & Paleta Pantone 2267 C ($27,300 AUD)</span>
              <span class="text-emerald-600">✓ 100% Completado</span>
            </div>
            <div class="grid grid-cols-6 gap-2 h-7 bg-slate-100 rounded-xl p-1 items-center">
              <div class="col-span-1 bg-emerald-500 h-full rounded-lg text-[10px] font-bold text-white flex items-center justify-center shadow-sm">
                Entrega onmove
              </div>
              <div class="col-span-5 text-[10px] text-slate-400 pl-2">
                Manuales de marca, logos multilingües y packaging recibidos en Drive.
              </div>
            </div>
          </div>

          <!-- Barra 2: Campaña Meta Ads Fase 1 -->
          <div class="space-y-1">
            <div class="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>2. Campaña Meta Ads Fase 1 — Enfoque Regional ($2,500 AUD)</span>
              <span class="text-blue-600 font-bold">Activa (Día 38 de 100)</span>
            </div>
            <div class="grid grid-cols-6 gap-2 h-7 bg-slate-100 rounded-xl p-1 items-center">
              <div class="col-span-1"></div>
              <div class="col-span-4 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 h-full rounded-lg text-[10px] font-bold text-white flex items-center justify-between px-3 shadow-sm">
                <span>Inicio: 7 Sep</span>
                <span>7 Conjuntos (Árabe, Farsi, Ucraniano, Hebreo, Inglés)</span>
                <span>Fin: 13 Dic</span>
              </div>
              <div class="col-span-1 text-[10px] text-slate-400 pl-2">Receso Verano</div>
            </div>
          </div>

          <!-- Barra 3: Fase 1 Web - Estrategia & Arquitectura (onmove) -->
          <div class="space-y-1">
            <div class="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>3. Web Fase 1: Arquitectura, Sitemap & Get Help Toolkit</span>
              <span class="text-amber-600 font-bold">85% (Trabado en firma clínica)</span>
            </div>
            <div class="grid grid-cols-6 gap-2 h-7 bg-slate-100 rounded-xl p-1 items-center">
              <div class="col-span-1"></div>
              <div class="col-span-1 bg-amber-400 h-full rounded-l-lg"></div>
              <div class="col-span-1 bg-amber-500 h-full rounded-r-lg text-[10px] font-bold text-white flex items-center justify-center shadow-sm">
                Cierre Oct 20
              </div>
              <div class="col-span-3 text-[10px] text-slate-400 pl-2">
                Wireframes listos en Figma. Pendiente aprobación de 8 emociones por Joshua.
              </div>
            </div>
          </div>

          <!-- Barra 4: Fase 2 Web - Diseño Visual UX/UI (onmove) -->
          <div class="space-y-1">
            <div class="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>4. Web Fase 2: Diseño Visual & Maquetas Figma</span>
              <span class="text-slate-600">40% (En curso)</span>
            </div>
            <div class="grid grid-cols-6 gap-2 h-7 bg-slate-100 rounded-xl p-1 items-center">
              <div class="col-span-2"></div>
              <div class="col-span-2 bg-gradient-to-r from-slate-400 to-slate-700 h-full rounded-lg text-[10px] font-bold text-white flex items-center justify-center shadow-sm">
                Figma UX/UI (ETA comprometido: 5 Nov)
              </div>
              <div class="col-span-2 text-[10px] text-slate-400 pl-2">
                Homepage y Hub de recursos
              </div>
            </div>
          </div>

          <!-- Barra 5: Fase 3 Web - Desarrollo CMS WordPress + Bricks Builder -->
          <div class="space-y-1">
            <div class="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>5. Web Fase 3: Construcción WordPress + Bricks Builder (6 Idiomas)</span>
              <span class="text-red-500 font-bold">⚠️ Fecha por fijar por onmove</span>
            </div>
            <div class="grid grid-cols-6 gap-2 h-7 bg-slate-100 rounded-xl p-1 items-center">
              <div class="col-span-3"></div>
              <div class="col-span-2 border-2 border-dashed border-amber-400 bg-amber-50 h-full rounded-lg text-[10px] font-bold text-amber-900 flex items-center justify-center">
                Sprints de Desarrollo CMS (Timeframe pendiente)
              </div>
              <div class="col-span-1 text-[10px] text-slate-400 pl-2"></div>
            </div>
          </div>

          <!-- Barra 6: Fase 4 Web - Testing, Accesibilidad & Go-Live -->
          <div class="space-y-1">
            <div class="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>6. Web Fase 4: Testing WCAG 2.1 AA, Staging & Lanzamiento</span>
              <span class="text-purple-600 font-bold">Enero 2027</span>
            </div>
            <div class="grid grid-cols-6 gap-2 h-7 bg-slate-100 rounded-xl p-1 items-center">
              <div class="col-span-5"></div>
              <div class="col-span-1 bg-purple-600 h-full rounded-lg text-[10px] font-bold text-white flex items-center justify-center shadow-sm">
                🚀 Go-Live
              </div>
            </div>
          </div>

          <!-- Barra 7: Merchandising & Banners para Eventos -->
          <div class="space-y-1">
            <div class="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>7. Merchandising, Banners & Uniformes ($4,750 AUD)</span>
              <span class="text-indigo-600 font-bold">Lote 1 Pagado · Lote 2 en Cotización</span>
            </div>
            <div class="grid grid-cols-6 gap-2 h-7 bg-slate-100 rounded-xl p-1 items-center">
              <div class="col-span-1 bg-indigo-500 h-full rounded-l-lg text-[10px] font-bold text-white flex items-center justify-center">
                Snap $905
              </div>
              <div class="col-span-1"></div>
              <div class="col-span-2 bg-indigo-200 border border-indigo-300 h-full rounded-r-lg text-[10px] font-bold text-indigo-900 flex items-center justify-center">
                4 Proveedores cotizando manteles y kits
              </div>
              <div class="col-span-2 text-[10px] text-slate-400 pl-2">
                Entrega masiva para eventos 2027
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- TARJETAS DE DEPENDENCIAS CRÍTICAS -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <span class="text-[10px] font-bold text-amber-800 uppercase tracking-wider block mb-1">Paso Crítico Inmediato #1</span>
          <h4 class="font-bold text-slate-900 text-sm mb-1">Aprobación de Contenidos Clínicos</h4>
          <p class="text-xs text-slate-600 mb-4 leading-relaxed">
            Joshua debe validar las 8 emociones del autoayuda. Sin esto, onmove no puede cerrar la arquitectura del sitio web.
          </p>
          <button onclick="openEmailModal('act-2')" class="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow transition-all">
            Enviar Recordatorio a Joshua &rarr;
          </button>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <span class="text-[10px] font-bold text-blue-800 uppercase tracking-wider block mb-1">Paso Crítico Inmediato #2</span>
          <h4 class="font-bold text-slate-900 text-sm mb-1">Compromiso Formal de Fechas onmove</h4>
          <p class="text-xs text-slate-600 mb-4 leading-relaxed">
            Exigir a onmove las fechas de entrega de los sprints de desarrollo en WordPress Bricks Builder antes de emitir más pagos.
          </p>
          <button onclick="openEmailModal('act-1')" class="w-full py-2 bg-[#323B3F] hover:bg-slate-900 text-[#96EE89] font-bold text-xs rounded-xl shadow transition-all">
            Exigir Timeframe a onmove &rarr;
          </button>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <span class="text-[10px] font-bold text-indigo-800 uppercase tracking-wider block mb-1">Paso Crítico Inmediato #3</span>
          <h4 class="font-bold text-slate-900 text-sm mb-1">Consolidación de Cotizaciones Merch</h4>
          <p class="text-xs text-slate-600 mb-4 leading-relaxed">
            Maria debe cerrar la tabla comparativa de precios con SOS Promotions, Everything Branded, Fast Promos y Vivid Ads.
          </p>
          <button onclick="setActiveTab('merch')" class="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition-all">
            Ver Comparativa de Proveedores &rarr;
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Modal para compartir enlaces directos por Rol y gestionar el Túnel Seguro Cloudflare
 */
async function openShareModal() {
  const modalContainer = document.getElementById("modalContainer");
  if (!modalContainer) return;

  AppState.modalOpen = "shareModal";

  // Consultar estado actual del túnel
  let tunnelInfo = { active: false, publicUrl: null };
  try {
    const res = await fetch('/api/tunnel');
    if (res.ok) {
      tunnelInfo = await res.json();
    }
  } catch (e) {}

  const baseUrl = tunnelInfo.publicUrl || window.location.origin;

  modalContainer.innerHTML = `
    <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl animate-scaleUp max-h-[90vh] overflow-y-auto">
        <div class="flex items-center justify-between pb-4 border-b border-slate-100">
          <div>
            <span class="text-[10px] font-bold uppercase tracking-wider text-[#323B3F] bg-[#96EE89] px-2 py-0.5 rounded">
              Colaboración & Acceso
            </span>
            <h3 class="text-xl font-bold text-[#323B3F] mt-1">Enlaces de Acceso Personalizados por Rol</h3>
          </div>
          <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <p class="text-xs text-slate-600 mt-2 mb-4">
          Cada enlace abre el Centro de Control configurado para el rol específico, permitiendo a la agencia fijar sus fechas, 
          a Lachlan evaluar el estado ejecutivo y al equipo operar sin desorganización.
        </p>

        <!-- SECCIÓN DE ENLACE PÚBLICO SEGURO (CLOUDFLARE TUNNEL) -->
        <div class="mb-5 p-4 rounded-xl border ${
          tunnelInfo.active ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200'
        }">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full ${tunnelInfo.active ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'}"></span>
                <h4 class="font-bold text-xs text-slate-900">
                  ${tunnelInfo.active ? 'Túnel Público Seguro Activo (HTTPS)' : 'Acceso Público en la Nube (Cloudflare)'}
                </h4>
              </div>
              <p class="text-[11px] text-slate-600 mt-1">
                ${tunnelInfo.active ? 
                  `URL Pública: <strong class="text-emerald-800 select-all">${tunnelInfo.publicUrl}</strong>` : 
                  'Genera una URL segura accesible desde cualquier dispositivo (celulares, red NSW Health, computadoras de la agencia).'}
              </p>
            </div>

            <div>
              ${tunnelInfo.active ? `
                <div class="flex items-center gap-2">
                  <button onclick="copyToClipboard('${tunnelInfo.publicUrl}')" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow">
                    Copiar URL Pública
                  </button>
                  <button onclick="toggleTunnel('stop')" class="px-2.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 font-bold text-xs rounded-lg">
                    Detener
                  </button>
                </div>
              ` : `
                <button onclick="toggleTunnel('start')" id="btnStartTunnel" class="px-4 py-2 bg-slate-900 hover:bg-black text-[#96EE89] font-bold text-xs rounded-lg shadow flex items-center gap-1.5">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                  Activar Enlace Público (1 Clic)
                </button>
              `}
            </div>
          </div>
        </div>

        <!-- LISTADO DE ENLACES POR ROL -->
        <div class="space-y-3 text-xs">
          <!-- 1. Rol Agencia (onmove) -->
          <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="font-bold text-slate-900">🏢 Enlace para la Agencia (onmove)</span>
                <span class="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">Fijar Fechas</span>
              </div>
              <p class="text-[11px] text-slate-500 mt-0.5">
                Abre directamente la vista de sprints para que ingresen y comprometan sus fechas de entrega (ETAs).
              </p>
            </div>
            <button onclick="copyToClipboard('${baseUrl}/?role=agency&tab=agency')" class="whitespace-nowrap px-3 py-1.5 bg-[#323B3F] hover:bg-slate-900 text-[#96EE89] font-bold rounded-lg shadow flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/>
              </svg>
              Copiar Enlace
            </button>
          </div>

          <!-- 2. Rol Ejecutivo (Lachlan) -->
          <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="font-bold text-slate-900">👑 Enlace para Lachlan (Líder de Área)</span>
                <span class="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">Reporte & Board</span>
              </div>
              <p class="text-[11px] text-slate-500 mt-0.5">
                Muestra el radar estratégico (Dónde estamos, Dónde vamos, Próximo paso) y exportación de informe PDF.
              </p>
            </div>
            <button onclick="copyToClipboard('${baseUrl}/?role=executive&tab=radar')" class="whitespace-nowrap px-3 py-1.5 bg-[#323B3F] hover:bg-slate-900 text-[#96EE89] font-bold rounded-lg shadow flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/>
              </svg>
              Copiar Enlace
            </button>
          </div>

          <!-- 3. Rol Operativo (Equipo W2W) -->
          <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="font-bold text-slate-900">👥 Enlace Operativo & Anti-Cuellos de Botella</span>
                <span class="text-[10px] font-bold bg-red-100 text-red-800 px-2 py-0.5 rounded-full">SLA 48h</span>
              </div>
              <p class="text-[11px] text-slate-500 mt-0.5">
                Tablero Kanban con asignación de dueño único y semáforo de revisiones atrasadas.
              </p>
            </div>
            <button onclick="copyToClipboard('${baseUrl}/?role=operations&tab=workflow')" class="whitespace-nowrap px-3 py-1.5 bg-[#323B3F] hover:bg-slate-900 text-[#96EE89] font-bold rounded-lg shadow flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/>
              </svg>
              Copiar Enlace
            </button>
          </div>

          <!-- 4. Rol Redes & Growth (Luis) -->
          <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="font-bold text-slate-900">📈 Enlace Campañas (Meta Ads & Google)</span>
                <span class="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">Pauta & Telefonía</span>
              </div>
              <p class="text-[11px] text-slate-500 mt-0.5">
                Desglose de los 7 conjuntos de anuncios por idioma, llamadas fuera de NSW y reserva de Google.
              </p>
            </div>
            <button onclick="copyToClipboard('${baseUrl}/?role=media&tab=media')" class="whitespace-nowrap px-3 py-1.5 bg-[#323B3F] hover:bg-slate-900 text-[#96EE89] font-bold rounded-lg shadow flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/>
              </svg>
              Copiar Enlace
            </button>
          </div>

          <!-- 5. Rol Merchandising (Maria) -->
          <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="font-bold text-slate-900">📦 Enlace Merchandising & Proveedores</span>
                <span class="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">Cotizaciones</span>
              </div>
              <p class="text-[11px] text-slate-500 mt-0.5">
                Tabla de los 11 artículos pedidos, directorio de los 4 proveedores y control de presupuesto.
              </p>
            </div>
            <button onclick="copyToClipboard('${baseUrl}/?role=merch&tab=merch')" class="whitespace-nowrap px-3 py-1.5 bg-[#323B3F] hover:bg-slate-900 text-[#96EE89] font-bold rounded-lg shadow flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/>
              </svg>
              Copiar Enlace
            </button>
          </div>
        </div>

        <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end">
          <button onclick="closeModal()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl">
            Listo / Cerrar
          </button>
        </div>
      </div>
    </div>
  `;
}

/**
 * Controla el inicio o detención del túnel Cloudflare
 */
async function toggleTunnel(action) {
  const btn = document.getElementById("btnStartTunnel");
  if (btn) {
    btn.innerHTML = `<span class="animate-spin mr-1">⏳</span> Generando enlace seguro...`;
    btn.disabled = true;
  }

  try {
    const res = await fetch('/api/tunnel', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action })
    });
    const result = await res.json();
    if (result.ok) {
      showToast(action === 'start' ? "¡Enlace público seguro generado!" : "Túnel detenido", "success");
      openShareModal(); // Refrescar modal
    } else {
      showToast("Error al configurar túnel: " + (result.error || ""), "error");
    }
  } catch (err) {
    showToast("Error comunicando con el servidor local", "error");
  }
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast("¡Enlace copiado al portapapeles!", "success");
  }).catch(() => {
    prompt("Copia este enlace manualmente:", text);
  });
}

/**
 * Abre modal con plantilla de correo lista para copiar para onmove o Joshua
 */
function openEmailModal(actionId) {
  const action = AppState.data.strategicRadar.nextStep.actions.find(a => a.id === actionId);
  if (!action || !action.emailTemplate) return;

  const modalContainer = document.getElementById("modalContainer");
  if (!modalContainer) return;

  AppState.modalOpen = "emailModal";
  modalContainer.innerHTML = `
    <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl animate-scaleUp">
        <div class="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 class="text-lg font-bold text-[#323B3F]">Plantilla de Correo Lista para Enviar</h3>
          <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="mt-4 space-y-3 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Destinatario:</label>
            <div class="bg-slate-50 p-2 rounded-lg border border-slate-200 text-slate-800 font-semibold">
              ${action.owner === 'onmove (Agencia)' ? 'projects@onmove.com.au' : 'joshua.clinical@health.nsw.gov.au'}
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Asunto:</label>
            <input type="text" id="emailSubjectInput" value="${action.emailTemplate.subject}" 
                   class="w-full bg-slate-50 p-2 rounded-lg border border-slate-200 text-slate-800 font-bold focus:outline-none" />
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Cuerpo del Mensaje:</label>
            <textarea id="emailBodyInput" rows="8" 
                      class="w-full bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-800 font-mono text-[11px] leading-relaxed focus:outline-none">${action.emailTemplate.body}</textarea>
          </div>
        </div>

        <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button onclick="closeModal()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl">
            Cerrar
          </button>
          <button onclick="copyEmailToClipboard()" class="px-4 py-2 bg-[#323B3F] hover:bg-slate-900 text-[#96EE89] text-xs font-bold rounded-xl shadow flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/>
            </svg>
            Copiar al Portapapeles
          </button>
        </div>
      </div>
    </div>
  `;
}

function copyEmailToClipboard() {
  const subject = document.getElementById("emailSubjectInput").value;
  const body = document.getElementById("emailBodyInput").value;
  const fullText = `Asunto: ${subject}\n\n${body}`;

  navigator.clipboard.writeText(fullText).then(() => {
    showToast("¡Texto de correo copiado al portapapeles!", "success");
    closeModal();
  }).catch(() => {
    showToast("No se pudo copiar automáticamente, copia manualmente.", "error");
  });
}

/**
 * Modal para agregar nueva tarea operativa
 */
function openNewTaskModal() {
  const modalContainer = document.getElementById("modalContainer");
  if (!modalContainer) return;

  AppState.modalOpen = "taskModal";
  modalContainer.innerHTML = `
    <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scaleUp">
        <div class="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 class="text-lg font-bold text-[#323B3F]">Nueva Tarea / Aprobación</h3>
          <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <form onsubmit="handleCreateTask(event)" class="mt-4 space-y-3 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Título de la Tarea:</label>
            <input type="text" id="newTaskTitle" required placeholder="Ej: Revisión de textos en Dari" 
                   class="w-full bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#96EE89]" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Responsable Único:</label>
              <select id="newTaskAssignee" class="w-full bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-800">
                ${AppState.data.teamOperations.members.map(m => `
                  <option value="${m.id}">${m.name}</option>
                `).join('')}
              </select>
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Prioridad:</label>
              <select id="newTaskPriority" class="w-full bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-800">
                <option value="critical">Crítica</option>
                <option value="high" selected>Alta</option>
                <option value="medium">Media</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Etapa Inicial:</label>
              <select id="newTaskStage" class="w-full bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-800">
                <option value="requested">1. Solicitado</option>
                <option value="in_prep" selected>2. En Redacción</option>
                <option value="tech_review">3. Revisión Técnica</option>
                <option value="clinical_review">4. Revisión Clínica</option>
                <option value="area_approval">5. Aprobación Área</option>
              </select>
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Fecha Límite:</label>
              <input type="date" id="newTaskDueDate" required 
                     class="w-full bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-800" />
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Notas / Instrucciones:</label>
            <textarea id="newTaskNotes" rows="2" placeholder="Detalles de la entrega..." 
                      class="w-full bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-800 focus:outline-none"></textarea>
          </div>

          <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button type="button" onclick="closeModal()" class="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl">Cancelar</button>
            <button type="submit" class="px-4 py-2 bg-[#323B3F] hover:bg-slate-900 text-[#96EE89] font-bold rounded-xl shadow">Crear Tarea</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function handleCreateTask(e) {
  e.preventDefault();
  const title = document.getElementById("newTaskTitle").value;
  const assignee = document.getElementById("newTaskAssignee").value;
  const priority = document.getElementById("newTaskPriority").value;
  const stage = document.getElementById("newTaskStage").value;
  const dueDate = document.getElementById("newTaskDueDate").value;
  const notes = document.getElementById("newTaskNotes").value;

  const newTask = {
    id: "task-" + Date.now(),
    title,
    track: "general",
    assignee,
    accountable: "lachlan",
    consulted: "luis",
    informed: "yassmen",
    stage,
    priority,
    dueDate,
    daysInStage: 0,
    isBlocked: false,
    blockerReason: null,
    notes
  };

  AppState.data.teamOperations.tasks.unshift(newTask);
  saveAppState();
  closeModal();
  renderWorkflowView();
  showToast("Nueva tarea creada exitosamente", "success");
}

/**
 * Modal para agregar un artículo de merchandising
 */
function openNewMerchModal() {
  const modalContainer = document.getElementById("modalContainer");
  if (!modalContainer) return;

  AppState.modalOpen = "merchModal";
  modalContainer.innerHTML = `
    <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl animate-scaleUp">
        <div class="flex items-center justify-between pb-4 border-b border-slate-100">
          <h3 class="text-lg font-bold text-[#323B3F]">Agregar Artículo de Merchandising</h3>
          <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <form onsubmit="handleCreateMerch(event)" class="mt-4 space-y-3 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">Nombre del Artículo:</label>
            <input type="text" id="newMerchItem" required placeholder="Ej: Banderines para eventos" 
                   class="w-full bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-800" />
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">Especificaciones:</label>
            <input type="text" id="newMerchSpecs" required placeholder="Ej: 50 unidades lona impresa" 
                   class="w-full bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-800" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Cantidad:</label>
              <input type="number" id="newMerchQty" required min="1" value="50" 
                     class="w-full bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-800" />
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Costo Estimado ($AUD):</label>
              <input type="number" id="newMerchCost" step="0.01" required value="250.00" 
                     class="w-full bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-800" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">Proveedor:</label>
              <select id="newMerchSupplier" class="w-full bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-800">
                ${AppState.data.merchandising.suppliers.map(s => `
                  <option value="${s.id}">${s.name}</option>
                `).join('')}
              </select>
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">Color / Versión:</label>
              <input type="text" id="newMerchColor" value="Renewal Green #96EE89" 
                     class="w-full bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-800" />
            </div>
          </div>

          <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button type="button" onclick="closeModal()" class="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl">Cancelar</button>
            <button type="submit" class="px-4 py-2 bg-[#323B3F] hover:bg-slate-900 text-[#96EE89] font-bold rounded-xl shadow">Guardar Artículo</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function handleCreateMerch(e) {
  e.preventDefault();
  const item = document.getElementById("newMerchItem").value;
  const specs = document.getElementById("newMerchSpecs").value;
  const quantity = parseInt(document.getElementById("newMerchQty").value, 10);
  const totalCost = parseFloat(document.getElementById("newMerchCost").value);
  const supplier = document.getElementById("newMerchSupplier").value;
  const brandColor = document.getElementById("newMerchColor").value;

  const newItem = {
    id: "m-" + Date.now(),
    item,
    category: "Merch",
    specs,
    quantity,
    supplier,
    status: "quote_requested",
    unitPrice: totalCost / quantity,
    totalCost,
    paid: false,
    invoiceNo: "Pendiente",
    deliveryDate: "2026-11-30",
    brandColor
  };

  AppState.data.merchandising.items.push(newItem);
  saveAppState();
  closeModal();
  renderMerchView();
  showToast("Artículo de merchandising agregado", "success");
}

function closeModal() {
  const modalContainer = document.getElementById("modalContainer");
  if (modalContainer) {
    modalContainer.innerHTML = "";
  }
  AppState.modalOpen = null;
}

/**
 * Exportar estado completo a archivo JSON
 */
function exportDataAsJSON() {
  const jsonStr = JSON.stringify(AppState.data, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `witness_to_war_backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast("Copia de seguridad JSON descargada", "success");
}

/**
 * Importar estado desde archivo JSON
 */
function importDataFromJSON() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = ".json";
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target.result);
        if (imported.project && imported.strategicRadar) {
          AppState.data = imported;
          saveAppState();
          renderApp();
          showToast("Datos importados exitosamente", "success");
        } else {
          showToast("Archivo JSON no compatible con Witness to War", "error");
        }
      } catch (err) {
        showToast("Error al leer el archivo JSON", "error");
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

/**
 * Imprimir / Guardar como PDF
 */
function printExecutiveReport() {
  window.print();
}

/**
 * Toast de notificaciones breves
 */
function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `fixed bottom-5 right-5 z-50 px-4 py-3 rounded-xl shadow-lg text-xs font-bold flex items-center gap-2 transition-all transform translate-y-10 opacity-0 ${
    type === "success" ? "bg-emerald-600 text-white" :
    type === "error" ? "bg-red-600 text-white" : "bg-[#323B3F] text-[#96EE89]"
  }`;
  toast.innerHTML = `
    <span>${type === "success" ? "✓" : type === "error" ? "✕" : "ℹ"}</span>
    <span>${message}</span>
  `;

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove("translate-y-10", "opacity-0");
  }, 50);

  setTimeout(() => {
    toast.classList.add("translate-y-10", "opacity-0");
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}
