import React, { useState, useEffect, useCallback, useRef } from "react";
import "./ManageClinic.scss";
import MarkdownIt from "markdown-it";
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import { CommonUtils, getBase64FromBuffer } from "../../../utils";
import {
  createNewClinicService,
  updateClinicService,
  deleteClinicService,
  getDetailClinicById,
  handleGetAllClinics,
} from "../../../services/clinicService";
import { toast } from "react-toastify";

const mdParser = new MarkdownIt({ html: true });

const ManageClinic = () => {
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [imageBase64, setImageBase64] = useState("");
  const [previewImage, setPreviewImage] = useState("");
  const [imageCoverBase64, setImageCoverBase64] = useState("");
  const [previewImageCover, setPreviewImageCover] = useState("");
  const [descriptionHTML, setDescriptionHTML] = useState("");
  const [descriptionMarkdown, setDescriptionMarkdown] = useState("");
  const [clinics, setClinics] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editClinicId, setEditClinicId] = useState<number | string | null>(null);

  const fileInputLogo = useRef<HTMLInputElement>(null);
  const fileInputCover = useRef<HTMLInputElement>(null);

  const fetchAllClinics = useCallback(async () => {
    try {
      let res = await handleGetAllClinics();
      if (res && res.errCode === 0) {
        setClinics(res.data ? res.data : []);
      }
    } catch (e) {
      console.log(e);
    }
  }, []);

  // Lấy danh sách phòng khám khi mount
  useEffect(() => {
    fetchAllClinics();
  }, [fetchAllClinics]);

  const handleOnChangeInput = useCallback((event: any, id: string) => {
    if (!event || !event.target) return;
    const valueInput = event.target.value;
    switch (id) {
      case "name": setName(valueInput); break;
      case "address": setAddress(valueInput); break;
      default: break;
    }
  }, []);

  const handleEditorChange = useCallback(({ html, text }: { html: string; text: string }) => {
    setDescriptionHTML(html);
    setDescriptionMarkdown(text);
  }, []);

  const handleOnChangeImage = useCallback(async (event: any, type = "logo") => {
    if (!event || !event.target || !event.target.files) return;
    const file = event.target.files[0];
    if (!file) return;

    const Base64 = await CommonUtils.getBase64(file);
    if (type === "cover") {
      setImageCoverBase64(Base64 || "");
      setPreviewImageCover(Base64 || "");
    } else {
      setImageBase64(Base64 || "");
      setPreviewImage(Base64 || "");
    }
  }, []);

  const resetForm = useCallback(() => {
    setName("");
    setAddress("");
    setImageBase64("");
    setPreviewImage("");
    setImageCoverBase64("");
    setPreviewImageCover("");
    setDescriptionHTML("");
    setDescriptionMarkdown("");
    setIsEditing(false);
    setEditClinicId(null);
    if (fileInputLogo.current) {
      fileInputLogo.current.value = "";
    }
    if (fileInputCover.current) {
      fileInputCover.current.value = "";
    }
  }, []);

  const handleSaveNewClinic = async () => {
    if (!name || !address || !descriptionMarkdown) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    try {
      const payload = {
        id: editClinicId as number,
        name,
        address,
        imageBase64,
        imageCoverBase64,
        descriptionHTML,
        descriptionMarkdown,
      };

      const res = isEditing
        ? await updateClinicService(payload)
        : await createNewClinicService(payload);

      if (res && res.errCode === 0) {
        toast.success(
          isEditing
            ? "Cập nhật phòng khám thành công!"
            : "Tạo phòng khám thành công!",
        );
        resetForm();
        await fetchAllClinics();
      } else {
        toast.error(
          res?.errMessage ||
            (isEditing
              ? "Cập nhật phòng khám thất bại!"
              : "Tạo phòng khám thất bại!"),
        );
      }
    } catch (e) {
      console.log(e);
      toast.error(
        isEditing
          ? "Có lỗi xảy ra khi cập nhật phòng khám!"
          : "Có lỗi xảy ra khi tạo phòng khám!",
      );
    }
  };

  const handleEditClinic = async (clinic: any) => {
    if (!clinic || !clinic.id) return;
    try {
      const res = await getDetailClinicById(clinic.id);
      if (res && res.errCode === 0 && res.data) {
        const imgBase64 = res.data.image
          ? getBase64FromBuffer(res.data.image) || ""
          : "";
        const imgCoverBase64 = res.data.imageCover
          ? getBase64FromBuffer(res.data.imageCover) || ""
          : "";

        setName(res.data.name || "");
        setAddress(res.data.address || "");
        setImageBase64(imgBase64);
        setPreviewImage(imgBase64);
        setImageCoverBase64(imgCoverBase64);
        setPreviewImageCover(imgCoverBase64);
        setDescriptionHTML(res.data.descriptionHTML || "");
        setDescriptionMarkdown(res.data.descriptionMarkdown || "");
        setIsEditing(true);
        setEditClinicId(res.data.id);
      }
    } catch (e) {
      console.log(e);
    }
  };

  const handleDeleteClinic = async (clinic: any) => {
    if (!clinic || !clinic.id) return;
    try {
      const res = await deleteClinicService(clinic.id);
      if (res && res.errCode === 0) {
        toast.success("Xóa phòng khám thành công!");
        await fetchAllClinics();
      } else {
        toast.error(res?.errMessage || "Xóa phòng khám thất bại!");
      }
    } catch (e) {
      console.log(e);
      toast.error("Có lỗi xảy ra khi xóa phòng khám!");
    }
  };

  const logoPreviewUrl = previewImage ? `url(${previewImage})` : "";
  const coverPreviewUrl = previewImageCover
    ? `url(${previewImageCover})`
    : "";
  const filteredClinics = clinics.filter((item) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return true;
    }

    return (
      (item.name || "").toLowerCase().includes(query) ||
      (item.address || "").toLowerCase().includes(query)
    );
  });

  return (
    <div className="manage-clinic-container">
      <div className="clinic-panel clinic-general-panel">
        <div className="panel-heading">
          <h2>Thông tin chung</h2>
        </div>

        <div className="clinic-general-grid">
          <div className="clinic-form-fields">
            <div className="form-field">
              <label htmlFor="clinic-name">Tên phòng khám</label>
              <input
                id="clinic-name"
                className="clinic-input"
                type="text"
                placeholder="Nhập tên phòng khám..."
                value={name}
                onChange={(event) => handleOnChangeInput(event, "name")}
              />
            </div>

            <div className="form-field">
              <label htmlFor="clinic-address">Địa chỉ phòng khám</label>
              <div className="input-with-icon">
                <i className="fas fa-map-marker-alt" />
                <input
                  id="clinic-address"
                  className="clinic-input"
                  type="text"
                  placeholder="Nhập địa chỉ chi tiết..."
                  value={address}
                  onChange={(event) => handleOnChangeInput(event, "address")}
                />
              </div>
            </div>
          </div>

          <div className="clinic-upload-group">
            <div className="upload-field">
              <label>Logo</label>
              <button
                type="button"
                className={`clinic-upload-box logo-box ${previewImage ? "has-image" : ""}`}
                style={{ backgroundImage: logoPreviewUrl }}
                onClick={() => fileInputLogo.current?.click()}
              >
                <input
                  ref={fileInputLogo}
                  type="file"
                  hidden
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={(event) => handleOnChangeImage(event, "logo")}
                />
                {!imageBase64 && (
                  <>
                    <span className="upload-icon">
                      <i className="fas fa-cloud-upload-alt" />
                    </span>
                    <span className="upload-title">Tải logo lên</span>
                    <span className="upload-note">PNG, JPG (tối đa 2MB)</span>
                  </>
                )}
              </button>
            </div>

            <div className="upload-field">
              <label>Ảnh bìa (Cover)</label>
              <button
                type="button"
                className={`clinic-upload-box cover-box ${previewImageCover ? "has-image" : ""}`}
                style={{ backgroundImage: coverPreviewUrl }}
                onClick={() => fileInputCover.current?.click()}
              >
                <input
                  ref={fileInputCover}
                  type="file"
                  hidden
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={(event) => handleOnChangeImage(event, "cover")}
                />
                {!imageCoverBase64 && (
                  <>
                    <span className="upload-icon">
                      <i className="far fa-image" />
                    </span>
                    <span className="upload-title">Tải ảnh bìa</span>
                    <span className="upload-note">Tỷ lệ 16:9</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="clinic-panel clinic-editor-panel">
        <div className="panel-heading">
          <h2>Thông tin giới thiệu chi tiết</h2>
        </div>

        <div className="editor-shell">
          <MdEditor
            style={{ height: "360px" }}
            renderHTML={(text) => mdParser.render(text)}
            onChange={handleEditorChange}
            value={descriptionMarkdown}
            placeholder="Viết nội dung giới thiệu về phòng khám..."
          />
        </div>
      </div>

      <div className="clinic-actions">
        <button type="button" className="save-clinic-button" onClick={handleSaveNewClinic}>
          <i className="far fa-save" />
          <span>{isEditing ? "CẬP NHẬT THÔNG TIN" : "LƯU THÔNG TIN"}</span>
        </button>

        {isEditing && (
          <button type="button" className="cancel-clinic-button" onClick={resetForm}>
            HỦY CHỈNH SỬA
          </button>
        )}
      </div>

      <div className="clinic-panel clinic-list-panel">
        <div className="panel-heading panel-heading-row">
          <h2>Danh sách phòng khám</h2>

          <div className="clinic-search-box">
            <i className="fas fa-search" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Tìm nhanh..."
            />
          </div>
        </div>

        <div className="clinic-table-wrap">
          <table className="clinic-table">
            <thead>
              <tr>
                <th>Tên phòng khám</th>
                <th>Địa chỉ</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredClinics.length > 0 ? (
                filteredClinics.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <div className="clinic-name-cell">
                        <span className="clinic-code">P{item.id}</span>
                        <span>{item.name}</span>
                      </div>
                    </td>
                    <td>{item.address}</td>
                    <td>
                      <span className="status-badge active">
                        <i className="fas fa-circle" />
                        Hoạt động
                      </span>
                    </td>
                    <td>
                      <div className="clinic-table-actions">
                        <button
                          type="button"
                          className="table-action edit-action"
                          onClick={() => handleEditClinic(item)}
                          title="Sửa"
                        >
                          <i className="fas fa-pencil-alt" />
                        </button>
                        <button
                          type="button"
                          className="table-action delete-action"
                          onClick={() => handleDeleteClinic(item)}
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
                  <td colSpan={4} className="clinic-empty-state">
                    Chưa có dữ liệu phòng khám
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

export default ManageClinic;
