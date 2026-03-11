import React, { useState, useEffect, useCallback, useRef } from "react";
import { useSelector } from "react-redux";
import "./ManageSpecialty.scss";
import { FormattedMessage } from "react-intl";
import MarkdownIt from "markdown-it";
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import { CommonUtils, getBase64FromBuffer } from "../../../utils";
import {
  createNewSpecialtyService,
  handleGetAllSpecialties,
  deleteSpecialtyService,
  updateSpecialtyService,
  getSpecialtyByIds,
} from "../../../services/specialtyService";
import { toast } from "react-toastify";
import { IRootState } from "../../../types";

const mdParser = new MarkdownIt();

const ManageSpecialty = () => {
  const language = useSelector((state: IRootState) => state.app.language);

  const [name, setName] = useState("");
  const [imageBase64, setImageBase64] = useState("");
  const [descriptionHTML, setDescriptionHTML] = useState("");
  const [descriptionMarkdown, setDescriptionMarkdown] = useState("");
  const [previewImgURL, setPreviewImgURL] = useState("");
  const [specialties, setSpecialties] = useState<any[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editSpecialtyId, setEditSpecialtyId] = useState<string | null>(null);

  const fileInput = useRef<HTMLInputElement>(null);

  const fetchAllSpecialties = useCallback(async () => {
    let res = await handleGetAllSpecialties();
    if (res && res.errCode === 0) {
      setSpecialties(res.data ? res.data : []);
    }
  }, []);

  // Lấy danh sách chuyên khoa khi mount
  useEffect(() => {
    fetchAllSpecialties();
  }, [fetchAllSpecialties]);

  const handleEditorChange = useCallback(({ html, text }: { html: string; text: string }) => {
    setDescriptionHTML(html);
    setDescriptionMarkdown(text);
  }, []);

  const handleOnChangeImage = useCallback(async (event: any) => {
    let data = event.target.files;
    let file = data[0];
    if (file) {
      let Base64 = await CommonUtils.getBase64(file);
      setImageBase64(Base64);
      setPreviewImgURL(Base64);
    }
  }, []);

  const resetForm = useCallback(() => {
    setName("");
    setImageBase64("");
    setDescriptionHTML("");
    setDescriptionMarkdown("");
    setPreviewImgURL("");
    setIsEditing(false);
    setEditSpecialtyId(null);
  }, []);

  const handleSaveNewSpecialty = async () => {
    if (!name || !imageBase64 || !descriptionMarkdown) {
      toast.error("Vui lòng điền đầy đủ thông tin!");
      return;
    }

    try {
      let data: any = {
        name,
        imageBase64,
        descriptionHTML,
        descriptionMarkdown,
      };

      let res;
      if (isEditing) {
        res = await updateSpecialtyService({ ...data, id: editSpecialtyId });
      } else {
        res = await createNewSpecialtyService(data);
      }

      if (res && res.errCode === 0) {
        toast.success(
          isEditing
            ? "Cập nhật chuyên khoa thành công!"
            : "Thêm chuyên khoa thành công!",
        );
        resetForm();
        fetchAllSpecialties();
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

  const handleEditSpecialty = (item: any) => {
    let imgBase64 = "";
    if (item && item.image) {
      imgBase64 = getBase64FromBuffer(item.image) || "";
    }

    setName(item?.name || "");
    setImageBase64(imgBase64);
    setPreviewImgURL(imgBase64);
    setDescriptionHTML(item?.descriptionHTML || "");
    setDescriptionMarkdown(item?.descriptionMarkdown || "");
    setIsEditing(true);
    setEditSpecialtyId(item?.id || null);
  };

  const handleDeleteSpecialty = async (item: any) => {
    let res = await deleteSpecialtyService(item.id);
    if (res && res.errCode === 0) {
      toast.success("Xóa chuyên khoa thành công!");
      fetchAllSpecialties();
    } else {
      toast.error(res.errMessage || "Xóa chuyên khoa thất bại!");
    }
  };

  return (
    <div className="manage-specialty-container">
      <div className="ms-title">
        <FormattedMessage id="menu.manage-specialty.title" />
      </div>

      <div className="add-new-specialty row">
        <div className="col-12 mb-4">
          <div className="info-card">
            <div className="card-header">
              <span>
                <i className="fas fa-notes-medical"></i> Thông tin chung
              </span>
            </div>
            <div className="card-body row">
              <div className="col-md-6 form-group">
                <label className="label-bold">
                  <FormattedMessage id="menu.manage-specialty.name-specialty" />{" "}
                  <span className="text-danger">*</span>
                </label>
                <input
                  className="form-control"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Nhập tên chuyên khoa..."
                />
              </div>

              <div className="col-md-6 form-group">
                <label className="label-bold">
                  <FormattedMessage id="menu.manage-specialty.image-specialty" />{" "}
                  <span className="text-danger">*</span>
                </label>
                <div
                  className="upload-box"
                  style={{ backgroundImage: `url(${previewImgURL})` }}
                  onClick={() => fileInput.current?.click()}
                >
                  <input
                    ref={fileInput}
                    id="previewImg"
                    type="file"
                    hidden
                    onChange={(event) => handleOnChangeImage(event)}
                  />
                  {!previewImgURL && (
                    <span className="upload-text">
                      <i className="fas fa-cloud-upload-alt"></i>{" "}
                      <FormattedMessage id="menu.manage-specialty.upload-image" />
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-12">
          <div className="info-card">
            <div className="card-header">
              <span>
                <i className="fas fa-pen-nib"></i>{" "}
                <FormattedMessage id="menu.manage-specialty.description" />
              </span>
            </div>
            <div className="card-body">
              <MdEditor
                style={{ height: "400px" }}
                renderHTML={(text) => mdParser.render(text)}
                onChange={handleEditorChange}
                value={descriptionMarkdown}
              />
            </div>
          </div>
        </div>

        <div className="col-12 btn-container">
          <button
            type="button"
            className="btn btn-primary btn-save-specialty"
            onClick={() => handleSaveNewSpecialty()}
          >
            <i className="fas fa-save"></i>{" "}
            {isEditing ? (
              <FormattedMessage
                id="menu.manage-specialty.edit"
                defaultMessage="Cập nhật"
              />
            ) : (
              <FormattedMessage id="menu.manage-specialty.save" />
            )}
          </button>
          {isEditing && (
            <button
              className="btn btn-secondary ml-3 btn-cancel"
              onClick={() => resetForm()}
            >
              <i className="fas fa-times"></i> Hủy
            </button>
          )}
        </div>
      </div>

      <div className="specialty-list-container mt-5">
        <div className="info-card">
          <div className="card-header">
            <span>
              <i className="fas fa-list"></i> Danh sách chuyên khoa
            </span>
          </div>
          <div className="card-body p-0">
            <table className="table table-striped table-bordered mb-0">
              <thead>
                <tr>
                  <th>Tên chuyên khoa</th>
                  <th style={{ width: "150px", textAlign: "center" }}>
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody>
                {specialties && specialties.length > 0 ? (
                  specialties.map((item, index) => (
                    <tr key={index}>
                      <td>{item.name}</td>
                      <td className="text-center">
                        <button
                          className="btn-edit"
                          onClick={() => handleEditSpecialty(item)}
                        >
                          <i className="fas fa-pencil-alt"></i>
                        </button>
                        <button
                          className="btn-delete"
                          onClick={() => handleDeleteSpecialty(item)}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={2} className="text-center">
                      Chưa có chuyên khoa nào
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

export default ManageSpecialty;