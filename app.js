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

// DICCIONARIO DE INTERNACIONALIZACIÓN (DEFAULT: AUSTRALIAN ENGLISH)
const I18N = {
  en: {
    // Header & Brand
    missionControl: "Mission Control",
    subAgency: "STARTTS / NSW Health",
    appTitle: "Witness to War & Violence",
    appSubtitle: "Digital Operations & Delivery Control Centre",
    roleLabel: "Role:",
    roleExecutive: "👑 Executive View (Lachlan)",
    roleAgency: "🏢 Agency Portal (onmove)",
    roleOperations: "👥 Operations (WTWV Team)",
    roleMedia: "📈 Growth & Media (Luis)",
    roleMerch: "📦 Merchandising & Events",
    liveSync: "Live Sync",
    offlineMode: "Local Mode",
    shareBtn: "Share",
    printBtn: "Print / PDF Report",
    backupBtn: "Export JSON",
    importBtn: "Import JSON",
    resetBtn: "Reset Data",
    searchPlaceholder: "Search task, deliverable, partner...",

    // Navigation Tabs
    tabRadar: "Strategic Radar",
    tabAgency: "Website & onmove (Sprints)",
    tabScopeReviews: "Get Help, FASSTT & Videos",
    tabWorkflow: "Team Workflow & Unblock",
    tabMedia: "Media & Telephony (Meta/Google)",
    tabMerch: "Merchandise & Print",
    tabRaci: "RACI Matrix",
    tabTimeline: "Roadmap & Gantt",

    // Agency & Sprints (Timeframe Builder)
    agencyTag: "Web Development & CMS",
    agencyContracted: "Agency Contracted:",
    agencyHeadline: "Deliverables, Sprints & Official Timeframe Tracking",
    agencyProposal: "Approved proposal: 165 hours @ $130/hr + GST ($21,450 AUD) on WordPress with Bricks Builder across 6 languages.",
    demandTimeframeBtn: "Request Timeframe from onmove",
    openFigmaBtn: "Open onmove Figma",
    addDeliverableBtn: "➕ Add Deliverable",
    exportSprintBtn: "📄 Export Sprint to Lachlan",
    hoursContracted: "Contracted Hours",
    fixedRate: "Fixed rate of $130/hr + GST",
    webBudget: "Website Budget",
    budgetExcl: "Excludes hosting & plugin licences",
    techStack: "Tech Stack",
    wcagStandard: "WordPress CMS + WCAG 2.1 AA",
    managementAlert: "Management Alert",
    managementAlertText: "Awaiting onmove development commitment dates to present to Lachlan and Board.",
    allDeliverables: "All Deliverables",
    laneDone: "Completed ('What has been done')",
    laneInProgress: "In Progress ('In development')",
    laneToDo: "To Do ('What is left to do')",
    laneBlocked: "Blocked ('Waiting on STARTTS')",
    filterBySprint: "Filter by Sprint:",
    allPhases: "All Sprints",
    phase1Label: "Sprint 1: Strategy & IA",
    phase2Label: "Sprint 2: UX/UI Design",
    phase3Label: "Sprint 3: Bricks Builder Build",
    phase4Label: "Sprint 4: QA, Accessibility & Launch",
    etaCommitted: "Committed ETA:",
    estimatedProgress: "Phase progress:",
    keyDeliverables: "Key Deliverables for this Sprint:",
    clientDependency: "STARTTS Internal Dependency:",
    responsible: "Responsible:",
    status: "Status:",
    actions: "Actions",
    editBtn: "Edit",
    deleteBtn: "Delete",

    // Scope Reviews
    scopeTitle: "Get Help, FASSTT National Network & Video Production",
    scopeSubtitle: "Operational sign-off and scope tracking across critical digital deliverables.",
    tomorrowAlertTitle: "Tomorrow's Presentation with onmove (Friday 16 Oct)",
    tomorrowAlertDesc: "Evaluating Figma wireframes (frames 1492-6 and 1853-7561) for the Get Help section and validating mobile-first user flows.",
    lockedTopics: "Locked Topics (Approved)",
    lockedTechniques: "Locked Self-Help Techniques (Approved)",
    pendingFeelings: "8 Emotional States (Awaiting Joshua's Clinical Sign-off)",
    signoffAsJoshua: "✍️ Sign-off Emotions as Joshua",
    alreadySignedOff: "✅ Signed-off by Joshua (Clinical Lead)",
    getHelpRoadmap: "Get Help Step-by-Step Delivery Roadmap & ETAs",
    aboutUsTitle: "About Us Section Review (Institutional Framework)",
    aboutUsSubtitle: "Checklist of completed items vs outstanding institutional requirements.",
    fassttTitle: "FASSTT National Network Partners (Australia-wide Offices)",
    fassttSubtitle: "National directory so clients outside NSW can find local specialised trauma rehabilitation centres.",
    allStates: "All States (8)",
    videosTitle: "Video Content Creation (4 Get Help Techniques + 1 Institutional)",
    videosSubtitle: "Audio-visual psychoeducation strategy for platform embeds and social media.",
    starttsPendingTitle: "Deliverables Pending by STARTTS (Owed to onmove)",
    starttsPendingSubtitle: "Transparent internal commitments to ensure zero deflections or delays attributed to STARTTS."
  },
  es: {
    // Header & Brand
    missionControl: "Centro de Misión",
    subAgency: "STARTTS / NSW Health",
    appTitle: "Witness to War & Violence",
    appSubtitle: "Centro de Control Digital & Operaciones",
    roleLabel: "Rol:",
    roleExecutive: "👑 Vista Ejecutiva (Lachlan)",
    roleAgency: "🏢 Portal Agencia (onmove)",
    roleOperations: "👥 Operaciones (Equipo W2W)",
    roleMedia: "📈 Crecimiento & Redes (Luis)",
    roleMerch: "📦 Merchandising & Eventos",
    liveSync: "En Vivo (Sync)",
    offlineMode: "Modo Local",
    shareBtn: "Compartir",
    printBtn: "Imprimir / Reporte PDF",
    backupBtn: "Exportar JSON",
    importBtn: "Importar JSON",
    resetBtn: "Restablecer Datos",
    searchPlaceholder: "Buscar tarea, entregable, socio...",

    // Navigation Tabs
    tabRadar: "Radar Estratégico",
    tabAgency: "Sitio Web & onmove (Sprints)",
    tabScopeReviews: "Get Help, FASSTT & Videos",
    tabWorkflow: "Flujo Interno & Cuellos de Botella",
    tabMedia: "Redes & Telefonía (Meta/Google)",
    tabMerch: "Merchandising & Gráfica",
    tabRaci: "Matriz RACI",
    tabTimeline: "Cronograma & Gantt",

    // Agency & Sprints (Timeframe Builder)
    agencyTag: "Desarrollo Web & CMS",
    agencyContracted: "Agencia Contratada:",
    agencyHeadline: "Seguimiento de Entregables, Sprints y Cronograma Oficial",
    agencyProposal: "Propuesta aprobada: 165 horas @ $130/h + GST ($21,450 AUD) en WordPress con Bricks Builder para 6 idiomas.",
    demandTimeframeBtn: "Exigir Timeframe a onmove",
    openFigmaBtn: "Abrir Figma de onmove",
    addDeliverableBtn: "➕ Agregar Entregable",
    exportSprintBtn: "📄 Exportar Sprint a Lachlan",
    hoursContracted: "Horas Contratadas",
    fixedRate: "Tarifa fija de $130/hr + GST",
    webBudget: "Presupuesto Web",
    budgetExcl: "Excluye hosting y licencias",
    techStack: "Stack Tecnológico",
    wcagStandard: "WordPress CMS + WCAG 2.1 AA",
    managementAlert: "Alerta de Gestión",
    managementAlertText: "Falta confirmación de fechas de desarrollo para presentar a Lachlan y al Directorio.",
    allDeliverables: "Todos los Entregables",
    laneDone: "Completado ('Lo que se hizo')",
    laneInProgress: "En Desarrollo ('En construcción')",
    laneToDo: "Por Hacer ('Lo que falta hacer')",
    laneBlocked: "Bloqueado ('Esperando a STARTTS')",
    filterBySprint: "Filtrar por Sprint:",
    allPhases: "Todos los Sprints",
    phase1Label: "Sprint 1: Estrategia & IA",
    phase2Label: "Sprint 2: Diseño UX/UI",
    phase3Label: "Sprint 3: Desarrollo Bricks Builder",
    phase4Label: "Sprint 4: QA, Accesibilidad & Lanzamiento",
    etaCommitted: "Fecha Comprometida (ETA):",
    estimatedProgress: "Progreso estimado:",
    keyDeliverables: "Entregables Clave de este Sprint:",
    clientDependency: "Dependencia Interna de STARTTS:",
    responsible: "Responsable:",
    status: "Estado:",
    actions: "Acciones",
    editBtn: "Editar",
    deleteBtn: "Eliminar",

    // Scope Reviews
    scopeTitle: "Get Help, Red Nacional FASSTT y Producción de Videos",
    scopeSubtitle: "Validación operativa y seguimiento de alcance en entregables digitales críticos.",
    tomorrowAlertTitle: "Sesión de Wireframes de Mañana con onmove (Viernes 16 Oct)",
    tomorrowAlertDesc: "Revisar frames 1492-6 y 1853-7561 de Figma para la sección Get Help y validar rutas mobile-first.",
    lockedTopics: "Temas Aprobados y Cerrados",
    lockedTechniques: "Técnicas de Autoayuda Aprobadas",
    pendingFeelings: "8 Emociones / Sentimientos (Pendiente Firma de Joshua)",
    signoffAsJoshua: "✍️ Firmar Emociones como Joshua",
    alreadySignedOff: "✅ Firmado clínicamente por Joshua (Líder Clínico)",
    getHelpRoadmap: "Hoja de Ruta y Fechas de Entrega de Get Help",
    aboutUsTitle: "Revisión de Sección About Us (Marco Institucional)",
    aboutUsSubtitle: "Checklist de elementos completados vs requerimientos institucionales pendientes.",
    fassttTitle: "Socios de la Red Nacional FASSTT (Oficinas en Toda Australia)",
    fassttSubtitle: "Directorio nacional para que usuarios fuera de NSW ubiquen centros especializados de rehabilitación de trauma.",
    allStates: "Todos los Estados (8)",
    videosTitle: "Producción de Videos (4 Get Help + 1 Institucional)",
    videosSubtitle: "Estrategia psicoeducativa audiovisual para la web y redes sociales.",
    starttsPendingTitle: "Entregables Pendientes de STARTTS (Hacia la Agencia)",
    starttsPendingSubtitle: "Compromisos internos transparentes para asegurar cero demoras atribuibles a STARTTS."
  }
};

// Estado global de la aplicación
let AppState = {
  data: null,
  currentRole: "executive", // "executive" | "agency" | "operations" | "media" | "merch"
  activeTab: "radar",       // "radar" | "agency" | "scope-reviews" | "workflow" | "media" | "merch" | "raci" | "timeline"
  lang: localStorage.getItem("wtwv_lang") || "en", // Default: Australian English ("en")
  agencySprintFilter: "all", // "all" | "completed" | "in_progress" | "todo" | "blocked"
  agencyPhaseFilter: "all",  // "all" | "p1" | "p2" | "p3" | "p4"
  fassttFilter: "all",       // "all" | "NSW" | "VIC" | "QLD" | "SA" | "WA" | "TAS" | "NT" | "ACT"
  filters: {
    search: "",
    assignee: "all",
    priority: "all",
    onlyBlocked: false
  },
  modalOpen: null, // null | "taskModal" | "merchModal" | "emailModal" | "exportModal" | "shareModal" | "deliverableModal"
  isServerSyncActive: false
};

// Helper de traducción de claves con fallback
function t(key, fallback = "") {
  const currentLang = AppState.lang || "en";
  if (I18N[currentLang] && I18N[currentLang][key]) {
    return I18N[currentLang][key];
  }
  if (I18N.en && I18N.en[key]) {
    return I18N.en[key];
  }
  return fallback || key;
}

// Helper bilingüe conciso: si lang === "en", devuelve enText, si no esText
function tr(esText, enText) {
  return AppState.lang === "en" ? enText : esText;
}

