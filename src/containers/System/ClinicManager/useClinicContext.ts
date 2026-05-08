import { useState, useEffect, useMemo, useCallback } from "react";
import { useSelector } from "react-redux";
import { handleGetAllClinics } from "../../../services/clinicService";
import { IClinic, IRootState } from "../../../types";
import { USER_ROLE } from "../../../utils";

export const useClinicContext = () => {
  const userInfo = useSelector((state: IRootState) => state.user.userInfo);
  const [clinics, setClinics] = useState<IClinic[]>([]);
  const [selectedClinicId, setSelectedClinicId] = useState<number | string>("");

  const roleId = userInfo?.roleId || (userInfo as any)?.roleData?.keyMap;
  const isClinicManager = roleId === USER_ROLE.CLINIC_MANAGER;
  const userClinicId =
    (userInfo as any)?.clinicId ||
    (userInfo as any)?.clinic_id ||
    (userInfo as any)?.clinic?.id ||
    (userInfo as any)?.clinicData?.id ||
    "";
  const userClinicName =
    (userInfo as any)?.clinicName ||
    (userInfo as any)?.clinic_name ||
    (userInfo as any)?.clinic?.name ||
    (userInfo as any)?.clinicData?.name ||
    "";

  useEffect(() => {
    if (!isClinicManager) {
      setSelectedClinicId("");
      return;
    }
    setSelectedClinicId(userClinicId ? String(userClinicId) : "");
  }, [isClinicManager, userClinicId]);

  useEffect(() => {
    const loadClinics = async () => {
      if (!isClinicManager) {
        setClinics([]);
        return;
      }
      try {
        const res = await handleGetAllClinics();
        const clinicList =
          res?.errCode === 0 && Array.isArray(res.data) ? res.data : [];
        setClinics(clinicList);
      } catch {
        setClinics([]);
      }
    };
    loadClinics();
  }, [isClinicManager]);

  const selectedClinic = useMemo(
    () => clinics.find((c) => String(c.id) === String(selectedClinicId)),
    [clinics, selectedClinicId],
  );
  const displayClinicName =
    selectedClinic?.name || userClinicName || "MediBook";

  return {
    isClinicManager,
    selectedClinicId,
    displayClinicName,
    clinics,
    userInfo,
  };
};
