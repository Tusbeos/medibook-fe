import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { FormattedMessage } from "react-intl";
import { useSelector } from "react-redux";
import "./ManageSchedule.scss";
import Select from "react-select";
import { LANGUAGES, USER_ROLE } from "../../../utils";
import DatePicker from "components/Input/DatePicker";
import { DataState } from "components/System/SystemShared";
import { toast } from "react-toastify";
import _ from "lodash";
import moment from "moment";
import { IAllCode, IRootState } from "../../../types";
import {
  useGetAllCodeQuery,
  useGetAllDoctorsQuery,
  useGetDoctorsByClinicIdQuery,
  useGetDoctorScheduleQuery,
  useDeleteDoctorScheduleMutation,
  useSaveDoctorScheduleMutation,
} from "../../../store/api/publicApi";

const DEFAULT_MAX_NUMBER = 5;
const MIN_MAX_NUMBER = 1;
const MAX_MAX_NUMBER = 20;

const TIME_SLOT_GROUPS = [
  { key: "morning", label: "Buổi sáng" },
  { key: "afternoon", label: "Buổi chiều" },
  { key: "evening", label: "Buổi tối" },
];

const getTimeSlotOrder = (keyMap = "") => {
  const match = keyMap.match(/(\d+)$/);
  return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
};

const getTimeSlotGroup = (slot: IAllCode) => {
  const startHour = Number(slot.valueVi?.match(/^(\d{1,2}):/)?.[1]);
  if (Number.isFinite(startHour)) {
    if (startHour < 12) return "morning";
    if (startHour < 17) return "afternoon";
    return "evening";
  }

  const order = getTimeSlotOrder(slot.keyMap);
  if (order <= 8) return "morning";
  if (order <= 16) return "afternoon";
  return "evening";
};

const getScheduleSnapshot = (slots: any[] = []) => {
  return JSON.stringify(
    slots.map((item) => ({
      id: item.id || null,
      keyMap: item.keyMap,
      isSelected: Boolean(item.isSelected),
      pendingDelete: Boolean(item.pendingDelete),
      maxNumber:
        item.isSelected && !item.pendingDelete
          ? Number(item.maxNumber || DEFAULT_MAX_NUMBER)
          : null,
    })),
  );
};

