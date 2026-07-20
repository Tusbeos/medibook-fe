export type PatientAuthBookingKind = "doctor" | "package";

export interface PendingPatientAuthFlow {
  email: string;
  returnTo: string;
  bookingKind: PatientAuthBookingKind;
  bookingDraft: Record<string, unknown>;
  routeState?: Record<string, unknown>;
}

const STORAGE_KEY = "medibook.pending-patient-auth";

export const savePendingPatientAuthFlow = (
  flow: PendingPatientAuthFlow,
) => {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(flow));
};

export const getPendingPatientAuthFlow = (): PendingPatientAuthFlow | null => {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PendingPatientAuthFlow) : null;
  } catch (_) {
    sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }
};

export const clearPendingPatientAuthFlow = () => {
  sessionStorage.removeItem(STORAGE_KEY);
};
