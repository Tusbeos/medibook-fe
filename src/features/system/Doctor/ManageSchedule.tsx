import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { FormattedMessage } from "react-intl";
import { useSelector } from "react-redux";
import "./ManageSchedule.scss";
import Select from "react-select";
import { LANGUAGES, USER_ROLE } from "../../../utils";
import DatePicker from "components/Input/DatePicker";
import { toast } from "react-toastify";
import _ from "lodash";
import moment from "moment";
import { IRootState } from "../../../types";
import {
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

const FIXED_TIME_SLOTS = [
  { keyMap: "T1", valueVi: "07:30 - 08:00", valueEn: "07:30 AM - 08:00 AM", group: "morning" },
  { keyMap: "T2", valueVi: "08:00 - 08:30", valueEn: "08:00 AM - 08:30 AM", group: "morning" },
  { keyMap: "T3", valueVi: "08:30 - 09:00", valueEn: "08:30 AM - 09:00 AM", group: "morning" },
  { keyMap: "T4", valueVi: "09:00 - 09:30", valueEn: "09:00 AM - 09:30 AM", group: "morning" },
  { keyMap: "T5", valueVi: "09:30 - 10:00", valueEn: "09:30 AM - 10:00 AM", group: "morning" },
  { keyMap: "T6", valueVi: "10:00 - 10:30", valueEn: "10:00 AM - 10:30 AM", group: "morning" },
  { keyMap: "T7", valueVi: "10:30 - 11:00", valueEn: "10:30 AM - 11:00 AM", group: "morning" },
  { keyMap: "T8", valueVi: "11:00 - 11:30", valueEn: "11:00 AM - 11:30 AM", group: "morning" },
  { keyMap: "T9", valueVi: "13:00 - 13:30", valueEn: "01:00 PM - 01:30 PM", group: "afternoon" },
  { keyMap: "T10", valueVi: "13:30 - 14:00", valueEn: "01:30 PM - 02:00 PM", group: "afternoon" },
  { keyMap: "T11", valueVi: "14:00 - 14:30", valueEn: "02:00 PM - 02:30 PM", group: "afternoon" },
  { keyMap: "T12", valueVi: "14:30 - 15:00", valueEn: "02:30 PM - 03:00 PM", group: "afternoon" },
  { keyMap: "T13", valueVi: "15:00 - 15:30", valueEn: "03:00 PM - 03:30 PM", group: "afternoon" },
  { keyMap: "T14", valueVi: "15:30 - 16:00", valueEn: "03:30 PM - 04:00 PM", group: "afternoon" },
  { keyMap: "T15", valueVi: "16:00 - 16:30", valueEn: "04:00 PM - 04:30 PM", group: "afternoon" },
  { keyMap: "T16", valueVi: "16:30 - 17:00", valueEn: "04:30 PM - 05:00 PM", group: "afternoon" },
  { keyMap: "T17", valueVi: "17:30 - 18:00", valueEn: "05:30 PM - 06:00 PM", group: "evening" },
  { keyMap: "T18", valueVi: "18:00 - 18:30", valueEn: "06:00 PM - 06:30 PM", group: "evening" },
  { keyMap: "T19", valueVi: "18:30 - 19:00", valueEn: "06:30 PM - 07:00 PM", group: "evening" },
  { keyMap: "T20", valueVi: "19:00 - 19:30", valueEn: "07:00 PM - 07:30 PM", group: "evening" },
];

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
  // Khởi tạo startDate về nửa đêm để khớp timestamp khi query/lưu lịch
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
  } = useGetAllDoctorsQuery(undefined, {
    skip: !shouldLoadAllDoctors,
  });
  const {
    data: clinicDoctorsResponse,
    isLoading: isLoadingClinicDoctors,
    isFetching: isFetchingClinicDoctors,
    isError: isClinicDoctorsError,
  } = useGetDoctorsByClinicIdQuery(userClinicId, {
    skip: !isClinicManager || !userClinicId,
  });

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

    return FIXED_TIME_SLOTS.map((slot) => {
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
  }, []);

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
        ? new Date(new Date(startDate).setHours(0, 0, 0, 0)).getTime()
        : 0,
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
        ? new Date(new Date(parsedStartDate).setHours(0, 0, 0, 0)).getTime()
        : null;

    if (!formatDate) {
      toast.error("Ngày không hợp lệ!");
      return;
    }

    if (!hasScheduleChanges) {
      toast.info("Lịch khám chưa có thay đổi.");
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
                  <div className="col-12 alert alert-danger">
                    Không thể tải danh sách bác sĩ.
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

                  {isSchedulePending && (
                    <div className="alert alert-info">Đang tải lịch khám...</div>
                  )}
                  {isScheduleError && (
                    <div className="alert alert-danger">
                      Không thể tải lịch khám.
                    </div>
                  )}

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
                </div>

                <div className="col-12 pick-hour-container legacy-time-picker">
                  <label className="mb-3">Chọn khung giờ khám:</label>
                  <div className="time-content">
                    {rangeTime &&
                      rangeTime.length > 0 &&
                      rangeTime.map((item, index) => {
                        return (
                          <button
                            className={
                              item.isSelected === true
                                ? "btn btn-schedule active"
                                : "btn btn-schedule"
                            }
                            key={index}
                            onClick={() => handleClickTime(item)}
                          >
                            {language === LANGUAGES.VI
                              ? item.valueVi
                              : item.valueEn}
                          </button>
                        );
                      })}
                  </div>
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