const ManageSchedule = () => {
  const language = useSelector((state: IRootState) => state.app.language);
  const userInfo = useSelector((state: IRootState) => state.user.userInfo);
  const [selectedDoctor, setSelectedDoctor] = useState<any>({});
  // DatePicker keeps a local Date; every API request uses ISO yyyy-MM-dd.
  const [startDate, setStartDate] = useState<Date>(
    new Date(new Date().setHours(0, 0, 0, 0)),
  );
  const [rangeTime, setRangeTime] = useState<any[]>([]);
  const [defaultMaxNumber, setDefaultMaxNumber] = useState(DEFAULT_MAX_NUMBER);
  const scheduleSnapshotRef = useRef(getScheduleSnapshot([]));
  const roleId = userInfo?.roleId || (userInfo as any)?.roleData?.keyMap;
  const isDoctor = roleId === USER_ROLE.DOCTOR;
  const isClinicManager = roleId === USER_ROLE.CLINIC_MANAGER;
  const isAdmin = roleId === USER_ROLE.ADMIN;
  const userClinicId =
    (userInfo as any)?.clinicId ||
    (userInfo as any)?.clinic_id ||
    (userInfo as any)?.clinic?.id ||
    (userInfo as any)?.clinicData?.id ||
    "";
  const userDoctorId = userInfo?.id || userInfo?.userId || "";
  const shouldLoadAllDoctors =
    isAdmin || (isDoctor && !userDoctorId && !!userInfo?.email);

  const {
    data: allDoctorsResponse,
    isLoading: isLoadingAllDoctors,
    isFetching: isFetchingAllDoctors,
    isError: isAllDoctorsError,
    refetch: refetchAllDoctors,
  } = useGetAllDoctorsQuery(undefined, {
    skip: !shouldLoadAllDoctors,
  });
  const {
    data: clinicDoctorsResponse,
    isLoading: isLoadingClinicDoctors,
    isFetching: isFetchingClinicDoctors,
    isError: isClinicDoctorsError,
    refetch: refetchClinicDoctors,
  } = useGetDoctorsByClinicIdQuery(userClinicId, {
    skip: !isClinicManager || !userClinicId,
  });
  const {
    data: timeCodesResponse,
    isLoading: isLoadingTimeCodes,
    isFetching: isFetchingTimeCodes,
    isError: isTimeCodesError,
    refetch: refetchTimeCodes,
  } = useGetAllCodeQuery("TIME");

  const allDoctors = useMemo(
    () =>
      allDoctorsResponse?.errCode === 0 &&
      Array.isArray(allDoctorsResponse.data)
        ? allDoctorsResponse.data
        : [],
    [allDoctorsResponse],
  );
  const clinicDoctors = useMemo(
    () =>
      clinicDoctorsResponse?.errCode === 0 &&
      Array.isArray(clinicDoctorsResponse.data)
        ? clinicDoctorsResponse.data
        : [],
    [clinicDoctorsResponse],
  );
  const timeSlots = useMemo(
    () =>
      timeCodesResponse?.errCode === 0 && Array.isArray(timeCodesResponse.data)
        ? timeCodesResponse.data
            .filter((slot: IAllCode) => Boolean(slot.keyMap))
            .sort(
              (first: IAllCode, second: IAllCode) =>
                getTimeSlotOrder(first.keyMap) - getTimeSlotOrder(second.keyMap),
            )
            .map((slot: IAllCode) => ({
              keyMap: slot.keyMap,
              valueVi: slot.valueVi || slot.keyMap,
              valueEn: slot.valueEn || slot.valueVi || slot.keyMap,
              group: getTimeSlotGroup(slot),
            }))
        : [],
    [timeCodesResponse],
  );

  const buildDataInputSelect = useCallback(
    (inputData: any[] = []) => {
      return inputData.map((item: any) => {
        const labelVi = `${item.lastName ?? ""} ${item.firstName ?? ""}`.trim();
        const labelEn = `${item.firstName ?? ""} ${item.lastName ?? ""}`.trim();
        return {
          label: language === LANGUAGES.VI ? labelVi : labelEn,
          value: item.id,
        };
      });
    },
    [language],
  );

  const buildTimeSlots = useCallback((scheduled: any[] = []) => {
    const scheduledByKey = new Map(
      scheduled.map((item: any) => [item.timeType, item]),
    );

    return timeSlots.map((slot) => {
      const existing = scheduledByKey.get(slot.keyMap);
      return {
        ...slot,
        id: existing?.id,
        isSelected: Boolean(existing),
        pendingDelete: false,
        maxNumber: existing?.maxNumber || DEFAULT_MAX_NUMBER,
        currentNumber: existing?.currentNumber || 0,
      };
    });
  }, [timeSlots]);

  const listDoctors = useMemo(() => {
    if (isClinicManager) return buildDataInputSelect(clinicDoctors);
    if (isAdmin) return buildDataInputSelect(allDoctors);
    return [];
  }, [
    allDoctors,
    buildDataInputSelect,
    clinicDoctors,
    isAdmin,
    isClinicManager,
  ]);

  const matchedDoctorId = useMemo(() => {
    if (!isDoctor || userDoctorId || !userInfo?.email) return "";
    return (
      allDoctors.find((item: any) => item?.email === userInfo.email)?.id || ""
    );
  }, [allDoctors, isDoctor, userDoctorId, userInfo?.email]);

  useEffect(() => {
    if (isDoctor && userInfo) {
      const labelVi =
        `${userInfo.lastName ?? ""} ${userInfo.firstName ?? ""}`.trim();
      const labelEn =
        `${userInfo.firstName ?? ""} ${userInfo.lastName ?? ""}`.trim();
      setSelectedDoctor({
        value: userDoctorId || matchedDoctorId,
        label: language === LANGUAGES.VI ? labelVi : labelEn,
      });
    }
  }, [isDoctor, language, matchedDoctorId, userDoctorId, userInfo]);

  useEffect(() => {
    if (isClinicManager) {
      setSelectedDoctor((current: any) =>
        current?.value ? current : listDoctors[0] || {},
      );
    }
  }, [isClinicManager, listDoctors]);

  const activeDoctorId =
    selectedDoctor?.value || (isDoctor ? userDoctorId || matchedDoctorId : "");
  const selectedDateValue = useMemo(
    () =>
      startDate
        ? moment(startDate).format("YYYY-MM-DD")
        : "",
    [startDate],
  );
  const shouldFetchSchedule = !!activeDoctorId && !!selectedDateValue;
  const {
    currentData: scheduleResponse,
    isLoading: isLoadingSchedule,
    isFetching: isFetchingSchedule,
    isError: isScheduleError,
    refetch: refetchSchedule,
  } = useGetDoctorScheduleQuery(
    { doctorId: activeDoctorId || "", date: selectedDateValue },
    { skip: !shouldFetchSchedule },
  );
  const [saveDoctorSchedule] = useSaveDoctorScheduleMutation();
  const [deleteDoctorSchedule] = useDeleteDoctorScheduleMutation();

  useEffect(() => {
    const scheduled =
      scheduleResponse?.errCode === 0 && Array.isArray(scheduleResponse.data)
        ? scheduleResponse.data
        : [];
    const nextSlots = buildTimeSlots(scheduled);
    scheduleSnapshotRef.current = getScheduleSnapshot(nextSlots);
    setRangeTime(nextSlots);
  }, [
    activeDoctorId,
    buildTimeSlots,
    isScheduleError,
    scheduleResponse,
    selectedDateValue,
    shouldFetchSchedule,
  ]);

  // selectedDoctor, startDate được xử lý trong effect tổng hợp bên trên

  const handleChangeSelectDoctor = useCallback(
    async (selected: any) => {
      if (isDoctor) return;
      if (!selected || !selected.value) return;
      setSelectedDoctor(selected);
    },
    [isDoctor],
  );

  // Khi selectedDoctor thay đổi → effect tổng hợp tự xử lý

  const handleChange = useCallback((selectedDates: Date[]) => {
    // Trường hợp không có ngày nào được chọn → giữ nguyên startDate
    if (!selectedDates || selectedDates.length === 0) return;
    const candidate = selectedDates[0];
    // Nếu date không hợp lệ → giữ nguyên, không set null
    if (!candidate || isNaN(new Date(candidate).getTime())) return;
    // Chuẩn hóa về nửa đêm để timestamp khớp phía patient query
    setStartDate(new Date(new Date(candidate).setHours(0, 0, 0, 0)));
  }, []);

  // Khi startDate thay đổi → effect tổng hợp tự xử lý

  const handleClickTime = useCallback((time: any) => {
    setRangeTime((prev) => {
      return prev.map((item) => {
        if (item.keyMap === time.keyMap) {
          if (item.isSelected && item.currentNumber > 0) {
            toast.warning("Khung giờ đã có bệnh nhân đặt lịch, không thể bỏ chọn.");
            return item;
          }
          return {
            ...item,
            isSelected: !item.isSelected,
            pendingDelete: item.isSelected && item.id ? true : false,
            maxNumber: item.maxNumber || defaultMaxNumber,
          };
        }
        return item;
      });
    });
  }, [defaultMaxNumber]);

  const handleChangeDefaultMaxNumber = useCallback((value: string) => {
    const nextValue = Number(value);
    if (!Number.isFinite(nextValue)) return;
    setDefaultMaxNumber(
      Math.min(MAX_MAX_NUMBER, Math.max(MIN_MAX_NUMBER, nextValue)),
    );
  }, []);

  const handleApplyDefaultMaxNumber = useCallback(() => {
    setRangeTime((prev) =>
      prev.map((item) => ({
        ...item,
        maxNumber: item.pendingDelete
          ? item.maxNumber
          : Math.max(defaultMaxNumber, item.currentNumber || 0),
      })),
    );
    toast.success("Đã áp dụng số bệnh nhân mặc định cho các khung giờ.");
  }, [defaultMaxNumber]);

  const handleChangeSlotMaxNumber = useCallback((time: any, value: string) => {
    const nextValue = Number(value);
    if (!Number.isFinite(nextValue)) return;

    setRangeTime((prev) =>
      prev.map((item) => {
        if (item.keyMap !== time.keyMap) return item;
        const minValue = Math.max(MIN_MAX_NUMBER, item.currentNumber || 0);
        return {
          ...item,
          maxNumber: Math.min(MAX_MAX_NUMBER, Math.max(minValue, nextValue)),
        };
      }),
    );
  }, []);

  const handleToggleGroup = useCallback((groupKey: string, selected: boolean) => {
    setRangeTime((prev) =>
      prev.map((item) => {
        if (item.group !== groupKey) return item;
        if (!selected && item.currentNumber > 0) return item;
        return {
          ...item,
          isSelected: selected,
          pendingDelete: !selected && item.id ? true : false,
          maxNumber: item.maxNumber || defaultMaxNumber,
        };
      }),
    );
  }, [defaultMaxNumber]);

  const hasScheduleChanges = useMemo(
    () => getScheduleSnapshot(rangeTime) !== scheduleSnapshotRef.current,
    [rangeTime],
  );

  const handleSaveSchedule = async () => {
    let result: any[] = [];
    let currentSelectedDoctor = selectedDoctor;

    const resolvedDoctorId =
      currentSelectedDoctor && currentSelectedDoctor.value
        ? currentSelectedDoctor.value
        : isDoctor
          ? userInfo?.id || userInfo?.userId
          : "";

    if (!startDate) {
      toast.error("Ngày không hợp lệ!");
      return;
    }
    if (!resolvedDoctorId) {
      console.log("[ManageSchedule] missing doctorId", {
        selectedDoctor: currentSelectedDoctor,
        resolvedDoctorId,
        userInfo,
      });
      toast.error("Chưa chọn bác sĩ!");
      return;
    }

    if (!currentSelectedDoctor || _.isEmpty(currentSelectedDoctor)) {
      if (isDoctor && resolvedDoctorId) {
        const labelVi =
          `${userInfo.lastName ?? ""} ${userInfo.firstName ?? ""}`.trim();
        const labelEn =
          `${userInfo.firstName ?? ""} ${userInfo.lastName ?? ""}`.trim();
        currentSelectedDoctor = {
          value: resolvedDoctorId,
          label: language === LANGUAGES.VI ? labelVi : labelEn,
        };
        setSelectedDoctor(currentSelectedDoctor);
      }
    }

    const parsedStartDate = startDate ? new Date(startDate) : null;
    // Chuẩn hóa về nửa đêm để timestamp khớp với phía patient query lịch
    const formatDate =
      parsedStartDate && !isNaN(parsedStartDate.getTime())
        ? moment(parsedStartDate).format("YYYY-MM-DD")
        : "";

    if (!formatDate) {
      toast.error("Ngày không hợp lệ!");
      return;
    }

    if (!hasScheduleChanges) {
      toast.info("Lịch khám chưa có thay đổi.");
      return;
    }

    if (timeSlots.length === 0) {
      toast.error("Không có định nghĩa khung giờ khám hợp lệ.");
      return;
    }

    if (rangeTime && rangeTime.length > 0) {
      let selectedTime = rangeTime.filter((item) => item.isSelected === true);
      const schedulesToDelete = rangeTime.filter(
        (item) => item.pendingDelete && item.id,
      );

      selectedTime.map((item) => {
        let object: any = {};
        object.doctorId = resolvedDoctorId;
        object.date = formatDate;
        object.timeType = item.keyMap;
        object.maxNumber = item.maxNumber || DEFAULT_MAX_NUMBER;
        result.push(object);
        return item;
      });

      if (result.length === 0 && schedulesToDelete.length === 0) {
        toast.error("Chưa chọn khung giờ!");
        return;
      }

      try {
        if (result.length > 0) {
          await saveDoctorSchedule({
            arrSchedule: result,
            doctorId: resolvedDoctorId,
            formattedDate: formatDate,
          }).unwrap();
        }

        if (schedulesToDelete.length > 0) {
          await Promise.all(
            schedulesToDelete.map((item) =>
              deleteDoctorSchedule({
                doctorId: resolvedDoctorId,
                scheduleId: item.id,
                date: formatDate,
              }).unwrap(),
            ),
          );
        }

        console.log("[ManageSchedule] save schedule payload", {
          doctorId: resolvedDoctorId,
          formattedDate: formatDate,
          arrSchedule: result,
          deleteScheduleIds: schedulesToDelete.map((item) => item.id),
        });

        const refreshed = await refetchSchedule().unwrap();
        const scheduled =
          refreshed && refreshed.errCode === 0 ? refreshed.data || [] : [];
        const nextSlots = buildTimeSlots(scheduled);
        scheduleSnapshotRef.current = getScheduleSnapshot(nextSlots);
        setRangeTime(nextSlots);
        toast.success("Lưu lịch khám thành công!");
      } catch {
        toast.error("Lưu lịch khám thất bại!");
      }
    }
  };

  // Ngày hiện tại (midnight) — stable qua các render, dùng cho minDate của DatePicker
  const currentDay = useMemo(
    () => new Date(new Date().setHours(0, 0, 0, 0)),
    [],
  );
  const isLoadingDoctorList = isClinicManager
    ? isLoadingClinicDoctors || isFetchingClinicDoctors
    : shouldLoadAllDoctors && (isLoadingAllDoctors || isFetchingAllDoctors);
  const isDoctorListError = isClinicManager
    ? isClinicDoctorsError
    : shouldLoadAllDoctors && isAllDoctorsError;
  const isSchedulePending = isLoadingSchedule || isFetchingSchedule;
  const isTimeSlotsPending = isLoadingTimeCodes || isFetchingTimeCodes;
  const canSelectDoctor = isClinicManager;
  const selectedSlots = rangeTime.filter((item) => item.isSelected);
  const totalCapacity = selectedSlots.reduce(
    (sum, item) => sum + Number(item.maxNumber || 0),
    0,
  );
  const totalBooked = selectedSlots.reduce(
    (sum, item) => sum + Number(item.currentNumber || 0),
    0,
  );
  console.log("Check state manage schedule: ", {
    selectedDoctor,
    listDoctors,
    startDate,
    rangeTime,
  });

  return (
    <div className="manage-schedule-container">
      <div className="m-s-title">
        <FormattedMessage id="manage-schedule.title" />
      </div>

      <div className="row">
        <div className="col-12">
          <div className="info-card">
            <div className="card-header">
              <span>
                <i className="fas fa-calendar-alt"></i> Thông tin kế hoạch
              </span>
            </div>

            <div className="card-body">
              <div className="row">
                {canSelectDoctor ? (
                  <div className="col-md-6 form-group">
                    <label>
                      <FormattedMessage id="manage-schedule.select-doctor" />
                    </label>
                    <Select
                      value={selectedDoctor}
                      onChange={handleChangeSelectDoctor}
                      options={listDoctors}
                      isLoading={isLoadingDoctorList}
                      menuPortalTarget={document.body}
                      styles={{
                        menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                      }}
                    />
                  </div>
                ) : (
                  <div className="col-md-6 form-group">
                    <label>
                      <FormattedMessage id="manage-schedule.select-doctor" />
                    </label>
                    <input
                      className="form-control"
                      value={selectedDoctor?.label || ""}
                      disabled
                      readOnly
                    />
                  </div>
                )}

                {isDoctorListError && (
                  <div className="col-12">
                    <DataState
                      variant="error"
                      text="Không thể tải danh sách bác sĩ."
                      onRetry={() => {
                        if (isClinicManager) void refetchClinicDoctors();
                        else if (shouldLoadAllDoctors) void refetchAllDoctors();
                      }}
                      compact
                    />
                  </div>
                )}
                {!isLoadingDoctorList &&
                  !isDoctorListError &&
                  canSelectDoctor &&
                  listDoctors.length === 0 && (
                    <div className="col-12">
                      <DataState
                        variant="empty"
                        text="Cơ sở y tế chưa có bác sĩ để xếp lịch."
                        compact
                      />
                    </div>
                  )}

                {/* Chọn Ngày */}
                <div className="col-md-6 form-group">
                  <label>
                    <FormattedMessage id="manage-schedule.select-date" />
                  </label>
                  <DatePicker
                    className="form-control"
                    onChange={handleChange}
                    value={startDate}
                    minDate={currentDay}
                  />
                </div>
                <div className="col-12 pick-hour-container">
                  <div className="schedule-toolbar">
                    <div>
                      <label>Chọn khung giờ khám cố định</label>
                      <div className="schedule-summary">
                        <span>{selectedSlots.length} khung đã chọn</span>
                        <span>{totalCapacity} lượt tối đa</span>
                        <span>{totalBooked} lượt đã đặt</span>
                      </div>
                    </div>
                    <div className="default-capacity">
                      <label>Số bệnh nhân mặc định</label>
                      <div className="capacity-control">
                        <input
                          type="number"
                          min={MIN_MAX_NUMBER}
                          max={MAX_MAX_NUMBER}
                          value={defaultMaxNumber}
                          onChange={(event) =>
                            handleChangeDefaultMaxNumber(event.target.value)
                          }
                        />
                        <button
                          type="button"
                          onClick={handleApplyDefaultMaxNumber}
                        >
                          Áp dụng
                        </button>
                      </div>
                    </div>
                  </div>

                  {isTimeSlotsPending && (
                    <DataState
                      variant="loading"
                      text="Đang tải danh mục khung giờ..."
                      compact
                    />
                  )}
                  {isTimeCodesError && (
                    <DataState
                      variant="error"
                      text="Không thể tải danh mục khung giờ."
                      onRetry={() => void refetchTimeCodes()}
                      compact
                    />
                  )}
                  {!isTimeSlotsPending &&
                    !isTimeCodesError &&
                    timeSlots.length === 0 && (
                      <DataState
                        variant="empty"
                        text="Backend chưa cấu hình khung giờ khám."
                        compact
                      />
                    )}

                  {isSchedulePending && (
                    <DataState
                      variant="loading"
                      text="Đang tải lịch khám..."
                      compact
                    />
                  )}
                  {isScheduleError && (
                    <DataState
                      variant="error"
                      text="Không thể tải lịch khám."
                      onRetry={() => void refetchSchedule()}
                      compact
                    />
                  )}
                  {!isSchedulePending &&
                    !isScheduleError &&
                    !shouldFetchSchedule && (
                      <DataState
                        variant="empty"
                        text="Vui lòng chọn bác sĩ để xem và chỉnh sửa lịch khám."
                        compact
                      />
                  )}

                  {!isTimeSlotsPending &&
                    !isTimeCodesError &&
                    timeSlots.length > 0 && (
                  <div className="time-groups">
                    {TIME_SLOT_GROUPS.map((group) => {
                      const groupSlots = rangeTime.filter(
                        (item) => item.group === group.key,
                      );

                      return (
                        <section className="time-group" key={group.key}>
                          <div className="time-group-header">
                            <h4>{group.label}</h4>
                            <div className="group-actions">
                              <button
                                type="button"
                                onClick={() => handleToggleGroup(group.key, true)}
                              >
                                Chọn buổi này
                              </button>
                              <button
                                type="button"
                                onClick={() => handleToggleGroup(group.key, false)}
                              >
                                Bỏ chọn
                              </button>
                            </div>
                          </div>

                          <div className="time-content">
                            {groupSlots.map((item) => {
                              const label =
                                language === LANGUAGES.VI
                                  ? item.valueVi
                                  : item.valueEn;
                              const minValue = Math.max(
                                MIN_MAX_NUMBER,
                                item.currentNumber || 0,
                              );

                              return (
                                <div
                                  className={
                                    item.pendingDelete
                                      ? "time-slot-row pending-delete"
                                      : item.isSelected
                                      ? "time-slot-row active"
                                      : "time-slot-row"
                                  }
                                  key={item.keyMap}
                                >
                                  <button
                                    type="button"
                                    className="slot-toggle"
                                    onClick={() => handleClickTime(item)}
                                  >
                                    <span className="slot-check">
                                      {item.isSelected && (
                                        <i className="fas fa-check"></i>
                                      )}
                                    </span>
                                    <span>{label}</span>
                                  </button>

                                  <div className="slot-capacity">
                                    <span>
                                      {item.pendingDelete
                                        ? "Chờ xóa"
                                        : `Đã đặt ${item.currentNumber || 0}`}
                                    </span>
                                    <input
                                      type="number"
                                      min={minValue}
                                      max={MAX_MAX_NUMBER}
                                      disabled={!item.isSelected}
                                      value={item.maxNumber || defaultMaxNumber}
                                      onChange={(event) =>
                                        handleChangeSlotMaxNumber(
                                          item,
                                          event.target.value,
                                        )
                                      }
                                    />
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </section>
                      );
                    })}
                  </div>
                  )}
                </div>

                {/* Nút Lưu */}
                <div className="col-12 btn-container">
                  <button
                    className="btn btn-primary btn-save-schedule"
                    disabled={!hasScheduleChanges}
                    onClick={() => handleSaveSchedule()}
                  >
                    <i className="fas fa-save"></i>{" "}
                    <FormattedMessage id="manage-schedule.save" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManageSchedule;
