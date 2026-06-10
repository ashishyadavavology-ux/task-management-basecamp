export const OWNER_EMAIL = "ashishyadav.avology@gmail.com";

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export function isOwnerEmail(email: string | null | undefined) {
  return normalizeEmail(email || "") === normalizeEmail(OWNER_EMAIL);
}

export function isWorkspaceOwner(
  userId: string | null | undefined,
  ownerId: string | null | undefined,
  email: string | null | undefined,
) {
  if (!userId) return false;
  if (ownerId && userId === ownerId) return true;
  return isOwnerEmail(email);
}
