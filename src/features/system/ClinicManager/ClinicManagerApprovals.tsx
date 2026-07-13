import React, { useCallback, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  useApproveClinicManagerDoctorMutation,
  useApproveClinicManagerPackageMutation,
  useGetClinicManagerPackagesQuery,
  useGetDoctorsByClinicIdQuery,
} from "../../../store/api/publicApi";
import { DataState } from "components/System/SystemShared";
import { useClinicContext } from "./useClinicContext";
import "./ClinicManagerShared.scss";

type QueueFilter = "all" | "doctors" | "packages";

interface IQueueItem {
  id: any;
  category: "doctor" | "package";
  requester: string;
  subtitle: string;
  typeLabel: string;
  typeClass: string;
  details: string;
  initials: string;
}

const getStatusKey = (item: any) =>
  item.statusId || item.status_id || item.statusData?.keyMap || "";

const ClinicManagerApprovals: React.FC = () => {
  const navigate = useNavigate();
  const { isClinicManager, selectedClinicId, displayClinicName } =
    useClinicContext();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<QueueFilter>("all");

  const {
    data: doctorsResponse,
    isLoading: isLoadingDoctors,
    isFetching: isFetchingDoctors,
    isError: isDoctorsError,
    refetch: refetchDoctors,
  } = useGetDoctorsByClinicIdQuery(selectedClinicId, {
    skip: !selectedClinicId,
  });

  const {
    data: packagesResponse,
    isLoading: isLoadingPackages,
    isFetching: isFetchingPackages,
    isError: isPackagesError,
    refetch: refetchPackages,
  } = useGetClinicManagerPackagesQuery(selectedClinicId, {
    skip: !selectedClinicId,
  });
  const [approveDoctor] = useApproveClinicManagerDoctorMutation();
  const [approvePackage] = useApproveClinicManagerPackageMutation();

  const doctors = useMemo(
    () =>
      doctorsResponse?.errCode === 0 && Array.isArray(doctorsResponse.data)
        ? doctorsResponse.data
        : [],
    [doctorsResponse],
  );

  const packages = useMemo(
    () =>
      packagesResponse?.errCode === 0 && Array.isArray(packagesResponse.data)
        ? packagesResponse.data
        : [],
    [packagesResponse],
  );

  const isLoading =
    isLoadingDoctors ||
    isFetchingDoctors ||
    isLoadingPackages ||
    isFetchingPackages;
  const isError = isDoctorsError || isPackagesError;

  const refetchQueue = useCallback(() => {
    if (!selectedClinicId) return;
    refetchDoctors();
    refetchPackages();
  }, [refetchDoctors, refetchPackages, selectedClinicId]);

  const queueItems = useMemo<IQueueItem[]>(() => {
    const pendingDoctors = doctors.filter((d) => getStatusKey(d) === "SD1");
    const pendingPackages = packages.filter((p) => {
      const sk = getStatusKey(p);
      return sk === "SD1" || !sk;
    });

    const doctorItems: IQueueItem[] = pendingDoctors.map((d) => ({
      id: d.id,
      category: "doctor",
      requester: `${d.firstName || ""} ${d.lastName || ""}`.trim() || "N/A",
      subtitle: d.specialtyName || "Chưa phân chuyên khoa",
      typeLabel: "Bác sĩ",
      typeClass: "review",
      details: `Chờ duyệt để hoạt động tại ${displayClinicName}.`,
      initials:
        (
          (d.firstName || "").charAt(0) + (d.lastName || "").charAt(0)
        ).toUpperCase() || "?",
    }));

    const packageItems: IQueueItem[] = pendingPackages.map((p) => ({
      id: p.id,
      category: "package",
      requester: p.name || "Gói khám",
      subtitle: p.typeData?.valueVi || "Gói khám",
      typeLabel: "Gói khám",
      typeClass: "approve",
      details: `Chờ duyệt${p.price ? `, giá ${p.price.toLocaleString("vi-VN")} VNĐ` : ""}.`,
      initials: "PK",
    }));

    return [...doctorItems, ...packageItems];
  }, [doctors, packages, displayClinicName]);

  const filtered = useMemo(() => {
    const kw = search.trim().toLowerCase();
    return queueItems.filter((item) => {
      const matchFilter =
        filter === "all" ||
        (filter === "doctors" && item.category === "doctor") ||
        (filter === "packages" && item.category === "package");
      const matchSearch =
        !kw ||
        item.requester.toLowerCase().includes(kw) ||
        item.subtitle.toLowerCase().includes(kw) ||
        item.details.toLowerCase().includes(kw);
      return matchFilter && matchSearch;
    });
  }, [queueItems, filter, search]);

  const handleApprove = async (item: IQueueItem) => {
    try {
      if (item.category === "doctor") {
        await approveDoctor(item.id).unwrap();
      } else {
        await approvePackage(item.id).unwrap();
      }
      toast.success("Phê duyệt thành công!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Phê duyệt thất bại.");
    }
  };

  const handleReview = (item: IQueueItem) => {
    if (item.category === "doctor") {
      navigate(`/system/clinic-manager/review-doctor/${item.id}`);
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
            placeholder="Tìm kiếm yêu cầu..."
          />
        </div>

        <div className="cm-filter-tabs">
          <button
            className={filter === "all" ? "active" : ""}
            onClick={() => setFilter("all")}
          >
            Tất cả ({queueItems.length})
          </button>
          <button
            className={filter === "doctors" ? "active" : ""}
            onClick={() => setFilter("doctors")}
          >
            Bác sĩ ({queueItems.filter((i) => i.category === "doctor").length})
          </button>
          <button
            className={filter === "packages" ? "active" : ""}
            onClick={() => setFilter("packages")}
          >
            Gói khám (
            {queueItems.filter((i) => i.category === "package").length})
          </button>
        </div>

        <button
          className="cm-refresh-btn"
          onClick={refetchQueue}
          disabled={isLoading}
        >
          <i className="fas fa-sync-alt" /> Refresh
        </button>
      </div>

      <div className="cm-table">
        <div
          className="cm-table-header"
          style={{ gridTemplateColumns: "2fr 1fr 3fr 1.2fr" }}
        >
          <span>Người yêu cầu</span>
          <span>Loại</span>
          <span>Chi tiết</span>
          <span>Hành động</span>
        </div>

        {isLoading ? (
          <DataState variant="loading" text="Đang tải danh sách yêu cầu..." />
        ) : isError ? (
          <DataState
            variant="error"
            text="Không thể tải danh sách yêu cầu."
            onRetry={refetchQueue}
          />
        ) : filtered.length === 0 ? (
          <DataState
            variant="empty"
            text={
              queueItems.length > 0
                ? "Không có yêu cầu phù hợp với bộ lọc."
                : "Không có yêu cầu chờ duyệt."
            }
          />
        ) : (
          filtered.map((item) => (
            <div
              className="cm-table-row"
              key={`${item.category}-${item.id}`}
              style={{ gridTemplateColumns: "2fr 1fr 3fr 1.2fr" }}
            >
              <div className="cm-name-cell">
                <div className="cm-avatar">{item.initials}</div>
                <div className="cm-name-info">
                  <strong>{item.requester}</strong>
                  <small>{item.subtitle}</small>
                </div>
              </div>
              <span className={`cm-status pending`}>
                <span className="status-dot" />
                {item.typeLabel}
              </span>
              <span>{item.details}</span>
              <div className="cm-actions-cell">
                <button
                  className="cm-action-btn approve"
                  onClick={() => handleApprove(item)}
                >
                  Duyệt
                </button>
                {item.category === "doctor" && (
                  <button
                    className="cm-action-btn review"
                    onClick={() => handleReview(item)}
                  >
                    Xem
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ClinicManagerApprovals;
