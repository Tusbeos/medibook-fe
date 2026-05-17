import { useState, useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import { IClinic, IRootState } from "../../../types";
import { USER_ROLE } from "../../../utils";
import { useGetClinicsQuery } from "../../../store/api/publicApi";

export const useClinicContext = () => {
  const userInfo = useSelector((state: IRootState) => state.user.userInfo);
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
  const { data: clinicsResponse } = useGetClinicsQuery(undefined, {
    skip: !isClinicManager,
  });
  const clinics = useMemo<IClinic[]>(
    () =>
      clinicsResponse?.errCode === 0 && Array.isArray(clinicsResponse.data)
        ? clinicsResponse.data
        : [],
    [clinicsResponse],
  );

  useEffect(() => {
    if (!isClinicManager) {
      setSelectedClinicId("");
      return;
    }
    setSelectedClinicId(userClinicId ? String(userClinicId) : "");
  }, [isClinicManager, userClinicId]);

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
