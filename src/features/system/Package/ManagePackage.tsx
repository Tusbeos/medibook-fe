import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import MarkdownIt from "markdown-it";
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import "./ManagePackage.scss";
import { CommonUtils, getBase64FromBuffer } from "../../../utils";
import {
  createNewPackageService,
  deletePackageService,
  getPackageById,
  handleGetAllPackages,
  updatePackageService,
} from "../../../services/packageService";
import { handleGetAllCode } from "../../../services/userService";
import { handleGetAllClinics } from "../../../services/clinicService";
import { toast } from "react-toastify";
import {
  Panel,
  PanelHeading,
  SearchBox,
  DataTable,
  ActionButtons,
  FormField,
} from "components/System/SystemShared";

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
  const [serviceGroups, setServiceGroups] = useState<ServiceGroup[]>([
    createEmptyGroup(),
  ]);
  const [packages, setPackages] = useState<any[]>([]);
  const [packageTypes, setPackageTypes] = useState<any[]>([]);
  const [clinics, setClinics] = useState<any[]>([]);
  const [groupServices, setGroupServices] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editPackageId, setEditPackageId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

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

  const handleOnChangeImage = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) {
        return;
      }

      const base64 = (await CommonUtils.getBase64(file)) as string;
      setImageBase64(base64);
      setPreviewImgURL(base64);
    },
    [],
  );

  const handleGroupCodeChange = useCallback(
    (groupIndex: number, value: string) => {
      setServiceGroups((prev) =>
        prev.map((group, index) =>
          index === groupIndex ? { ...group, groupServiceCode: value } : group,
        ),
      );
    },
    [],
  );

  const handleServiceChange = useCallback(
    (
      groupIndex: number,
      serviceIndex: number,
      field: keyof ServiceEntry,
      value: string,
    ) => {
      setServiceGroups((prev) =>
        prev.map((group, index) =>
          index === groupIndex
            ? {
                ...group,
                services: group.services.map((service, itemIndex) =>
                  itemIndex === serviceIndex
                    ? { ...service, [field]: value }
                    : service,
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
          ? {
              ...group,
              services: [
                ...group.services,
                { serviceName: "", description: "" },
              ],
            }
          : group,
      ),
    );
  }, []);

  const handleRemoveService = useCallback(
    (groupIndex: number, serviceIndex: number) => {
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
            ? {
                ...item,
                services: item.services.filter(
                  (_, itemIndex) => itemIndex !== serviceIndex,
                ),
              }
            : item,
        );
      });
    },
    [],
  );

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
        toast.success(
          isEditing
            ? "Cập nhật gói khám thành công."
            : "Lưu gói khám thành công.",
        );
        resetForm();
        fetchAllPackages();
        return;
      }

      toast.error(res?.errMessage || "Đã có lỗi xảy ra.");
    } catch (e: any) {
      const msg =
        e?.response?.data?.errMessage ||
        e?.response?.data?.message ||
        "Đã có lỗi xảy ra.";
      toast.error(msg);
    }
  };

  const handleEditPackage = async (item: any) => {
    let packageDetail = item;
    if (item?.id) {
      try {
        const res = await getPackageById(item.id);
        packageDetail = res?.errCode === 0 && res?.data ? res.data : item;
      } catch {
        toast.error("Không tải được chi tiết gói khám.");
      }
    }

    const imgBase64 = getBase64FromBuffer(packageDetail?.image);

    setName(packageDetail?.name || "");
    setPrice(packageDetail?.price || "");
    setTypeCode(packageDetail?.typeCode || "");
    setClinicId(packageDetail?.clinicId || "");
    setNote(packageDetail?.note || "");
    setImageBase64(imgBase64);
    setPreviewImgURL(imgBase64);
    setDescriptionHTML(packageDetail?.descriptionHTML || "");
    setDescriptionMarkdown(packageDetail?.descriptionMarkdown || "");

    const groupMap: Record<string, ServiceEntry[]> = {};
    for (const service of packageDetail?.packageServices || []) {
      const key = service.groupServiceCode || "";
      if (!groupMap[key]) {
        groupMap[key] = [];
      }
      groupMap[key].push({
        serviceName: service.serviceName || "",
        description: service.description || "",
      });
    }

    const loadedGroups = Object.entries(groupMap).map(
      ([groupServiceCode, services]) => ({
        groupServiceCode,
        services,
      }),
    );
    setServiceGroups(
      loadedGroups.length > 0 ? loadedGroups : [createEmptyGroup()],
    );
    setIsEditing(true);
    setEditPackageId(packageDetail?.id || null);
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

  const filteredPackages = useMemo(() => {
    if (!searchTerm.trim()) return packages;
    const term = searchTerm.toLowerCase();
    return packages.filter(
      (item: any) =>
        (item.name || "").toLowerCase().includes(term) ||
        (item.clinicName || item.clinicData?.name || "")
          .toLowerCase()
          .includes(term) ||
        (getTypeName(item) || "").toLowerCase().includes(term),
    );
  }, [packages, searchTerm]);

  const packageColumns = useMemo(
    () => [
      { key: "name", title: "Tên gói khám" },
      {
        key: "type",
        title: "Loại gói",
        render: (item: any) => getTypeName(item),
      },
      {
        key: "clinic",
        title: "Phòng khám",
        render: (item: any) =>
          item.clinicName || item.clinicData?.name || item.clinicId,
      },
      {
        key: "price",
        title: "Giá (VNĐ)",
        render: (item: any) => item.price?.toLocaleString("vi-VN"),
      },
    ],
    [],
  );

  return (
    <div className="manage-package-container">
      <Panel className="package-info-panel">
        <PanelHeading title="Thông tin chung" icon="fas fa-briefcase-medical" />

        <div className="package-form-grid">
          <FormField label="Tên gói khám *">
            <input
              className="sys-input"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nhập tên gói khám..."
            />
          </FormField>

          <FormField label="Giá gói khám (VNĐ) *">
            <input
              className="sys-input"
              type="number"
              min={0}
              value={price}
              onChange={(event) => setPrice(event.target.value)}
              placeholder="Nhập giá gói khám (VNĐ)..."
            />
          </FormField>

          <FormField label="Loại gói khám *">
            <select
              className="sys-input"
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
          </FormField>

          <FormField label="Phòng khám *">
            <select
              className="sys-input"
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
          </FormField>
        </div>

        <FormField label="Ghi chú">
          <input
            className="sys-input"
            type="text"
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Nhập ghi chú (không bắt buộc)..."
          />
        </FormField>

        <FormField label="Ảnh gói khám">
          <button
            type="button"
            className={`package-upload-card ${previewImgURL ? "has-image" : ""}`}
            style={{
              backgroundImage: previewImgURL ? `url(${previewImgURL})` : "",
            }}
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
        </FormField>
      </Panel>

      <Panel className="package-service-panel">
        <PanelHeading title="Danh mục dịch vụ" icon="fas fa-list-ul" />

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
                            onChange={(event) =>
                              handleGroupCodeChange(
                                groupIndex,
                                event.target.value,
                              )
                            }
                          >
                            <option value="">-- Chọn nhóm --</option>
                            {groupServices.map((groupService: any) => (
                              <option
                                key={groupService.keyMap}
                                value={groupService.keyMap}
                              >
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
                            handleServiceChange(
                              groupIndex,
                              serviceIndex,
                              "serviceName",
                              event.target.value,
                            )
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
                            handleServiceChange(
                              groupIndex,
                              serviceIndex,
                              "description",
                              event.target.value,
                            )
                          }
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="remove-service-button"
                          onClick={() =>
                            handleRemoveService(groupIndex, serviceIndex)
                          }
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

        <button
          type="button"
          className="add-group-button"
          onClick={handleAddGroup}
        >
          <i className="fas fa-plus" />
          Thêm nhóm dịch vụ
        </button>
      </Panel>

      <Panel className="package-editor-panel">
        <PanelHeading title="Mô tả gói khám" icon="fas fa-file-alt" />

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
      </Panel>

      <ActionButtons
        isEditing={isEditing}
        onSave={handleSavePackage}
        onCancel={resetForm}
        saveLabel="LƯU THÔNG TIN"
        editLabel="CẬP NHẬT THÔNG TIN"
      />

      <Panel className="package-list-panel">
        <PanelHeading title="Danh sách gói khám" icon="fas fa-box-open">
          <SearchBox
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Tìm kiếm theo tên, loại, phòng khám..."
          />
        </PanelHeading>

        <DataTable
          columns={packageColumns}
          data={filteredPackages}
          rowKey={(item: any) => item.id || item.name}
          emptyText="Chưa có gói khám nào."
          onEdit={handleEditPackage}
          onDelete={handleDeletePackage}
        />
      </Panel>
    </div>
  );
};

export default ManagePackage;
