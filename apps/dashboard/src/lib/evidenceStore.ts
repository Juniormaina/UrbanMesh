const KEY = "urbanmesh.lpdpSelection";

export function loadEvidenceSelection(): string[] | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveEvidenceSelection(ids: string[]): void {
  sessionStorage.setItem(KEY, JSON.stringify(ids));
}

export function addEvidenceCluster(id: string): string[] {
  const current = loadEvidenceSelection() ?? [];
  const next = current.includes(id) ? current : [...current, id];
  saveEvidenceSelection(next);
  return next;
}