// Diccionario de traducción dinámica de contenidos y entidades
const CONTENT_TRANSLATIONS = {
  // Strategic Radar - Where we are
  "1. ¿Dónde estamos HOY?": "1. Where are we TODAY?",
  "Branding aprobado, Campaña Meta Fase 1 activa, y Wireframes Web en revisión técnica.": "Branding approved, Phase 1 Meta Ads active, and Website Wireframes under technical review.",
  "Identidad & Branding": "Identity & onmove Branding",
  "100% completado por la agencia onmove ($27,300 + GST). Todos los manuales, logos multilingües y swatches Pantone 2267 C recibidos.": "100% completed by onmove ($27,300 AUD + GST). All brand guidelines, multilingual logos and Pantone 2267 C swatches delivered on Drive.",
  "Completado": "Completed",
  "Campaña Meta Ads Fase 1": "Phase 1 Meta Ads Campaign",
  "Activa con $2,500 en 7 conjuntos de anuncios (Árabe, Farsi/Dari, Ucraniano, Hebreo, Inglés). Enfoque 100% llamadas directas.": "Active with $2,500 AUD across 7 ad sets (Arabic, Farsi/Dari, Ukrainian, Hebrew, English). Focused 100% on direct phone inquiries.",
  "En Ejecución": "In Execution",
  "Sitio Web (onmove)": "Website (onmove)",
  "Fase 1 de Estrategia e Información avanzada al 85%. Los wireframes de 'Get Help' están diseñados en Figma pero TRABADOS en validación de contenidos.": "Sprint 1 Strategy & IA at 85%. 'Get Help' wireframes designed in Figma but HELD pending content sign-off.",
  "Cuello de Botella": "Bottleneck",
  "Merchandising & Banners": "Merchandise & Banners",
  "Primer lote de impresión (tarjetas, folletos, roll-up banners) pagado y recibido en Snap Wetherill Park ($905.34). Cotizaciones de merchandising masivo solicitadas a 4 proveedores.": "Initial print batch (cards, brochures, pull-up banners) paid and received from Snap Wetherill Park ($905.34 AUD). Bulk merchandise quotes requested from 4 suppliers.",
  "En Cotización": "Tendering / Quoting",

  // Strategic Radar - Where we are going
  "2. ¿Hacia dónde vamos? (Próximos Hitos)": "2. Where are we HEADED? (Upcoming Milestones)",
  "Hacia el lanzamiento del sitio web multilingüe y la expansión nacional de llamadas.": "Towards the multilingual website go-live and nationwide call expansion.",
  "Semanas 1-2 (Octubre)": "Weeks 1-2 (October)",
  "Desbloqueo de Contenidos & Timeframe de onmove": "Content Sign-off & onmove Timeframe Commitment",
  "Aprobación clínica de las 8 emociones del Get Help por Joshua y entrega formal del cronograma semana a semana por parte de onmove.": "Clinical sign-off on 8 Get Help emotional states by Joshua and formal delivery of weekly sprint schedule by onmove.",
  "Semanas 3-5 (Noviembre)": "Weeks 3-5 (November)",
  "Desarrollo WordPress en Bricks Builder": "WordPress Build in Bricks Builder",
  "Construcción del CMS, integración de las rutas de crisis ('Safety Exit'), buscador de recursos y estructura en 6 idiomas.": "CMS build, crisis routing integration ('Safety Exit'), resource finder, and 6-language RTL architecture.",
  "Semanas 6-8 (Diciembre)": "Weeks 6-8 (December)",
  "Evaluación Meta Ads Fase 1 & Cierre de Campaña": "Meta Ads Phase 1 Review & Campaign Wrap-up",
  "Medición del volumen de llamadas fuera de NSW (Melbourne, Adelaide, Shepparton) vs Sydney. Cierre de campaña previo al receso de verano (14 Dic).": "Measuring call volume outside NSW (Melbourne, Adelaide, Shepparton) vs Sydney. Campaign wrap-up before summer recess (14 Dec).",
  "Enero 2027": "January 2027",
  "Decisión Reserva Google Ads ($2,500) y Lanzamiento Web": "Google Ads Reserve Decision ($2,500 AUD) & Web Go-Live",
  "Si el costo por llamada de Meta es menor a $100, se escala Meta; si no, se activa Google Search / Call-only. QA y despliegue del sitio en vivo.": "If Meta cost-per-call is under $100, scale Meta; otherwise activate Google Search / Call-only reserve. QA and live deployment.",

  // Strategic Radar - Next Step
  "3. ¿Cuál es el paso a seguir INMEDIATO?": "3. What is our IMMEDIATE NEXT STEP?",
  "Acciones concretas requeridas hoy para romper los dos cuellos de botella principales.": "Concrete actions required today to break the two primary bottlenecks.",
  "Exigir el 'Timeframe & Sprint Schedule' formal a onmove": "Demand formal 'Timeframe & Sprint Schedule' from onmove",
  "onmove debe comprometer por escrito las fechas de entrega de la Fase 2 (Visual UX), Fase 3 (Desarrollo Bricks) y Fase 4 (Testing). Sin estas fechas, Lachlan no puede presentar avances al board de STARTTS.": "onmove must formally commit in writing to milestone delivery dates for Phase 2 (UX/UI), Phase 3 (Bricks Build), and Phase 4 (QA/Launch). Without these, Lachlan cannot report progress to the STARTTS board.",
  "Copiar Correo para onmove": "Copy Formal Notice for onmove",
  "Firma clínica de las 8 emociones del Get Help Toolkit": "Clinical sign-off on 8 emotional states for Get Help Toolkit",
  "Validar que la lista de 8 emociones (Ansiedad, Desconexión, Depresión, Miedo, Soledad, Agobio, Inquietud, Preocupación) sea clínicamente precisa para víctimas de trauma.": "Validate that the taxonomy of 8 emotional states is clinically accurate for trauma-affected communities.",
  "Reclamar a Joshua": "Follow-up with Joshua",
  "Consolidar cotizaciones de merchandising (4 proveedores)": "Consolidate merchandise quotes (4 suppliers)",
  "Reunir las respuestas de SOS Promotions, Everything Branded, Fast Promos y Vivid Ads para presentar comparativa de precios a Lachlan.": "Consolidate supplier quotes from SOS Promotions, Everything Branded, Fast Promos, and Vivid Ads for Lachlan's sign-off.",
  "Ver Proveedores": "View Suppliers",

  // Sprints / Fases
  "Fase 1: Estrategia de Sitio & Arquitectura de Información": "Sprint 1: Website Strategy & Information Architecture",
  "Fase 2: Diseño Visual & Experiencia de Usuario (UX/UI)": "Sprint 2: Visual Design & User Experience (UX/UI)",
  "Fase 3: Desarrollo en WordPress (Bricks Builder)": "Sprint 3: WordPress Development (Bricks Builder)",
  "Fase 4: Testing, Accesibilidad & Lanzamiento": "Sprint 4: QA Testing, WCAG 2.1 AA Accessibility & Go-Live",

  // Entregables
  "Arquitectura web y sitemap general": "Website architecture & master sitemap",
  "Mapeo de rutas de soporte en crisis": "Crisis support user journeys mapping",
  "Estructura de la sección 'Get Help' y toolkit": "'Get Help' section layout & toolkit structure",
  "Estructura multilingüe (rutas por idioma)": "Multilingual routing (6 languages)",
  "Concepto visual y dirección de Homepage": "Homepage visual concept & creative direction",
  "Diseño de plantillas para páginas de contenido clave": "Key content page templates design",
  "Maquetas de layouts para el Hub de Recursos y Toolkit": "Self-Help Hub & Resource directory layouts",
  "Componente de salida segura inmediata ('Safety Exit')": "Immediate Safety Exit component",
  "Diseño responsivo para móviles y tablets": "Responsive mobile & tablet layouts",
  "Instalación y configuración de WordPress + Bricks Builder": "WordPress + Bricks Builder core setup & config",
  "Desarrollo del theme accesible y modular": "Accessible & modular custom theme development",
  "Implementación del Hub de Recursos con filtros por sentimiento": "Resource Hub build with emotion tag filters",
  "Configuración multilingüe en 6 idiomas (RTL para Árabe/Hebreo/Farsi/Dari)": "6 Languages setup with RTL (Arabic, Hebrew, Farsi, Dari)",
  "Integración de donaciones (sistema embebido)": "Embedded donation system integration",
  "Optimización técnica y SEO básico": "Technical optimisation & baseline SEO",
  "Control de calidad funcional (QA cross-browser)": "Cross-browser functional QA testing",
  "Auditoría de accesibilidad WCAG 2.1 AA": "WCAG 2.1 AA accessibility audit & sign-off",
  "Capacitación de CMS para el equipo (5 horas incluidas)": "CMS training for WTWV team (5 hrs included)",
  "Despliegue a producción y verificación en vivo": "Production deployment & live verification",
  "Soporte post-lanzamiento (15 horas incluidas)": "Post-launch warranty & hypercare support (15 hrs included)",

  // Notas y Dependencias
  "Wireframes listos en Figma (frames 1492-6, 1853-7561). Falta cierre de textos clínicos.": "Figma wireframes ready (frames 1492-6, 1853-7561). Pending clinical text sign-off.",
  "Aplicando paleta Renewal Green #96EE89 y Grounded Slate #323B3F.": "Applying Renewal Green #96EE89 and Grounded Slate #323B3F palette.",
  "Validación del brief clínico de 'Get Help' por parte de Joshua y Yassmen.": "Validation of 'Get Help' clinical brief by Joshua and Yassmen.",
  "Aprobación de la dirección visual de Homepage por Lachlan.": "Approval of Homepage visual direction by Lachlan.",
  "Entrega de textos traducidos en los 6 idiomas e infraestructura de hosting/licencia de plugins.": "Delivery of translated copy in 6 languages and hosting/licence infrastructure.",
  "Entrega de credenciales de hosting y contenidos finales aprobados.": "Delivery of hosting credentials and final approved content.",

  // Get Help Topics
  "Preocupación por familiares en el extranjero (Worried about family overseas)": "Worried about family overseas (Overseas conflict impact)",
  "Impacto del trauma y la violencia en la vida diaria (Trauma & daily impact)": "Trauma & daily life impact (Somatic and emotional distress)",
  "Navegando noticias y medios de comunicación (Navigating news and media triggers)": "Navigating news and media triggers (Information overload)",
  "Apoyo a niños y jóvenes afectados por la guerra (Supporting children and youth)": "Supporting children and youth affected by war (Family care)",

  // Get Help Techniques
  "Gentle Belly Breathing (Respiración abdominal suave)": "Gentle Belly Breathing (Slow diaphragmatic exercise)",
  "5-4-3-2-1 Grounding (Anclaje sensorial)": "5-4-3-2-1 Grounding Technique (Sensory anchor for acute panic)",
  "Orient to the Present (Orientación al momento presente)": "Orient to the Present (Safe room orientation)",
  "Five Senses Treasure Hunt (Exploración de los cinco sentidos)": "Five Senses Treasure Hunt (Multigenerational sensory scan)",

  // 8 Emotional States (Feelings Taxonomy)
  "1. Ansiedad y Pánico": "1. Anxiety & Panic",
  "2. Aislamiento y Soledad": "2. Isolation & Loneliness",
  "3. Desesperanza y Tristeza": "3. Hopelessness & Sadness",
  "4. Culpa del Sobreviviente": "4. Survivor Guilt",
  "5. Ira e Impotencia": "5. Anger & Helplessness",
  "6. Insomnio y Pesadillas": "6. Insomnia & Nightmares",
  "7. Agobio Sensorial": "7. Sensory Overload",
  "8. Dificultad para Concentrarse": "8. Concentration Difficulties",

  // Get Help Next Steps
  "Sesión de validación de wireframes con onmove": "Wireframes validation review session with onmove",
  "Revisar frames 1492-6 y 1853-7561 en Figma con Luis y equipo clínico.": "Review Figma frames 1492-6 and 1853-7561 with Luis and clinical team.",
  "Firma clínica de 8 sentimientos por Joshua": "Clinical sign-off on 8 feelings by Joshua",
  "Requerido para que onmove cierre la taxonomía de filtros en WordPress.": "Required for onmove to configure taxonomy filters in WordPress.",
  "Entrega de copys traducidos a los 5 idiomas adicionales": "Delivery of translated copy across remaining 5 languages",
  "Árabe, Hebreo, Farsi, Dari y Ucraniano para cargar en CMS.": "Arabic, Hebrew, Farsi, Dari and Ukrainian for CMS import.",
  "Aprobación de la dirección visual de Homepage": "Homepage visual design sign-off",
  "Lachlan debe dar el OK a la maqueta de alta fidelidad en Figma.": "Lachlan must give final sign-off on high-fidelity Figma mockup.",

  // About Us
  "Declaración de Misión y Enfoque Informado en Trauma": "Trauma-informed mission statement & clinical framework",
  "Redactado y alineado con los principios de atención de trauma de STARTTS.": "Drafted and aligned with STARTTS trauma-informed care principles.",
  "Co-branding Institucional: STARTTS / NSW Health": "Institutional co-branding: STARTTS / NSW Health",
  "Logos y jerarquía visual aprobados. NSW Health arriba a la izquierda, STARTTS co-sponsor.": "Approved logos & visual hierarchy. NSW Health top-left, STARTTS co-sponsor.",
  "Respaldo y Lockup de la Red Nacional FASSTT": "FASSTT National Network endorsement & lockup",
  "Revisar si se incluye el logo de FASSTT o si se menciona solo en el directorio interestatal.": "Review whether FASSTT logo is included or referenced in interstate directory.",
  "Protocolos de Confidencialidad y Privacidad Médica": "Medical confidentiality & clinical privacy protocols",
  "Aclarar explícitamente que las llamadas y consultas no quedan registradas en bases de datos policiales ni migratorias.": "Explicitly state calls/inquiries are never shared with police or immigration authorities.",
  "Biografías del Equipo Clínico / Testimonios": "Clinical staff biographies vs anonymous profiles",
  "Decidir si se publican nombres reales de terapeutas o perfiles protegidos por seguridad comunitaria.": "Decision needed: publish real therapist names or protected profiles for community security.",
  "Botón de Salida Segura Inmediata ('Safety Exit')": "Immediate Safety Exit component",
  "Requisito de seguridad digital: botón flotante persistente que redirige a Google y borra el historial de navegación.": "Digital safety requirement: persistent floating button redirecting to weather/Google and clearing cache.",
  "Traducción Oficial en los 6 Idiomas": "Official accredited translation in 6 languages",
  "Asegurar que los textos sobre STARTTS y NSW Health estén acreditados por traductores NAATI.": "Ensure all institutional copy is accredited by NAATI professional translators.",

  // Videos
  "Gentle Belly Breathing (Respiración Abdominal)": "Gentle Belly Breathing (Slow Diaphragmatic Exercise)",
  "5-4-3-2-1 Sensory Grounding (Anclaje Sensorial)": "5-4-3-2-1 Sensory Grounding Technique",
  "Orient to the Present (Orientación al Presente)": "Orient to the Present (Safe Space Orientation)",
  "Five Senses Treasure Hunt (Caza de Sentidos)": "Five Senses Treasure Hunt (Multigenerational Scan)",
  "Witness to War: Institucional & Historia de Marca": "Witness to War: Institutional Brand Story",

  // STARTTS Pending
  "Validación de Wireframes de 'Get Help' en reunión de mañana": "Validation of 'Get Help' wireframes in tomorrow's meeting",
  "Reunión agendada para el viernes 16 Oct. Luis y Joshua deben dar feedback definitivo sobre frames Figma.": "Meeting scheduled for Friday 16 Oct. Luis and Joshua must provide final feedback on Figma frames.",
  "Aprobación clínica final del listado de 8 emociones": "Final clinical sign-off on 8 emotional states",
  "Joshua debe firmar el documento de Google Docs para que la agencia configure las taxonomías en WordPress.": "Joshua must sign off in Google Docs so onmove can configure WordPress taxonomy filters.",
  "Entrega de textos traducidos en 5 idiomas a onmove": "Delivery of translated copy in 5 languages to onmove",
  "Yassmen y equipo de traducción deben entregar las hojas de cálculo con textos para carga en CMS.": "Yassmen & translation team must deliver copy spreadsheets for CMS upload.",
  "Confirmación de licencias Bricks Builder y hosting": "Bricks Builder licences & hosting infrastructure confirmation",
  "Definir si el hosting lo provee STARTTS/NSW Health o si onmove gestiona el entorno cloud.": "Decide whether hosting is provisioned by STARTTS/NSW Health or managed by onmove.",

  // Team Operations Tasks & Blocker Reasons
  "Definición final de la lista de emociones para 'Get Help'": "Final sign-off on emotions taxonomy for 'Get Help'",
  "Joshua no ha emitido dictamen en 4 días sobre el listado de 8 sentimientos.": "Joshua has not provided clinical sign-off on the 8 feelings list in 4 days.",
  "Solicitud y fijación del cronograma oficial de onmove": "Request and formal locking of onmove's official timeframe",
  "onmove no envió los timeframes de desarrollo en su propuesta inicial.": "onmove did not include development timeframes in their initial proposal.",
  "Monitoreo semanal del registro de llamadas telefónicas de Meta Ads": "Weekly monitoring of Meta Ads phone call log",
  "Cotización comparativa de merchandising masivo (4 proveedores)": "Competitive quoting for bulk merchandise (4 suppliers)",
  "Traducción oficial de contenidos de folletos a 5 idiomas": "Official translation of brochure copy into 5 languages",
  "Verificación de licencias de Bricks Builder y plugins WordPress": "Verification of Bricks Builder licences & WordPress plugins",
  "Plan de difusión Ukrainian Fellowship 2026": "Promotion plan for Ukrainian Fellowship 2026",

  // Paid Media Ad Sets & Notes
  "Árabe - NSW (Canterbury-Bankstown, Fairfield)": "Arabic - NSW (Canterbury-Bankstown, Fairfield)",
  "Comunidad más numerosa (~367k en Australia). Alta respuesta histórica.": "Largest community (~367k in Australia). High historical response rate.",
  "Árabe - Resto de Australia (Melbourne focus)": "Arabic - Rest of Australia (Melbourne focus)",
  "Caja de crecimiento regional ponderada doblemente para descentralizar NSW.": "Regional growth budget weighted double to decentralise beyond NSW.",
  "Farsi / Dari - NSW (Blacktown, Fairfield)": "Farsi / Dari - NSW (Blacktown, Fairfield)",
  "Audiencia consolidada iraní/afgana en NSW.": "Consolidated Iranian/Afghan community in NSW.",
  "Farsi / Dari - Resto de Australia (Melb, Adelaide, Shepparton)": "Farsi / Dari - Rest of Australia (Melb, Adelaide, Shepparton)",
  "La mayor concentración de afganos/hazaras vive fuera de NSW. Gran rendimiento.": "Highest concentration of Afghan/Hazara diaspora lives outside NSW. Strong performance.",
  "Ucraniano - Nacional (Ucraniano + Ruso)": "Ukrainian - Nationwide (Ukrainian + Russian)",
  "En 2025 fue la comunidad con mayor incremento porcentual (+111%).": "In 2025 this community achieved the highest percentage call growth (+111%).",
  "Hebreo - Nacional (Glen Eira & Eastern Sydney)": "Hebrew - Nationwide (Glen Eira & Eastern Sydney)",
  "Presencia institucional y equidad de servicio según compromiso de fondos.": "Institutional presence and service equity as per funding agreement.",
  "Inglés - Nacional (Cap fijo referidores & familias)": "English - Nationwide (Capped budget for referrers & families)",
  "Tope estricto de presupuesto para que el inglés no consuma los fondos de minorías.": "Strict budget cap ensuring English ads do not cannibalise minority language funds.",
  "VIC (Hume, Brimbank, Dandenong) + Resto AU": "VIC (Hume, Brimbank, Dandenong) + Rest of AU",
  "VIC (Casey-Cranbourne), SA (Salisbury) y Shepparton regional": "VIC (Casey-Cranbourne), SA (Salisbury) & Regional Shepparton",
  "Australia Nacional": "Australia Nationwide",
  "Melbourne (Glen Eira) + Sydney Este": "Melbourne (Glen Eira) + Eastern Sydney",
  "Australia Nacional (Eventos de vida: Lejos del hogar)": "Australia Nationwide (Life events: Far from home)",

  // Merchandising Items, Specs & Colors
  "Business Cards (Linen)": "Business Cards (Linen)",
  "100 unidades en papel lino 350gsm, full colour 2 caras": "100 units on 350gsm linen stock, double-sided full colour",
  "Grounded Slate & White": "Grounded Slate & White",
  "A4 Flyers (Silk)": "A4 Flyers (Silk)",
  "200 unidades (2 modelos x 100 c/u) en 150gsm seda, 1 cara color": "200 units (2 designs x 100 ea) on 150gsm silk, single-sided colour",
  "Renewal Green #96EE89 & Slate": "Renewal Green #96EE89 & Slate",
  "A4 Flyers plegados DL": "DL Folded A4 Brochures",
  "100 unidades en 150gsm seda, 2 caras color plegado a DL": "100 units on 150gsm silk, double-sided colour roll-folded to DL",
  "Multicolor": "Multicolour",
  "Pull Up Banners (Silver Base)": "Pull Up Banners (Silver Base)",
  "2 banners roll-up retráctiles base plata, 850x2000mm color": "2 retractable roll-up banners silver base, 850x2000mm full colour",
  "Renewal Green & Slate": "Renewal Green & Slate",
  "Tablecloths para Ferias & Eventos": "Event Tablecloths (Fitted 4ft)",
  "Mantel ajustado de 4 pies con logo frontal monoline continuo": "Fitted 4-foot tablecloth with continuous monoline loop front logo",
  "Renewal Green #96EE89 base": "Renewal Green #96EE89 base",
  "Remeras del Equipo (Apparel)": "Staff T-Shirts (Apparel)",
  "Remeras de algodón premium con isotipo vertical en pecho": "Premium cotton tees with vertical chest icon & sleeve tagline",
  "Grounded Slate con logo Renewal Green": "Grounded Slate with Renewal Green logo",
  "Lapiceras Promocionales (Pens)": "Branded Pens (Loop Logo & 1800 No)",
  "Lapiceras grabadas con teléfono gratuito y logo en bucle": "Printed ballpoint pens with toll-free 1800 number and loop logo",
  "Blanco / Slate / Renewal Green": "White / Slate / Renewal Green",
  "Pelotas Antiestrés (Stress Balls)": "Stress Relief Foam Balls (2 Designs)",
  "1,000 unidades en dos modelos (bucle ergonómico y corazón suave)": "1,000 units across two moulds (ergonomic loop and soft heart)",
  "Renewal Green & Soft Pastel Blue": "Renewal Green & Soft Pastel Blue",
  "Bolsas de Algodón / Tote Bags": "Heavyweight Cotton Calico Bags",
  "Bolsas ecológicas de lona de algodón con logo vertical y texto": "Heavy-duty canvas calico bags with vertical branding and toll-free number",
  "Color crudo natural con estampa Slate": "Natural raw calico with Slate screen-print",
  "Lanyards y Gorras para Eventos": "Volunteer Lanyards & Embroidered Caps",
  "20 sets de credencial colgante y gorras bordadas para voluntarios": "20 sets of woven lanyards with cardholder and embroidered event caps",
  "Slate & Renewal Green": "Slate & Renewal Green",
  "Botellas Reutilizables de Agua": "Laser-Engraved Aluminium Drink Bottles",
  "Botellas de aluminio libres de BPA grabadas en láser": "BPA-free matte aluminium drink bottles with laser-etched branding",
  "Print": "Print",
  "Displays": "Displays",
  "Merch": "Merchandise",

  // Supplier Notes
  "Excelente calidad en papel lino y banners. Factura #29460 pagada el 12/06/2026 ($905.34).": "High quality linen stock and pull-up banners. Invoice #29460 paid on 12/06/2026 ($905.34 AUD).",
  "Proveedor principal para merchandising corporativo (remeras, lapiceras, bolsas, manteles).": "Primary corporate merchandise supplier (apparel, pens, calico bags, tablecloths).",
  "Cotización comparativa para pelotas antiestrés y botellas.": "Competitive quote requested for tactile stress relief balls and water bottles.",
  "Lanyards y gorras promocionales.": "Branded lanyards and embroidered promotional caps.",
  "Especialistas en manteles para ferias (tablecloths) y displays de eventos.": "Specialists in event tablecloths, fabric trade-show runners and pull-up displays.",

  // Team Roles
  "Área Leader / Executive Sponsor": "Area Leader / Executive Sponsor",
  "Marketing, Growth & Digital PM": "Marketing, Growth & Digital PM",
  "Team Leader - Witness to War": "Team Leader - Witness to War",
  "Community Development Coordinator": "Community Development Coordinator",
  "Clinical Section Lead (STARTTS)": "Clinical Section Lead (STARTTS)",
  "Project Support & Socials": "Project Support & Socials",
  "External Web & Design Partner": "External Web & Design Partner"
};

function translateContent(text) {
  if (!text) return "";
  if (AppState.lang === "en" && CONTENT_TRANSLATIONS[text]) {
    return CONTENT_TRANSLATIONS[text];
  }
  return text;
}

// Cambia el idioma de la aplicación (Australian English principal + Español)
function setLanguage(lang) {
  if (lang !== "en" && lang !== "es") lang = "en";
  AppState.lang = lang;
  localStorage.setItem("wtwv_lang", lang);

  const langSelector = document.getElementById("languageSelector");
  if (langSelector) langSelector.value = lang;

  updateI18nStaticUI();
  updateNavigationUI();
  renderApp();

  const msg = lang === "en" 
    ? "Language set to Australian English (AU)" 
    : "Idioma cambiado a Español";
  showToast(msg, "info");
}

// Actualiza textos estáticos en header, pestañas y controles
function updateI18nStaticUI() {
  const safeText = (id, text) => {
    const el = document.getElementById(id);
    if (el) el.textContent = text;
  };

  safeText("hdrMissionText", t("missionControl"));
  safeText("hdrSubAgency", t("subAgency"));
  safeText("hdrTitle", t("appTitle"));
  safeText("roleLabelText", t("roleLabel"));
  safeText("shareBtnText", t("shareBtn"));
  safeText("syncStatusText", AppState.isServerSyncActive ? t("liveSync") : t("offlineMode"));

  // Pestañas
  safeText("tabLabelRadar", t("tabRadar"));
  safeText("tabLabelAgency", t("tabAgency"));
  safeText("tabLabelScopeReviews", t("tabScopeReviews"));
  safeText("tabLabelWorkflow", t("tabWorkflow"));
  safeText("tabLabelMedia", t("tabMedia"));
  safeText("tabLabelMerch", t("tabMerch"));
  safeText("tabLabelRaci", t("tabRaci"));
  safeText("tabLabelTimeline", t("tabTimeline"));

  // Input de búsqueda
  const searchInput = document.getElementById("globalSearchInput");
  if (searchInput) {
    searchInput.placeholder = t("searchPlaceholder");
  }

  // Opciones de selector de rol
  const roleSelect = document.getElementById("roleSelector");
  if (roleSelect) {
    const options = roleSelect.options;
    for (let i = 0; i < options.length; i++) {
      if (options[i].value === "executive") options[i].text = t("roleExecutive");
      else if (options[i].value === "agency") options[i].text = t("roleAgency");
      else if (options[i].value === "operations") options[i].text = t("roleOperations");
      else if (options[i].value === "media") options[i].text = t("roleMedia");
      else if (options[i].value === "merch") options[i].text = t("roleMerch");
    }
  }
}

// Inicialización de la app
document.addEventListener("DOMContentLoaded", async () => {
  parseUrlParameters();
  setupEventListeners();
  updateI18nStaticUI();
  await initAppState();
  console.log("Witness to War Control Center initialized in " + AppState.lang + " mode.");
});

/**
 * Lee parámetros de la URL (?role=agency, ?tab=scope-reviews, ?lang=en) para compartir vistas directas
 */
function parseUrlParameters() {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const roleParam = urlParams.get('role');
    const tabParam = urlParams.get('tab');
    const langParam = urlParams.get('lang');

    if (langParam && ["en", "es"].includes(langParam)) {
      AppState.lang = langParam;
      localStorage.setItem("wtwv_lang", langParam);
    }

    if (roleParam && ["executive", "agency", "operations", "media", "merch"].includes(roleParam)) {
      AppState.currentRole = roleParam;
    }
    
    if (tabParam && ["radar", "agency", "scope-reviews", "workflow", "media", "merch", "raci", "timeline"].includes(tabParam)) {
      AppState.activeTab = tabParam;
    } else if (roleParam) {
      if (roleParam === "agency") AppState.activeTab = "agency";
      else if (roleParam === "operations") AppState.activeTab = "workflow";
      else if (roleParam === "media") AppState.activeTab = "media";
      else if (roleParam === "merch") AppState.activeTab = "merch";
      else if (roleParam === "executive") AppState.activeTab = "radar";
    }
  } catch (err) {
    console.warn("Error parsing URL parameters:", err);
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
  showToast(tr(`Vista cambiada a: ${getRoleDisplayName(role)}`, `View changed to: ${getRoleDisplayName(role)}`), "info");
}

function getRoleDisplayName(role) {
  const isEn = AppState.lang === "en";
  switch (role) {
    case "executive": return isEn ? "👑 Executive View (Lachlan)" : "👑 Vista Ejecutiva (Lachlan)";
    case "agency": return isEn ? "🏢 Agency Portal (onmove - Restricted Scope)" : "🏢 Portal Agencia (onmove - Alcance Restringido)";
    case "operations": return isEn ? "👥 Operations (WTWV Team)" : "👥 Vista Operativa (Equipo W2W)";
    case "media": return isEn ? "📈 Growth & Media (Luis)" : "📈 Vista Growth & Redes (Luis)";
    case "merch": return isEn ? "📦 Merchandising & Events" : "📦 Vista Merchandising & Eventos";
    default: return isEn ? "General View" : "Vista General";
  }
}

/**
 * Cambia la pestaña activa con control de acceso por rol
 */
function setActiveTab(tab) {
  const isAgency = AppState.currentRole === "agency";
  const restrictedForAgency = ["radar", "workflow", "media", "merch", "raci"];
  
  // Si la agencia intenta entrar a un área restringida, redirigir a 'agency'
  if (isAgency && restrictedForAgency.includes(tab)) {
    tab = "agency";
    showToast(tr("Acceso restringido: vista interna de STARTTS", "Access restricted: STARTTS internal view"), "info");
  }

  AppState.activeTab = tab;
  updateNavigationUI();
  renderCurrentTab();
}

/**
 * Control de visibilidad de pestañas y restricciones por rol
 */
