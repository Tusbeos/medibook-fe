import React, { useCallback, useEffect, useRef, useState } from "react";
import "./ManageSpecialty.scss";
import MarkdownIt from "markdown-it";
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import { CommonUtils, getBase64FromBuffer } from "../../../utils";
import {
  createNewSpecialtyService,
  deleteSpecialtyService,
  handleGetAllSpecialties,
  updateSpecialtyService,
} from "../../../services/specialtyService";
import { toast } from "react-toastify";
import { ISpecialty } from "../../../types";

const mdParser = new MarkdownIt();

const ManageSpecialty = () => {
  const [name, setName] = useState("");
  const [imageBase64, setImageBase64] = useState("");
  const [descriptionHTML, setDescriptionHTML] = useState("");
  const [descriptionMarkdown, setDescriptionMarkdown] = useState("");
  const [previewImgURL, setPreviewImgURL] = useState("");
  const [specialties, setSpecialties] = useState<ISpecialty[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editSpecialtyId, setEditSpecialtyId] = useState<number | null>(null);

  const fileInput = useRef<HTMLInputElement>(null);

  const fetchAllSpecialties = useCallback(async () => {
    const res = await handleGetAllSpecialties();
    if (res && res.errCode === 0) {
      setSpecialties(Array.isArray(res.data) ? res.data : []);
    }
  }, []);

  useEffect(() => {
    fetchAllSpecialties();
  }, [fetchAllSpecialties]);

  const handleEditorChange = useCallback(
    ({ html, text }: { html: string; text: string }) => {
      setDescriptionHTML(html);
      setDescriptionMarkdown(text);
    },
    [],
  );

  const handleOnChangeImage = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    const file = files?.[0];

    if (!file) {
      return;
    }

    const base64 = await CommonUtils.getBase64(file);
    setImageBase64(base64);
    setPreviewImgURL(base64);
  }, []);

  const resetForm = useCallback(() => {
    setName("");
    setImageBase64("");
    setDescriptionHTML("");
    setDescriptionMarkdown("");
    setPreviewImgURL("");
    setIsEditing(false);
    setEditSpecialtyId(null);
    if (fileInput.current) {
      fileInput.current.value = "";
    }
  }, []);

  const handleSaveNewSpecialty = async () => {
    if (!name.trim() || !imageBase64 || !descriptionMarkdown.trim()) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc.");
      return;
    }

    try {
      const payload: Partial<ISpecialty> = {
        name: name.trim(),
        image: imageBase64,
        descriptionHTML,
        descriptionMarkdown,
      };

      const res = isEditing
        ? await updateSpecialtyService({ ...payload, id: editSpecialtyId || undefined })
        : await createNewSpecialtyService(payload);

      if (res && res.errCode === 0) {
        toast.success(isEditing ? "Cập nhật chuyên khoa thành công." : "Tạo chuyên khoa thành công.");
        resetForm();
        fetchAllSpecialties();
        return;
      }

      toast.error(res?.errMessage || "Đã có lỗi xảy ra.");
    } catch (e: any) {
      const msg =
        e?.response?.data?.errMessage || e?.response?.data?.message || "Đã có lỗi xảy ra.";
      toast.error(msg);
    }
  };

  const handleEditSpecialty = (item: ISpecialty) => {
    const imgBase64 = item?.image ? getBase64FromBuffer(item.image) || "" : "";

    setName(item?.name || "");
    setImageBase64(imgBase64);
    setPreviewImgURL(imgBase64);
    setDescriptionHTML(item?.descriptionHTML || "");
    setDescriptionMarkdown(item?.descriptionMarkdown || "");
    setIsEditing(true);
    setEditSpecialtyId(item?.id || null);
  };

  const handleDeleteSpecialty = async (item: ISpecialty) => {
    const res = await deleteSpecialtyService(item.id || "");
    if (res && res.errCode === 0) {
      toast.success("Xóa chuyên khoa thành công.");
      fetchAllSpecialties();
      return;
    }

    toast.error(res?.errMessage || "Xóa chuyên khoa thất bại.");
  };

  const filteredSpecialties = specialties.filter((item) => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) {
      return true;
    }

    const description = item.descriptionMarkdown || "";
    return (
      (item.name || "").toLowerCase().includes(query) ||
      description.toLowerCase().includes(query)
    );
  });

  return (
    <div className="manage-specialty-container">
      <div className="specialty-panel specialty-form-panel">
        <div className="panel-heading">
          <h2>Thông tin chung</h2>
        </div>

        <div className="specialty-form-grid">
          <div className="specialty-name-field">
            <label htmlFor="specialty-name">Tên chuyên khoa</label>
            <input
              id="specialty-name"
              className="specialty-input"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Nhập tên chuyên khoa..."
            />
          </div>

          <div className="specialty-upload-field">
            <label>Hình ảnh chuyên khoa</label>
            <input
              ref={fileInput}
              id="specialty-image"
              type="file"
              hidden
              accept="image/png,image/jpeg,image/jpg"
              onChange={handleOnChangeImage}
            />

            <div className="specialty-upload-grid">
              <button
                type="button"
                className="upload-card"
                onClick={() => fileInput.current?.click()}
              >
                <span className="upload-icon">
                  <i className="fas fa-cloud-upload-alt" />
                </span>
                <span className="upload-title">Tải ảnh lên</span>
                <span className="upload-subtitle">PNG, JPG (tối đa 2MB)</span>
              </button>

              <button
                type="button"
                className={`upload-card preview-card ${previewImgURL ? "has-image" : ""}`}
                onClick={() => fileInput.current?.click()}
              >
                {previewImgURL ? (
                  <div
                    className="upload-preview"
                    style={{ backgroundImage: `url(${previewImgURL})` }}
                  />
                ) : (
                  <>
                    <span className="upload-icon">
                      <i className="far fa-image" />
                    </span>
                    <span className="upload-title">Xem trước ảnh</span>
                    <span className="upload-subtitle">Tỉ lệ tùy chọn theo ảnh tải lên</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="specialty-panel specialty-editor-panel">
        <div className="panel-heading">
          <h2>Thông tin giới thiệu chi tiết</h2>
        </div>

        <div className="editor-shell">
          <MdEditor
            style={{ height: "360px" }}
            renderHTML={(text) => mdParser.render(text)}
            onChange={handleEditorChange}
            value={descriptionMarkdown}
            placeholder="Nhập nội dung giới thiệu chi tiết về chuyên khoa tại đây..."
          />
        </div>
      </div>

      <div className="specialty-actions">
        <button type="button" className="save-specialty-button" onClick={handleSaveNewSpecialty}>
          <i className="far fa-save" />
          <span>{isEditing ? "CẬP NHẬT THÔNG TIN" : "LƯU THÔNG TIN"}</span>
        </button>

        {isEditing && (
          <button type="button" className="cancel-specialty-button" onClick={resetForm}>
            HỦY CHỈNH SỬA
          </button>
        )}
      </div>

      <div className="specialty-panel specialty-list-panel">
        <div className="panel-heading panel-heading-row">
          <h2>Danh sách chuyên khoa</h2>

          <div className="search-box">
            <i className="fas fa-search" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Tìm kiếm chuyên khoa..."
            />
          </div>
        </div>

        <div className="specialty-table-wrap">
          <table className="specialty-table">
            <thead>
              <tr>
                <th>Tên chuyên khoa</th>
                <th>Mô tả</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {filteredSpecialties.length > 0 ? (
                filteredSpecialties.map((item) => {
                  const imageUrl = item.image ? getBase64FromBuffer(item.image) : "";
                  const descriptionPreview = (item.descriptionMarkdown || "")
                    .replace(/[#_*`>-]/g, "")
                    .trim();

                  return (
                    <tr key={item.id}>
                      <td>
                        <div className="specialty-cell specialty-name-cell">
                          <div className="specialty-avatar">
                            {imageUrl ? (
                              <div
                                className="specialty-avatar-image"
                                style={{ backgroundImage: `url(${imageUrl})` }}
                              />
                            ) : (
                              <i className="fas fa-clinic-medical" />
                            )}
                          </div>
                          <span>{item.name}</span>
                        </div>
                      </td>
                      <td className="specialty-description-cell">
                        {descriptionPreview || "Chưa có mô tả chi tiết."}
                      </td>
                      <td>
                        <div className="specialty-table-actions">
                          <button
                            type="button"
                            className="table-action edit-action"
                            onClick={() => handleEditSpecialty(item)}
                          >
                            <i className="fas fa-pen" />
                          </button>
                          <button
                            type="button"
                            className="table-action delete-action"
                            onClick={() => handleDeleteSpecialty(item)}
                          >
                            <i className="fas fa-trash-alt" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={3} className="specialty-empty-state">
                    Chưa có chuyên khoa phù hợp.
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

export default ManageSpecialty;
