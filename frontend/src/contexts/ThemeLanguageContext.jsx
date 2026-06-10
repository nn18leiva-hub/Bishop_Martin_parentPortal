import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeLanguageContext = createContext(null);

const translations = {
  en: {
    dashboard: "Dashboard",
    all_documents: "All Documents",
    approval_queue: "Approval Queue",
    staff_directory: "Staff Directory",
    archive: "Archive",
    help_center: "Help Center",
    sign_out: "Sign Out",
    new_entry: "New Entry",
    new_request: "New Request",
    search_records: "Search records...",
    search_registry: "Search registry...",
    filter_list: "Filter List",
    add_new_staff: "Add New Staff",
    staff_registry: "Staff Registry",
    active_requests: "ACTIVE REQUESTS",
    awaiting_action: "Awaiting processing or action",
    parent_dashboard: "Parent Dashboard",
    recent_requests: "Recent Document Requests",
    view_all: "View All",
    requests: "Requests",
    verification: "Verification",
    user_management: "User Management"
  },
  es: {
    dashboard: "Tablero",
    all_documents: "Todos los Documentos",
    approval_queue: "Cola de Aprobación",
    staff_directory: "Directorio de Personal",
    archive: "Archivo",
    help_center: "Centro de Ayuda",
    sign_out: "Cerrar Sesión",
    new_entry: "Nueva Entrada",
    new_request: "Nueva Solicitud",
    search_records: "Buscar registros...",
    search_registry: "Buscar directorio...",
    filter_list: "Filtrar Lista",
    add_new_staff: "Agregar Personal",
    staff_registry: "Registro de Personal",
    active_requests: "SOLICITUDES ACTIVAS",
    awaiting_action: "En espera de procesamiento o acción",
    parent_dashboard: "Panel de Padres",
    recent_requests: "Solicitudes de Documentos Recientes",
    view_all: "Ver Todo",
    requests: "Solicitudes",
    verification: "Verificación",
    user_management: "Gestión de Usuarios"
  },
  bz: {
    dashboard: "Dashboard",
    all_documents: "All di Paper dem",
    approval_queue: "Approve Line",
    staff_directory: "Workers List",
    archive: "Old Records",
    help_center: "Help Spot",
    sign_out: "Log Out",
    new_entry: "New Ting",
    new_request: "New Request",
    search_records: "Look fi paper dem...",
    search_registry: "Look fi worker dem...",
    filter_list: "Sort List",
    add_new_staff: "Add New Worker",
    staff_registry: "School Workers",
    active_requests: "ACTIVE REQUESTS DEM",
    awaiting_action: "Waiting fi check up",
    parent_dashboard: "Parent Yard",
    recent_requests: "New Request Dem",
    view_all: "See All",
    requests: "Request dem",
    verification: "Check Identity",
    user_management: "Profile Work"
  },
  fr: {
    dashboard: "Tableau de Bord",
    all_documents: "Tous les Documents",
    approval_queue: "File d'Attente d'Approbation",
    staff_directory: "Répertoire du Personnel",
    archive: "Archive",
    help_center: "Centre d'Aide",
    sign_out: "Se Déconnecter",
    new_entry: "Nouvelle Entrée",
    new_request: "Nouvelle Demande",
    search_records: "Rechercher des dossiers...",
    search_registry: "Rechercher dans le registre...",
    filter_list: "Filtrer la Liste",
    add_new_staff: "Ajouter du Personnel",
    staff_registry: "Registre du Personnel",
    active_requests: "DEMANDES ACTIVES",
    awaiting_action: "En attente de traitement ou d'action",
    parent_dashboard: "Tableau des Parents",
    recent_requests: "Demandes de Documents Récentes",
    view_all: "Voir Tout",
    requests: "Demandes",
    verification: "Vérification",
    user_management: "Gestion des Utilisateurs"
  }
};

export const ThemeLanguageProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => localStorage.getItem('app-theme') || 'light');
  const [language, setLanguage] = useState(() => localStorage.getItem('app-lang') || 'en');

  useEffect(() => {
    localStorage.setItem('app-theme', theme);
    if (theme === 'dark') {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem('app-lang', language);
  }, [language]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const t = (key) => {
    return translations[language]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <ThemeLanguageContext.Provider value={{ theme, toggleTheme, language, setLanguage, t }}>
      {children}
    </ThemeLanguageContext.Provider>
  );
};

export const useSettings = () => useContext(ThemeLanguageContext);
