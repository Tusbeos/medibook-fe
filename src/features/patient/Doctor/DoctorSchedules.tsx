import React, { useState, useEffect, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import "./DoctorSchedules.scss";
import moment from "moment";
import { LANGUAGES, path } from "../../../utils";
import { FormattedMessage } from "react-intl";
import { IRootState } from "../../../types";
import { useGetDoctorScheduleQuery } from "../../../store/api/publicApi";

interface IDoctorSchedulesProps {
  detailDoctorFromParent: number | string;
}

const capitalizeFirstLetter = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const getArrDays = (language: string) => {
  let allDays: any[] = [];
  for (let i = 0; i < 7; i++) {
    let object: any = {};
    if (language === LANGUAGES.VI) {
      if (i === 0) {
        let ddMM = moment(new Date()).format("DD/MM");
        let today = `Hôm nay - ${ddMM}`;
        object.label = today;
      } else {
        let labelVi = moment(new Date())
          .add(i, "days")
          .format("dddd - DD/MM");
        object.label = capitalizeFirstLetter(labelVi);
      }
    } else {
      if (i === 0) {
        let ddMM = moment(new Date()).format("DD/MM");
        let today = `Today - ${ddMM}`;
        object.label = today;
      } else {
        object.label = moment(new Date())
          .add(i, "days")
          .locale("en")
          .format("dddd - DD/MM");
      }
    }
    object.value = moment(new Date()).add(i, "days").startOf("day").valueOf();
    allDays.push(object);
  }
  return allDays;
};

// Kiểm tra slot đã đầy chưa
const isSlotFull = (item: any): boolean => {
  return item.currentNumber >= item.maxNumber;
};

// Kiểm tra khung giờ đã qua chưa (chỉ áp dụng cho ngày hôm nay)
const isTimeSlotPast = (item: any, selectedDate: number): boolean => {
  if (!moment(selectedDate).isSame(moment(), "day")) return false;
  const valueVi = item.timeTypeData?.valueVi || "";
  const match = valueVi.match(/^(\d+):(\d+)/);
  if (!match) return false;
  const hour = parseInt(match[1], 10);
  const minute = parseInt(match[2], 10);
  const slotTime = moment().startOf("day").add(hour, "hours").add(minute, "minutes");
  return moment().isAfter(slotTime);
};

const DoctorSchedules = ({ detailDoctorFromParent }: IDoctorSchedulesProps) => {
  const language = useSelector((state: IRootState) => state.app.language);
  const navigate = useNavigate();
  const [allDays, setAllDays] = useState<any[]>([]);
  const [availableTime, setAvailableTime] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<number>(
    moment().startOf("day").valueOf()
  );
  const shouldSkipSchedule = !detailDoctorFromParent || detailDoctorFromParent === -1;
  const { data: scheduleResponse } = useGetDoctorScheduleQuery(
    {
      doctorId: detailDoctorFromParent,
      date: moment(selectedDate).format("YYYY-MM-DD"),
    },
    { skip: shouldSkipSchedule },
  );

  useEffect(() => {
    let days = getArrDays(language);
    setAllDays(days);
    setSelectedDate(days[0].value);
  }, [detailDoctorFromParent, language]);

  useEffect(() => {
    setAvailableTime(scheduleResponse?.data ? scheduleResponse.data : []);
  }, [scheduleResponse]);

  const handleOnChangeSelect = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      if (detailDoctorFromParent && detailDoctorFromParent !== -1) {
        const date = event.target.value;
        setSelectedDate(Number(date));
      }
    },
    [detailDoctorFromParent]
  );

  const handleBookingDoctor = useCallback(
    (scheduleTime: any) => {
      let doctorId =
        scheduleTime.doctorId ||
        (detailDoctorFromParent && (detailDoctorFromParent as any).id);
      if (path.BOOKING_DOCTOR && doctorId) {
        let linkRedirect = path.BOOKING_DOCTOR.replace(":id", doctorId);
        navigate(linkRedirect, { state: { dataTime: scheduleTime } });
      }
    },
    [detailDoctorFromParent, navigate]
  );

  return (
    <div className="doctor-schedules-container">
      <div className="all-schedules">
        <select onChange={(event) => handleOnChangeSelect(event)}>
          {allDays &&
            allDays.length > 0 &&
            allDays.map((item, index) => {
              return (
                <option value={item.value} key={index}>
                  {item.label}
                </option>
              );
            })}
        </select>
      </div>
      <div className="available-schedules">
        <div className="text-calender">
          <i className="fas fa-calendar-alt"></i>{" "}
          <span>
            <FormattedMessage id="patient.detail-doctor.schedule" />
          </span>
        </div>
        <div className="time-content">
          {availableTime && availableTime.length > 0 ? (
            <>
              <div className="time-content-btns">
                {availableTime.map((item, index) => {
                  let timeDisplay =
                    language === LANGUAGES.VI
                      ? item.timeTypeData.valueVi
                      : item.timeTypeData.valueEn;
                  const isPast = isTimeSlotPast(item, selectedDate);
                  const isFull = isSlotFull(item);
                  const isDisabled = isPast || isFull;
                  return (
                    <button
                      onClick={() => !isDisabled && handleBookingDoctor(item)}
                      key={index}
                      disabled={isDisabled}
                      className={`${
                        language === LANGUAGES.VI ? "btn-vi" : "btn-en"
                      }${isPast ? " btn-time-past" : ""}${isFull && !isPast ? " btn-slot-full" : ""}`}
                      title={isFull ? "Khung giờ này đã đầy" : undefined}
                    >
                      {timeDisplay}
                      {isFull && !isPast && (
                        <span className="slot-full-badge">Hết chỗ</span>
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="book-free">
                <span>
                  <FormattedMessage id="patient.detail-doctor.choose" />
                  <i className="far fa-hand-point-up"></i>
                  <FormattedMessage id="patient.detail-doctor.book-free" />
                </span>
              </div>
            </>
          ) : (
            <div className="no-schedule">
              <FormattedMessage id="patient.detail-doctor.no-schedule" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorSchedules;