function updateNavigationUI() {
  const isAgency = AppState.currentRole === "agency";
  const restrictedForAgency = ["radar", "workflow", "media", "merch", "raci"];

  // Si el rol es agencia y está en una pestaña restringida, forzar hacia 'agency'
  if (isAgency && restrictedForAgency.includes(AppState.activeTab)) {
    AppState.activeTab = "agency";
  }

  document.querySelectorAll("[data-nav-tab]").forEach(btn => {
    const tabName = btn.getAttribute("data-nav-tab");
    
    // Ocultar pestañas internas al rol agencia
    if (isAgency && restrictedForAgency.includes(tabName)) {
      btn.style.display = "none";
      return;
    } else {
      btn.style.display = "flex";
    }

    if (tabName === AppState.activeTab) {
      btn.className = "flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold bg-[#323B3F] text-[#96EE89] shadow-sm transition-all whitespace-nowrap";
    } else {
      btn.className = "flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all whitespace-nowrap";
    }
  });

  // Actualizar etiquetas dinámicas según rol
  const tabLabelTimeline = document.getElementById("tabLabelTimeline");
  if (tabLabelTimeline) {
    if (isAgency) {
      tabLabelTimeline.textContent = tr("Cronograma Web (onmove)", "Website Roadmap (onmove)");
    } else {
      tabLabelTimeline.textContent = t("tabTimeline");
    }
  }

  const tabLabelScopeReviews = document.getElementById("tabLabelScopeReviews");
  if (tabLabelScopeReviews) {
    if (isAgency) {
      tabLabelScopeReviews.textContent = tr("Get Help & Alcance Web", "Get Help & Web Scope");
    } else {
      tabLabelScopeReviews.textContent = t("tabScopeReviews");
    }
  }

  // Sincronizar selector de rol
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
 * Renderiza métricas rápidas del header en tema oscuro con filtro de confidencialidad para la agencia
 */
function renderHeaderMetrics() {
  const container = document.getElementById("headerMetrics");
  if (!container || !AppState.data) return;

  const data = AppState.data;
  const isEn = AppState.lang === "en";
  const isAgency = AppState.currentRole === "agency";

  const websiteProgress = data.agencyRoadmap ? Math.round(
    data.agencyRoadmap.phases.reduce((acc, p) => acc + (p.progress || 0), 0) / data.agencyRoadmap.phases.length
  ) : 0;

  // VISTA DE MÉTRICAS EXCLUSIVA PARA LA AGENCIA ONMOVE (Cero filtración de datos de pauta ni cuellos internos)
  if (isAgency) {
    container.innerHTML = `
      <div class="flex flex-wrap items-center gap-2.5">
        <!-- Indicador de Alcance Agencia -->
        <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800 text-[#96EE89] border border-slate-700">
          <span class="w-2 h-2 rounded-full bg-[#96EE89]"></span>
          <span>${tr("Portal Agencia (Alcance Sitio Web & Get Help)", "Agency Portal (Website & Get Help Scope)")}</span>
        </div>

        <!-- Progreso de Sprints Web -->
        <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800/90 text-slate-300 border border-slate-700">
          <span class="text-slate-400">${tr("Sprints Web:", "Website Sprints:")}</span>
          <span class="font-bold text-[#96EE89]">${websiteProgress}%</span>
        </div>

        <!-- Alcance Contratado -->
        <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800/90 text-slate-300 border border-slate-700">
          <span class="text-slate-400">${tr("Alcance Contratado:", "Contracted Scope:")}</span>
          <span class="font-bold text-white">165 hrs ($21,450 AUD)</span>
        </div>

        <!-- Stack Tecnológico -->
        <div class="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800/90 text-slate-300 border border-slate-700">
          <span class="text-slate-400">${tr("Plataforma:", "Platform:")}</span>
          <span class="font-bold text-slate-200">WordPress + Bricks Builder (WCAG 2.1 AA)</span>
        </div>
      </div>

      <!-- Próximo Hito Crítico -->
      <div class="flex items-center gap-2">
        <button onclick="setActiveTab('scope-reviews')" class="flex items-center gap-1.5 px-2.5 py-1 bg-purple-950/90 hover:bg-purple-900 text-purple-200 border border-purple-800 rounded-lg text-xs font-bold transition-all">
          <span class="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
          <span>${tr("📅 Viernes 16 Oct: Sesión de Wireframes", "📅 Fri 16 Oct: Wireframes Session")}</span>
          <svg class="w-3.5 h-3.5 text-purple-300 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
          </svg>
        </button>
      </div>
    `;
    return;
  }

  // VISTA DE MÉTRICAS COMPLETA PARA EQUIPO INTERNO, LACHLAN Y MARKETING
  const totalTasks = data.teamOperations ? data.teamOperations.tasks.length : 0;
  const blockedTasks = data.teamOperations ? data.teamOperations.tasks.filter(t => t.isBlocked).length : 0;
  const metaSpent = data.paidMedia ? data.paidMedia.phase1Meta.spentToDate : 0;
  const metaBudget = data.paidMedia ? data.paidMedia.phase1Meta.totalBudget : 3000;

  container.innerHTML = `
    <div class="flex flex-wrap items-center gap-2.5">
      <!-- Cuellos de Botella -->
      <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
        blockedTasks > 0 ? "bg-amber-950/80 text-amber-300 border border-amber-800" : "bg-emerald-950/80 text-emerald-300 border border-emerald-800"
      }">
        <span class="w-2 h-2 rounded-full ${blockedTasks > 0 ? "bg-amber-400 animate-pulse" : "bg-emerald-400"}"></span>
        <span>${blockedTasks > 0 ? `${blockedTasks} ${tr("Cuellos de Botella", "Bottlenecks")}` : tr("Flujo Despejado", "Workflow Clear")}</span>
      </div>

      <!-- Progreso Sitio Web -->
      <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800/90 text-slate-300 border border-slate-700">
        <span class="text-slate-400">${tr("Sitio Web:", "Website Sprints:")}</span>
        <span class="font-bold text-[#96EE89]">${websiteProgress}%</span>
      </div>

      <!-- Pauta Meta Ads -->
      <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800/90 text-slate-300 border border-slate-700">
        <span class="text-slate-400">Meta Ads:</span>
        <span class="font-bold text-white">$${metaSpent.toFixed(0)} / $${metaBudget} AUD</span>
      </div>

      <!-- Idiomas -->
      <div class="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-800/90 text-slate-300 border border-slate-700">
        <span class="text-slate-400">${tr("Idiomas:", "Languages:")}</span>
        <span class="font-bold text-slate-200">6 (EN, AR, FA, DA, UK, HE)</span>
      </div>
    </div>

    <!-- Próximo Hito Crítico -->
    <div class="flex items-center gap-2">
      <button onclick="setActiveTab('scope-reviews')" class="flex items-center gap-1.5 px-2.5 py-1 bg-purple-950/90 hover:bg-purple-900 text-purple-200 border border-purple-800 rounded-lg text-xs font-bold transition-all">
        <span class="w-2 h-2 rounded-full bg-purple-400 animate-pulse"></span>
        <span>${tr("📅 Viernes 16 Oct: Wireframes onmove", "📅 Fri 16 Oct: onmove Wireframes Session")}</span>
        <svg class="w-3.5 h-3.5 text-purple-300 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
        </svg>
      </button>
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
    case "scope-reviews":
      mainContent.innerHTML = renderScopeReviewsView();
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

/**
 * Listeners específicos para vistas inyectadas
 */
function attachTabSpecificListeners() {
  // Manejador opcional para inicializar interactividad específica
}

// =========================================================================
// MÓDULO 1: RADAR ESTRATÉGICO ("Dónde estamos, Dónde vamos, Próximo paso")
// =========================================================================
function renderRadarView() {
  const radar = AppState.data.strategicRadar;
  const tasks = AppState.data.teamOperations.tasks;
  const blockedTasks = tasks.filter(t => t.isBlocked);
  const isEn = AppState.lang === "en";

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
              <h4 class="text-sm font-bold text-amber-900 uppercase tracking-wider">
                ${tr("Atención de Liderazgo Requerida", "Executive Leadership Attention Required")}
              </h4>
              <p class="text-slate-800 text-sm mt-0.5">
                ${tr(
                  `Hay <strong>${blockedTasks.length} tareas detenidas</strong> afectando el cronograma del sitio web y la presentación de Lachlan. Principal bloqueo: <span class="underline font-semibold">${translateContent(blockedTasks[0].title)}</span> (${translateContent(blockedTasks[0].blockerReason)})`,
                  `There are <strong>${blockedTasks.length} blocked tasks</strong> impacting the website delivery timeline and Lachlan's presentation. Primary bottleneck: <span class="underline font-semibold">${translateContent(blockedTasks[0].title)}</span> (${translateContent(blockedTasks[0].blockerReason)})`
                )}
              </p>
            </div>
          </div>
          <button onclick="setActiveTab('workflow'); AppState.filters.onlyBlocked=true; renderCurrentTab();" 
                  class="whitespace-nowrap px-4 py-2 bg-[#323B3F] hover:bg-slate-900 text-[#96EE89] text-xs font-bold rounded-lg shadow transition-all">
            ${tr("Desbloquear Cuellos de Botella &rarr;", "Unblock Bottlenecks &rarr;")}
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
              <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">${tr("Fase Actual", "Current Phase")}</span>
              <span class="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800">
                ${tr("Octubre 2026", "October 2026")}
              </span>
            </div>
            <h3 class="text-xl font-bold text-[#323B3F] mb-1">${translateContent(radar.whereWeAre.title)}</h3>
            <p class="text-xs text-slate-500 mb-5">${translateContent(radar.whereWeAre.headline)}</p>

            <div class="space-y-4">
              ${radar.whereWeAre.points.map(pt => `
                <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-100">
                  <div class="flex items-center justify-between mb-1">
                    <span class="text-xs font-bold text-slate-800">${translateContent(pt.label)}</span>
                    <span class="text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      pt.badgeColor === 'emerald' ? 'bg-emerald-100 text-emerald-800' :
                      pt.badgeColor === 'amber' ? 'bg-amber-100 text-amber-800' :
                      pt.badgeColor === 'blue' ? 'bg-blue-100 text-blue-800' : 'bg-slate-200 text-slate-700'
                    }">${translateContent(pt.badge)}</span>
                  </div>
                  <p class="text-xs text-slate-600 leading-relaxed">${translateContent(pt.desc)}</p>
                </div>
              `).join('')}
            </div>
          </div>
          <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>${tr("Presupuesto Ejecutado:", "Budget Executed:")}</span>
            <span class="font-bold text-slate-800">$${AppState.data.project.budget.spent.toLocaleString()} / $${AppState.data.project.budget.totalApproved.toLocaleString()} AUD</span>
          </div>
        </div>

        <!-- 2. DÓNDE VAMOS A ESTAR -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between">
          <div class="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#96EE89] to-emerald-500"></div>
          <div>
            <div class="flex items-center justify-between mb-4">
              <span class="text-xs font-bold text-slate-500 uppercase tracking-wider">${tr("Horizonte de Entrega", "Delivery Horizon")}</span>
              <span class="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-100 text-emerald-800">
                ${tr("Hitos Clave", "Key Milestones")}
              </span>
            </div>
            <h3 class="text-xl font-bold text-[#323B3F] mb-1">${translateContent(radar.whereWeAreGoing.title)}</h3>
            <p class="text-xs text-slate-500 mb-5">${translateContent(radar.whereWeAreGoing.headline)}</p>

            <div class="space-y-4">
              ${radar.whereWeAreGoing.milestones.map((ms, idx) => `
                <div class="relative pl-6 pb-2 border-l-2 ${idx === 0 ? 'border-amber-400' : 'border-slate-200'} last:border-transparent">
                  <div class="absolute -left-1.5 top-0.5 w-3 h-3 rounded-full ${
                    idx === 0 ? 'bg-amber-500 ring-4 ring-amber-100' : 'bg-slate-400'
                  }"></div>
                  <span class="text-[11px] font-bold text-slate-400 block uppercase">${translateContent(ms.timeframe)}</span>
                  <h5 class="text-xs font-bold text-slate-900 mt-0.5">${translateContent(ms.title)}</h5>
                  <p class="text-xs text-slate-600 mt-1 leading-relaxed">${translateContent(ms.desc)}</p>
                  <div class="mt-2 flex items-center gap-2">
                    <span class="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-medium">${tr(`Líder: ${ms.owner}`, `Lead: ${ms.owner}`)}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>
          <div class="mt-6 pt-4 border-t border-slate-100 text-center">
            <button onclick="setActiveTab('agency')" class="text-xs font-bold text-[#323B3F] hover:text-emerald-700 flex items-center justify-center gap-1 w-full">
              ${tr("Ver Cronograma de la Agencia onmove &rarr;", "View onmove Agency Roadmap &rarr;")}
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
              <span class="text-xs font-bold text-[#96EE89] uppercase tracking-wider">${tr("Acción Inmediata", "Immediate Action")}</span>
              <span class="px-2.5 py-1 text-xs font-bold rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                ${tr("Prioridad Crítica", "Critical Priority")}
              </span>
            </div>
            <h3 class="text-xl font-bold text-white mb-1">${translateContent(radar.nextStep.title)}</h3>
            <p class="text-xs text-slate-300 mb-5">${translateContent(radar.nextStep.headline)}</p>

            <div class="space-y-4">
              ${radar.nextStep.actions.map(act => `
                <div class="p-4 bg-slate-800/80 backdrop-blur rounded-xl border border-slate-700/60 hover:border-[#96EE89]/60 transition-all">
                  <div class="flex items-center justify-between mb-1.5">
                    <span class="text-[10px] font-bold uppercase tracking-wider text-[#96EE89]">${act.owner}</span>
                    <span class="text-[10px] font-semibold text-amber-300 bg-amber-900/40 px-2 py-0.5 rounded border border-amber-700/50">
                      SLA: ${act.sla}
                    </span>
                  </div>
                  <h5 class="text-sm font-bold text-white mb-1">${translateContent(act.title)}</h5>
                  <p class="text-xs text-slate-300 mb-3 leading-relaxed">${translateContent(act.desc)}</p>
                  
                  ${act.emailTemplate ? `
                    <button onclick="openEmailModal('${act.id}')" 
                            class="w-full py-2 px-3 bg-[#96EE89] hover:bg-[#85de79] text-[#323B3F] text-xs font-bold rounded-lg flex items-center justify-center gap-2 shadow transition-all">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                      </svg>
                      ${translateContent(act.actionBtnText)}
                    </button>
                  ` : `
                    <button onclick="setActiveTab('merch')" 
                            class="w-full py-2 px-3 bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold rounded-lg flex items-center justify-center gap-2 transition-all">
                      ${translateContent(act.actionBtnText)} &rarr;
                    </button>
                  `}
                </div>
              `).join('')}
            </div>
          </div>
          <div class="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400">
            <span>${tr("Regla de Oro:", "Golden Rule:")}</span> ${tr("Un solo responsable por acción para evitar dispersión.", "Single designated owner per action to avoid diffusion of responsibility.")}
          </div>
        </div>

      </div>

      <!-- RESUMEN DE PROGRESO DE LOS 5 FRENTES DEL PROYECTO -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h4 class="text-base font-bold text-[#323B3F] mb-4">${tr("Estado Consolidado por Frentes de Trabajo", "Consolidated Status by Project Workstream")}</h4>
        
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Frente 1: Branding -->
          <div class="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span class="font-bold text-slate-800">${tr("1. Branding & Identidad", "1. Branding & Identity")}</span>
                <span class="font-bold text-emerald-600">100%</span>
              </div>
              <div class="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-2">
                <div class="bg-emerald-500 h-2 rounded-full" style="width: 100%"></div>
              </div>
              <p class="text-[11px] text-slate-600">${tr("Logos multilingües, guía de estilo y mockups recibidos en Drive.", "Multilingual logos, style guide, and mockups delivered on Drive.")}</p>
            </div>
            <span class="mt-3 text-[10px] text-emerald-700 font-bold flex items-center gap-1">
              ${tr("✓ Entregado por onmove", "✓ Delivered by onmove")}
            </span>
          </div>

          <!-- Frente 2: Sitio Web -->
          <div class="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span class="font-bold text-slate-800">${tr("2. Sitio Web (onmove)", "2. Website (onmove)")}</span>
                <span class="font-bold text-amber-600">35%</span>
              </div>
              <div class="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-2">
                <div class="bg-amber-500 h-2 rounded-full" style="width: 35%"></div>
              </div>
              <p class="text-[11px] text-slate-600">${tr("Fase 1 al 85%. Falta validación clínica de 'Get Help' y cronograma.", "Sprint 1 at 85%. Awaiting clinical sign-off of 'Get Help' and timeframe.")}</p>
            </div>
            <button onclick="setActiveTab('agency')" class="mt-3 text-[10px] text-amber-700 font-bold hover:underline flex items-center gap-1">
              ${tr("Ver Timeframes &rarr;", "View Timeframes &rarr;")}
            </button>
          </div>

          <!-- Frente 3: Meta Ads -->
          <div class="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span class="font-bold text-slate-800">${tr("3. Campaña Meta Ads", "3. Meta Ads Campaign")}</span>
                <span class="font-bold text-blue-600">${tr("Activa ($2.5k)", "Active ($2.5k AUD)")}</span>
              </div>
              <div class="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-2">
                <div class="bg-blue-500 h-2 rounded-full" style="width: 42%"></div>
              </div>
              <p class="text-[11px] text-slate-600">${tr("7 conjuntos activos. Monitoreo del volumen de llamadas fuera de NSW.", "7 active ad sets. Monitoring call volume outside NSW.")}</p>
            </div>
            <button onclick="setActiveTab('media')" class="mt-3 text-[10px] text-blue-700 font-bold hover:underline flex items-center gap-1">
              ${tr("Ver Rendimiento &rarr;", "View Performance &rarr;")}
            </button>
          </div>

          <!-- Frente 4: Merch & Eventos -->
          <div class="p-4 rounded-xl bg-slate-50 border border-slate-100 flex flex-col justify-between">
            <div>
              <div class="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span class="font-bold text-slate-800">${tr("4. Merchandising", "4. Merchandise & Print")}</span>
                <span class="font-bold text-indigo-600">55%</span>
              </div>
              <div class="w-full bg-slate-200 h-2 rounded-full overflow-hidden mb-2">
                <div class="bg-indigo-500 h-2 rounded-full" style="width: 55%"></div>
              </div>
              <p class="text-[11px] text-slate-600">${tr("Snap impreso ($905.34). 4 proveedores en cotización de manteles y kits.", "Snap printed ($905.34 AUD). 4 suppliers tendering on runners & kits.")}</p>
            </div>
            <button onclick="setActiveTab('merch')" class="mt-3 text-[10px] text-indigo-700 font-bold hover:underline flex items-center gap-1">
              ${tr("Ver Cotizaciones &rarr;", "View Quotes &rarr;")}
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// =========================================================================
// MÓDULO 2: AGENCIA WEB (onmove) - ROADMAP, TIMEFRAMES Y SPRINT BUILDER
// =========================================================================
function renderAgencyView() {
  const agency = AppState.data.agencyRoadmap;
  const isEn = AppState.lang === "en";

  // Recopilar todos los entregables con su índice de fase
  let allDeliverables = [];
  agency.phases.forEach((phase, pIdx) => {
    (phase.deliverables || []).forEach((del, dIdx) => {
      allDeliverables.push({
        ...del,
        phaseIdx: pIdx,
        delIdx: dIdx,
        phaseName: phase.name,
        phaseId: phase.id,
        owner: del.owner || (pIdx === 0 ? "onmove / Luis" : pIdx === 1 ? "onmove UX/Design" : pIdx === 2 ? "onmove Dev Lead" : "onmove / STARTTS")
      });
    });
  });

  // Conteo de estados
  const completedCount = allDeliverables.filter(d => d.status === "completed").length;
  const inProgressCount = allDeliverables.filter(d => d.status === "in_progress" || d.status === "in_review").length;
  const todoCount = allDeliverables.filter(d => d.status === "pending" || d.status === "todo").length;
  const blockedCount = allDeliverables.filter(d => d.status === "blocked" || d.status === "attention").length;

  // Filtrar según selección activa
  let filteredDeliverables = allDeliverables;
  if (AppState.agencySprintFilter === "completed") {
    filteredDeliverables = filteredDeliverables.filter(d => d.status === "completed");
  } else if (AppState.agencySprintFilter === "in_progress") {
    filteredDeliverables = filteredDeliverables.filter(d => d.status === "in_progress" || d.status === "in_review");
  } else if (AppState.agencySprintFilter === "todo") {
    filteredDeliverables = filteredDeliverables.filter(d => d.status === "pending" || d.status === "todo");
  } else if (AppState.agencySprintFilter === "blocked") {
    filteredDeliverables = filteredDeliverables.filter(d => d.status === "blocked" || d.status === "attention");
  }

  // Filtrar por Sprint / Fase si no es "all"
  if (AppState.agencyPhaseFilter && AppState.agencyPhaseFilter !== "all") {
    filteredDeliverables = filteredDeliverables.filter(d => d.phaseId === AppState.agencyPhaseFilter);
  }

  return `
    <div class="space-y-6 animate-fadeIn">
      <!-- Header de la Agencia y Resumen de Contrato -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div class="flex items-center gap-3">
              <span class="px-3 py-1 bg-slate-900 text-[#96EE89] rounded-lg text-xs font-bold uppercase tracking-wider">
                ${t("agencyTag")}
              </span>
              <span class="text-xs text-slate-500">${t("agencyContracted")} <strong>${agency.agencyName}</strong> (${agency.website})</span>
            </div>
            <h2 class="text-2xl font-bold text-[#323B3F] mt-2">${t("agencyHeadline")}</h2>
            <p class="text-sm text-slate-600 mt-1">
              ${t("agencyProposal")}
            </p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <button onclick="openAddDeliverableModal(0)" class="px-3.5 py-2.5 bg-[#96EE89] hover:bg-[#82d675] text-[#323B3F] text-xs font-extrabold rounded-xl shadow-sm flex items-center gap-1.5 transition-all">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 4v16m8-8H4"/>
              </svg>
              <span>${t("addDeliverableBtn")}</span>
            </button>

            <button onclick="exportAgencySprintToLachlan()" class="px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all" title="Copy formatted sprint schedule for Lachlan">
              <svg class="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
              </svg>
              <span>${t("exportSprintBtn")}</span>
            </button>

            <button onclick="openEmailModal('act-1')" class="px-3.5 py-2.5 bg-[#323B3F] hover:bg-slate-900 text-[#96EE89] text-xs font-bold rounded-xl shadow flex items-center gap-1.5 transition-all">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span>${t("demandTimeframeBtn")}</span>
            </button>

            <a href="https://www.figma.com/design/LH0VieeERNHhgVh4La9TtB/Witness-to-war" target="_blank" 
               class="px-3.5 py-2.5 bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all">
              <svg class="w-4 h-4 text-purple-600" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/>
              </svg>
              <span>${t("openFigmaBtn")}</span>
            </a>
          </div>
        </div>

        <!-- Tarjetas de Información Clave sobre la Agencia -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6">
          <div class="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <span class="text-xs font-bold text-slate-500 uppercase">${t("hoursContracted")}</span>
            <div class="text-2xl font-black text-[#323B3F] mt-1">${agency.totalHours} hrs</div>
            <span class="text-[11px] text-slate-500">${t("fixedRate")}</span>
          </div>

          <div class="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <span class="text-xs font-bold text-slate-500 uppercase">${t("webBudget")}</span>
            <div class="text-2xl font-black text-[#323B3F] mt-1">$${agency.totalBudgetExGst.toLocaleString()} AUD</div>
            <span class="text-[11px] text-slate-500">${t("budgetExcl")}</span>
          </div>

          <div class="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <span class="text-xs font-bold text-slate-500 uppercase">${t("techStack")}</span>
            <div class="text-base font-bold text-slate-800 mt-1">${agency.platform}</div>
            <span class="text-[11px] text-slate-500">${t("wcagStandard")}</span>
          </div>

          <div class="p-4 bg-amber-50 rounded-xl border border-amber-200">
            <span class="text-xs font-bold text-amber-800 uppercase flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              ${t("managementAlert")}
            </span>
            <div class="text-xs font-semibold text-amber-900 mt-1 leading-snug">
              ${t("managementAlertText")}
            </div>
          </div>
        </div>
      </div>

      <!-- MOTOR INTERACTIVO DE TIMEFRAMES: FILTROS DE ESTADO & SPRINT BUILDER -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
              <h3 class="text-lg font-bold text-[#323B3F]">
                ${isEn ? "Interactive Sprint & Timeframe Board" : "Tablero Interactivo de Sprints & Timeframe"}
              </h3>
            </div>
            <p class="text-xs text-slate-500 mt-0.5">
              ${isEn ? "onmove and STARTTS team can edit status, commitment dates, and owners directly." : "onmove y el equipo de STARTTS pueden editar estados, fechas y responsables directamente."}
            </p>
          </div>

          <!-- Selector de Sprint / Fase -->
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-xs font-semibold text-slate-500">${t("filterBySprint")}</span>
            <select onchange="setAgencyPhaseFilter(this.value)" class="text-xs font-bold text-slate-800 bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-[#96EE89]">
              <option value="all" ${AppState.agencyPhaseFilter === "all" ? "selected" : ""}>${t("allPhases")}</option>
              <option value="p1" ${AppState.agencyPhaseFilter === "p1" ? "selected" : ""}>${t("phase1Label")}</option>
              <option value="p2" ${AppState.agencyPhaseFilter === "p2" ? "selected" : ""}>${t("phase2Label")}</option>
              <option value="p3" ${AppState.agencyPhaseFilter === "p3" ? "selected" : ""}>${t("phase3Label")}</option>
              <option value="p4" ${AppState.agencyPhaseFilter === "p4" ? "selected" : ""}>${t("phase4Label")}</option>
            </select>
          </div>
        </div>

        <!-- Botones de Filtrado Rápido por Estado (Lo que se hizo, En desarrollo, Lo que falta, Bloqueado) -->
        <div class="flex flex-wrap items-center gap-2 pt-4 pb-4">
          <button onclick="setAgencySprintFilter('all')" class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
            AppState.agencySprintFilter === 'all' ? 'bg-[#323B3F] text-[#96EE89] shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }">
            ${t("allDeliverables")} (${allDeliverables.length})
          </button>
          
          <button onclick="setAgencySprintFilter('completed')" class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            AppState.agencySprintFilter === 'completed' ? 'bg-emerald-600 text-white shadow-sm' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
          }">
            <span>✓</span>
            <span>${t("laneDone")} (${completedCount})</span>
          </button>

          <button onclick="setAgencySprintFilter('in_progress')" class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            AppState.agencySprintFilter === 'in_progress' ? 'bg-blue-600 text-white shadow-sm' : 'bg-blue-50 text-blue-800 hover:bg-blue-100'
          }">
            <span class="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
            <span>${t("laneInProgress")} (${inProgressCount})</span>
          </button>

          <button onclick="setAgencySprintFilter('todo')" class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            AppState.agencySprintFilter === 'todo' ? 'bg-slate-700 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }">
            <span>⏱</span>
            <span>${t("laneToDo")} (${todoCount})</span>
          </button>

          <button onclick="setAgencySprintFilter('blocked')" class="px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
            AppState.agencySprintFilter === 'blocked' ? 'bg-amber-600 text-white shadow-sm' : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
          }">
            <span>⚠️</span>
            <span>${t("laneBlocked")} (${blockedCount})</span>
          </button>
        </div>

        <!-- LISTA / TABLA INTERACTIVA DE ENTREGABLES EDITABLES -->
        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-700">
            <thead class="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider text-[11px] border-y border-slate-200">
              <tr>
                <th class="py-3 px-3 w-10">#</th>
                <th class="py-3 px-3">${isEn ? "Deliverable & Scope" : "Entregable & Alcance"}</th>
                <th class="py-3 px-3">${isEn ? "Sprint / Phase" : "Sprint / Fase"}</th>
                <th class="py-3 px-3">${t("responsible")}</th>
                <th class="py-3 px-3">${t("status")}</th>
                <th class="py-3 px-3">${t("etaCommitted")}</th>
                <th class="py-3 px-3 text-right">${t("actions")}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100">
              ${filteredDeliverables.length === 0 ? `
                <tr>
                  <td colspan="7" class="py-8 text-center text-slate-400 font-medium">
                    ${isEn ? "No deliverables match this filter." : "No hay entregables que coincidan con este filtro."}
                  </td>
                </tr>
              ` : filteredDeliverables.map((item, idx) => `
                <tr class="hover:bg-slate-50/80 transition-colors">
                  <td class="py-3 px-3 text-slate-400 font-bold">${idx + 1}</td>
                  
                  <!-- Nombre y notas del entregable -->
                  <td class="py-3 px-3">
                    <div class="font-bold text-slate-900 ${item.status === 'completed' ? 'line-through text-slate-400' : ''}">
                      ${translateContent(item.name)}
                    </div>
                    ${item.note ? `<div class="text-[11px] text-slate-500 mt-0.5">${translateContent(item.note)}</div>` : ''}
                  </td>

                  <!-- Sprint / Fase -->
                  <td class="py-3 px-3">
                    <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 whitespace-nowrap">
                      ${translateContent(item.phaseName).split(':')[0]}
                    </span>
                  </td>

                  <!-- Responsable Asignado (Editable inline) -->
                  <td class="py-3 px-3">
                    <select onchange="updateDeliverableOwner(${item.phaseIdx}, ${item.delIdx}, this.value)" 
                            class="text-xs font-semibold bg-white border border-slate-200 rounded-lg px-2 py-1 text-slate-800 focus:ring-1 focus:ring-[#96EE89]">
                      <option value="onmove Dev Lead" ${item.owner.includes("Dev") ? "selected" : ""}>🏢 onmove Dev Lead</option>
                      <option value="onmove UX/Design" ${item.owner.includes("UX") || item.owner.includes("Design") ? "selected" : ""}>🎨 onmove UX/Design</option>
                      <option value="Luis Rastelli (WTWV)" ${item.owner.includes("Luis") ? "selected" : ""}>👤 Luis Rastelli (WTWV Lead)</option>
                      <option value="Joshua (Clinical Lead)" ${item.owner.includes("Joshua") ? "selected" : ""}>🩺 Joshua (Clinical Lead)</option>
                      <option value="Lachlan (Area Lead)" ${item.owner.includes("Lachlan") ? "selected" : ""}>👑 Lachlan (Area Lead)</option>
                      <option value="Yassmen (Translations)" ${item.owner.includes("Yassmen") ? "selected" : ""}>🌐 Yassmen (Translations)</option>
                    </select>
                  </td>

                  <!-- Estado del Entregable (Dropdown Editable) -->
                  <td class="py-3 px-3">
                    <select onchange="updateDeliverableStatus(${item.phaseIdx}, ${item.delIdx}, this.value)"
                            class="text-xs font-bold rounded-lg px-2.5 py-1 border focus:ring-2 focus:ring-[#96EE89] cursor-pointer ${
                              item.status === 'completed' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                              item.status === 'in_progress' || item.status === 'in_review' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                              item.status === 'blocked' || item.status === 'attention' ? 'bg-amber-50 text-amber-800 border-amber-200' :
                              'bg-slate-100 text-slate-700 border-slate-200'
                            }">
                      <option value="completed" ${item.status === 'completed' ? 'selected' : ''}>✓ ${isEn ? "Done" : "Completado"}</option>
                      <option value="in_progress" ${item.status === 'in_progress' || item.status === 'in_review' ? 'selected' : ''}>🔄 ${isEn ? "In Progress" : "En Desarrollo"}</option>
                      <option value="pending" ${item.status === 'pending' || item.status === 'todo' ? 'selected' : ''}>⏱ ${isEn ? "To Do" : "Por Hacer"}</option>
                      <option value="blocked" ${item.status === 'blocked' || item.status === 'attention' ? 'selected' : ''}>⚠️ ${isEn ? "Blocked" : "Bloqueado"}</option>
                    </select>
                  </td>

                  <!-- Fecha Comprometida / ETA (Editable) -->
                  <td class="py-3 px-3">
                    <input type="text" 
                           value="${item.date || 'TBD'}" 
                           onchange="updateDeliverableDate(${item.phaseIdx}, ${item.delIdx}, this.value)"
                           placeholder="YYYY-MM-DD"
                           class="w-28 text-xs font-bold bg-white border border-slate-300 rounded px-2 py-1 text-slate-800 focus:ring-2 focus:ring-[#96EE89]" />
                  </td>

                  <!-- Acciones (Editar / Eliminar) -->
                  <td class="py-3 px-3 text-right whitespace-nowrap">
                    <button onclick="openEditDeliverableModal(${item.phaseIdx}, ${item.delIdx})" 
                            class="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors" title="${t('editBtn')}">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/>
                      </svg>
                    </button>
                    <button onclick="deleteDeliverable(${item.phaseIdx}, ${item.delIdx})" 
                            class="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="${t('deleteBtn')}">
                      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                      </svg>
                    </button>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      </div>

      <!-- DESGLOSE POR FASE CON BARRAS DE PROGRESO Y DEPENDENCIAS STARTTS -->
      <div class="space-y-6">
        <div class="flex items-center justify-between">
          <h3 class="text-lg font-bold text-[#323B3F]">
            ${isEn ? "Detailed Sprint Phases & Agency Delivery Timeline" : "Fases Detalladas de Sprint y Cronograma Oficial"}
          </h3>
          <span class="text-xs text-slate-500">${agency.phases.length} ${isEn ? "Phases Contracted" : "Fases Contratadas"}</span>
        </div>

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
                    ${phase.status === 'completed' ? (isEn ? 'Completed' : 'Completada') :
                      phase.status === 'in_progress' ? (isEn ? 'In Progress' : 'En Curso') :
                      phase.status === 'attention' ? (isEn ? 'Needs Attention' : 'Requiere Atención') : (isEn ? 'Pending ETA' : 'Pendiente de Fechas')}
                  </span>
                  <span class="text-xs text-slate-400 font-medium">${phase.hours} ${isEn ? 'Hours' : 'Horas'} | $${phase.budget.toLocaleString()} AUD</span>
                </div>
                <h3 class="text-lg font-bold text-[#323B3F] mt-1">${translateContent(phase.name)}</h3>
              </div>

              <!-- Input editable para la fecha comprometida (ETA) de la fase -->
              <div class="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
                <span class="text-xs font-bold text-slate-600">${t("etaCommitted")}</span>
                <input type="text" 
                       value="${phase.eta}" 
                       onchange="updatePhaseEta(${pIdx}, this.value)" 
                       class="text-xs font-bold text-slate-900 bg-white border border-slate-300 rounded px-2 py-1 w-36 focus:outline-none focus:ring-2 focus:ring-[#96EE89]"
                       placeholder="YYYY-MM-DD o TBD" />
              </div>
            </div>

            <!-- Barra de Progreso de la Fase -->
            <div class="my-4">
              <div class="flex items-center justify-between text-xs text-slate-500 mb-1">
                <span>${t("estimatedProgress")}</span>
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
              <div class="flex items-center justify-between mb-2">
                <h5 class="text-xs font-bold text-slate-500 uppercase tracking-wider">${t("keyDeliverables")}</h5>
                <button onclick="openAddDeliverableModal(${pIdx})" class="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1">
                  <span>+</span> ${isEn ? "Add item to this phase" : "Agregar entregable a esta fase"}
                </button>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                ${(phase.deliverables || []).map((del, dIdx) => `
                  <div class="p-3 bg-slate-50 rounded-xl border border-slate-100 flex items-start justify-between gap-2 hover:border-slate-200 transition-all">
                    <div class="flex items-start gap-2">
                      <input type="checkbox" 
                             ${del.status === 'completed' ? 'checked' : ''} 
                             onchange="toggleDeliverableStatus(${pIdx}, ${dIdx})"
                             class="mt-1 rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4 border-slate-300 cursor-pointer" />
                      <div>
                        <span class="text-xs font-semibold ${del.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-800'}">
                          ${translateContent(del.name)}
                        </span>
                        ${del.note ? `<p class="text-[11px] text-slate-500 mt-0.5">${translateContent(del.note)}</p>` : ''}
                      </div>
                    </div>
                    <div class="text-right">
                      <span class="text-[10px] font-bold text-slate-500 whitespace-nowrap">${del.date || 'TBD'}</span>
                      <div class="flex items-center justify-end gap-1 mt-1">
                        <button onclick="openEditDeliverableModal(${pIdx}, ${dIdx})" class="text-[10px] text-slate-400 hover:text-slate-700 font-semibold underline">Edit</button>
                      </div>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Dependencia de STARTTS (Qué nos pide la agencia a nosotros) -->
            ${phase.clientDependencies ? `
              <div class="mt-4 p-3 bg-blue-50/70 rounded-xl border border-blue-100 flex items-start gap-2 text-xs text-blue-900">
                <svg class="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
                <div>
                  <strong>${t("clientDependency")}</strong> ${translateContent(phase.clientDependencies)}
                </div>
              </div>
            ` : ''}

          </div>
        `).join('')}
      </div>
    </div>
  `;
}

// Handlers para filtros y acciones de Sprint
function setAgencySprintFilter(filter) {
  AppState.agencySprintFilter = filter;
  renderAgencyView();
}

function setAgencyPhaseFilter(phaseId) {
  AppState.agencyPhaseFilter = phaseId;
  renderAgencyView();
}

function updateDeliverableStatus(phaseIdx, delIdx, newStatus) {
  const phase = AppState.data.agencyRoadmap.phases[phaseIdx];
  if (phase && phase.deliverables[delIdx]) {
    phase.deliverables[delIdx].status = newStatus;
    
    // Recalcular progreso de la fase
    const completedCount = phase.deliverables.filter(d => d.status === "completed").length;
    phase.progress = Math.round((completedCount / phase.deliverables.length) * 100);

    saveAppState();
    renderAgencyView();
    showToast(AppState.lang === "en" ? "Deliverable status updated" : "Estado del entregable actualizado", "success");
  }
}

function updateDeliverableDate(phaseIdx, delIdx, newDate) {
  const phase = AppState.data.agencyRoadmap.phases[phaseIdx];
  if (phase && phase.deliverables[delIdx]) {
    phase.deliverables[delIdx].date = newDate;
    saveAppState();
    showToast(AppState.lang === "en" ? "ETA date updated" : "Fecha comprometida actualizada", "success");
  }
}

function updateDeliverableOwner(phaseIdx, delIdx, newOwner) {
  const phase = AppState.data.agencyRoadmap.phases[phaseIdx];
  if (phase && phase.deliverables[delIdx]) {
    phase.deliverables[delIdx].owner = newOwner;
    saveAppState();
    showToast(AppState.lang === "en" ? "Responsible owner updated" : "Responsable actualizado", "success");
  }
}

function deleteDeliverable(phaseIdx, delIdx) {
  const phase = AppState.data.agencyRoadmap.phases[phaseIdx];
  if (phase && phase.deliverables[delIdx]) {
    const confirmMsg = AppState.lang === "en" 
      ? `Delete deliverable "${phase.deliverables[delIdx].name}"?` 
      : `¿Eliminar entregable "${phase.deliverables[delIdx].name}"?`;
    if (confirm(confirmMsg)) {
      phase.deliverables.splice(delIdx, 1);
      const completedCount = phase.deliverables.filter(d => d.status === "completed").length;
      phase.progress = phase.deliverables.length > 0 ? Math.round((completedCount / phase.deliverables.length) * 100) : 0;
      saveAppState();
      renderAgencyView();
      showToast(AppState.lang === "en" ? "Deliverable deleted" : "Entregable eliminado", "info");
    }
  }
}

function updatePhaseEta(phaseIndex, newEta) {
  if (AppState.data.agencyRoadmap.phases[phaseIndex]) {
    AppState.data.agencyRoadmap.phases[phaseIndex].eta = newEta;
    saveAppState();
    showToast(`Fecha de entrega actualizada para ${AppState.data.agencyRoadmap.phases[phaseIndex].name}`, "success");
  }
}

function toggleDeliverableStatus(phaseIndex, deliverableIndex) {
  const phase = AppState.data.agencyRoadmap.phases[phaseIndex];
  if (phase && phase.deliverables[deliverableIndex]) {
    const current = phase.deliverables[deliverableIndex].status;
    phase.deliverables[deliverableIndex].status = current === "completed" ? "pending" : "completed";
    
    const completedCount = phase.deliverables.filter(d => d.status === "completed").length;
    phase.progress = Math.round((completedCount / phase.deliverables.length) * 100);

    saveAppState();
    renderAgencyView();
    showToast(AppState.lang === "en" ? "Deliverable status updated" : "Estado del entregable actualizado", "success");
  }
}

// Modal para agregar nuevo entregable
function openAddDeliverableModal(preselectedPhaseIdx = 0) {
  const isEn = AppState.lang === "en";
  const modalContainer = document.getElementById("modalContainer");
  if (!modalContainer) return;

  AppState.modalOpen = "deliverableModal";

  modalContainer.innerHTML = `
    <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-scaleUp">
        <div class="flex items-center justify-between pb-4 border-b border-slate-100">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-[#96EE89]"></span>
            <h3 class="text-lg font-bold text-[#323B3F]">
              ${isEn ? "Add New Deliverable / Sprint Item" : "Agregar Nuevo Entregable / Tarea de Sprint"}
            </h3>
          </div>
          <button onclick="closeModal()" class="text-slate-400 hover:text-slate-700 font-bold text-lg">&times;</button>
        </div>

        <form id="addDeliverableForm" onsubmit="handleAddDeliverableSubmit(event)" class="space-y-4 pt-4 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">${isEn ? "Deliverable Title" : "Título del Entregable"}:</label>
            <input type="text" id="newDelName" required placeholder="${isEn ? 'e.g. Implement RTL styling for Arabic & Hebrew' : 'Ej: Implementar estilos RTL para Árabe y Hebreo'}"
                   class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium text-slate-900 focus:ring-2 focus:ring-[#96EE89]" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">${isEn ? "Phase / Sprint" : "Fase / Sprint"}:</label>
              <select id="newDelPhase" class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium text-slate-800">
                ${AppState.data.agencyRoadmap.phases.map((p, idx) => `
                  <option value="${idx}" ${idx === preselectedPhaseIdx ? 'selected' : ''}>${p.name.split(':')[0]}</option>
                `).join('')}
              </select>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">${t("responsible")}:</label>
              <select id="newDelOwner" class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium text-slate-800">
                <option value="onmove Dev Lead">🏢 onmove Dev Lead</option>
                <option value="onmove UX/Design">🎨 onmove UX/Design</option>
                <option value="Luis Rastelli (WTWV)">👤 Luis Rastelli (WTWV Lead)</option>
                <option value="Joshua (Clinical Lead)">🩺 Joshua (Clinical Lead)</option>
                <option value="Lachlan (Area Lead)">👑 Lachlan (Area Lead)</option>
                <option value="Yassmen (Translations)">🌐 Yassmen (Translations)</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">${t("etaCommitted")}:</label>
              <input type="date" id="newDelDate" value="2026-11-15"
                     class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium text-slate-800" />
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">${t("status")}:</label>
              <select id="newDelStatus" class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium text-slate-800">
                <option value="pending">${isEn ? "To Do" : "Por Hacer"}</option>
                <option value="in_progress">${isEn ? "In Progress" : "En Desarrollo"}</option>
                <option value="completed">${isEn ? "Completed" : "Completado"}</option>
                <option value="blocked">${isEn ? "Blocked" : "Bloqueado"}</option>
              </select>
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">${isEn ? "Notes or Dependencies" : "Notas o Dependencias"}:</label>
            <input type="text" id="newDelNote" placeholder="${isEn ? 'e.g. Depends on translated copy from Yassmen' : 'Ej: Requiere textos traducidos de Yassmen'}"
                   class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium text-slate-800" />
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button type="button" onclick="closeModal()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold">
              ${isEn ? "Cancel" : "Cancelar"}
            </button>
            <button type="submit" class="px-4 py-2 bg-[#96EE89] hover:bg-[#82d675] text-[#323B3F] rounded-xl font-extrabold shadow">
              ${isEn ? "Save Deliverable" : "Guardar Entregable"}
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function handleAddDeliverableSubmit(e) {
  e.preventDefault();
  const phaseIdx = parseInt(document.getElementById("newDelPhase").value, 10);
  const name = document.getElementById("newDelName").value;
  const owner = document.getElementById("newDelOwner").value;
  const date = document.getElementById("newDelDate").value;
  const status = document.getElementById("newDelStatus").value;
  const note = document.getElementById("newDelNote").value;

  const phase = AppState.data.agencyRoadmap.phases[phaseIdx];
  if (phase) {
    if (!phase.deliverables) phase.deliverables = [];
    phase.deliverables.push({ name, owner, date, status, note });

    const completedCount = phase.deliverables.filter(d => d.status === "completed").length;
    phase.progress = Math.round((completedCount / phase.deliverables.length) * 100);

    saveAppState();
    closeModal();
    renderAgencyView();
    showToast(AppState.lang === "en" ? "Deliverable added to sprint" : "Entregable agregado al sprint", "success");
  }
}

// Modal para editar entregable existente
function openEditDeliverableModal(phaseIdx, delIdx) {
  const isEn = AppState.lang === "en";
  const modalContainer = document.getElementById("modalContainer");
  if (!modalContainer) return;

  const phase = AppState.data.agencyRoadmap.phases[phaseIdx];
  if (!phase || !phase.deliverables[delIdx]) return;
  const del = phase.deliverables[delIdx];

  AppState.modalOpen = "deliverableModal";

  modalContainer.innerHTML = `
    <div class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div class="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-scaleUp">
        <div class="flex items-center justify-between pb-4 border-b border-slate-100">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-blue-500"></span>
            <h3 class="text-lg font-bold text-[#323B3F]">
              ${isEn ? "Edit Deliverable / Timeframe" : "Editar Entregable / Plazo"}
            </h3>
          </div>
          <button onclick="closeModal()" class="text-slate-400 hover:text-slate-700 font-bold text-lg">&times;</button>
        </div>

        <form id="editDeliverableForm" onsubmit="handleEditDeliverableSubmit(event, ${phaseIdx}, ${delIdx})" class="space-y-4 pt-4 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">${isEn ? "Deliverable Title" : "Título del Entregable"}:</label>
            <input type="text" id="editDelName" required value="${del.name.replace(/"/g, '&quot;')}"
                   class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium text-slate-900 focus:ring-2 focus:ring-[#96EE89]" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">${t("responsible")}:</label>
              <select id="editDelOwner" class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium text-slate-800">
                <option value="onmove Dev Lead" ${(del.owner || '').includes("Dev") ? "selected" : ""}>🏢 onmove Dev Lead</option>
                <option value="onmove UX/Design" ${(del.owner || '').includes("UX") || (del.owner || '').includes("Design") ? "selected" : ""}>🎨 onmove UX/Design</option>
                <option value="Luis Rastelli (WTWV)" ${(del.owner || '').includes("Luis") ? "selected" : ""}>👤 Luis Rastelli (WTWV Lead)</option>
                <option value="Joshua (Clinical Lead)" ${(del.owner || '').includes("Joshua") ? "selected" : ""}>🩺 Joshua (Clinical Lead)</option>
                <option value="Lachlan (Area Lead)" ${(del.owner || '').includes("Lachlan") ? "selected" : ""}>👑 Lachlan (Area Lead)</option>
                <option value="Yassmen (Translations)" ${(del.owner || '').includes("Yassmen") ? "selected" : ""}>🌐 Yassmen (Translations)</option>
              </select>
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">${t("status")}:</label>
              <select id="editDelStatus" class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium text-slate-800">
                <option value="pending" ${del.status === 'pending' || del.status === 'todo' ? 'selected' : ''}>${isEn ? "To Do" : "Por Hacer"}</option>
                <option value="in_progress" ${del.status === 'in_progress' || del.status === 'in_review' ? 'selected' : ''}>${isEn ? "In Progress" : "En Desarrollo"}</option>
                <option value="completed" ${del.status === 'completed' ? 'selected' : ''}>${isEn ? "Completed" : "Completado"}</option>
                <option value="blocked" ${del.status === 'blocked' || del.status === 'attention' ? 'selected' : ''}>${isEn ? "Blocked" : "Bloqueado"}</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">${t("etaCommitted")}:</label>
              <input type="text" id="editDelDate" value="${del.date || ''}" placeholder="YYYY-MM-DD"
                     class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium text-slate-800" />
            </div>

            <div>
              <label class="block font-bold text-slate-700 mb-1">${isEn ? "Notes or Dependencies" : "Notas o Dependencias"}:</label>
              <input type="text" id="editDelNote" value="${(del.note || '').replace(/"/g, '&quot;')}"
                     class="w-full bg-slate-50 border border-slate-300 rounded-lg p-2.5 font-medium text-slate-800" />
            </div>
          </div>

          <div class="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button type="button" onclick="closeModal()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold">
              ${isEn ? "Cancel" : "Cancelar"}
            </button>
            <button type="submit" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow">
              ${isEn ? "Update Deliverable" : "Actualizar Entregable"}
            </button>
          </div>
        </form>
      </div>
    </div>
  `;
}

function handleEditDeliverableSubmit(e, phaseIdx, delIdx) {
  e.preventDefault();
  const phase = AppState.data.agencyRoadmap.phases[phaseIdx];
  if (phase && phase.deliverables[delIdx]) {
    phase.deliverables[delIdx].name = document.getElementById("editDelName").value;
    phase.deliverables[delIdx].owner = document.getElementById("editDelOwner").value;
    phase.deliverables[delIdx].status = document.getElementById("editDelStatus").value;
    phase.deliverables[delIdx].date = document.getElementById("editDelDate").value;
    phase.deliverables[delIdx].note = document.getElementById("editDelNote").value;

    const completedCount = phase.deliverables.filter(d => d.status === "completed").length;
    phase.progress = Math.round((completedCount / phase.deliverables.length) * 100);

    saveAppState();
    closeModal();
    renderAgencyView();
    showToast(AppState.lang === "en" ? "Deliverable updated successfully" : "Entregable actualizado exitosamente", "success");
  }
}

// Exporta resumen oficial de sprints para Lachlan
function exportAgencySprintToLachlan() {
  const agency = AppState.data.agencyRoadmap;
  const isEn = AppState.lang === "en";

  let report = `========================================================\n`;
  report += `WITNESS TO WAR & VIOLENCE — OFFICIAL WEBSITE SPRINT TIMEFRAME\n`;
  report += `Agency: onmove (${agency.website}) | Total Contracted: ${agency.totalHours} hrs ($${agency.totalBudgetExGst} AUD ex GST)\n`;
  report += `Status Date: ${new Date().toLocaleDateString('en-AU')}\n`;
  report += `========================================================\n\n`;

  agency.phases.forEach((phase, idx) => {
    report += `SPRINT ${idx + 1}: ${phase.name.toUpperCase()}\n`;
    report += `Status: ${phase.status.toUpperCase()} | Progress: ${phase.progress}% | ETA: ${phase.eta}\n`;
    report += `Internal STARTTS Dependency: ${phase.clientDependencies || 'None'}\n`;
    report += `Deliverables:\n`;
    (phase.deliverables || []).forEach(d => {
      const mark = d.status === 'completed' ? '[x] COMPLETED' : d.status === 'in_progress' ? '[~] IN PROGRESS' : d.status === 'blocked' ? '[!] BLOCKED' : '[ ] TO DO';
      report += `  ${mark} - ${d.name} (Owner: ${d.owner || 'onmove'}, ETA: ${d.date || 'TBD'})\n`;
    });
    report += `\n`;
  });

  navigator.clipboard.writeText(report).then(() => {
    showToast(isEn ? "Sprint schedule copied to clipboard for Lachlan" : "Cronograma de sprint copiado para enviar a Lachlan", "success");
  }).catch(() => {
    alert(report);
  });
}

// =========================================================================
// MÓDULO NUEVO: REVISIÓN DE ALCANCE (GET HELP, FASSTT & VIDEOS)
// =========================================================================
function renderScopeReviewsView() {
  const reviews = AppState.data.websiteReviews || (window.WTW_INITIAL_DATA && window.WTW_INITIAL_DATA.websiteReviews) || {};
  const isEn = AppState.lang === "en";

  const getHelp = reviews.getHelp || {};
  const aboutUs = reviews.aboutUs || {};
  const fasstt = reviews.fassttNetwork || {};
  const videos = reviews.videoContent || {};
  const starttsPending = reviews.starttsPending || {};

  // Filtrado de oficinas FASSTT por estado
  let offices = fasstt.offices || [];
  if (AppState.fassttFilter && AppState.fassttFilter !== "all") {
    offices = offices.filter(o => o.state === AppState.fassttFilter);
  }

  const isFeelingsSignedOff = getHelp.isSignedOff || false;

  return `
    <div class="space-y-8 animate-fadeIn">
      
      <!-- HEADER PRINCIPAL DEL MÓDULO -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div class="flex items-center gap-2">
              <span class="px-3 py-1 bg-purple-900 text-[#96EE89] rounded-lg text-xs font-bold uppercase tracking-wider">
                ${isEn ? "Scope Reviews & Deliverables" : "Revisión de Alcance & Entregables"}
              </span>
              <span class="text-xs text-slate-500">${isEn ? "Clinical sign-off & multi-state coverage" : "Validación clínica y cobertura interestatal"}</span>
            </div>
            <h2 class="text-2xl font-bold text-[#323B3F] mt-2">${t("scopeTitle")}</h2>
            <p class="text-sm text-slate-600 mt-1">${t("scopeSubtitle")}</p>
          </div>

          <div class="flex flex-wrap items-center gap-2">
            <a href="#scope-gethelp" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all">Get Help</a>
            <a href="#scope-aboutus" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all">About Us</a>
            <a href="#scope-fasstt" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all">FASSTT (8)</a>
            <a href="#scope-videos" class="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition-all">Videos</a>
            <a href="#scope-startts" class="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold rounded-lg transition-all">STARTTS Pending</a>
          </div>
        </div>
      </div>

      <!-- SECCIÓN 1: GET HELP & SESIÓN DE WIREFRAMES DE MAÑANA (VIERNES 16 OCT) -->
      <div id="scope-gethelp" class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
        
        <!-- Alerta de Sesión de Mañana con onmove -->
        <div class="bg-gradient-to-r from-purple-50 via-purple-100/60 to-indigo-50 border-l-4 border-purple-600 p-5 rounded-xl shadow-sm">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div class="flex items-start gap-3">
              <div class="p-2.5 bg-purple-600 text-white rounded-xl shadow-sm flex-shrink-0">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                </svg>
              </div>
              <div>
                <div class="flex items-center gap-2">
                  <span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-200 text-purple-900 uppercase">
                    ${isEn ? "Tomorrow Friday 16 Oct" : "Mañana Viernes 16 Oct"}
                  </span>
                  <span class="text-xs font-bold text-purple-900">${getHelp.title}</span>
                </div>
                <h3 class="text-lg font-bold text-slate-900 mt-0.5">${t("tomorrowAlertTitle")}</h3>
                <p class="text-xs text-slate-600 mt-1">${t("tomorrowAlertDesc")}</p>
              </div>
            </div>

            <div class="flex items-center gap-2">
              <a href="https://www.figma.com/design/LH0VieeERNHhgVh4La9TtB/Witness-to-war?node-id=1492-6" target="_blank"
                 class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow flex items-center gap-2 transition-all">
                <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l6 4.5-6 4.5z"/>
                </svg>
                ${isEn ? "Open Figma Wireframes" : "Ver Wireframes en Figma"}
              </a>
            </div>
          </div>

          <!-- Checklist de Verificación de Wireframes para la Reunión de Mañana -->
          <div class="mt-4 pt-4 border-t border-purple-200/80 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div class="flex items-center gap-2 bg-white/80 p-2.5 rounded-lg border border-purple-200">
              <span class="text-emerald-600 font-bold">✓</span>
              <span>${isEn ? "Mobile tap targets & WCAG 2.1 AA" : "Áreas táctiles móviles y WCAG 2.1"}</span>
            </div>
            <div class="flex items-center gap-2 bg-white/80 p-2.5 rounded-lg border border-purple-200">
              <span class="text-emerald-600 font-bold">✓</span>
              <span>${isEn ? "Single feeling tag selector UX" : "Selector de emoción único"}</span>
            </div>
            <div class="flex items-center gap-2 bg-white/80 p-2.5 rounded-lg border border-purple-200">
              <span class="text-amber-600 font-bold">⚠️</span>
              <span>${isEn ? "RTL layout mirror (Arabic/Hebrew)" : "Espejo RTL para Árabe/Hebreo"}</span>
            </div>
            <div class="flex items-center gap-2 bg-white/80 p-2.5 rounded-lg border border-purple-200">
              <span class="text-blue-600 font-bold">ℹ</span>
              <span>${isEn ? "Safety exit persistent on screen" : "Botón de salida segura visible"}</span>
            </div>
          </div>
        </div>

        <!-- 3 Columnas: Temas Cerrados, Técnicas Cerradas, y 8 Emociones Pendientes de Joshua -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          <!-- Columna 1: 4 Temas Cerrados -->
          <div class="p-5 bg-slate-50 rounded-2xl border border-slate-200">
            <div class="flex items-center justify-between pb-3 border-b border-slate-200">
              <span class="text-xs font-bold text-slate-700 uppercase">${t("lockedTopics")}</span>
              <span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800">4 Locked</span>
            </div>
            <ul class="mt-3 space-y-2 text-xs text-slate-800">
              ${(getHelp.lockedTopics || []).map(topic => `
                <li class="flex items-start gap-2 p-2 bg-white rounded-lg border border-slate-100 shadow-2xs">
                  <span class="text-emerald-600 font-bold mt-0.5">✓</span>
                  <span class="font-medium">${translateContent(topic)}</span>
                </li>
              `).join('')}
            </ul>
          </div>

          <!-- Columna 2: 4 Técnicas de Autoayuda Cerradas -->
          <div class="p-5 bg-slate-50 rounded-2xl border border-slate-200">
            <div class="flex items-center justify-between pb-3 border-b border-slate-200">
              <span class="text-xs font-bold text-slate-700 uppercase">${t("lockedTechniques")}</span>
              <span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-emerald-100 text-emerald-800">4 Locked</span>
            </div>
            <ul class="mt-3 space-y-2 text-xs text-slate-800">
              ${(getHelp.lockedTechniques || []).map(tech => `
                <li class="flex items-start gap-2 p-2 bg-white rounded-lg border border-slate-100 shadow-2xs">
                  <span class="text-emerald-600 font-bold mt-0.5">✓</span>
                  <span class="font-medium">${translateContent(tech)}</span>
                </li>
              `).join('')}
            </ul>
          </div>

          <!-- Columna 3: 8 Emociones / Sentimientos Pendientes de Firma de Joshua -->
          <div class="p-5 bg-amber-50/70 rounded-2xl border border-amber-200">
            <div class="flex items-center justify-between pb-3 border-b border-amber-200">
              <span class="text-xs font-bold text-amber-900 uppercase">${isEn ? "8 Emotional States" : "8 Estados Emocionales"}</span>
              <span class="px-2 py-0.5 rounded text-[10px] font-extrabold ${isFeelingsSignedOff ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-200 text-amber-900'}">
                ${isFeelingsSignedOff ? (isEn ? 'Signed-off' : 'Firmado') : (isEn ? 'Pending Joshua' : 'Pendiente Joshua')}
              </span>
            </div>
            <p class="text-[11px] text-amber-800 mt-2">
              ${isEn ? "Joshua must formally sign off on this clinical taxonomy to unblock Bricks Builder filters." : "Joshua debe firmar esta taxonomía clínica para desbloquear los filtros en Bricks Builder."}
            </p>
            <div class="mt-3 flex flex-wrap gap-1.5">
              ${(getHelp.pendingFeelingsSignoff || []).map(feeling => `
                <span class="px-2.5 py-1 bg-white border border-amber-200 text-amber-900 rounded-lg text-xs font-bold">
                  ${translateContent(feeling)}
                </span>
              `).join('')}
            </div>
            <div class="mt-4 pt-3 border-t border-amber-200">
              <button onclick="toggleJoshuaSignoff()" class="w-full py-2 px-3 rounded-xl text-xs font-extrabold shadow transition-all ${
                isFeelingsSignedOff ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-amber-600 hover:bg-amber-700 text-white'
              }">
                ${isFeelingsSignedOff ? t("alreadySignedOff") : t("signoffAsJoshua")}
              </button>
            </div>
          </div>

        </div>

        <!-- HOJA DE RUTA Y FECHAS DE ENTREGA DE GET HELP -->
        <div class="mt-6 pt-6 border-t border-slate-200">
          <h4 class="text-sm font-bold text-slate-900 mb-3">${t("getHelpRoadmap")}</h4>
          <div class="space-y-3">
            ${(getHelp.nextSteps || []).map(step => `
              <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div class="flex items-start gap-3">
                  <span class="w-2.5 h-2.5 rounded-full ${step.status === 'upcoming' ? 'bg-purple-500 animate-pulse' : 'bg-slate-400'} mt-1.5"></span>
                  <div>
                    <h5 class="text-xs font-bold text-slate-900">${translateContent(step.step)}</h5>
                    <p class="text-[11px] text-slate-500 mt-0.5">${translateContent(step.note)}</p>
                  </div>
                </div>
                <div class="flex items-center gap-3 text-right">
                  <span class="px-2.5 py-1 bg-white rounded-lg text-xs font-bold text-slate-700 border border-slate-200">
                    👤 ${step.owner}
                  </span>
                  <span class="px-2.5 py-1 bg-slate-900 text-[#96EE89] rounded-lg text-xs font-bold">
                    📅 ${step.date}
                  </span>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

      </div>

      <!-- SECCIÓN 2: ABOUT US (REVISIÓN DE QUÉ SE HIZO Y QUÉ FALTA) -->
      <div id="scope-aboutus" class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold uppercase tracking-wider text-slate-400">Website Section</span>
              <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-800">In Review</span>
            </div>
            <h3 class="text-lg font-bold text-[#323B3F] mt-1">${t("aboutUsTitle")}</h3>
            <p class="text-xs text-slate-500">${t("aboutUsSubtitle")}</p>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
          ${(aboutUs.checklist || []).map((item, idx) => `
            <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex items-start justify-between gap-3">
              <div class="flex items-start gap-2.5">
                <input type="checkbox" 
                       ${item.status === 'completed' ? 'checked' : ''} 
                       onchange="toggleAboutUsItem(${idx})"
                       class="mt-1 rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4 border-slate-300 cursor-pointer" />
                <div>
                  <span class="text-xs font-bold ${item.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900'}">
                    ${translateContent(item.item)}
                  </span>
                  <p class="text-[11px] text-slate-500 mt-0.5">${translateContent(item.note)}</p>
                </div>
              </div>
              <span class="px-2 py-0.5 rounded text-[10px] font-extrabold whitespace-nowrap ${
                item.status === 'completed' ? 'bg-emerald-100 text-emerald-800' :
                item.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                item.status === 'pending_review' ? 'bg-purple-100 text-purple-800' : 'bg-slate-200 text-slate-700'
              }">
                ${item.status === 'completed' ? (isEn ? 'Done' : 'Listo') : item.status === 'pending_review' ? (isEn ? 'Needs Review' : 'En Revisión') : (isEn ? 'In Progress' : 'En Curso')}
              </span>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- SECCIÓN 3: RED NACIONAL DE SOCIOS FASSTT (OFICINAS EN TODA AUSTRALIA) -->
      <div id="scope-fasstt" class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-100 text-blue-800 uppercase">National Network</span>
              <span class="text-xs text-slate-500">${isEn ? "8 States & Territories" : "8 Estados y Territorios"}</span>
            </div>
            <h3 class="text-lg font-bold text-[#323B3F] mt-1">${t("fassttTitle")}</h3>
            <p class="text-xs text-slate-500">${t("fassttSubtitle")}</p>
          </div>

          <!-- Filtro por Estado (Pills) -->
          <div class="flex flex-wrap items-center gap-1.5">
            ${["all", "NSW", "VIC", "QLD", "SA", "WA", "TAS", "NT", "ACT"].map(st => `
              <button onclick="setFassttFilter('${st}')" class="px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                AppState.fassttFilter === st ? 'bg-slate-900 text-[#96EE89] shadow-sm' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }">
                ${st === 'all' ? t("allStates") : st}
              </button>
            `).join('')}
          </div>
        </div>

        <!-- Grid de Tarjetas de Oficinas FASSTT -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-2">
          ${offices.map(partner => `
            <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between hover:border-slate-300 transition-all ${partner.isLead ? 'ring-2 ring-emerald-400 bg-emerald-50/30' : ''}">
              <div>
                <div class="flex items-center justify-between">
                  <span class="px-2 py-0.5 bg-slate-800 text-[#96EE89] rounded text-[11px] font-extrabold">
                    ${partner.state}
                  </span>
                  ${partner.isLead ? `
                    <span class="px-2 py-0.5 bg-emerald-600 text-white rounded text-[10px] font-bold">
                      NSW Lead
                    </span>
                  ` : ''}
                </div>
                <h4 class="text-sm font-bold text-slate-900 mt-2">${partner.agency}</h4>
                <p class="text-[11px] text-slate-600 mt-0.5 line-clamp-2">${partner.name}</p>
                <div class="mt-3 text-[11px] text-slate-500">
                  <strong>Locations:</strong> ${partner.locations}
                </div>
              </div>

              <div class="mt-4 pt-3 border-t border-slate-200 flex items-center justify-between text-xs">
                <a href="tel:${partner.phone.replace(/[^0-9]/g, '')}" class="text-blue-700 font-bold hover:underline flex items-center gap-1">
                  📞 ${partner.phone}
                </a>
                <a href="${partner.website}" target="_blank" class="text-slate-500 hover:text-slate-900 font-semibold text-[11px] flex items-center gap-0.5">
                  Web &rarr;
                </a>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- SECCIÓN 4: CREACIÓN DE CONTENIDO DE VIDEOS (4 GET HELP + 1 INSTITUCIONAL) -->
      <div id="scope-videos" class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-indigo-100 text-indigo-800 uppercase">Video Production</span>
              <span class="text-xs text-slate-500">${isEn ? "4 Toolkits + 1 Brand Story" : "4 Técnicas + 1 Institucional"}</span>
            </div>
            <h3 class="text-lg font-bold text-[#323B3F] mt-1">${t("videosTitle")}</h3>
            <p class="text-xs text-slate-500">${t("videosSubtitle")}</p>
          </div>
        </div>

        <div class="space-y-3 pt-2">
          ${(videos.videos || []).map((video, vIdx) => `
            <div class="p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 transition-all">
              <div class="flex items-start gap-3">
                <div class="p-2.5 bg-indigo-100 text-indigo-700 rounded-xl flex-shrink-0 mt-0.5">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                  </svg>
                </div>
                <div>
                  <div class="flex items-center gap-2">
                    <span class="px-2 py-0.5 bg-slate-200 text-slate-800 rounded text-[10px] font-bold">${translateContent(video.type)}</span>
                    <span class="text-[11px] text-slate-400">${isEn ? "Subtitles: 6 languages" : `Subtítulos: ${video.subtitles}`}</span>
                  </div>
                  <h4 class="text-sm font-bold text-slate-900 mt-1">${translateContent(video.title)}</h4>
                  <p class="text-xs text-slate-600 mt-0.5">${translateContent(video.specs)}</p>
                </div>
              </div>

              <!-- Selector de Estado de Video y Fecha Comprometida -->
              <div class="flex flex-wrap items-center gap-2.5">
                <div class="text-right">
                  <span class="text-[11px] text-slate-400 block">${isEn ? "Owner:" : "Líder:"} <strong>${video.owner}</strong></span>
                  <input type="text" 
                         value="${video.eta}" 
                         onchange="updateVideoEta(${vIdx}, this.value)"
                         class="text-xs font-bold text-slate-800 bg-white border border-slate-300 rounded px-2 py-1 mt-1 w-28 focus:ring-1 focus:ring-[#96EE89]" />
                </div>

                <select onchange="updateVideoStatus(${vIdx}, this.value)"
                        class="text-xs font-bold rounded-lg px-2.5 py-1.5 border focus:ring-2 focus:ring-[#96EE89] cursor-pointer ${
                          video.status === 'ready' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
                          video.status === 'filming' || video.status === 'editing' ? 'bg-blue-50 text-blue-800 border-blue-200' :
                          'bg-indigo-50 text-indigo-800 border-indigo-200'
                        }">
                  <option value="scripting" ${video.status === 'scripting' ? 'selected' : ''}>📝 Scripting</option>
                  <option value="storyboard" ${video.status === 'storyboard' ? 'selected' : ''}>🎨 Storyboard</option>
                  <option value="filming" ${video.status === 'filming' ? 'selected' : ''}>🎬 Filming</option>
                  <option value="editing" ${video.status === 'editing' ? 'selected' : ''}>✂️ Editing</option>
                  <option value="subtitles" ${video.status === 'subtitles' ? 'selected' : ''}>🌐 Subtitling (6 langs)</option>
                  <option value="ready" ${video.status === 'ready' ? 'selected' : ''}>✓ Ready / Published</option>
                </select>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

      <!-- SECCIÓN 5: ENTREGABLES PENDIENTES POR PARTE DE STARTTS (HACIA LA AGENCIA) -->
      <div id="scope-startts" class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div>
            <div class="flex items-center gap-2">
              <span class="px-2 py-0.5 rounded text-[10px] font-extrabold bg-amber-100 text-amber-800 uppercase">STARTTS Internal</span>
              <span class="text-xs text-slate-500">${isEn ? "Avoid deflection of agency delays" : "Evitar que la agencia defienda demoras"}</span>
            </div>
            <h3 class="text-lg font-bold text-[#323B3F] mt-1">${t("starttsPendingTitle")}</h3>
            <p class="text-xs text-slate-500">${t("starttsPendingSubtitle")}</p>
          </div>
        </div>

        <div class="space-y-3 pt-2">
          ${(starttsPending.items || []).map((item, idx) => `
            <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:border-slate-300 transition-all">
              <div class="flex items-start gap-3">
                <input type="checkbox" 
                       ${item.status === 'completed' ? 'checked' : ''} 
                       onchange="toggleStarttsPendingItem(${idx})"
                       class="mt-1 rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4 border-slate-300 cursor-pointer" />
                <div>
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-bold ${item.status === 'completed' ? 'line-through text-slate-400' : 'text-slate-900'}">
                      ${translateContent(item.title)}
                    </span>
                    <span class="px-2 py-0.5 rounded text-[10px] font-extrabold ${
                      item.urgency === 'critical' ? 'bg-red-100 text-red-800' :
                      item.urgency === 'high' ? 'bg-amber-100 text-amber-800' : 'bg-slate-200 text-slate-700'
                    }">
                      ${item.urgency.toUpperCase()}
                    </span>
                  </div>
                  <p class="text-[11px] text-slate-500 mt-0.5">${translateContent(item.note)}</p>
                </div>
              </div>

              <div class="flex items-center gap-2.5 text-right whitespace-nowrap">
                <span class="text-xs font-bold text-slate-700 bg-white border border-slate-200 rounded-lg px-2.5 py-1">
                  👤 ${item.owner}
                </span>
                <span class="text-xs font-bold ${item.dueDate === '2026-10-16' ? 'bg-purple-100 text-purple-900 border border-purple-300' : 'bg-slate-900 text-[#96EE89]'} rounded-lg px-2.5 py-1">
                  📅 ${item.dueDate}
                </span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>

    </div>
  `;
}

// Handlers interactivos para Scope Reviews
function toggleJoshuaSignoff() {
  const getHelp = AppState.data.websiteReviews.getHelp;
  getHelp.isSignedOff = !getHelp.isSignedOff;
  saveAppState();
  renderScopeReviewsView();
  showToast(getHelp.isSignedOff 
    ? (AppState.lang === "en" ? "8 Feelings signed-off as Joshua (Clinical Lead)" : "8 Emociones firmadas clínicamente por Joshua")
    : (AppState.lang === "en" ? "Sign-off reversed to Pending" : "Firma revertida a Pendiente"), 
    getHelp.isSignedOff ? "success" : "info"
  );
}

function toggleAboutUsItem(idx) {
  const checklist = AppState.data.websiteReviews.aboutUs.checklist;
  if (checklist && checklist[idx]) {
    checklist[idx].status = checklist[idx].status === 'completed' ? 'pending_review' : 'completed';
    saveAppState();
    renderScopeReviewsView();
    showToast(AppState.lang === "en" ? "About Us checklist updated" : "Checklist de About Us actualizado", "success");
  }
}

function setFassttFilter(stateCode) {
  AppState.fassttFilter = stateCode;
  renderScopeReviewsView();
}

function updateVideoStatus(idx, newStatus) {
  const videos = AppState.data.websiteReviews.videoContent.videos;
  if (videos && videos[idx]) {
    videos[idx].status = newStatus;
    saveAppState();
    renderScopeReviewsView();
    showToast(AppState.lang === "en" ? "Video status updated" : "Estado del video actualizado", "success");
  }
}

function updateVideoEta(idx, newEta) {
  const videos = AppState.data.websiteReviews.videoContent.videos;
  if (videos && videos[idx]) {
    videos[idx].eta = newEta;
    saveAppState();
    showToast(AppState.lang === "en" ? "Video ETA updated" : "Fecha de entrega del video actualizada", "success");
  }
}

function toggleStarttsPendingItem(idx) {
  const items = AppState.data.websiteReviews.starttsPending.items;
  if (items && items[idx]) {
    items[idx].status = items[idx].status === 'completed' ? 'in_progress' : 'completed';
    saveAppState();
    renderScopeReviewsView();
    showToast(AppState.lang === "en" ? "STARTTS deliverable status updated" : "Estado del pendiente de STARTTS actualizado", "success");
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
    { id: "requested", label: tr("1. Solicitado", "1. Requested"), color: "slate" },
    { id: "in_prep", label: tr("2. En Redacción / Prep", "2. In Drafting / Prep"), color: "blue" },
    { id: "tech_review", label: tr("3. Revisión Técnica (Luis)", "3. Tech Review (Luis)"), color: "indigo" },
    { id: "clinical_review", label: tr("4. Revisión Clínica (Joshua)", "4. Clinical Review (Joshua)"), color: "amber" },
    { id: "area_approval", label: tr("5. Aprobación Área (Lachlan)", "5. Area Approval (Lachlan)"), color: "purple" },
    { id: "completed", label: tr("6. Listo / En Producción", "6. Ready / In Production"), color: "emerald" }
  ];

  return `
    <div class="space-y-6 animate-fadeIn">
      <!-- Reglas Anti-Caos -->
      <div class="bg-gradient-to-r from-slate-900 to-[#323B3F] text-white p-5 rounded-2xl shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span class="text-[10px] font-bold text-[#96EE89] uppercase tracking-wider">${tr("Protocolo de Eficiencia", "Efficiency Protocol")}</span>
          <h3 class="text-lg font-bold text-white mt-0.5">${tr("Motor Operativo Anti-Cuellos de Botella", "Operational Bottleneck Elimination Engine")}</h3>
          <p class="text-xs text-slate-300 mt-1 max-w-2xl">
            ${tr(
              "Solución al problema histórico: <strong>cada tarea tiene UN solo dueño</strong>, SLA estricto de revisión de 48h, y prohibición de pasos circulares.",
              "Solution to team delays: <strong>every task has ONE single owner</strong>, strict 48h review SLA, and prohibition of circular handoffs."
            )}
          </p>
        </div>
        <button onclick="openNewTaskModal()" class="px-4 py-2 bg-[#96EE89] hover:bg-[#85de79] text-[#323B3F] text-xs font-bold rounded-xl shadow transition-all flex items-center gap-1.5 whitespace-nowrap">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
          </svg>
          ${tr("Nueva Tarea / Aprobación", "New Task / Approval")}
        </button>
      </div>

      <!-- Barra de Filtros Rápidos -->
      <div class="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-3 text-xs">
        <div class="flex flex-wrap items-center gap-3">
          <!-- Filtro por Responsable -->
          <div class="flex items-center gap-1.5">
            <span class="font-bold text-slate-600">${tr("Responsable:", "Assignee:")}</span>
            <select onchange="AppState.filters.assignee=this.value; renderWorkflowView();" 
                    class="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#96EE89]">
              <option value="all">${tr("Todos los miembros", "All members")}</option>
              ${ops.members.map(m => `
                <option value="${m.id}" ${AppState.filters.assignee === m.id ? 'selected' : ''}>${m.name} (${m.role.split(' ')[0]})</option>
              `).join('')}
            </select>
          </div>

          <!-- Filtro por Prioridad -->
          <div class="flex items-center gap-1.5">
            <span class="font-bold text-slate-600">${tr("Prioridad:", "Priority:")}</span>
            <select onchange="AppState.filters.priority=this.value; renderWorkflowView();" 
                    class="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 font-semibold text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#96EE89]">
              <option value="all">${tr("Todas", "All")}</option>
              <option value="critical" ${AppState.filters.priority === 'critical' ? 'selected' : ''}>${tr("Crítica", "Critical")}</option>
              <option value="high" ${AppState.filters.priority === 'high' ? 'selected' : ''}>${tr("Alta", "High")}</option>
              <option value="medium" ${AppState.filters.priority === 'medium' ? 'selected' : ''}>${tr("Media", "Medium")}</option>
            </select>
          </div>

          <!-- Toggle Solo Cuellos de Botella -->
          <label class="flex items-center gap-2 cursor-pointer font-bold text-slate-700 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">
            <input type="checkbox" 
                   ${AppState.filters.onlyBlocked ? 'checked' : ''} 
                   onchange="AppState.filters.onlyBlocked=this.checked; renderWorkflowView();"
                   class="rounded text-amber-600 focus:ring-amber-500 h-4 w-4" />
            <span class="text-amber-900">${tr("Solo Cuellos de Botella", "Only Bottlenecks")} (${ops.tasks.filter(t => t.isBlocked).length})</span>
          </label>
        </div>

        <div class="text-slate-400 font-medium">
          ${tr(`Mostrando ${tasks.length} de ${ops.tasks.length} tareas`, `Showing ${tasks.length} of ${ops.tasks.length} tasks`)}
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
                    ${tr("Sin tareas pendientes", "No pending tasks")}
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
        }">${task.priority.toUpperCase()}</span>

        ${task.isBlocked ? `
          <span class="text-[9px] font-bold bg-amber-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
            <span class="w-1.5 h-1.5 rounded-full bg-white animate-ping"></span>
            ${tr(`Trabado (${task.daysInStage}d)`, `Blocked (${task.daysInStage}d)`)}
          </span>
        ` : `
          <span class="text-[10px] text-slate-400 font-medium">${task.dueDate}</span>
        `}
      </div>

      <!-- Título de la tarea -->
      <h4 class="text-xs font-bold text-slate-900 leading-snug mb-1.5">${translateContent(task.title)}</h4>

      <!-- Motivo de bloqueo si existe -->
      ${task.isBlocked ? `
        <div class="p-2 bg-amber-50 rounded-lg border border-amber-200 text-[10px] text-amber-900 font-medium mb-2 leading-relaxed">
          <strong>${tr("Cuello de botella:", "Bottleneck:")}</strong> ${translateContent(task.blockerReason)}
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
                ${tr("Estrategia de Crecimiento & Telefonía", "Growth & Telephony Strategy")}
              </span>
              <span class="text-xs text-slate-500">${tr("Campaña Activa:", "Active Campaign:")} <strong>${meta.startDate} ${tr("a", "to")} ${meta.endDate}</strong></span>
            </div>
            <h2 class="text-2xl font-bold text-[#323B3F] mt-2">${tr("Campaña Meta Ads Fase 1 & Reserva Google Ads", "Phase 1 Meta Ads Campaign & Google Ads Reserve")}</h2>
            <p class="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              ${tr(
                "Objetivo: <strong>100% Llamadas directas al conmutador</strong>. Segmentación por idiomas y regionalización estratégica para romper el monopolio histórico de llamadas de NSW y alcanzar comunidades vulnerables en Victoria y South Australia.",
                "Objective: <strong>100% Direct Switchboard Inquiries</strong>. Language segmentation and interstate targeting to break the historical NSW call monopoly and reach vulnerable communities across Victoria and South Australia."
              )}
            </p>
          </div>

          <div class="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs">
            <div>
              <span class="text-slate-400 block font-semibold">${tr("Inversión Fase 1:", "Phase 1 Spend:")}</span>
              <span class="text-lg font-black text-slate-900">$${meta.spentToDate.toFixed(2)} / $${meta.totalBudget} AUD</span>
            </div>
          </div>
        </div>

        <!-- Métricas de Impacto Telefónico Real (Reporte 2025 vs Actual) -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 pt-6">
          <div class="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <span class="text-xs font-bold text-slate-500 uppercase">${tr("Llamadas Línea Base", "Baseline Inquiries")}</span>
            <div class="text-2xl font-black text-slate-800 mt-1">${meta.benchmarks.baselineCallsPerWeek} ${tr("/ sem", "/ wk")}</div>
            <span class="text-[11px] text-slate-500">${tr("Promedio sin publicidad activa", "Average volume without active ads")}</span>
          </div>

          <div class="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <span class="text-xs font-bold text-emerald-800 uppercase">${tr("Impacto Campaña", "Campaign Uplift")}</span>
            <div class="text-2xl font-black text-emerald-700 mt-1">${meta.benchmarks.campaignLiftCallsPerWeek} ${tr("/ sem", "/ wk")}</div>
            <span class="text-[11px] text-emerald-600 font-bold">+${meta.benchmarks.percentageLift}% ${tr("de aumento real", "actual uplift")}</span>
          </div>

          <div class="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <span class="text-xs font-bold text-slate-500 uppercase">${tr("Costo Real x Llamada", "Effective Cost per Call")}</span>
            <div class="text-2xl font-black text-[#323B3F] mt-1">~$${meta.benchmarks.estimatedCostPerCall.toFixed(2)} AUD</div>
            <span class="text-[11px] text-slate-500">${tr("Medido contra registro de llamadas", "Measured against incoming call registry")}</span>
          </div>

          <div class="p-4 bg-purple-50 rounded-xl border border-purple-100">
            <span class="text-xs font-bold text-purple-800 uppercase">${tr("Reserva Google Ads", "Google Ads Reserve")}</span>
            <div class="text-2xl font-black text-purple-700 mt-1">$${google.plannedBudget.toLocaleString()} AUD</div>
            <span class="text-[11px] text-purple-600">${tr("Decisión Enero 2027", "Decision Point January 2027")}</span>
          </div>
        </div>
      </div>

      <!-- DESGLOSE DE LOS 7 CONJUNTOS DE ANUNCIOS ACTIVOS (META) -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-lg font-bold text-[#323B3F]">${tr("Rendimiento por Idioma & Región (7 Conjuntos de Anuncios)", "Performance by Language & Region (7 Ad Sets)")}</h3>
            <p class="text-xs text-slate-500">${tr("Presupuestos protegidos mediante ABO para garantizar presencia equitativa.", "ABO protected budgets ensuring equitable community representation.")}</p>
          </div>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase font-bold">
                <th class="py-3 px-4">${tr("Idioma & Enfoque", "Language & Targeting")}</th>
                <th class="py-3 px-4">${tr("Área Geográfica", "Geographic Area")}</th>
                <th class="py-3 px-4 text-right">${tr("Presupuesto", "Budget")}</th>
                <th class="py-3 px-4 text-right">${tr("Gastado", "Spent")}</th>
                <th class="py-3 px-4 text-right">${tr("Clics", "Clicks")}</th>
                <th class="py-3 px-4 text-right">${tr("Llamadas Estimadas", "Reported Calls")}</th>
                <th class="py-3 px-4 text-center">${tr("Estado", "Status")}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-medium">
              ${meta.adSets.map(ad => `
                <tr class="hover:bg-slate-50 transition-colors">
                  <td class="py-3 px-4">
                    <div class="font-bold text-slate-900">${translateContent(ad.name)}</div>
                    <div class="text-[11px] text-slate-500">${translateContent(ad.notes)}</div>
                  </td>
                  <td class="py-3 px-4 text-slate-700 font-semibold">${translateContent(ad.geo)}</td>
                  <td class="py-3 px-4 text-right font-bold text-slate-800">$${ad.budget}</td>
                  <td class="py-3 px-4 text-right text-slate-600">$${ad.spent.toFixed(2)}</td>
                  <td class="py-3 px-4 text-right font-semibold text-blue-600">${ad.clicks}</td>
                  <td class="py-3 px-4 text-right font-bold text-emerald-600">${ad.callsReported}</td>
                  <td class="py-3 px-4 text-center">
                    <span class="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                      ${tr("Activo", "Active")}
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
            <span class="text-[10px] font-bold text-[#96EE89] uppercase tracking-wider">${tr("Fase 2 Planificada", "Phase 2 Reserve")}</span>
            <h3 class="text-xl font-bold text-white mt-1">${tr("Estrategia de Reserva Google Ads ($2,500 AUD)", "Google Ads Strategic Reserve Strategy ($2,500 AUD)")}</h3>
            <p class="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              ${tr(
                "Criterio de decisión acordado con Luis y Lachlan: Al cierre de la Fase 1 en Diciembre, evaluaremos el registro de llamadas. Si Meta mantiene un costo por llamada incremental menor a $100 AUD en árabe y farsi, escalamos Meta. Si no, activamos Google Search Call-Only.",
                "Decision criteria agreed with Luis and Lachlan: Following Phase 1 completion in December, incoming call logs will be assessed. If Meta maintains an incremental cost per call under $100 AUD in Arabic and Farsi, scale Meta; otherwise, activate Google Search Call-Only."
              )}
            </p>
          </div>
          <div class="bg-purple-800/60 p-4 rounded-xl border border-purple-700/60 text-xs">
            <span class="text-purple-300 font-semibold block">${tr("Palabras Clave Preparadas:", "Staged Target Keywords:")}</span>
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
                ${tr("Eventos & Materiales", "Events & Collateral")}
              </span>
              <span class="text-xs text-slate-500">${tr("Gestión de Proveedores, Cotizaciones e Inventario", "Supplier Management, Quotes & Inventory Tracking")}</span>
            </div>
            <h2 class="text-2xl font-bold text-[#323B3F] mt-2">${tr("Control de Merchandising, Impresión & Presupuestos", "Merchandise, Print Procurement & Budget Control")}</h2>
            <p class="text-sm text-slate-600 mt-1">
              ${tr("Colores oficiales:", "Official brand colours:")} <strong>Renewal Green (#96EE89 / Pantone 2267 C)</strong> ${tr("y", "and")} <strong>Grounded Slate (#323B3F)</strong>.
            </p>
          </div>

          <div class="flex items-center gap-2">
            <button onclick="openNewMerchModal()" class="px-4 py-2.5 bg-[#323B3F] hover:bg-slate-900 text-[#96EE89] text-xs font-bold rounded-xl shadow flex items-center gap-2 transition-all">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/>
              </svg>
              ${tr("Agregar Item de Merch", "Add Merch Item")}
            </button>
          </div>
        </div>

        <!-- Indicadores Financieros de Merchandising -->
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4 pt-6">
          <div class="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <span class="text-xs font-bold text-slate-500 uppercase">${tr("Presupuesto Merch", "Merchandise Budget")}</span>
            <div class="text-2xl font-black text-[#323B3F] mt-1">$${merch.totalBudget.toLocaleString()} AUD</div>
            <span class="text-[11px] text-slate-500">${tr("Asignación para eventos y lanzamientos", "Allocation for launches & events")}</span>
          </div>

          <div class="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <span class="text-xs font-bold text-emerald-800 uppercase">${tr("Pagado / Facturado", "Invoiced & Paid")}</span>
            <div class="text-2xl font-black text-emerald-700 mt-1">$${merch.spentToDate.toLocaleString()} AUD</div>
            <span class="text-[11px] text-emerald-600 font-semibold">${tr("Factura Snap #29460 pagada", "Snap invoice #29460 paid")}</span>
          </div>

          <div class="p-4 bg-amber-50 rounded-xl border border-amber-100">
            <span class="text-xs font-bold text-amber-800 uppercase">${tr("Cotizaciones en Curso", "Pending Quotes")}</span>
            <div class="text-2xl font-black text-amber-700 mt-1">~$${merch.committedQuotes.toLocaleString()} AUD</div>
            <span class="text-[11px] text-amber-600">${tr("4 proveedores consultados", "4 suppliers tendered")}</span>
          </div>

          <div class="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <span class="text-xs font-bold text-slate-500 uppercase">${tr("Saldo Disponible", "Available Balance")}</span>
            <div class="text-2xl font-black text-slate-800 mt-1">$${(merch.totalBudget - merch.spentToDate).toLocaleString()} AUD</div>
            <span class="text-[11px] text-slate-500">${tr("Margen restante para aprobar", "Remaining uncommitted budget")}</span>
          </div>
        </div>
      </div>

      <!-- TABLA DE ARTÍCULOS PEDIDOS, CANTIDADES Y ESTADO -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h3 class="text-lg font-bold text-[#323B3F] mb-4">${tr("Inventario de Materiales & Artículos Solicitados", "Materials & Requested Items Inventory")}</h3>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs">
            <thead>
              <tr class="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase font-bold">
                <th class="py-3 px-4">${tr("Artículo & Especificaciones", "Item & Specifications")}</th>
                <th class="py-3 px-4">${tr("Categoría", "Category")}</th>
                <th class="py-3 px-4 text-center">${tr("Cantidad", "Quantity")}</th>
                <th class="py-3 px-4">${tr("Proveedor", "Supplier")}</th>
                <th class="py-3 px-4 text-right">${tr("Costo Est.", "Est. Cost")}</th>
                <th class="py-3 px-4 text-center">${tr("Estado", "Status")}</th>
                <th class="py-3 px-4 text-center">${tr("Acción", "Action")}</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 font-medium">
              ${merch.items.map((item, idx) => {
                const supp = merch.suppliers.find(s => s.id === item.supplier) || { name: item.supplier };
                return `
                  <tr class="hover:bg-slate-50 transition-colors">
                    <td class="py-3 px-4">
                      <div class="font-bold text-slate-900">${translateContent(item.item)}</div>
                      <div class="text-[11px] text-slate-500">${translateContent(item.specs)}</div>
                      <div class="text-[10px] text-indigo-600 font-semibold mt-0.5">${tr("Color:", "Colour:")} ${translateContent(item.brandColor)}</div>
                    </td>
                    <td class="py-3 px-4 text-slate-600 font-semibold">${translateContent(item.category)}</td>
                    <td class="py-3 px-4 text-center font-bold text-slate-800">${item.quantity.toLocaleString()}</td>
                    <td class="py-3 px-4 text-slate-700 font-semibold">${supp.name}</td>
                    <td class="py-3 px-4 text-right font-bold text-slate-900">$${item.totalCost.toFixed(2)}</td>
                    <td class="py-3 px-4 text-center">
                      <span class="px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        item.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                        item.status === 'in_production' ? 'bg-blue-100 text-blue-800' :
                        item.status === 'approved' ? 'bg-purple-100 text-purple-800' : 'bg-amber-100 text-amber-800'
                      }">
                        ${item.status === 'delivered' ? tr('✓ Entregado', '✓ Delivered') :
                          item.status === 'in_production' ? tr('En Producción', 'In Production') :
                          item.status === 'approved' ? tr('Aprobado', 'Approved') : tr('Cotización Pedida', 'Quote Requested')}
                      </span>
                    </td>
                    <td class="py-3 px-4 text-center">
                      <button onclick="toggleMerchItemStatus(${idx})" class="text-[11px] font-bold text-indigo-600 hover:text-indigo-900 hover:underline">
                        ${tr("Cambiar Estado", "Update Status")}
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
        <h3 class="text-lg font-bold text-[#323B3F] mb-4">${tr("Directorio de Proveedores & Contactos", "Supplier Directory & Key Contacts")}</h3>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          ${merch.suppliers.map(s => `
            <div class="p-4 bg-slate-50 rounded-xl border border-slate-100 flex flex-col justify-between">
              <div>
                <div class="flex items-center justify-between mb-2">
                  <h4 class="font-bold text-slate-900 text-sm">${s.name}</h4>
                  <span class="text-[9px] font-bold px-2 py-0.5 rounded ${
                    s.status === 'invoiced_and_paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }">${s.status === 'invoiced_and_paid' ? tr('Facturado', 'Invoiced') : tr('En Cotización', 'Quoting')}</span>
                </div>
                <p class="text-xs text-slate-600 mb-1">${tr("Contacto:", "Contact:")} <strong>${s.contact}</strong></p>
                <p class="text-xs text-slate-500 mb-1">Email: <a href="mailto:${s.email}" class="text-blue-600 hover:underline">${s.email}</a></p>
                <p class="text-xs text-slate-500">${tr("Teléfono:", "Phone:")} ${s.phone}</p>
                <p class="text-[11px] text-slate-600 mt-2 bg-white p-2 rounded border border-slate-200 leading-snug">${translateContent(s.notes)}</p>
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
  const label = item.status === 'delivered' ? tr('Entregado', 'Delivered') :
    item.status === 'in_production' ? tr('En Producción', 'In Production') :
    item.status === 'approved' ? tr('Aprobado', 'Approved') : tr('Cotización Pedida', 'Quote Requested');
  showToast(tr(`Estado cambiado a: ${label}`, `Status changed to: ${label}`), "success");
}

// =========================================================================
// MÓDULO 6: MATRIZ DE RESPONSABILIDADES (RACI) & DIRECTORIO
// =========================================================================
function renderRaciView() {
  const members = AppState.data.teamOperations.members;

  return `
    <div class="space-y-6 animate-fadeIn">
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <h2 class="text-2xl font-bold text-[#323B3F] mb-1">${tr("Matriz RACI & Equipo de Witness to War", "RACI Matrix & Witness to War Operations Team")}</h2>
        <p class="text-sm text-slate-600 mb-6">
          ${tr(
            "Definición clara de roles para evitar que las tareas reboten entre \"miles de personas\".",
            "Clear accountability structure to prevent deliverables from bouncing between \"thousands of people\"."
          )}
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
                    <span class="text-xs text-slate-500 block">${translateContent(m.role)}</span>
                  </div>
                </div>

                <div class="text-xs text-slate-600 space-y-1.5 mt-3 pt-3 border-t border-slate-200">
                  <p><strong>Email:</strong> <a href="mailto:${m.email}" class="text-blue-600 hover:underline">${m.email}</a></p>
                  ${m.phone ? `<p><strong>${tr("Teléfono:", "Phone:")}</strong> ${m.phone}</p>` : ''}
                </div>
              </div>

              <div class="mt-4 pt-3 border-t border-slate-200">
                <span class="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">${tr("Responsabilidad Primaria:", "Primary Accountability:")}</span>
                <p class="text-[11px] text-slate-700 font-medium">
                  ${m.id === 'lachlan' ? tr('Aprobación final de presupuestos, cronogramas y escalamiento institucional al directorio.', 'Final sign-off on budgets, overall timeframe, and executive escalation to STARTTS Board and NSW Health.') :
                    m.id === 'luis' ? tr('Gestión técnica y de marketing, pauta publicitaria en Meta/Google, relación con agencia onmove y compras.', 'Technical and marketing delivery, Meta & Google Ads management, agency SLA tracking with onmove, and procurement.') :
                    m.id === 'joshua' ? tr('Aprobación clínica estricta de contenidos de salud mental, técnicas de respiración y sentimientos.', 'Strict clinical sign-off on all psychoeducational content, grounding exercises, and 8-feeling taxonomy.') :
                    m.id === 'yassmen' ? tr('Operación del servicio telefónico de Witness to War, registro de llamadas e insumos comunitarios.', 'Operational oversight of toll-free line (1800), incoming switchboard log, and community translation review.') :
                    m.id === 'jasmina' ? tr('Coordinación comunitaria en STARTTS y alineación estratégica de fondos y alianzas.', 'Community stakeholder engagement, multicultural partner alignment, and funding governance.') :
                    m.id === 'maria' ? tr('Soporte operativo, becas ucranianas, cotizaciones de merchandising y redes sociales.', 'Operational support, Ukrainian Fellowship rollout, merchandise supplier quotes, and social media posting.') :
                    tr('Entrega técnica de diseño en Figma y desarrollo WordPress en Bricks Builder con compromiso de fechas.', 'Technical Figma UX/UI delivery, custom WordPress development in Bricks Builder, and sprint schedule commitment.')}
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
  const isAgency = AppState.currentRole === "agency";
  const isEn = AppState.lang === "en";

  // =========================================================================
  // VISTA DE CRONOGRAMA EXCLUSIVA PARA LA AGENCIA ONMOVE (Alcance Estricto Web)
  // =========================================================================
  if (isAgency) {
    return `
      <div class="space-y-6 animate-fadeIn">
        <!-- Encabezado del Roadmap (Restringido para Agencia) -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
          <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div>
              <div class="flex items-center gap-2">
                <span class="px-3 py-1 bg-slate-900 text-[#96EE89] rounded-lg text-xs font-bold uppercase tracking-wider">
                  ${tr("Alcance Agencia onmove", "onmove Agency Scope")}
                </span>
                <span class="text-xs text-slate-500">${tr("Sprints de Desarrollo Web: <strong>Agosto 2026 — Enero 2027</strong>", "Website Delivery Sprints: <strong>August 2026 — January 2027</strong>")}</span>
              </div>
              <h2 class="text-2xl font-bold text-[#323B3F] mt-2">
                ${tr("Cronograma de Desarrollo Web & Entregables onmove", "Website Delivery Roadmap & onmove Sprints")}
              </h2>
              <p class="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
                ${tr(
                  "Sincronización de las 4 fases contratadas de onmove: Estrategia, Diseño UX/UI en Figma, Construcción en WordPress Bricks Builder y Lanzamiento oficial multilingüe.",
                  "Visual schedule tracking onmove's 4 contracted phases: Strategy & IA, Figma UX/UI Design, WordPress Bricks Builder Build, and Multilingual Go-Live."
                )}
              </p>
            </div>

            <div class="flex items-center gap-2">
              <button onclick="exportAgencySprintToLachlan()" class="px-4 py-2.5 bg-[#323B3F] hover:bg-slate-900 text-[#96EE89] text-xs font-bold rounded-xl shadow flex items-center gap-2 transition-all">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                </svg>
                ${tr("Copiar Resumen de Sprints", "Copy Sprint Summary")}
              </button>
            </div>
          </div>

          <!-- Indicadores de Estado por Línea de Tiempo (Solo Sitio Web) -->
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 text-xs">
            <div class="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <span class="font-bold text-emerald-800 uppercase text-[10px] block">${tr("Hito 1: Identidad & Branding", "Sprint 1: Identity & Branding")}</span>
              <div class="text-base font-bold text-emerald-950 mt-1">${tr("100% Completado", "100% Completed")}</div>
              <span class="text-slate-500 text-[11px]">${tr("Agosto 2026 · Logos multilingües & manual", "August 2026 · Multilingual logos & brand guide")}</span>
            </div>

            <div class="p-4 bg-amber-50 rounded-xl border border-amber-200">
              <span class="font-bold text-amber-800 uppercase text-[10px] block flex items-center gap-1">
                <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                ${tr("Hito 2: Wireframes & Get Help", "Sprint 2: Wireframes & Get Help")}
              </span>
              <div class="text-base font-bold text-amber-950 mt-1">${tr("85% (Sesión 16 Oct)", "85% (Session 16 Oct)")}</div>
              <span class="text-slate-600 text-[11px]">${tr("Validación Figma frames 1492-6", "Figma frames 1492-6 review")}</span>
            </div>

            <div class="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <span class="font-bold text-blue-800 uppercase text-[10px] block">${tr("Hito 3: Construcción WordPress", "Sprint 3: WordPress Build")}</span>
              <div class="text-base font-bold text-blue-950 mt-1">${tr("Bricks Builder (6 Idiomas)", "Bricks Builder (6 Languages)")}</div>
              <span class="text-slate-500 text-[11px]">${tr("Timeframe en confirmación", "Timeframe commitment in progress")}</span>
            </div>

            <div class="p-4 bg-purple-50 rounded-xl border border-purple-100">
              <span class="font-bold text-purple-800 uppercase text-[10px] block">${tr("Hito 4: Testing & Lanzamiento", "Sprint 4: QA Testing & Go-Live")}</span>
              <div class="text-base font-bold text-purple-950 mt-1">${tr("Enero 2027", "January 2027")}</div>
              <span class="text-slate-500 text-[11px]">${tr("Accesibilidad WCAG 2.1 AA & Staging", "WCAG 2.1 AA accessibility & Staging")}</span>
            </div>
          </div>
        </div>

        <!-- DIAGRAMA VISUAL GANTT / TIMELINE MENSUAL (Solo Fases Web) -->
        <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-x-auto">
          <h3 class="text-lg font-bold text-[#323B3F] mb-6">${tr("Mapa Mensual de Sprints de la Agencia onmove", "onmove Monthly Sprint Delivery Schedule")}</h3>

          <div class="min-w-[760px] space-y-5">
            <!-- Encabezado de Meses -->
            <div class="grid grid-cols-6 gap-2 text-center text-xs font-bold pb-3 border-b-2 border-slate-200">
              <div class="text-slate-400">${tr("Agosto 2026", "August 2026")}</div>
              <div class="text-slate-400">${tr("Septiembre 2026", "September 2026")}</div>
              <div class="text-emerald-700 bg-emerald-50 py-1 rounded-lg border border-emerald-200">
                ${tr("Octubre 2026 (HOY)", "October 2026 (NOW)")}
              </div>
              <div class="text-slate-700">${tr("Noviembre 2026", "November 2026")}</div>
              <div class="text-slate-700">${tr("Diciembre 2026", "December 2026")}</div>
              <div class="text-purple-700 bg-purple-50 py-1 rounded-lg border border-purple-200">
                ${tr("Enero 2027 (Lanzamiento)", "January 2027 (Go-Live)")}
              </div>
            </div>

            <!-- Barra 1: Identidad & Branding onmove -->
            <div class="space-y-1">
              <div class="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>${tr("1. Identidad, Branding & Paleta Pantone 2267 C", "1. Identity, Branding & Pantone 2267 C Palette")}</span>
                <span class="text-emerald-600">${tr("✓ 100% Completado", "✓ 100% Completed")}</span>
              </div>
              <div class="grid grid-cols-6 gap-2 h-7 bg-slate-100 rounded-xl p-1 items-center">
                <div class="col-span-1 bg-emerald-500 h-full rounded-lg text-[10px] font-bold text-white flex items-center justify-center shadow-sm">
                  ${tr("Entrega onmove", "onmove Delivery")}
                </div>
                <div class="col-span-5 text-[10px] text-slate-400 pl-2">
                  ${tr("Manuales de marca, logos multilingües y packaging recibidos en Drive.", "Brand guidelines, multilingual logos, and packaging received on Drive.")}
                </div>
              </div>
            </div>

            <!-- Barra 2: Fase 1 Web - Estrategia & Arquitectura (onmove) -->
            <div class="space-y-1">
              <div class="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>${tr("2. Web Fase 1: Arquitectura, Sitemap & Get Help Toolkit", "2. Web Sprint 1: Architecture, Sitemap & Get Help Toolkit")}</span>
                <span class="text-amber-600 font-bold">${tr("85% (Sesión de Wireframes)", "85% (Wireframes Session)")}</span>
              </div>
              <div class="grid grid-cols-6 gap-2 h-7 bg-slate-100 rounded-xl p-1 items-center">
                <div class="col-span-1"></div>
                <div class="col-span-1 bg-amber-400 h-full rounded-l-lg"></div>
                <div class="col-span-1 bg-amber-500 h-full rounded-r-lg text-[10px] font-bold text-white flex items-center justify-center shadow-sm">
                  ${tr("Cierre Oct 20", "Closing Oct 20")}
                </div>
                <div class="col-span-3 text-[10px] text-slate-400 pl-2">
                  ${tr("Wireframes listos en Figma (frames 1492-6). Pendiente aprobación de 8 emociones por Joshua.", "Figma wireframes ready (frames 1492-6). Awaiting clinical sign-off on 8 feelings by Joshua.")}
                </div>
              </div>
            </div>

            <!-- Barra 3: Fase 2 Web - Diseño Visual UX/UI (onmove) -->
            <div class="space-y-1">
              <div class="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>${tr("3. Web Fase 2: Diseño Visual & Maquetas Figma", "3. Web Sprint 2: Visual Design & Figma Mockups")}</span>
                <span class="text-slate-600">${tr("40% (En curso)", "40% (In progress)")}</span>
              </div>
              <div class="grid grid-cols-6 gap-2 h-7 bg-slate-100 rounded-xl p-1 items-center">
                <div class="col-span-2"></div>
                <div class="col-span-2 bg-gradient-to-r from-slate-400 to-slate-700 h-full rounded-lg text-[10px] font-bold text-white flex items-center justify-center shadow-sm">
                  ${tr("Figma UX/UI (ETA comprometido: 5 Nov)", "Figma UX/UI (Committed ETA: 5 Nov)")}
                </div>
                <div class="col-span-2 text-[10px] text-slate-400 pl-2">
                  ${tr("Homepage y Hub de recursos", "Homepage and Resource Hub")}
                </div>
              </div>
            </div>

            <!-- Barra 4: Fase 3 Web - Desarrollo CMS WordPress + Bricks Builder -->
            <div class="space-y-1">
              <div class="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>${tr("4. Web Fase 3: Construcción WordPress + Bricks Builder (6 Idiomas)", "4. Web Sprint 3: WordPress + Bricks Builder Build (6 Languages + RTL)")}</span>
                <span class="text-amber-600 font-bold">${tr("Timeframe en confirmación", "Timeframe in confirmation")}</span>
              </div>
              <div class="grid grid-cols-6 gap-2 h-7 bg-slate-100 rounded-xl p-1 items-center">
                <div class="col-span-3"></div>
                <div class="col-span-2 border-2 border-dashed border-amber-400 bg-amber-50 h-full rounded-lg text-[10px] font-bold text-amber-900 flex items-center justify-center">
                  ${tr("Sprints de Desarrollo CMS (WordPress + Bricks Builder)", "CMS Development Sprints (WordPress + Bricks Builder)")}
                </div>
                <div class="col-span-1 text-[10px] text-slate-400 pl-2"></div>
              </div>
            </div>

            <!-- Barra 5: Fase 4 Web - Testing, Accesibilidad & Go-Live -->
            <div class="space-y-1">
              <div class="flex items-center justify-between text-xs font-bold text-slate-700">
                <span>${tr("5. Web Fase 4: Testing WCAG 2.1 AA, Staging & Lanzamiento", "5. Web Sprint 4: WCAG 2.1 AA Testing, Staging & Production Go-Live")}</span>
                <span class="text-purple-600 font-bold">${tr("Enero 2027", "January 2027")}</span>
              </div>
              <div class="grid grid-cols-6 gap-2 h-7 bg-slate-100 rounded-xl p-1 items-center">
                <div class="col-span-5"></div>
                <div class="col-span-1 bg-purple-600 h-full rounded-lg text-[10px] font-bold text-white flex items-center justify-center shadow-sm">
                  🚀 ${tr("Lanzamiento", "Go-Live")}
                </div>
              </div>
            </div>

          </div>
        </div>

        <!-- TARJETAS DE DEPENDENCIAS CRÍTICAS (Estrictas para Agencia) -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <span class="text-[10px] font-bold text-amber-800 uppercase tracking-wider block mb-1">
              ${tr("Paso Crítico Inmediato #1", "Immediate Critical Step #1")}
            </span>
            <h4 class="font-bold text-slate-900 text-sm mb-1">${tr("Aprobación de Contenidos Clínicos", "Clinical Content Sign-off")}</h4>
            <p class="text-xs text-slate-600 mb-4 leading-relaxed">
              ${tr(
                "Joshua debe validar las 8 emociones del autoayuda. Sin esto, onmove no puede cerrar la taxonomía en WordPress.",
                "Joshua must sign off on the 8 self-help emotional states to lock the CMS resource filters in WordPress."
              )}
            </p>
            <button onclick="setActiveTab('scope-reviews')" class="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow transition-all">
              ${tr("Ver Estado en Scope Reviews &rarr;", "View Status in Scope Reviews &rarr;")}
            </button>
          </div>

          <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <span class="text-[10px] font-bold text-blue-800 uppercase tracking-wider block mb-1">
              ${tr("Paso Crítico Inmediato #2", "Immediate Critical Step #2")}
            </span>
            <h4 class="font-bold text-slate-900 text-sm mb-1">${tr("Compromiso Formal de Fechas onmove", "Formal Date Commitment from onmove")}</h4>
            <p class="text-xs text-slate-600 mb-4 leading-relaxed">
              ${tr(
                "Actualizar y comprometer las fechas de entrega de los sprints de desarrollo en WordPress Bricks Builder.",
                "Update and commit development sprint milestone dates in WordPress Bricks Builder directly in the board."
              )}
            </p>
            <button onclick="setActiveTab('agency')" class="w-full py-2 bg-[#323B3F] hover:bg-slate-900 text-[#96EE89] font-bold text-xs rounded-xl shadow transition-all">
              ${tr("Editar Sprints en Portal Agencia &rarr;", "Edit Sprints in Agency Portal &rarr;")}
            </button>
          </div>

          <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
            <span class="text-[10px] font-bold text-purple-800 uppercase tracking-wider block mb-1">
              ${tr("Paso Crítico Inmediato #3", "Immediate Critical Step #3")}
            </span>
            <h4 class="font-bold text-slate-900 text-sm mb-1">${tr("Infraestructura y Contenidos Traducidos", "Hosting Infrastructure & Translations")}</h4>
            <p class="text-xs text-slate-600 mb-4 leading-relaxed">
              ${tr(
                "STARTTS entregará las credenciales de hosting y los textos finales en los 6 idiomas para la integración RTL.",
                "STARTTS to deliver hosting infrastructure credentials and final approved copy in 6 languages for RTL integration."
              )}
            </p>
            <button onclick="setActiveTab('scope-reviews')" class="w-full py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow transition-all">
              ${tr("Ver Pendientes STARTTS &rarr;", "View STARTTS Deliverables &rarr;")}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  // =========================================================================
  // VISTA DE CRONOGRAMA COMPLETA (Lachlan, Luis, Equipo Interno, Marketing)
  // =========================================================================
  return `
    <div class="space-y-6 animate-fadeIn">
      <!-- Encabezado del Roadmap -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
          <div>
            <div class="flex items-center gap-2">
              <span class="px-3 py-1 bg-slate-900 text-[#96EE89] rounded-lg text-xs font-bold uppercase tracking-wider">
                ${tr("Plan Maestro", "Master Delivery Plan")}
              </span>
              <span class="text-xs text-slate-500">${tr("Horizonte de 6 Meses: <strong>Agosto 2026 — Enero 2027</strong>", "6-Month Horizon: <strong>August 2026 — January 2027</strong>")}</span>
            </div>
            <h2 class="text-2xl font-bold text-[#323B3F] mt-2">${tr("Cronograma de Ejecución & Roadmap de Hitos", "Execution Roadmap & Milestone Schedule")}</h2>
            <p class="text-sm text-slate-600 mt-1 max-w-3xl leading-relaxed">
              ${tr(
                "Mapa visual que sincroniza las 4 fases de la agencia web onmove, la campaña activa de Meta Ads, la compra de merchandising y el hito de decisión de Google Ads para presentar a Lachlan y al directorio de STARTTS.",
                "Visual roadmap synchronising onmove's 4 website phases, the active Meta Ads campaign, merchandise procurement, and the Google Ads reserve decision for Lachlan and the STARTTS board."
              )}
            </p>
          </div>

          <div class="flex items-center gap-2">
            <button onclick="openShareModal()" class="px-4 py-2.5 bg-[#323B3F] hover:bg-slate-900 text-[#96EE89] text-xs font-bold rounded-xl shadow flex items-center gap-2 transition-all">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"/>
              </svg>
              ${tr("Compartir Cronograma", "Share Roadmap")}
            </button>
          </div>
        </div>

        <!-- Indicadores de Estado por Línea de Tiempo -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 text-xs">
          <div class="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <span class="font-bold text-emerald-800 uppercase text-[10px] block">${tr("Hito 1: Identidad", "Milestone 1: Identity")}</span>
            <div class="text-base font-bold text-emerald-950 mt-1">${tr("100% Completado", "100% Completed")}</div>
            <span class="text-slate-500 text-[11px]">${tr("Agosto 2026 · Logos multilingües & manual", "August 2026 · Multilingual logos & manual")}</span>
          </div>

          <div class="p-4 bg-blue-50 rounded-xl border border-blue-100">
            <span class="font-bold text-blue-800 uppercase text-[10px] block">${tr("Hito 2: Pauta Meta Fase 1", "Milestone 2: Phase 1 Meta Ads")}</span>
            <div class="text-base font-bold text-blue-950 mt-1">${tr("En Ejecución (42%)", "In Execution (42%)")}</div>
            <span class="text-slate-500 text-[11px]">${tr("7 Sep — 13 Dic 2026 · +75.5% llamadas", "7 Sep — 13 Dec 2026 · +75.5% calls")}</span>
          </div>

          <div class="p-4 bg-amber-50 rounded-xl border border-amber-200">
            <span class="font-bold text-amber-800 uppercase text-[10px] block flex items-center gap-1">
              <span class="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
              ${tr("Hito 3: Sitio Web CMS", "Milestone 3: Website CMS")}
            </span>
            <div class="text-base font-bold text-amber-950 mt-1">${tr("35% (Cuello de Botella)", "35% (Bottleneck)")}</div>
            <span class="text-slate-600 text-[11px]">${tr("Falta confirmación de fechas onmove", "Awaiting onmove date confirmation")}</span>
          </div>

          <div class="p-4 bg-purple-50 rounded-xl border border-purple-100">
            <span class="font-bold text-purple-800 uppercase text-[10px] block">${tr("Hito 4: Decisión Google Ads", "Milestone 4: Google Ads Decision")}</span>
            <div class="text-base font-bold text-purple-950 mt-1">${tr("Enero 2027 ($2,500)", "January 2027 ($2,500 AUD)")}</div>
            <span class="text-slate-500 text-[11px]">${tr("Criterio: Costo incremental de Meta", "Criteria: Incremental cost on Meta")}</span>
          </div>
        </div>
      </div>

      <!-- DIAGRAMA VISUAL GANTT / TIMELINE MENSUAL -->
      <div class="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 overflow-x-auto">
        <h3 class="text-lg font-bold text-[#323B3F] mb-6">${tr("Mapa Mensual de Sprints & Entregables", "Monthly Sprints & Deliverables Map")}</h3>

        <div class="min-w-[760px] space-y-5">
          <!-- Encabezado de Meses -->
          <div class="grid grid-cols-6 gap-2 text-center text-xs font-bold pb-3 border-b-2 border-slate-200">
            <div class="text-slate-400">${tr("Agosto 2026", "August 2026")}</div>
            <div class="text-slate-400">${tr("Septiembre 2026", "September 2026")}</div>
            <div class="text-emerald-700 bg-emerald-50 py-1 rounded-lg border border-emerald-200">
              ${tr("Octubre 2026 (HOY)", "October 2026 (NOW)")}
            </div>
            <div class="text-slate-700">${tr("Noviembre 2026", "November 2026")}</div>
            <div class="text-slate-700">${tr("Diciembre 2026", "December 2026")}</div>
            <div class="text-purple-700 bg-purple-50 py-1 rounded-lg border border-purple-200">
              ${tr("Enero 2027 (Lanzamiento)", "January 2027 (Go-Live)")}
            </div>
          </div>

          <!-- Barra 1: Identidad & Branding onmove -->
          <div class="space-y-1">
            <div class="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>${tr("1. Identidad, Branding & Paleta Pantone 2267 C ($27,300 AUD)", "1. Identity, Branding & Pantone 2267 C Palette ($27,300 AUD)")}</span>
              <span class="text-emerald-600">${tr("✓ 100% Completado", "✓ 100% Completed")}</span>
            </div>
            <div class="grid grid-cols-6 gap-2 h-7 bg-slate-100 rounded-xl p-1 items-center">
              <div class="col-span-1 bg-emerald-500 h-full rounded-lg text-[10px] font-bold text-white flex items-center justify-center shadow-sm">
                ${tr("Entrega onmove", "onmove Delivery")}
              </div>
              <div class="col-span-5 text-[10px] text-slate-400 pl-2">
                ${tr("Manuales de marca, logos multilingües y packaging recibidos en Drive.", "Brand manuals, multilingual logos, and packaging received on Drive.")}
              </div>
            </div>
          </div>

          <!-- Barra 2: Campaña Meta Ads Fase 1 -->
          <div class="space-y-1">
            <div class="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>${tr("2. Campaña Meta Ads Fase 1 — Enfoque Regional ($2,500 AUD)", "2. Phase 1 Meta Ads Campaign — Regional Focus ($2,500 AUD)")}</span>
              <span class="text-blue-600 font-bold">${tr("Activa (Día 38 de 100)", "Active (Day 38 of 100)")}</span>
            </div>
            <div class="grid grid-cols-6 gap-2 h-7 bg-slate-100 rounded-xl p-1 items-center">
              <div class="col-span-1"></div>
              <div class="col-span-4 bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 h-full rounded-lg text-[10px] font-bold text-white flex items-center justify-between px-3 shadow-sm">
                <span>${tr("Inicio: 7 Sep", "Start: 7 Sep")}</span>
                <span>${tr("7 Conjuntos (Árabe, Farsi, Ucraniano, Hebreo, Inglés)", "7 Sets (Arabic, Farsi, Ukrainian, Hebrew, English)")}</span>
                <span>${tr("Fin: 13 Dic", "End: 13 Dec")}</span>
              </div>
              <div class="col-span-1 text-[10px] text-slate-400 pl-2">${tr("Receso Verano", "Summer Recess")}</div>
            </div>
          </div>

          <!-- Barra 3: Fase 1 Web - Estrategia & Arquitectura (onmove) -->
          <div class="space-y-1">
            <div class="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>${tr("3. Web Fase 1: Arquitectura, Sitemap & Get Help Toolkit", "3. Web Sprint 1: Architecture, Sitemap & Get Help Toolkit")}</span>
              <span class="text-amber-600 font-bold">${tr("85% (Trabado en firma clínica)", "85% (Held on clinical sign-off)")}</span>
            </div>
            <div class="grid grid-cols-6 gap-2 h-7 bg-slate-100 rounded-xl p-1 items-center">
              <div class="col-span-1"></div>
              <div class="col-span-1 bg-amber-400 h-full rounded-l-lg"></div>
              <div class="col-span-1 bg-amber-500 h-full rounded-r-lg text-[10px] font-bold text-white flex items-center justify-center shadow-sm">
                ${tr("Cierre Oct 20", "Closing Oct 20")}
              </div>
              <div class="col-span-3 text-[10px] text-slate-400 pl-2">
                ${tr("Wireframes listos en Figma. Pendiente aprobación de 8 emociones por Joshua.", "Figma wireframes ready. Pending sign-off on 8 feelings by Joshua.")}
              </div>
            </div>
          </div>

          <!-- Barra 4: Fase 2 Web - Diseño Visual UX/UI (onmove) -->
          <div class="space-y-1">
            <div class="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>${tr("4. Web Fase 2: Diseño Visual & Maquetas Figma", "4. Web Sprint 2: Visual Design & Figma Mockups")}</span>
              <span class="text-slate-600">${tr("40% (En curso)", "40% (In progress)")}</span>
            </div>
            <div class="grid grid-cols-6 gap-2 h-7 bg-slate-100 rounded-xl p-1 items-center">
              <div class="col-span-2"></div>
              <div class="col-span-2 bg-gradient-to-r from-slate-400 to-slate-700 h-full rounded-lg text-[10px] font-bold text-white flex items-center justify-center shadow-sm">
                ${tr("Figma UX/UI (ETA comprometido: 5 Nov)", "Figma UX/UI (Committed ETA: 5 Nov)")}
              </div>
              <div class="col-span-2 text-[10px] text-slate-400 pl-2">
                ${tr("Homepage y Hub de recursos", "Homepage and Resource Hub")}
              </div>
            </div>
          </div>

          <!-- Barra 5: Fase 3 Web - Desarrollo CMS WordPress + Bricks Builder -->
          <div class="space-y-1">
            <div class="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>${tr("5. Web Fase 3: Construcción WordPress + Bricks Builder (6 Idiomas)", "5. Web Sprint 3: WordPress + Bricks Builder Build (6 Languages + RTL)")}</span>
              <span class="text-red-500 font-bold">${tr("⚠️ Fecha por fijar por onmove", "⚠️ Awaiting onmove date commitment")}</span>
            </div>
            <div class="grid grid-cols-6 gap-2 h-7 bg-slate-100 rounded-xl p-1 items-center">
              <div class="col-span-3"></div>
              <div class="col-span-2 border-2 border-dashed border-amber-400 bg-amber-50 h-full rounded-lg text-[10px] font-bold text-amber-900 flex items-center justify-center">
                ${tr("Sprints de Desarrollo CMS (Timeframe pendiente)", "CMS Development Sprints (Pending Timeframe)")}
              </div>
              <div class="col-span-1 text-[10px] text-slate-400 pl-2"></div>
            </div>
          </div>

          <!-- Barra 6: Fase 4 Web - Testing, Accesibilidad & Go-Live -->
          <div class="space-y-1">
            <div class="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>${tr("6. Web Fase 4: Testing WCAG 2.1 AA, Staging & Lanzamiento", "6. Web Sprint 4: WCAG 2.1 AA Testing, Staging & Production Go-Live")}</span>
              <span class="text-purple-600 font-bold">${tr("Enero 2027", "January 2027")}</span>
            </div>
            <div class="grid grid-cols-6 gap-2 h-7 bg-slate-100 rounded-xl p-1 items-center">
              <div class="col-span-5"></div>
              <div class="col-span-1 bg-purple-600 h-full rounded-lg text-[10px] font-bold text-white flex items-center justify-center shadow-sm">
                🚀 ${tr("Lanzamiento", "Go-Live")}
              </div>
            </div>
          </div>

          <!-- Barra 7: Merchandising & Banners para Eventos -->
          <div class="space-y-1">
            <div class="flex items-center justify-between text-xs font-bold text-slate-700">
              <span>${tr("7. Merchandising, Banners & Uniformes ($4,750 AUD)", "7. Merchandise, Banners & Uniforms ($4,750 AUD)")}</span>
              <span class="text-indigo-600 font-bold">${tr("Lote 1 Pagado · Lote 2 en Cotización", "Batch 1 Paid · Batch 2 Tendering")}</span>
            </div>
            <div class="grid grid-cols-6 gap-2 h-7 bg-slate-100 rounded-xl p-1 items-center">
              <div class="col-span-1 bg-indigo-500 h-full rounded-l-lg text-[10px] font-bold text-white flex items-center justify-center">
                Snap $905
              </div>
              <div class="col-span-1"></div>
              <div class="col-span-2 bg-indigo-200 border border-indigo-300 h-full rounded-r-lg text-[10px] font-bold text-indigo-900 flex items-center justify-center">
                ${tr("4 Proveedores cotizando manteles y kits", "4 Suppliers tendering runners & kits")}
              </div>
              <div class="col-span-2 text-[10px] text-slate-400 pl-2">
                ${tr("Entrega masiva para eventos 2027", "Bulk delivery for 2027 events")}
              </div>
            </div>
          </div>

        </div>
      </div>

      <!-- TARJETAS DE DEPENDENCIAS CRÍTICAS -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <span class="text-[10px] font-bold text-amber-800 uppercase tracking-wider block mb-1">
            ${tr("Paso Crítico Inmediato #1", "Immediate Critical Step #1")}
          </span>
          <h4 class="font-bold text-slate-900 text-sm mb-1">${tr("Aprobación de Contenidos Clínicos", "Clinical Content Sign-off")}</h4>
          <p class="text-xs text-slate-600 mb-4 leading-relaxed">
            ${tr(
              "Joshua debe validar las 8 emociones del autoayuda. Sin esto, onmove no puede cerrar la arquitectura del sitio web.",
              "Joshua must validate the 8 self-help emotional states. Without this, onmove cannot lock the website IA."
            )}
          </p>
          <button onclick="openEmailModal('act-2')" class="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow transition-all">
            ${tr("Enviar Recordatorio a Joshua &rarr;", "Send Reminder to Joshua &rarr;")}
          </button>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <span class="text-[10px] font-bold text-blue-800 uppercase tracking-wider block mb-1">
            ${tr("Paso Crítico Inmediato #2", "Immediate Critical Step #2")}
          </span>
          <h4 class="font-bold text-slate-900 text-sm mb-1">${tr("Compromiso Formal de Fechas onmove", "Formal Date Commitment from onmove")}</h4>
          <p class="text-xs text-slate-600 mb-4 leading-relaxed">
            ${tr(
              "Exigir a onmove las fechas de entrega de los sprints de desarrollo en WordPress Bricks Builder antes de emitir más pagos.",
              "Demand committed sprint milestone dates in WordPress Bricks Builder from onmove before releasing further payments."
            )}
          </p>
          <button onclick="openEmailModal('act-1')" class="w-full py-2 bg-[#323B3F] hover:bg-slate-900 text-[#96EE89] font-bold text-xs rounded-xl shadow transition-all">
            ${tr("Exigir Timeframe a onmove &rarr;", "Demand Timeframe from onmove &rarr;")}
          </button>
        </div>

        <div class="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
          <span class="text-[10px] font-bold text-indigo-800 uppercase tracking-wider block mb-1">
            ${tr("Paso Crítico Inmediato #3", "Immediate Critical Step #3")}
          </span>
          <h4 class="font-bold text-slate-900 text-sm mb-1">${tr("Consolidación de Cotizaciones Merch", "Consolidate Merchandise Quotes")}</h4>
          <p class="text-xs text-slate-600 mb-4 leading-relaxed">
            ${tr(
              "Maria debe cerrar la tabla comparativa de precios con SOS Promotions, Everything Branded, Fast Promos y Vivid Ads.",
              "Maria must finalise the competitive quote table with SOS Promotions, Everything Branded, Fast Promos, and Vivid Ads."
            )}
          </p>
          <button onclick="setActiveTab('merch')" class="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition-all">
            ${tr("Ver Comparativa de Proveedores &rarr;", "View Supplier Comparison &rarr;")}
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
              ${tr("Colaboración & Acceso", "Collaboration & Access")}
            </span>
            <h3 class="text-xl font-bold text-[#323B3F] mt-1">${tr("Enlaces de Acceso Personalizados por Rol", "Role-Personalised Access Links")}</h3>
          </div>
          <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <p class="text-xs text-slate-600 mt-2 mb-4 leading-relaxed">
          ${tr(
            "Cada enlace abre el Centro de Control configurado para el rol específico, permitiendo a la agencia fijar sus fechas, a Lachlan evaluar el estado ejecutivo y al equipo operar sin desorganización.",
            "Each secure link opens the Control Centre configured for that specific role, enabling onmove to commit their delivery dates, Lachlan to assess executive progress, and internal teams to eliminate coordination bottlenecks."
          )}
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
                  ${tunnelInfo.active ? tr("Túnel Público Seguro Activo (HTTPS)", "Active Secure Public Tunnel (HTTPS)") : tr("Acceso Público en la Nube (Cloudflare)", "Cloudflare Public Tunnel Access")}
                </h4>
              </div>
              <p class="text-[11px] text-slate-600 mt-1">
                ${tunnelInfo.active ? 
                  `${tr("URL Pública:", "Public URL:")} <strong class="text-emerald-800 select-all">${tunnelInfo.publicUrl}</strong>` : 
                  tr("Genera una URL segura accesible desde cualquier dispositivo (celulares, red NSW Health, computadoras de la agencia).", "Generate a secure URL accessible from any mobile device, NSW Health network, or external agency workstation.")}
              </p>
            </div>

            <div>
              ${tunnelInfo.active ? `
                <div class="flex items-center gap-2">
                  <button onclick="copyToClipboard('${tunnelInfo.publicUrl}')" class="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg shadow">
                    ${tr("Copiar URL Pública", "Copy Public URL")}
                  </button>
                  <button onclick="toggleTunnel('stop')" class="px-2.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 font-bold text-xs rounded-lg">
                    ${tr("Detener", "Stop")}
                  </button>
                </div>
              ` : `
                <button onclick="toggleTunnel('start')" id="btnStartTunnel" class="px-4 py-2 bg-slate-900 hover:bg-black text-[#96EE89] font-bold text-xs rounded-lg shadow flex items-center gap-1.5">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                  ${tr("Activar Enlace Público (1 Clic)", "Activate Public Link (1-Click)")}
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
                <span class="font-bold text-slate-900">${tr("🏢 Enlace para la Agencia (onmove)", "🏢 onmove Agency Access Link")}</span>
                <span class="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">${tr("Fijar Fechas", "Commit ETAs")}</span>
              </div>
              <p class="text-[11px] text-slate-500 mt-0.5">
                ${tr("Abre directamente la vista de sprints para que ingresen y comprometan sus fechas de entrega (ETAs).", "Directly opens sprint deliverables for onmove to review and commit milestone delivery dates.")}
              </p>
            </div>
            <button onclick="copyToClipboard('${baseUrl}/?role=agency&tab=agency')" class="whitespace-nowrap px-3 py-1.5 bg-[#323B3F] hover:bg-slate-900 text-[#96EE89] font-bold rounded-lg shadow flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/>
              </svg>
              ${tr("Copiar Enlace", "Copy Link")}
            </button>
          </div>

          <!-- 2. Rol Ejecutivo (Lachlan) -->
          <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="font-bold text-slate-900">${tr("👑 Enlace para Lachlan (Líder de Área)", "👑 Lachlan (Executive Sponsor) Link")}</span>
                <span class="text-[10px] font-bold bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">${tr("Reporte & Board", "Board Report")}</span>
              </div>
              <p class="text-[11px] text-slate-500 mt-0.5">
                ${tr("Muestra el radar estratégico (Dónde estamos, Dónde vamos, Próximo paso) y exportación de informe PDF.", "Displays the Strategic Radar (Where we are, Where we are headed, Next step) and PDF export.")}
              </p>
            </div>
            <button onclick="copyToClipboard('${baseUrl}/?role=executive&tab=radar')" class="whitespace-nowrap px-3 py-1.5 bg-[#323B3F] hover:bg-slate-900 text-[#96EE89] font-bold rounded-lg shadow flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/>
              </svg>
              ${tr("Copiar Enlace", "Copy Link")}
            </button>
          </div>

          <!-- 3. Rol Operativo (Equipo W2W) -->
          <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="font-bold text-slate-900">${tr("👥 Enlace Operativo & Anti-Cuellos de Botella", "👥 W2W Team Operations Link")}</span>
                <span class="text-[10px] font-bold bg-red-100 text-red-800 px-2 py-0.5 rounded-full">${tr("SLA 48h", "48h SLA")}</span>
              </div>
              <p class="text-[11px] text-slate-500 mt-0.5">
                ${tr("Tablero Kanban con asignación de dueño único y semáforo de revisiones atrasadas.", "Kanban workflow board with single-owner accountability and 48-hour SLA bottleneck alerts.")}
              </p>
            </div>
            <button onclick="copyToClipboard('${baseUrl}/?role=operations&tab=workflow')" class="whitespace-nowrap px-3 py-1.5 bg-[#323B3F] hover:bg-slate-900 text-[#96EE89] font-bold rounded-lg shadow flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/>
              </svg>
              ${tr("Copiar Enlace", "Copy Link")}
            </button>
          </div>

          <!-- 4. Rol Redes & Growth (Luis) -->
          <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="font-bold text-slate-900">${tr("📈 Enlace Campañas (Meta Ads & Google)", "📈 Paid Media & Telephony Link")}</span>
                <span class="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">${tr("Pauta & Telefonía", "Growth & Inquiries")}</span>
              </div>
              <p class="text-[11px] text-slate-500 mt-0.5">
                ${tr("Desglose de los 7 conjuntos de anuncios por idioma, llamadas fuera de NSW y reserva de Google.", "Breakdown of 7 language-targeted ad sets, interstate call volume, and Google reserve strategy.")}
              </p>
            </div>
            <button onclick="copyToClipboard('${baseUrl}/?role=media&tab=media')" class="whitespace-nowrap px-3 py-1.5 bg-[#323B3F] hover:bg-slate-900 text-[#96EE89] font-bold rounded-lg shadow flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/>
              </svg>
              ${tr("Copiar Enlace", "Copy Link")}
            </button>
          </div>

          <!-- 5. Rol Merchandising (Maria) -->
          <div class="p-3.5 bg-slate-50 rounded-xl border border-slate-200 hover:border-slate-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="font-bold text-slate-900">${tr("📦 Enlace Merchandising & Proveedores", "📦 Merchandise & Procurement Link")}</span>
                <span class="text-[10px] font-bold bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">${tr("Cotizaciones", "Supplier Quotes")}</span>
              </div>
              <p class="text-[11px] text-slate-500 mt-0.5">
                ${tr("Tabla de los 11 artículos pedidos, directorio de los 4 proveedores y control de presupuesto.", "Inventory tracking of 11 items, 4 supplier quotes directory, and Pantone 2267 C specifications.")}
              </p>
            </div>
            <button onclick="copyToClipboard('${baseUrl}/?role=merch&tab=merch')" class="whitespace-nowrap px-3 py-1.5 bg-[#323B3F] hover:bg-slate-900 text-[#96EE89] font-bold rounded-lg shadow flex items-center gap-1.5">
              <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/>
              </svg>
              ${tr("Copiar Enlace", "Copy Link")}
            </button>
          </div>
        </div>

        <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end">
          <button onclick="closeModal()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl">
            ${tr("Listo / Cerrar", "Done / Close")}
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
    btn.innerHTML = `<span class="animate-spin mr-1">⏳</span> ${tr("Generando enlace seguro...", "Generating secure tunnel...")}`;
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
      showToast(action === 'start' ? tr("¡Enlace público seguro generado!", "Secure public tunnel generated!") : tr("Túnel detenido", "Tunnel stopped"), "success");
      openShareModal(); // Refrescar modal
    } else {
      showToast(tr("Error al configurar túnel: ", "Error configuring tunnel: ") + (result.error || ""), "error");
    }
  } catch (err) {
    showToast(tr("Error comunicando con el servidor local", "Error connecting to local server"), "error");
  }
}

function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(tr("¡Enlace copiado al portapapeles!", "Link copied to clipboard!"), "success");
  }).catch(() => {
    prompt(tr("Copia este enlace manualmente:", "Copy this link manually:"), text);
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
          <h3 class="text-lg font-bold text-[#323B3F]">${tr("Plantilla de Correo Lista para Enviar", "Ready-to-Send Email Template")}</h3>
          <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="mt-4 space-y-3 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">${tr("Destinatario:", "Recipient:")}</label>
            <div class="bg-slate-50 p-2 rounded-lg border border-slate-200 text-slate-800 font-semibold">
              ${action.owner === 'onmove (Agencia)' ? 'projects@onmove.com.au' : 'joshua.clinical@health.nsw.gov.au'}
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">${tr("Asunto:", "Subject:")}</label>
            <input type="text" id="emailSubjectInput" value="${action.emailTemplate.subject}" 
                   class="w-full bg-slate-50 p-2 rounded-lg border border-slate-200 text-slate-800 font-bold focus:outline-none" />
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">${tr("Cuerpo del Mensaje:", "Message Body:")}</label>
            <textarea id="emailBodyInput" rows="8" 
                      class="w-full bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-800 font-mono text-[11px] leading-relaxed focus:outline-none">${action.emailTemplate.body}</textarea>
          </div>
        </div>

        <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
          <button onclick="closeModal()" class="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl">
            ${tr("Cerrar", "Close")}
          </button>
          <button onclick="copyEmailToClipboard()" class="px-4 py-2 bg-[#323B3F] hover:bg-slate-900 text-[#96EE89] text-xs font-bold rounded-xl shadow flex items-center gap-2">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3"/>
            </svg>
            ${tr("Copiar al Portapapeles", "Copy to Clipboard")}
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
    showToast(tr("¡Texto de correo copiado al portapapeles!", "Email draft copied to clipboard!"), "success");
    closeModal();
  }).catch(() => {
    showToast(tr("No se pudo copiar automáticamente, copia manualmente.", "Could not copy automatically, please copy manually."), "error");
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
          <h3 class="text-lg font-bold text-[#323B3F]">${tr("Nueva Tarea / Aprobación", "New Task / Sign-off")}</h3>
          <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <form onsubmit="handleCreateTask(event)" class="mt-4 space-y-3 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">${tr("Título de la Tarea:", "Task Title:")}</label>
            <input type="text" id="newTaskTitle" required placeholder="${tr("Ej: Revisión de textos en Dari", "e.g. Dari translated copy review")}" 
                   class="w-full bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#96EE89]" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">${tr("Responsable Único:", "Single Assignee:")}</label>
              <select id="newTaskAssignee" class="w-full bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-800">
                ${AppState.data.teamOperations.members.map(m => `
                  <option value="${m.id}">${m.name}</option>
                `).join('')}
              </select>
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">${tr("Prioridad:", "Priority:")}</label>
              <select id="newTaskPriority" class="w-full bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-800">
                <option value="critical">${tr("Crítica", "Critical")}</option>
                <option value="high" selected>${tr("Alta", "High")}</option>
                <option value="medium">${tr("Media", "Medium")}</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">${tr("Etapa Inicial:", "Initial Stage:")}</label>
              <select id="newTaskStage" class="w-full bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-800">
                <option value="requested">${tr("1. Solicitado", "1. Requested")}</option>
                <option value="in_prep" selected>${tr("2. En Redacción", "2. In Drafting")}</option>
                <option value="tech_review">${tr("3. Revisión Técnica", "3. Technical Review")}</option>
                <option value="clinical_review">${tr("4. Revisión Clínica", "4. Clinical Review")}</option>
                <option value="area_approval">${tr("5. Aprobación Área", "5. Area Sign-off")}</option>
              </select>
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">${tr("Fecha Límite:", "Due Date:")}</label>
              <input type="date" id="newTaskDueDate" required 
                     class="w-full bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-800" />
            </div>
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">${tr("Notas / Instrucciones:", "Notes / Instructions:")}</label>
            <textarea id="newTaskNotes" rows="2" placeholder="${tr("Detalles de la entrega...", "Deliverable details...")}" 
                      class="w-full bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-800 focus:outline-none"></textarea>
          </div>

          <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button type="button" onclick="closeModal()" class="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl">${tr("Cancelar", "Cancel")}</button>
            <button type="submit" class="px-4 py-2 bg-[#323B3F] hover:bg-slate-900 text-[#96EE89] font-bold rounded-xl shadow">${tr("Crear Tarea", "Create Task")}</button>
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
  showToast(tr("Nueva tarea creada exitosamente", "New task created successfully"), "success");
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
          <h3 class="text-lg font-bold text-[#323B3F]">${tr("Agregar Artículo de Merchandising", "Add Merchandise Item")}</h3>
          <button onclick="closeModal()" class="text-slate-400 hover:text-slate-600">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <form onsubmit="handleCreateMerch(event)" class="mt-4 space-y-3 text-xs">
          <div>
            <label class="block font-bold text-slate-700 mb-1">${tr("Nombre del Artículo:", "Item Name:")}</label>
            <input type="text" id="newMerchItem" required placeholder="${tr("Ej: Banderines para eventos", "e.g. Event Banners & Table Runners")}" 
                   class="w-full bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-800" />
          </div>

          <div>
            <label class="block font-bold text-slate-700 mb-1">${tr("Especificaciones:", "Specifications:")}</label>
            <input type="text" id="newMerchSpecs" required placeholder="${tr("Ej: 50 unidades lona impresa", "e.g. 50 units printed heavy canvas")}" 
                   class="w-full bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-800" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">${tr("Cantidad:", "Quantity:")}</label>
              <input type="number" id="newMerchQty" required min="1" value="50" 
                     class="w-full bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-800" />
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">${tr("Costo Estimado ($AUD):", "Estimated Cost ($AUD):")}</label>
              <input type="number" id="newMerchCost" step="0.01" required value="250.00" 
                     class="w-full bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-800" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block font-bold text-slate-700 mb-1">${tr("Proveedor:", "Supplier:")}</label>
              <select id="newMerchSupplier" class="w-full bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-800">
                ${AppState.data.merchandising.suppliers.map(s => `
                  <option value="${s.id}">${s.name}</option>
                `).join('')}
              </select>
            </div>
            <div>
              <label class="block font-bold text-slate-700 mb-1">${tr("Color / Versión:", "Colour / Finish:")}</label>
              <input type="text" id="newMerchColor" value="Renewal Green #96EE89" 
                     class="w-full bg-slate-50 p-2.5 rounded-lg border border-slate-200 text-slate-800" />
            </div>
          </div>

          <div class="mt-6 pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button type="button" onclick="closeModal()" class="px-4 py-2 bg-slate-100 text-slate-700 font-bold rounded-xl">${tr("Cancelar", "Cancel")}</button>
            <button type="submit" class="px-4 py-2 bg-[#323B3F] hover:bg-slate-900 text-[#96EE89] font-bold rounded-xl shadow">${tr("Guardar Artículo", "Save Item")}</button>
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
