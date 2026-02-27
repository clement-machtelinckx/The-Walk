export type ContactKey =
    | "default"
    | "partner"
    | "becomePartner"
    | "customer"
    | "protecaudio"
    | "rossard"
    | "recrutement"
    | "placeholder"; // pour les tests, à supprimer ensuite

export type ContactInfo = {
    label: string;        // "Contact", "Partenaires", ...
    phone: string;        // "02 79 02 77 28"
    email: string;        // "contact@markassur.com"
    hours?: string;
};

export const PLACEHOLDER_CONTACT: ContactInfo = {
    label: "Contact",
    phone: "XX XX XX XX XX",
    email: "placeholder@example.com",
    hours: "Du lundi au vendredi de 9h à 18h.",
};

// pointe sur placeholder le temps d'avoir les vrais data 

// export const CONTACTS: Record<ContactKey, ContactInfo> = {
//     default: PLACEHOLDER_CONTACT,
//     partner: PLACEHOLDER_CONTACT,
//     becomePartner: PLACEHOLDER_CONTACT,
//     customer: PLACEHOLDER_CONTACT,
//     protecaudio: PLACEHOLDER_CONTACT,
//     rossard: PLACEHOLDER_CONTACT,
//     placeholder: PLACEHOLDER_CONTACT,
// };

// a activer une fois les data des contact reçus 

export const CONTACTS: Record<ContactKey, ContactInfo> = {
    default: {
        label: "Contact",
        phone: "02 79 02 77 28",
        email: "contact@markassur.com",
        hours: "Du lundi au vendredi de 9h à 18h.",
    },
    partner: {
        label: "Partenaires",
        phone: "02 79 02 77 28",
        email: "partenaires@markassur.com",
    },
    becomePartner: {
        label: "Devenir partenaire",
        phone: "02 79 02 77 28",
        email: "devenir@markassur.com",
    },
    customer: {
        label: "Contact",
        phone: "02 79 02 77 28",
        email: "contact@markassur.com",
    },
    protecaudio: {
        label: "ProtecAudio",
        phone: "09 80 08 50 47",
        email: "contact@protecaudio.fr",
        // email: "clement.machtelinckx@laplateforme.io",
    },
    rossard: {
        label: "Rossard Assurances",
        phone: "02 00 00 00 00",
        email: "contact@rossard-assurances.fr",
        // email: "clement.machtelinckx@laplateforme.io",
    },
    recrutement: {
        label: "Recrutement",
        email: "recrutement@protec.test",
        phone: "—",
    },
    placeholder: {
        label: "placeholder",
        phone: "06 00 00 00 00",
        email: "placeholder@email.com",
    },
};

export function telHref(phone: string) {
    return `tel:${phone.replace(/\s/g, "")}`;
}

export function mailHref(email: string) {
    return `mailto:${email}`;
}