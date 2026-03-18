import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import "./ManagePackage.scss";
import { FormattedMessage } from "react-intl";
import MarkdownIt from "markdown-it";
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import { CommonUtils } from "../../../utils";
import {
  createNewPackageService,
  handleGetAllPackages,
  deletePackageService,
  updatePackageService,
} from "../../../services/packageService";
import { handleGetAllCode } from "../../../services/userService";
import { handleGetAllClinics } from "../../../services/clinicService";
import { toast } from "react-toastify";
import { IRootState } from "../../../types";

const mdParser = new MarkdownIt();

interface ServiceEntry {
  serviceName: string;
  description: string;
}

interface ServiceGroup {
  groupServiceCode: string;
  services: ServiceEntry[];
}

const EMPTY_GROUP = (): ServiceGroup => ({
  groupServiceCode: "",
  services: [{ serviceName: "", description: "" }],
});

const ManagePackage = () => {
  const language = useSelector((state: IRootState) => state.app.language);

  // --- State form ---
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number | string>("");
  const [typeCode, setTypeCode] = useState("");
  const [clinicId, setClinicId] = useState<number | string>("");
  const [note, setNote] = useState("");
  const [imageBase64, setImageBase64] = useState("");
  const [descriptionHTML, setDescriptionHTML] = useState("");
  const [descriptionMarkdown, setDescriptionMarkdown] = useState("");
  const [previewImgURL, setPreviewImgURL] = useState("");

  // --- State danh mục dịch vụ (nhóm hoá) ---
  const [serviceGroups, setServiceGroups] = useState<ServiceGroup[]>([EMPTY_GROUP()]);

  // --- State danh sách ---
  const [packages, setPackages] = useState<any[]>([]);
  const [packageTypes, setPackageTypes] = useState<any[]>([]);
  const [clinics, setClinics] = useState<any[]>([]);
  const [groupServices, setGroupServices] = useState<any[]>([]);

  // --- State điều hướng chỉnh sửa ---
  const [isEditing, setIsEditing] = useState(false);
  const [editPackageId, setEditPackageId] = useState<number | null>(null);

  const fileInput = useRef<HTMLInputElement>(null);

  // Lấy danh sách gói khám
  const fetchAllPackages = useCallback(async () => {
    let res = await handleGetAllPackages();
    if (res && res.errCode === 0) {
      setPackages(res.data ? res.data : []);
    }
  }, []);

  // Lấy loại gói khám từ all_codes type PACKAGE
  const fetchPackageTypes = useCallback(async () => {
    let res = await handleGetAllCode("PACKAGE");
    if (res && res.errCode === 0) {
      setPackageTypes(res.data ? res.data : []);
    }
  }, []);

  // Lấy danh sách phòng khám
  const fetchClinics = useCallback(async () => {
    let res = await handleGetAllClinics();
    if (res && res.errCode === 0) {
      setClinics(res.data ? res.data : []);
    }
  }, []);

  // Lấy nhóm dịch vụ từ all_codes type GROUP_SERVICE
  const fetchGroupServices = useCallback(async () => {
    let res = await handleGetAllCode("GROUP_SERVICE");
    if (res && res.errCode === 0) {
      setGroupServices(res.data ? res.data : []);
    }
  }, []);

  useEffect(() => {
    fetchAllPackages();
    fetchPackageTypes();
    fetchClinics();
    fetchGroupServices();
  }, [fetchAllPackages, fetchPackageTypes, fetchClinics, fetchGroupServices]);

  const handleEditorChange = useCallback(
    ({ html, text }: { html: string; text: string }) => {
      setDescriptionHTML(html);
      setDescriptionMarkdown(text);
    },
    []
  );

  const handleOnChangeImage = useCallback(async (event: any) => {
    const file = event.target.files?.[0];
    if (file) {
      const base64 = await CommonUtils.getBase64(file) as string;
      setImageBase64(base64);
      setPreviewImgURL(base64);
      // Reset để có thể chọn lại cùng file
      event.target.value = "";
    }
  }, []);

  const resetForm = useCallback(() => {
    setName("");
    setPrice("");
    setTypeCode("");
    setClinicId("");
    setNote("");
    setImageBase64("");
    setDescriptionHTML("");
    setDescriptionMarkdown("");
    setPreviewImgURL("");
    setServiceGroups([EMPTY_GROUP()]);
    setIsEditing(false);
    setEditPackageId(null);
  }, []);

  // --- Handlers cho danh mục dịch vụ (nhóm hoá) ---
  const handleGroupCodeChange = useCallback((gi: number, value: string) => {
    setServiceGroups((prev) =>
      prev.map((g, i) => (i === gi ? { ...g, groupServiceCode: value } : g))
    );
  }, []);

  const handleServiceChange = useCallback(
    (gi: number, si: number, field: keyof ServiceEntry, value: string) => {
      setServiceGroups((prev) =>
        prev.map((g, i) =>
          i === gi
            ? { ...g, services: g.services.map((s, j) => (j === si ? { ...s, [field]: value } : s)) }
            : g
        )
      );
    },
    []
  );

  // Thêm dịch vụ vào trong nhóm hiện tại
  const handleAddServiceInGroup = useCallback((gi: number) => {
    setServiceGroups((prev) =>
      prev.map((g, i) =>
        i === gi ? { ...g, services: [...g.services, { serviceName: "", description: "" }] } : g
      )
    );
  }, []);

  // Xoá 1 dịch vụ; nếu là dịch vụ cuối trong nhóm thì xoá luôn nhóm đó
  const handleRemoveService = useCallback((gi: number, si: number) => {
    setServiceGroups((prev) => {
      const group = prev[gi];
      if (group.services.length === 1) {
        return prev.filter((_, i) => i !== gi);
      }
      return prev.map((g, i) =>
        i === gi ? { ...g, services: g.services.filter((_, j) => j !== si) } : g
      );
    });
  }, []);

  // Xoá cả nhóm
  const handleRemoveGroup = useCallback((gi: number) => {
    setServiceGroups((prev) => prev.filter((_, i) => i !== gi));
  }, []);

  // Thêm nhóm dịch vụ mới
  const handleAddGroup = useCallback(() => {
    setServiceGroups((prev) => [...prev, EMPTY_GROUP()]);
  }, []);

  const handleSavePackage = async () => {
    if (!name || !typeCode || !clinicId || !price) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    try {
      let data: any = {
        name,
        typeCode,
        clinicId: Number(clinicId),
        price: Number(price),
        note: note || null,
        imageBase64: imageBase64 || undefined,
        descriptionHTML,
        descriptionMarkdown,
        packageServices: serviceGroups.flatMap((g) =>
          g.services
            .filter((s) => s.serviceName.trim())
            .map((s) => ({
              groupServiceCode: g.groupServiceCode,
              serviceName: s.serviceName.trim(),
              description: s.description,
            }))
        ),
      };

      let res;
      if (isEditing && editPackageId) {
        res = await updatePackageService({ ...data, id: editPackageId });
      } else {
        res = await createNewPackageService(data);
      }

      if (res && res.errCode === 0) {
        toast.success(
          isEditing ? "Cập nhật gói khám thành công!" : "Thêm gói khám thành công!"
        );
        resetForm();
        fetchAllPackages();
      } else {
        toast.error(res?.errMessage || "Đã có lỗi xảy ra!");
      }
    } catch (e: any) {
      const msg =
        e?.response?.data?.errMessage ||
        e?.response?.data?.message ||
        "Đã có lỗi xảy ra!";
      toast.error(msg);
    }
  };

  const handleEditPackage = (item: any) => {
    let imgBase64 = "";
    if (item && item.image) {
      imgBase64 = item.image.startsWith("data:") ? item.image : `data:image/jpeg;base64,${item.image}`;
    }

    setName(item?.name || "");
    setPrice(item?.price || "");
    setTypeCode(item?.typeCode || "");
    setClinicId(item?.clinicId || "");
    setNote(item?.note || "");
    setImageBase64(imgBase64);
    setPreviewImgURL(imgBase64);
    setDescriptionHTML(item?.descriptionHTML || "");
    setDescriptionMarkdown(item?.descriptionMarkdown || "");
    // Nhóm lại các dịch vụ theo groupServiceCode khi load vào form sửa
    const groupMap: Record<string, ServiceEntry[]> = {};
    for (const s of (item?.packageServices || [])) {
      const key = s.groupServiceCode || "";
      if (!groupMap[key]) groupMap[key] = [];
      groupMap[key].push({ serviceName: s.serviceName || "", description: s.description || "" });
    }
    const loadedGroups: ServiceGroup[] = Object.entries(groupMap).map(([code, services]) => ({
      groupServiceCode: code,
      services,
    }));
    setServiceGroups(loadedGroups.length > 0 ? loadedGroups : [EMPTY_GROUP()]);
    setIsEditing(true);
    setEditPackageId(item?.id || null);
  };

  const handleDeletePackage = async (item: any) => {
    if (!window.confirm(`Bạn có chắc muốn xóa gói khám "${item.name}"?`)) return;
    let res = await deletePackageService(item.id);
    if (res && res.errCode === 0) {
      toast.success("Xóa gói khám thành công!");
      fetchAllPackages();
    } else {
      toast.error(res?.errMessage || "Xóa gói khám thất bại!");
    }
  };

  // Hiển thị tên loại gói khám theo ngôn ngữ
  const getTypeName = (item: any) => {
    if (!item?.typeData) return item?.typeCode || "";
    return language === "vi" ? item.typeData.valueVi : item.typeData.valueEn;
  };

  return (
    <div className="manage-package-container">
      <div className="mp-title">
        <FormattedMessage id="menu.manage-package.title" />
      </div>

      <div className="add-new-package row">
        {/* ===== Card: Thông tin chung ===== */}
        <div className="col-12 mb-4">
          <div className="info-card">
            <div className="card-header">
              <span>
                <i className="fas fa-box-open"></i> Thông tin chung
              </span>
            </div>
            <div className="card-body row">
              {/* Tên gói khám */}
              <div className="col-md-6 form-group">
                <label className="label-bold">
                  <FormattedMessage id="menu.manage-package.name-package" />{" "}
                  <span className="text-danger">*</span>
                </label>
                <input
                  className="form-control"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nhập tên gói khám..."
                />
              </div>

              {/* Giá gói khám */}
              <div className="col-md-6 form-group">
                <label className="label-bold">
                  <FormattedMessage id="menu.manage-package.price-package" />{" "}
                  <span className="text-danger">*</span>
                </label>
                <input
                  className="form-control"
                  type="number"
                  min={0}
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="Nhập giá gói khám (VNĐ)..."
                />
              </div>

              {/* Loại gói khám */}
              <div className="col-md-6 form-group">
                <label className="label-bold">
                  <FormattedMessage id="menu.manage-package.type-package" />{" "}
                  <span className="text-danger">*</span>
                </label>
                <select
                  className="form-control"
                  value={typeCode}
                  onChange={(e) => setTypeCode(e.target.value)}
                >
                  <option value="">-- Chọn loại gói khám --</option>
                  {packageTypes.map((type: any, index: number) => (
                    <option key={index} value={type.keyMap}>
                      {language === "vi" ? type.valueVi : type.valueEn}
                    </option>
                  ))}
                </select>
              </div>

              {/* Phòng khám */}
              <div className="col-md-6 form-group">
                <label className="label-bold">
                  <FormattedMessage id="menu.manage-package.clinic-package" />{" "}
                  <span className="text-danger">*</span>
                </label>
                <select
                  className="form-control"
                  value={clinicId}
                  onChange={(e) => setClinicId(e.target.value)}
                >
                  <option value="">-- Chọn phòng khám --</option>
                  {clinics.map((clinic: any, index: number) => (
                    <option key={index} value={clinic.id}>
                      {clinic.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Ghi chú */}
              <div className="col-md-12 form-group">
                <label className="label-bold">
                  <FormattedMessage id="menu.manage-package.note-package" />
                </label>
                <input
                  className="form-control"
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Nhập ghi chú (không bắt buộc)..."
                />
              </div>

              {/* Ảnh gói khám */}
              <div className="col-md-12 form-group">
                <label className="label-bold">
                  <FormattedMessage id="menu.manage-package.image-package" />
                </label>
                <div
                  className="upload-box"
                  style={{ backgroundImage: `url(${previewImgURL})` }}
                  onClick={() => fileInput.current?.click()}
                >
                  <input
                    ref={fileInput}
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={handleOnChangeImage}
                  />
                  {!previewImgURL && (
                    <span className="upload-text">
                      <i className="fas fa-cloud-upload-alt"></i>{" "}
                      <FormattedMessage id="menu.manage-package.upload-image" />
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ===== Card: Danh mục dịch vụ ===== */}
        <div className="col-12 mb-4">
          <div className="info-card">
            <div className="card-header">
              <span>
                <i className="fas fa-list-ul"></i> Danh mục dịch vụ
              </span>
            </div>
            <div className="card-body">
              <table className="table table-bordered service-table">
                <thead>
                  <tr>
                    <th style={{ width: "220px" }}>Nhóm dịch vụ</th>
                    <th>Tên dịch vụ</th>
                    <th>Mô tả</th>
                    <th style={{ width: "90px" }}></th>
                  </tr>
                </thead>
                <tbody>
                  {serviceGroups.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center text-muted py-3">
                        Chưa có nhóm dịch vụ nào. Nhấn "+ Thêm nhóm dịch vụ" để thêm.
                      </td>
                    </tr>
                  ) : (
                    serviceGroups.map((group, gi) => (
                      <React.Fragment key={gi}>
                        {/* Hàng phân cách giữa các nhóm */}
                        {gi > 0 && (
                          <tr className="group-divider-row">
                            <td colSpan={4}></td>
                          </tr>
                        )}

                        {/* Các dịch vụ trong nhóm */}
                        {group.services.map((svc, si) => (
                          <tr key={si}>
                            {/* Nhóm dịch vụ: chỉ hiện dropdown ở hàng đầu tiên */}
                            <td>
                              {si === 0 ? (
                                <select
                                  className="form-control form-control-sm"
                                  value={group.groupServiceCode}
                                  onChange={(e) => handleGroupCodeChange(gi, e.target.value)}
                                >
                                  <option value="">-- Chọn nhóm --</option>
                                  {groupServices.map((gs: any, i: number) => (
                                    <option key={i} value={gs.keyMap}>
                                      {language === "vi" ? gs.valueVi : gs.valueEn}
                                    </option>
                                  ))}
                                </select>
                              ) : (
                                <div className="group-indent-cell"
                                  title={group.groupServiceCode}>
                                </div>
                              )}
                            </td>
                            <td>
                              <input
                                className="form-control form-control-sm"
                                type="text"
                                value={svc.serviceName}
                                placeholder="Tên dịch vụ..."
                                onChange={(e) => handleServiceChange(gi, si, "serviceName", e.target.value)}
                              />
                            </td>
                            <td>
                              <input
                                className="form-control form-control-sm"
                                type="text"
                                value={svc.description}
                                placeholder="Mô tả..."
                                onChange={(e) => handleServiceChange(gi, si, "description", e.target.value)}
                              />
                            </td>
                            <td className="text-center service-action-cell">
                              <button
                                className="btn-remove-service"
                                onClick={() => handleRemoveService(gi, si)}
                                title="Xóa dịch vụ"
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </td>
                          </tr>
                        ))}

                        {/* Hàng hành động của nhóm: + Thêm dịch vụ và X Xóa nhóm */}
                        <tr className="group-action-row">
                          <td></td>
                          <td>
                            <button
                              type="button"
                              className="btn btn-link btn-sm p-0 btn-add-in-group"
                              onClick={() => handleAddServiceInGroup(gi)}
                            >
                              <i className="fas fa-plus-circle"></i> Thêm dịch vụ
                            </button>
                          </td>
                          <td></td>
                          <td className="text-center">
                            <button
                              className="btn-remove-group"
                              onClick={() => handleRemoveGroup(gi)}
                              title="Xóa nhóm này"
                            >
                              <i className="fas fa-trash-alt"></i>
                            </button>
                          </td>
                        </tr>
                      </React.Fragment>
                    ))
                  )}
                </tbody>
              </table>
              <button
                type="button"
                className="btn btn-outline-primary btn-sm btn-add-service"
                onClick={handleAddGroup}
              >
                <i className="fas fa-plus"></i> Thêm nhóm dịch vụ
              </button>
            </div>
          </div>
        </div>

        {/* ===== Card: Mô tả ===== */}
        <div className="col-12">
          <div className="info-card">
            <div className="card-header">
              <span>
                <i className="fas fa-pen-nib"></i>{" "}
                <FormattedMessage id="menu.manage-package.description" />
              </span>
            </div>
            <div className="card-body">
              <MdEditor
                key={editPackageId ?? "new"}
                style={{ height: "400px" }}
                renderHTML={(text) => mdParser.render(text)}
                onChange={handleEditorChange}
                value={descriptionMarkdown}
              />
            </div>
          </div>
        </div>

        {/* ===== Nút lưu ===== */}
        <div className="col-12 btn-container">
          <button
            type="button"
            className="btn btn-primary btn-save-package"
            onClick={handleSavePackage}
          >
            <i className="fas fa-save"></i>{" "}
            {isEditing ? (
              <FormattedMessage id="menu.manage-package.edit" defaultMessage="Cập nhật" />
            ) : (
              <FormattedMessage id="menu.manage-package.save" />
            )}
          </button>
          {isEditing && (
            <button
              className="btn btn-secondary ml-3 btn-cancel"
              onClick={resetForm}
            >
              <i className="fas fa-times"></i> Hủy
            </button>
          )}
        </div>
      </div>

      {/* ===== Danh sách gói khám ===== */}
      <div className="package-list-container mt-5">
        <div className="info-card">
          <div className="card-header">
            <span>
              <i className="fas fa-list"></i> Danh sách gói khám
            </span>
          </div>
          <div className="card-body p-0">
            <table className="table table-striped table-bordered mb-0">
              <thead>
                <tr>
                  <th>Tên gói khám</th>
                  <th>Loại gói</th>
                  <th>Phòng khám</th>
                  <th style={{ width: "120px", textAlign: "center" }}>
                    Giá (VNĐ)
                  </th>
                  <th style={{ width: "120px", textAlign: "center" }}>
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody>
                {packages && packages.length > 0 ? (
                  packages.map((item: any, index: number) => (
                    <tr key={index}>
                      <td>{item.name}</td>
                      <td>{getTypeName(item)}</td>
                      <td>{item.clinicName || item.clinicId}</td>
                      <td className="text-center">
                        {item.price?.toLocaleString("vi-VN")}
                      </td>
                      <td className="text-center">
                        <button
                          className="btn-edit"
                          onClick={() => handleEditPackage(item)}
                          title="Chỉnh sửa"
                        >
                          <i className="fas fa-pencil-alt"></i>
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDeletePackage(item)}
                          title="Xóa"
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center">
                      Chưa có gói khám nào
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagePackage;
