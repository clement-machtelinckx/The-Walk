export const AVATARS = [
    { key: "artificier_gnome_light", label: "Artificier gnome" },
    { key: "assassin_dark", label: "Assassin" },
    { key: "barde_tieffelin_light", label: "Barde tieffelin" },
    { key: "chevalier_dark", label: "Chevalier sombre" },
    { key: "chevalier_humain_light", label: "Chevalier humain" },
    { key: "druide_elfe_light", label: "Druide elfe" },
    { key: "guerrier_nain_dark", label: "Guerrier nain" },
    { key: "guerriere_naine_light", label: "Guerriere naine" },
    { key: "guerriere_orque_dark", label: "Guerriere orque" },
    { key: "liche_dark", label: "Liche" },
    { key: "mage_draconide_dark", label: "Mage draconide" },
    { key: "mage_drow_dark", label: "Mage drow" },
    { key: "rodeur_elfe_light", label: "Rodeur elfe" },
    { key: "rodeuse_drow_dark", label: "Rodeuse drow" },
    { key: "rodeuse_elfe_light", label: "Rodeuse elfe" },
    { key: "sorciere_dark", label: "Sorciere" },
] as const;

export type AvatarKey = (typeof AVATARS)[number]["key"];

const AVATAR_KEYS = new Set<string>(AVATARS.map((avatar) => avatar.key));

export function isAvatarKey(value: unknown): value is AvatarKey {
    return typeof value === "string" && AVATAR_KEYS.has(value);
}

export function getAvatarImagePath(avatarKey: AvatarKey): string {
    return `/images/avatars/${avatarKey}.webp`;
}

export function getAvatarByKey(avatarKey: string | null | undefined) {
    return AVATARS.find((avatar) => avatar.key === avatarKey) ?? null;
}
