import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

/**
 * Formate une date (ISO string ou Date object) en format lisible par l'utilisateur (Français).
 * @example "Lundi 15 avril 2026 à 10:27"
 */
export function formatFullDate(date: string | Date | null | undefined): string {
    if (!date) return "Non fixée";
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return format(dateObj, "eeee d MMMM yyyy 'à' HH:mm", { locale: fr });
}

/**
 * Formate une date pour l'affichage court (ex: dans une liste).
 * @example "15/04/2026 10:27"
 */
export function formatShortDate(date: string | Date | null | undefined): string {
    if (!date) return "N/A";
    const dateObj = typeof date === "string" ? parseISO(date) : date;
    return format(dateObj, "dd/MM/yyyy HH:mm", { locale: fr });
}

/**
 * Formate une date pour un input HTML type "datetime-local".
 * Attend "YYYY-MM-DDTHH:mm".
 */
export function formatForInput(date: string | Date | null | undefined): string {
    if (!date) return "";
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) return "";

    // On utilise local time pour l'input
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const day = String(dateObj.getDate()).padStart(2, "0");
    const hours = String(dateObj.getHours()).padStart(2, "0");
    const minutes = String(dateObj.getMinutes()).padStart(2, "0");

    return `${year}-${month}-${day}T${hours}:${minutes}`;
}

/**
 * Convertit une valeur d'input "datetime-local" en ISO string pour le transport/API.
 * Gère les éventuels problèmes de timezone en restant explicite.
 */
export function inputToISO(value: string | null | undefined): string | null {
    if (!value) return null;
    const date = new Date(value);
    if (isNaN(date.getTime())) return null;
    return date.toISOString();
}
