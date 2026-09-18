const KEY = "urbanmesh.myReports";

export interface StoredReport {
  id: string;
  at: string;
}

export function loadMyReportIds(): StoredReport[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredReport[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function rememberMyReport(id: string): void {
  const next = [
    { id, at: new Date().toISOString() },
    ...loadMyReportIds().filter((row) => row.id !== id),
  ].slice(0, 100);
  localStorage.setItem(KEY, JSON.stringify(next));
}
