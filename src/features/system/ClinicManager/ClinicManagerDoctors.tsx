import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useClinicContext } from "./useClinicContext";
import "./ClinicManagerShared.scss";
import {
  useApproveClinicManagerDoctorMutation,
  useGetDoctorsByClinicIdQuery,
  useUpdateClinicManagerDoctorStatusMutation,
} from "../../../store/api/publicApi";

interface IDoctorItem {
  id?: number;
  firstName?: string;
  lastName?: string;
  email?: string;
  specialtyName?: string;
  statusId?: string;
  status_id?: string;
  statusData?: { keyMap?: string; valueVi?: string };
}

const STATUS_OPTIONS = [
  { key: "SD2", label: "Hoạt động", className: "active" },
  { key: "SD4", label: "Nghỉ phép", className: "leave" },
  { key: "SD3", label: "Ngưng hoạt động", className: "inactive" },
];

const getStatusKey = (doctor: IDoctorItem) =>
  doctor.statusId || doctor.status_id || doctor.statusData?.keyMap || "";

const getName = (doctor: IDoctorItem) =>
  `${doctor.firstName || ""} ${doctor.lastName || ""}`.trim() || "N/A";

const getInitials = (doctor: IDoctorItem) => {
  const first = (doctor.firstName || "").charAt(0);
  const last = (doctor.lastName || "").charAt(0);
  return (first + last).toUpperCase() || "?";
};

const getStatusLabel = (doctor: IDoctorItem) => {
  const key = getStatusKey(doctor);
  if (doctor.statusData?.valueVi) return doctor.statusData.valueVi;

  switch (key) {
    case "SD1":
      return "Chờ duyệt";
    case "SD2":
      return "Hoạt động";
    case "SD3":
      return "Ngưng hoạt động";
    case "SD4":
      return "Nghỉ phép";
    case "SD5":
      return "Từ chối";
    default:
      return key || "N/A";
  }
};

const getStatusClass = (key: string) => {
  switch (key) {
    case "SD1":
      return "pending";
    case "SD2":
      return "active";
    case "SD3":
      return "inactive";
    case "SD4":
      return "leave";
    case "SD5":
      return "rejected";
    default:
      return "inactive";
  }
};

