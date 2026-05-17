import React, { useState, useEffect, useCallback, useMemo } from "react";
import { FormattedMessage } from "react-intl";
import { useSelector, useDispatch } from "react-redux";
import "./ManageSchedule.scss";
import Select from "react-select";
import * as actions from "../../../store/actions";
import { LANGUAGES, USER_ROLE } from "../../../utils";
import DatePicker from "components/Input/DatePicker";
import { toast } from "react-toastify";
import _ from "lodash";
import moment from "moment";
import {
  saveBulkScheduleDoctor,
  getScheduleDoctorByDate,
  getDoctorsByClinicId,
} from "../../../services/doctorService";
import { handleGetAllDoctors } from "../../../services/doctorService";
import { IRootState } from "../../../types";

const ManageSchedule = () => {
  const dispatch = useDispatch();
  const language = useSelector((state: IRootState) => state.app.language);
  const userInfo = useSelector((state: IRootState) => state.user.userInfo);
  const allDoctors = useSelector(
    (state: IRootState) => (state as any).admin.allDoctors,
  );
  const allScheduleTime = useSelector(
    (state: IRootState) => (state as any).admin.allScheduleTime,
  );

  const [selectedDoctor, setSelectedDoctor] = useState<any>({});
  const [listDoctors, setListDoctors] = useState<any[]>([]);
  // Khởi tạo startDate về nửa đêm để khớp timestamp khi query/lưu lịch
  const [startDate, setStartDate] = useState<Date>(
    new Date(new Date().setHours(0, 0, 0, 0)),
  );
  const [rangeTime, setRangeTime] = useState<any[]>([]);
  const roleId = userInfo?.roleId || (userInfo as any)?.roleData?.keyMap;
  const isDoctor = roleId === USER_ROLE.DOCTOR;
  const isClinicManager = roleId === USER_ROLE.CLINIC_MANAGER;
  const userClinicId =
    (userInfo as any)?.clinicId ||
    (userInfo as any)?.clinic_id ||
    (userInfo as any)?.clinic?.id ||
    (userInfo as any)?.clinicData?.id ||
    "";

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

  const initDoctorForRole = useCallback(async () => {
    if (!userInfo) return;

    if (isDoctor) {
      let doctorId = userInfo.id || userInfo.userId;
      if (!doctorId && userInfo.email) {
        try {
          const res = await handleGetAllDoctors();
          if (res && res.errCode === 0 && Array.isArray(res.data)) {
            const matched = res.data.find(
              (item: any) => item && item.email === userInfo.email,
            );
            doctorId = matched?.id || "";
          }
        } catch (e) {}
      }
      const labelVi =
        `${userInfo.lastName ?? ""} ${userInfo.firstName ?? ""}`.trim();
      const labelEn =
        `${userInfo.firstName ?? ""} ${userInfo.lastName ?? ""}`.trim();
      setSelectedDoctor({
        value: doctorId,
        label: language === LANGUAGES.VI ? labelVi : labelEn,
      });
      setListDoctors([]);
    }
  }, [userInfo, language, isDoctor]);

  const fetchClinicDoctors = useCallback(async () => {
    if (!isClinicManager || !userClinicId) return;

    try {
      const res = await getDoctorsByClinicId(userClinicId);
      const doctors =
        res?.errCode === 0 && Array.isArray(res.data) ? res.data : [];
      const dataSelect = buildDataInputSelect(doctors);
      setListDoctors(dataSelect);
      setSelectedDoctor((current: any) =>
        current?.value ? current : dataSelect[0] || {},
      );
    } catch {
      setListDoctors([]);
      setSelectedDoctor({});
      toast.error("Không thể tải danh sách bác sĩ của phòng khám.");
    }
  }, [isClinicManager, userClinicId, buildDataInputSelect]);

  useEffect(() => {
    if (!allScheduleTime || allScheduleTime.length === 0) return;

    const doctorId = selectedDoctor?.value
      ? selectedDoctor.value
      : isDoctor
        ? userInfo?.id || userInfo?.userId
        : "";

    if (!doctorId || !startDate) {
      setRangeTime(
        allScheduleTime.map((item: any) => ({ ...item, isSelected: false })),
      );
      return;
    }

    // Chuẩn hóa về nửa đêm để khớp với timestamp phía patient (DoctorSchedules)
    const dateValue = new Date(
      new Date(startDate).setHours(0, 0, 0, 0),
    ).getTime();

    getScheduleDoctorByDate(doctorId, dateValue)
      .then((res) => {
        const scheduled = res && res.errCode === 0 ? res.data || [] : [];
        const scheduledKeys = new Set(
          scheduled.map((item: any) => item.timeType),
        );
        setRangeTime(
          allScheduleTime.map((item: any) => ({
            ...item,
            isSelected: scheduledKeys.has(item.keyMap),
          })),
        );
      })
      .catch(() => {
        setRangeTime(
          allScheduleTime.map((item: any) => ({ ...item, isSelected: false })),
        );
      });
  }, [allScheduleTime, selectedDoctor, startDate, userInfo, isDoctor]);

  // Mount: load schedule times and initialize doctor selection by role.
  useEffect(() => {
    if (isClinicManager) {
      fetchClinicDoctors();
    } else if (isDoctor) {
      initDoctorForRole();
    }
    dispatch(actions.fetchAllScheduleTime());
  }, [dispatch, isClinicManager, isDoctor, fetchClinicDoctors, initDoctorForRole]);

  // Khi allDoctors thay đổi → build lại select options
  useEffect(() => {
    if (roleId === USER_ROLE.ADMIN && allDoctors) {
      let dataSelect = buildDataInputSelect(allDoctors);
      setListDoctors(dataSelect);
    }
  }, [allDoctors, buildDataInputSelect, roleId]);

  // Khi userInfo thay đổi → init lại doctor cho role
  useEffect(() => {
    if (isDoctor) {
      initDoctorForRole();
    }
  }, [isDoctor, initDoctorForRole]);

  // Khi language thay đổi → rebuild select options & re-init
  useEffect(() => {
    if (isClinicManager) {
      fetchClinicDoctors();
      return;
    }
    if (roleId === USER_ROLE.ADMIN && allDoctors) {
      let dataSelect = buildDataInputSelect(allDoctors);
      setListDoctors(dataSelect);
    }
    if (isDoctor) {
      initDoctorForRole();
    }
  }, [
    language,
    allDoctors,
    buildDataInputSelect,
    roleId,
    isClinicManager,
    isDoctor,
    fetchClinicDoctors,
    initDoctorForRole,
  ]);

  // allScheduleTime, selectedDoctor, startDate được xử lý trong effect tổng hợp bên trên

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
        // Dùng keyMap để so sánh – AllCode không có trường id
        if (item.keyMap === time.keyMap) {
          return { ...item, isSelected: !item.isSelected };
        }
        return item;
      });
    });
  }, []);

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

    if (rangeTime && rangeTime.length > 0) {
      let selectedTime = rangeTime.filter((item) => item.isSelected === true);
      if (selectedTime && selectedTime.length > 0) {
        selectedTime.map((item) => {
          let object: any = {};
          object.doctorId = resolvedDoctorId;
          object.date = formatDate;
          object.timeType = item.keyMap;
          result.push(object);
          return item;
        });
      } else {
        toast.error("Chưa chọn khung giờ!");
        return;
      }

      let res = await saveBulkScheduleDoctor({
        arrSchedule: result,
        doctorId: resolvedDoctorId,
        formattedDate: formatDate,
      });

      console.log("[ManageSchedule] save schedule payload", {
        doctorId: resolvedDoctorId,
        formattedDate: formatDate,
        arrSchedule: result,
      });

      if (res && res.errCode === 0) {
        toast.success("Lưu lịch khám thành công!");
        setRangeTime((prev) =>
          prev.map((item) => ({ ...item, isSelected: false })),
        );
      } else {
        toast.error("Lưu lịch khám thất bại!");
      }
    }
  };

  // Ngày hiện tại (midnight) — stable qua các render, dùng cho minDate của DatePicker
  const currentDay = useMemo(
    () => new Date(new Date().setHours(0, 0, 0, 0)),
    [],
  );
  const canSelectDoctor = isClinicManager;
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
