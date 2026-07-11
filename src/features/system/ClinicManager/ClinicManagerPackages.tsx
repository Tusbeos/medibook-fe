import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { useClinicContext } from "./useClinicContext";
import "./ClinicManagerShared.scss";
import {
  useApproveClinicManagerPackageMutation,
  useGetClinicManagerPackagesQuery,
} from "../../../store/api/publicApi";

const getStatusKey = (pkg: any) =>
  pkg.statusId || pkg.status_id || pkg.statusData?.keyMap || "";

const formatPrice = (price?: number) =>
  price ? `${price.toLocaleString("vi-VN")} VNĐ` : "—";

const ClinicManagerPackages: React.FC = () => {
  const { isClinicManager, selectedClinicId } = useClinicContext();
  const {
    data: packagesResponse,
    isLoading,
    isFetching,
    isError,
    refetch: refetchPackages,
  } = useGetClinicManagerPackagesQuery(selectedClinicId, {
    skip: !selectedClinicId,
  });
  const [approvePackage] = useApproveClinicManagerPackageMutation();
  const [search, setSearch] = useState("");

  const packages = useMemo(
    () =>
      packagesResponse?.errCode === 0 && Array.isArray(packagesResponse.data)
        ? packagesResponse.data
        : [],
    [packagesResponse],
  );

  useEffect(() => {
    if (isError) {
      toast.error("Không thể tải danh sách gói khám.");
    }
  }, [isError]);

  const filtered = useMemo(() => {
    if (!search.trim()) return packages;
    const kw = search.trim().toLowerCase();
    return packages.filter(
      (p) =>
        (p.name || "").toLowerCase().includes(kw) ||
        (p.typeData?.valueVi || "").toLowerCase().includes(kw),
    );
  }, [packages, search]);

  const handleApprove = async (pkgId: number) => {
    try {
      await approvePackage(pkgId).unwrap();
      toast.success("Duyệt gói khám thành công!");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Duyệt thất bại.");
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
            placeholder="Tìm theo tên gói khám..."
          />
        </div>
        <button
          className="cm-refresh-btn"
          onClick={() => refetchPackages()}
          disabled={isFetching}
        >
          <i className="fas fa-sync-alt" /> Refresh
        </button>
      </div>

      <div className="cm-table">
        <div
          className="cm-table-header"
          style={{ gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr" }}
        >
          <span>Tên gói</span>
          <span>Loại</span>
          <span>Giá</span>
          <span>Trạng thái</span>
          <span>Hành động</span>
        </div>

        {isLoading || isFetching ? (
          <div className="cm-empty">Đang tải...</div>
        ) : filtered.length === 0 ? (
          <div className="cm-empty">
            <i className="fas fa-box-open" />
            Chưa có gói khám nào.
          </div>
        ) : (
          filtered.map((pkg) => {
            const statusKey = getStatusKey(pkg);
            const isPending = statusKey === "SD1" || !statusKey;

            return (
              <div
                className="cm-table-row"
                key={pkg.id || pkg.name}
                style={{ gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr" }}
              >
                <div className="cm-name-cell">
                  <div className="cm-avatar">PK</div>
                  <div className="cm-name-info">
                    <strong>{pkg.name || "N/A"}</strong>
                    <small>{pkg.note || ""}</small>
                  </div>
                </div>
                <span>{pkg.typeData?.valueVi || pkg.typeCode || "—"}</span>
                <span>{formatPrice(pkg.price)}</span>
                <span
                  className={`cm-status ${isPending ? "pending" : "active"}`}
                >
                  <span className="status-dot" />
                  {isPending ? "Chờ duyệt" : "Hoạt động"}
                </span>
                <div className="cm-actions-cell">
                  {isPending && (
                    <button
                      className="cm-action-btn approve"
                      onClick={() => handleApprove(pkg.id)}
                    >
                      Duyệt
                    </button>
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

export default ClinicManagerPackages;