const ClinicManagerDoctors: React.FC = () => {
  const navigate = useNavigate();
  const { isClinicManager, selectedClinicId } = useClinicContext();
  const {
    data: doctorsResponse,
    isLoading,
    isFetching,
    isError,
    refetch: refetchDoctors,
  } = useGetDoctorsByClinicIdQuery(selectedClinicId, {
    skip: !selectedClinicId,
  });
  const [approveDoctor] = useApproveClinicManagerDoctorMutation();
  const [updateDoctorStatus] = useUpdateClinicManagerDoctorStatusMutation();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [openDropdown, setOpenDropdown] = useState<number | string>("");

  const doctors = useMemo<IDoctorItem[]>(
    () =>
      doctorsResponse?.errCode === 0 && Array.isArray(doctorsResponse.data)
        ? doctorsResponse.data
        : [],
    [doctorsResponse],
  );

  useEffect(() => {
    if (isError) {
      toast.error("Không thể tải danh sách bác sĩ.");
    }
  }, [isError]);

  const filtered = useMemo(() => {
    let list = doctors;
    if (statusFilter) {
      list = list.filter((doctor) => getStatusKey(doctor) === statusFilter);
    }
    if (search.trim()) {
      const keyword = search.trim().toLowerCase();
      list = list.filter(
        (doctor) =>
          getName(doctor).toLowerCase().includes(keyword) ||
          (doctor.email || "").toLowerCase().includes(keyword) ||
          (doctor.specialtyName || "").toLowerCase().includes(keyword),
      );
    }
    return list;
  }, [doctors, statusFilter, search]);

  const counts = useMemo(
    () => ({
      all: doctors.length,
      SD1: doctors.filter((doctor) => getStatusKey(doctor) === "SD1").length,
      SD2: doctors.filter((doctor) => getStatusKey(doctor) === "SD2").length,
    }),
    [doctors],
  );

  const handleApprove = async (doctorId: number) => {
    try {
      await approveDoctor(doctorId).unwrap();
      toast.success("Duyệt bác sĩ thành công!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Duyệt thất bại.");
    }
  };

  const handleChangeStatus = async (doctorId: number, statusId: string) => {
    try {
      await updateDoctorStatus({ doctorId, statusId }).unwrap();
      toast.success("Cập nhật trạng thái thành công!");
      setOpenDropdown("");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Cập nhật thất bại.");
    }
  };

  if (!isClinicManager || !selectedClinicId) {
    return (
      <div className="cm-page">
        <div className="cm-empty">
          <i className="fas fa-lock" />
          Bạn không có quyền truy cập trang này.
        </div>
      </div>
    );
  }

  return (
    <div className="cm-page">
      <div className="cm-toolbar">
        <div className="cm-search">
          <i className="fas fa-search" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên, email, chuyên khoa..."
          />
        </div>

        <div className="cm-filter-tabs">
          <button
            className={statusFilter === "" ? "active" : ""}
            onClick={() => setStatusFilter("")}
          >
            Tất cả ({counts.all})
          </button>
          <button
            className={statusFilter === "SD1" ? "active" : ""}
            onClick={() => setStatusFilter("SD1")}
          >
            Chờ duyệt ({counts.SD1})
          </button>
          <button
            className={statusFilter === "SD2" ? "active" : ""}
            onClick={() => setStatusFilter("SD2")}
          >
            Hoạt động ({counts.SD2})
          </button>
        </div>

        <button
          className="cm-refresh-btn"
          onClick={() => refetchDoctors()}
          disabled={isFetching}
        >
          <i className="fas fa-sync-alt" /> Refresh
        </button>
      </div>

      <div className="cm-table">
        <div
          className="cm-table-header"
          style={{ gridTemplateColumns: "2fr 1.5fr 1fr 1.2fr" }}
        >
          <span>Bác sĩ</span>
          <span>Chuyên khoa</span>
          <span>Trạng thái</span>
          <span>Hành động</span>
        </div>

        {isLoading || isFetching ? (
          <div className="cm-empty">Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div className="cm-empty">
            <i className="fas fa-user-slash" />
            Chưa có bác sĩ nào.
          </div>
        ) : (
          filtered.map((doctor) => {
            const statusKey = getStatusKey(doctor);
            const doctorKey = doctor.id || doctor.email || getName(doctor);

            return (
              <div
                className="cm-table-row"
                key={doctorKey}
                style={{ gridTemplateColumns: "2fr 1.5fr 1fr 1.2fr" }}
              >
                <div className="cm-name-cell">
                  <div className="cm-avatar">{getInitials(doctor)}</div>
                  <div className="cm-name-info">
                    <strong>{getName(doctor)}</strong>
                    <small>{doctor.email}</small>
                  </div>
                </div>
                <span>{doctor.specialtyName || "Chưa phân chuyên khoa"}</span>
                <span className={`cm-status ${getStatusClass(statusKey)}`}>
                  <span className="status-dot" />
                  {getStatusLabel(doctor)}
                </span>
                <div className="cm-actions-cell">
                  {statusKey === "SD1" ? (
                    <>
                      <button
                        className="cm-action-btn approve"
                        onClick={() => doctor.id && handleApprove(doctor.id)}
                      >
                        Duyệt
                      </button>
                      <button
                        className="cm-action-btn review"
                        onClick={() =>
                          navigate(
                            `/system/clinic-manager/review-doctor/${doctor.id}`,
                          )
                        }
                      >
                        Xem
                      </button>
                    </>
                  ) : (
                    <div style={{ position: "relative" }}>
                      <button
                        className="cm-action-btn review"
                        onClick={() =>
                          setOpenDropdown(
                            openDropdown === doctorKey ? "" : doctorKey,
                          )
                        }
                      >
                        Đổi trạng thái{" "}
                        <i
                          className="fas fa-chevron-down"
                          style={{ fontSize: "0.6rem", marginLeft: 4 }}
                        />
                      </button>
                      {openDropdown === doctorKey && (
                        <div
                          style={{
                            position: "absolute",
                            top: "100%",
                            right: 0,
                            zIndex: 10,
                            background: "#fff",
                            border: "1px solid #e2e8f0",
                            borderRadius: 8,
                            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                            padding: 4,
                            minWidth: 140,
                          }}
                        >
                          {STATUS_OPTIONS.map((option) => (
                            <button
                              key={option.key}
                              className={`cm-action-btn ${option.className}`}
                              style={{
                                display: "block",
                                width: "100%",
                                textAlign: "left",
                                marginBottom: 2,
                              }}
                              onClick={() =>
                                doctor.id &&
                                handleChangeStatus(doctor.id, option.key)
                              }
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ClinicManagerDoctors;
