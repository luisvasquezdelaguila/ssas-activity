// Helpers para localStorage
import { LocalStorageSchema } from "@/types";

export function getFromLocalStorage(): LocalStorageSchema & { areas?: any[] } {
  if (typeof window === "undefined") return { users: [], companies: [], activities: [], currentSession: null, areas: [] };
  // Leer usuarios
  let users = [];
  const usersRaw = localStorage.getItem("saas-platform-users") || localStorage.getItem("users") || localStorage.getItem("user-storage");
  if (usersRaw) {
    try {
      users = JSON.parse(usersRaw);
      // Si viene como objeto con .state.users
      if (users && users.state && Array.isArray(users.state.users)) users = users.state.users;
    } catch {}
  }
  // Leer compañías
  let companies = [];
  const companiesRaw = localStorage.getItem("saas-platform-companies") || localStorage.getItem("companies") || localStorage.getItem("company-storage");
  if (companiesRaw) {
    try {
      companies = JSON.parse(companiesRaw);
      if (companies && companies.state && Array.isArray(companies.state.companies)) companies = companies.state.companies;
    } catch {}
  }
  // Leer actividades
  let activities = [];
  const activitiesRaw = localStorage.getItem("saas-platform-activities") || localStorage.getItem("activities") || localStorage.getItem("activity-storage");
  if (activitiesRaw) {
    try {
      // Puede venir como objeto con .state.activities o como array
      const parsed = JSON.parse(activitiesRaw);
      if (Array.isArray(parsed)) activities = parsed;
      else if (parsed && parsed.state && Array.isArray(parsed.state.activities)) activities = parsed.state.activities;
    } catch {}
  }
  // Leer áreas
  let areas = [];
  const areasRaw = localStorage.getItem("saas-platform-areas") || localStorage.getItem("areas");
  if (areasRaw) {
    try {
      areas = JSON.parse(areasRaw);
    } catch {}
  }
  // Leer sesión actual
  let currentSession = null;
  const authRaw = localStorage.getItem("auth-storage") || localStorage.getItem("currentSession");
  if (authRaw) {
    try {
      const parsed = JSON.parse(authRaw);
      // Si viene como objeto con .state.session
      if (parsed && parsed.state && parsed.state.session) currentSession = parsed.state.session;
      else currentSession = parsed;
    } catch {}
  }
  return { users, companies, activities, currentSession, areas };
}

export function setToLocalStorage(data: Partial<LocalStorageSchema> & { areas?: any[] }) {
  if (typeof window === "undefined") return;
  if (data.users) localStorage.setItem("saas-platform-users", JSON.stringify(data.users));
  if (data.companies) localStorage.setItem("saas-platform-companies", JSON.stringify(data.companies));
  if (data.activities) localStorage.setItem("saas-platform-activities", JSON.stringify(data.activities));
  if (data.currentSession !== undefined) localStorage.setItem("auth-storage", JSON.stringify({ state: { session: data.currentSession } }));
  if (data.areas) localStorage.setItem("saas-platform-areas", JSON.stringify(data.areas));
}
import { twMerge } from "tailwind-merge";
import clsx, { ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(...inputs));
}
