import React, { useCallback, useEffect, useRef, useState } from "react";
import MarkdownIt from "markdown-it";
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import "./ManagePackage.scss";
import { CommonUtils } from "../../../utils";
import {
  createNewPackageService,
  deletePackageService,
  handleGetAllPackages,
  updatePackageService,
} from "../../../services/packageService";
import { handleGetAllCode } from "../../../services/userService";
import { handleGetAllClinics } from "../../../services/clinicService";
import { toast } from "react-toastify";

const mdParser = new MarkdownIt();

interface ServiceEntry {
  serviceName: string;
  description: string;
}

interface ServiceGroup {
  groupServiceCode: string;
  services: ServiceEntry[];
}

const createEmptyGroup = (): ServiceGroup => ({
  groupServiceCode: "",
  services: [{ serviceName: "", description: "" }],
});

const ManagePackage = () => {
  const [name, setName] = useState("");
  const [price, setPrice] = useState<number | string>("");
  const [typeCode, setTypeCode] = useState("");
  const [clinicId, setClinicId] = useState<number | string>("");
  const [note, setNote] = useState("");
  const [imageBase64, setImageBase64] = useState("");
  const [previewImgURL, setPreviewImgURL] = useState("");
  const [descriptionHTML, setDescriptionHTML] = useState("");
  const [descriptionMarkdown, setDescriptionMarkdown] = useState("");
  const [serviceGroups, setServiceGroups] = useState<ServiceGroup[]>([createEmptyGroup()]);
  const [packages, setPackages] = useState<any[]>([]);
  const [packageTypes, setPackageTypes] = useState<any[]>([]);
  const [clinics, setClinics] = useState<any[]>([]);
  const [groupServices, setGroupServices] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editPackageId, setEditPackageId] = useState<number | null>(null);

  const fileInput = useRef<HTMLInputElement>(null);

  const fetchAllPackages = useCallback(async () => {
    const res = await handleGetAllPackages();
    if (res && res.errCode === 0) {
      setPackages(res.data ? res.data : []);
    }
  }, []);

  const fetchPackageTypes = useCallback(async () => {
    const res = await handleGetAllCode("PACKAGE");
    if (res && res.errCode === 0) {
      setPackageTypes(res.data ? res.data : []);
    }
  }, []);

  const fetchClinics = useCallback(async () => {
    const res = await handleGetAllClinics();
    if (res && res.errCode === 0) {
      setClinics(res.data ? res.data : []);
    }
  }, []);

  const fetchGroupServices = useCallback(async () => {
    const res = await handleGetAllCode("GROUP_SERVICE");
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

  const resetForm = useCallback(() => {
    setName("");
    setPrice("");
    setTypeCode("");
    setClinicId("");
    setNote("");
    setImageBase64("");
    setPreviewImgURL("");
    setDescriptionHTML("");
    setDescriptionMarkdown("");
    setServiceGroups([createEmptyGroup()]);
    setIsEditing(false);
    setEditPackageId(null);
    if (fileInput.current) {
      fileInput.current.value = "";
    }
  }, []);

  const handleEditorChange = useCallback(
    ({ html, text }: { html: string; text: string }) => {
      setDescriptionHTML(html);
      setDescriptionMarkdown(text);
    },
    [],
  );

  const handleOnChangeImage = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const base64 = await CommonUtils.getBase64(file) as string;
    setImageBase64(base64);
    setPreviewImgURL(base64);
  }, []);

  const handleGroupCodeChange = useCallback((groupIndex: number, value: string) => {
    setServiceGroups((prev) =>
      prev.map((group, index) =>
        index === groupIndex ? { ...group, groupServiceCode: value } : group,
      ),
    );
  }, []);

  const handleServiceChange = useCallback(
    (groupIndex: number, serviceIndex: number, field: keyof ServiceEntry, value: string) => {
      setServiceGroups((prev) =>
        prev.map((group, index) =>
          index === groupIndex
            ? {
                ...group,
                services: group.services.map((service, itemIndex) =>
                  itemIndex === serviceIndex ? { ...service, [field]: value } : service,
                ),
              }
            : group,
        ),
      );
    },
    [],
  );

  const handleAddServiceInGroup = useCallback((groupIndex: number) => {
    setServiceGroups((prev) =>
      prev.map((group, index) =>
        index === groupIndex
          ? { ...group, services: [...group.services, { serviceName: "", description: "" }] }
          : group,
      ),
    );
  }, []);

  const handleRemoveService = useCallback((groupIndex: number, serviceIndex: number) => {
    setServiceGroups((prev) => {
      const group = prev[groupIndex];
      if (!group) {
        return prev;
      }

      if (group.services.length === 1) {
        const next = prev.filter((_, index) => index !== groupIndex);
        return next.length > 0 ? next : [createEmptyGroup()];
      }

      return prev.map((item, index) =>
        index === groupIndex
          ? { ...item, services: item.services.filter((_, itemIndex) => itemIndex !== serviceIndex) }
          : item,
      );
    });
  }, []);

  const handleRemoveGroup = useCallback((groupIndex: number) => {
    setServiceGroups((prev) => {
      const next = prev.filter((_, index) => index !== groupIndex);
      return next.length > 0 ? next : [createEmptyGroup()];
    });
  }, []);

  const handleAddGroup = useCallback(() => {
    setServiceGroups((prev) => [...prev, createEmptyGroup()]);
  }, []);

  const handleSavePackage = async () => {
    if (!name.trim() || !typeCode || !clinicId || !price) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc.");
      return;
    }

    try {
      const payload: any = {
        name: name.trim(),
        typeCode,
        clinicId: Number(clinicId),
        price: Number(price),
        note: note.trim() || null,
        statusId: isEditing ? undefined : "SD1",
        imageBase64: imageBase64 || undefined,
        descriptionHTML,
        descriptionMarkdown,
        packageServices: serviceGroups.flatMap((group) =>
          group.services
            .filter((service) => service.serviceName.trim())
            .map((service) => ({
              groupServiceCode: group.groupServiceCode,
              serviceName: service.serviceName.trim(),
              description: service.description,
            })),
        ),
      };

      const res =
        isEditing && editPackageId
          ? await updatePackageService({ ...payload, id: editPackageId })
          : await createNewPackageService(payload);

      if (res && res.errCode === 0) {
        toast.success(isEditing ? "Cập nhật gói khám thành công." : "Lưu gói khám thành công.");
        resetForm();
        fetchAllPackages();
        return;
      }

      toast.error(res?.errMessage || "Đã có lỗi xảy ra.");
    } catch (e: any) {
      const msg = e?.response?.data?.errMessage || e?.response?.data?.message || "Đã có lỗi xảy ra.";
      toast.error(msg);
    }
  };

  const handleEditPackage = (item: any) => {
    const imgBase64 = item?.image
      ? item.image.startsWith?.("data:")
        ? item.image
        : `data:image/jpeg;base64,${item.image}`
      : "";

    setName(item?.name || "");
    setPrice(item?.price || "");
    setTypeCode(item?.typeCode || "");
    setClinicId(item?.clinicId || "");
    setNote(item?.note || "");
    setImageBase64(imgBase64);
    setPreviewImgURL(imgBase64);
    setDescriptionHTML(item?.descriptionHTML || "");
    setDescriptionMarkdown(item?.descriptionMarkdown || "");

    const groupMap: Record<string, ServiceEntry[]> = {};
    for (const service of item?.packageServices || []) {
      const key = service.groupServiceCode || "";
      if (!groupMap[key]) {
        groupMap[key] = [];
      }
      groupMap[key].push({
        serviceName: service.serviceName || "",
        description: service.description || "",
      });
    }

    const loadedGroups = Object.entries(groupMap).map(([groupServiceCode, services]) => ({
      groupServiceCode,
      services,
    }));
    setServiceGroups(loadedGroups.length > 0 ? loadedGroups : [createEmptyGroup()]);
    setIsEditing(true);
    setEditPackageId(item?.id || null);
  };

  const handleDeletePackage = async (item: any) => {
    if (!window.confirm(`Bạn có chắc muốn xóa gói khám "${item.name}"?`)) {
      return;
    }

    const res = await deletePackageService(item.id);
    if (res && res.errCode === 0) {
      toast.success("Xóa gói khám thành công.");
      fetchAllPackages();
      return;
    }

    toast.error(res?.errMessage || "Xóa gói khám thất bại.");
  };

  const getTypeName = (item: any) => {
    if (!item?.typeData) {
      return item?.typeCode || "";
    }
    return item.typeData.valueVi || item.typeData.valueEn || item.typeCode;
  };

  return (
    <div className="manage-package-container">
      <div className="package-panel package-info-panel">
        <div className="panel-heading">
          <h2>Thông tin chung</h2>
        </div>

        <div className="package-form-grid">
          <div className="package-form-field">
            <label htmlFor="package-name">Tên gói khám <span>*</span></label>
            <input
              id="package-name"
              className="package-input"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nhập tên gói khám..."
            />
          </div>

          <div className="package-form-field">
            <label htmlFor="package-price">Giá gói khám (VNĐ) <span>*</span></label>
            <input
              id="package-price"
              className="package-input"
              type="number"
              min={0}
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              placeholder="Nhập giá gói khám (VNĐ)..."
            />
          </div>

          <div className="package-form-field">
            <label htmlFor="package-type">Loại gói khám <span>*</span></label>
            <select
              id="package-type"
              className="package-input package-select"
              value={typeCode}
              onChange={(event) => setTypeCode(event.target.value)}
            >
              <option value="">-- Chọn loại gói khám --</option>
              {packageTypes.map((type: any) => (
                <option key={type.keyMap} value={type.keyMap}>
                  {type.valueVi || type.valueEn}
                </option>
              ))}
            </select>
          </div>

          <div className="package-form-field">
            <label htmlFor="package-clinic">Phòng khám <span>*</span></label>
            <select
              id="package-clinic"
              className="package-input package-select"
              value={clinicId}
              onChange={(event) => setClinicId(event.target.value)}
            >
              <option value="">-- Chọn phòng khám --</option>
              {clinics.map((clinic: any) => (
                <option key={clinic.id} value={clinic.id}>
                  {clinic.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="package-form-field">
          <label htmlFor="package-note">Ghi chú</label>
          <input
            id="package-note"
            className="package-input"
            type="text"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Nhập ghi chú (không bắt buộc)..."
          />
        </div>

        <div className="package-form-field">
          <label>Ảnh gói khám</label>
          <button
            type="button"
            className={`package-upload-card ${previewImgURL ? "has-image" : ""}`}
            style={{ backgroundImage: previewImgURL ? `url(${previewImgURL})` : "" }}
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
              <>
                <span className="upload-icon">
                  <i className="fas fa-cloud-upload-alt" />
                </span>
                <span className="upload-title">Tải ảnh</span>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="package-panel package-service-panel">
        <div className="panel-heading">
          <h2>Danh mục dịch vụ</h2>
        </div>

        <div className="service-table-wrap">
          <table className="service-table">
            <thead>
              <tr>
                <th>Nhóm dịch vụ</th>
                <th>Tên dịch vụ</th>
                <th>Mô tả</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {serviceGroups.map((group, groupIndex) => (
                <React.Fragment key={groupIndex}>
                  {group.services.map((service, serviceIndex) => (
                    <tr key={`${groupIndex}-${serviceIndex}`}>
                      <td>
                        {serviceIndex === 0 ? (
                          <select
                            className="table-input package-select"
                            value={group.groupServiceCode}
                            onChange={(event) => handleGroupCodeChange(groupIndex, event.target.value)}
                          >
                            <option value="">-- Chọn nhóm --</option>
                            {groupServices.map((groupService: any) => (
                              <option key={groupService.keyMap} value={groupService.keyMap}>
                                {groupService.valueVi || groupService.valueEn}
                              </option>
                            ))}
                          </select>
                        ) : (
                          <div className="service-indent" />
                        )}
                      </td>
                      <td>
                        <input
                          className="table-input"
                          type="text"
                          value={service.serviceName}
                          placeholder="Tên dịch vụ..."
                          onChange={(event) =>
                            handleServiceChange(groupIndex, serviceIndex, "serviceName", event.target.value)
                          }
                        />
                      </td>
                      <td>
                        <input
                          className="table-input"
                          type="text"
                          value={service.description}
                          placeholder="Mô tả..."
                          onChange={(event) =>
                            handleServiceChange(groupIndex, serviceIndex, "description", event.target.value)
                          }
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="remove-service-button"
                          onClick={() => handleRemoveService(groupIndex, serviceIndex)}
                          title="Xóa dịch vụ"
                        >
                          <i className="fas fa-times" />
                        </button>
                      </td>
                    </tr>
                  ))}
                  <tr className="service-action-row">
                    <td />
                    <td>
                      <button
                        type="button"
                        className="add-service-button"
                        onClick={() => handleAddServiceInGroup(groupIndex)}
                      >
                        <i className="fas fa-plus-circle" />
                        Thêm dịch vụ
                      </button>
                    </td>
                    <td />
                    <td>
                      <button
                        type="button"
                        className="remove-group-button"
                        onClick={() => handleRemoveGroup(groupIndex)}
                        title="Xóa nhóm"
                      >
                        <i className="fas fa-trash-alt" />
                      </button>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        <button type="button" className="add-group-button" onClick={handleAddGroup}>
          <i className="fas fa-plus" />
          Thêm nhóm dịch vụ
        </button>
      </div>

      <div className="package-panel package-editor-panel">
        <div className="panel-heading">
          <h2>Mô tả gói khám</h2>
        </div>

        <div className="editor-shell">
          <MdEditor
            key={editPackageId ?? "new"}
            style={{ height: "360px" }}
            renderHTML={(text) => mdParser.render(text)}
            onChange={handleEditorChange}
            value={descriptionMarkdown}
            placeholder="Nhập nội dung mô tả gói khám..."
          />
        </div>
      </div>

      <div className="package-actions">
        <button type="button" className="save-package-button" onClick={handleSavePackage}>
          <i className="far fa-save" />
          <span>{isEditing ? "CẬP NHẬT THÔNG TIN" : "LƯU THÔNG TIN"}</span>
        </button>

        {isEditing && (
          <button type="button" className="cancel-package-button" onClick={resetForm}>
            HỦY CHỈNH SỬA
          </button>
        )}
      </div>

      <div className="package-panel package-list-panel">
        <div className="panel-heading">
          <h2>Danh sách gói khám</h2>
        </div>

        <div className="package-table-wrap">
          <table className="package-table">
            <thead>
              <tr>
                <th>Tên gói khám</th>
                <th>Loại gói</th>
                <th>Phòng khám</th>
                <th>Giá (VNĐ)</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {packages.length > 0 ? (
                packages.map((item: any) => (
                  <tr key={item.id || item.name}>
                    <td>{item.name}</td>
                    <td>{getTypeName(item)}</td>
                    <td>{item.clinicName || item.clinicData?.name || item.clinicId}</td>
                    <td>{item.price?.toLocaleString("vi-VN")}</td>
                    <td>
                      <div className="package-table-actions">
                        <button
                          type="button"
                          className="table-action edit-action"
                          onClick={() => handleEditPackage(item)}
                          title="Chỉnh sửa"
                        >
                          <i className="fas fa-pencil-alt" />
                        </button>
                        <button
                          type="button"
                          className="table-action delete-action"
                          onClick={() => handleDeletePackage(item)}
                          title="Xóa"
                        >
                          <i className="fas fa-trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="package-empty-state">
                    Chưa có gói khám nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManagePackage;
