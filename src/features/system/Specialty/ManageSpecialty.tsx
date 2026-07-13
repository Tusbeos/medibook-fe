import React, { useCallback, useMemo, useRef, useState } from "react";
import "./ManageSpecialty.scss";
import MarkdownIt from "markdown-it";
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import { CommonUtils, getBase64FromBuffer } from "../../../utils";
import { toast } from "react-toastify";
import { ISpecialty } from "../../../types";
import {
  useCreateSpecialtyMutation,
  useDeleteSpecialtyMutation,
  useGetSpecialtiesQuery,
  useUpdateSpecialtyMutation,
} from "../../../store/api/publicApi";
import {
  Panel,
  PanelHeading,
  SearchBox,
  DataTable,
  ActionButtons,
} from "components/System/SystemShared";

const mdParser = new MarkdownIt();

const ManageSpecialty = () => {
  const [name, setName] = useState("");
  const [imageBase64, setImageBase64] = useState("");
  const [descriptionHTML, setDescriptionHTML] = useState("");
  const [descriptionMarkdown, setDescriptionMarkdown] = useState("");
  const [previewImgURL, setPreviewImgURL] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editSpecialtyId, setEditSpecialtyId] = useState<number | null>(null);

  const fileInput = useRef<HTMLInputElement>(null);

  const {
    data: specialtiesResponse,
    isLoading: isLoadingSpecialties,
    isFetching: isFetchingSpecialties,
    isError: isSpecialtiesError,
    refetch: refetchSpecialties,
  } = useGetSpecialtiesQuery();
  const [createSpecialty] = useCreateSpecialtyMutation();
  const [updateSpecialty] = useUpdateSpecialtyMutation();
  const [deleteSpecialty] = useDeleteSpecialtyMutation();

  const specialties = useMemo<ISpecialty[]>(
    () =>
      specialtiesResponse?.errCode === 0 &&
      Array.isArray(specialtiesResponse.data)
        ? specialtiesResponse.data
        : [],
    [specialtiesResponse],
  );

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
      if (!file) return;
      const base64 = await CommonUtils.getBase64(file);
      setImageBase64(base64);
      setPreviewImgURL(base64);
    },
    [],
  );

  const resetForm = useCallback(() => {
    setName("");
    setImageBase64("");
    setDescriptionHTML("");
    setDescriptionMarkdown("");
    setPreviewImgURL("");
    setIsEditing(false);
    setEditSpecialtyId(null);
    if (fileInput.current) fileInput.current.value = "";
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
        ? await updateSpecialty({
            ...payload,
            id: editSpecialtyId || undefined,
          }).unwrap()
        : await createSpecialty(payload).unwrap();

      if (res && res.errCode === 0) {
        toast.success(
          isEditing
            ? "Cập nhật chuyên khoa thành công."
            : "Tạo chuyên khoa thành công.",
        );
        resetForm();
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
    const res = await deleteSpecialty(item.id || "").unwrap();
    if (res && res.errCode === 0) {
      toast.success("Xóa chuyên khoa thành công.");
      return;
    }
    toast.error(res?.errMessage || "Xóa chuyên khoa thất bại.");
  };

  const filteredSpecialties = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();
    if (!query) return specialties;
    return specialties.filter((item) => {
      const description = item.descriptionMarkdown || "";
      return (
        (item.name || "").toLowerCase().includes(query) ||
        description.toLowerCase().includes(query)
      );
    });
  }, [searchTerm, specialties]);

  const columns = [
    {
      key: "name",
      title: "Tên chuyên khoa",
      render: (item: ISpecialty) => {
        const imageUrl = item.image ? getBase64FromBuffer(item.image) : "";
        return (
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
        );
      },
    },
    {
      key: "description",
      title: "Mô tả",
      render: (item: ISpecialty) => {
        const preview = (item.descriptionMarkdown || "")
          .replace(/[#_*`>-]/g, "")
          .trim();
        return (
          <span className="specialty-description-cell">
            {preview || "Chưa có mô tả chi tiết."}
          </span>
        );
      },
    },
  ];

  return (
    <div className="manage-specialty-container">
      <Panel className="specialty-form-panel">
        <PanelHeading title="Thông tin chung" />

        <div className="specialty-form-grid">
          <div className="specialty-name-field">
            <label htmlFor="specialty-name">Tên chuyên khoa</label>
            <input
              id="specialty-name"
              className="sys-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập tên chuyên khoa..."
            />
          </div>

          <div className="specialty-upload-field">
            <label>Hình ảnh chuyên khoa</label>
            <input
              ref={fileInput}
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
                    style={{
                      backgroundImage: `url(${previewImgURL})`,
                    }}
                  />
                ) : (
                  <>
                    <span className="upload-icon">
                      <i className="far fa-image" />
                    </span>
                    <span className="upload-title">Xem trước ảnh</span>
                    <span className="upload-subtitle">
                      Tỉ lệ tùy chọn theo ảnh tải lên
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </Panel>

      <Panel className="specialty-editor-panel">
        <PanelHeading title="Thông tin giới thiệu chi tiết" />
        <div className="editor-shell">
          <MdEditor
            style={{ height: "360px" }}
            renderHTML={(text) => mdParser.render(text)}
            onChange={handleEditorChange}
            value={descriptionMarkdown}
            placeholder="Nhập nội dung giới thiệu chi tiết về chuyên khoa tại đây..."
          />
        </div>
      </Panel>

      <ActionButtons
        isEditing={isEditing}
        onSave={handleSaveNewSpecialty}
        onCancel={resetForm}
      />

      <Panel className="specialty-list-panel">
        <PanelHeading title="Danh sách chuyên khoa">
          <SearchBox
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Tìm kiếm chuyên khoa..."
          />
        </PanelHeading>

        <DataTable
          columns={columns}
          data={filteredSpecialties}
          rowKey={(item: ISpecialty) => item.id || 0}
          isLoading={isLoadingSpecialties || isFetchingSpecialties}
          isError={isSpecialtiesError}
          loadingText="Đang tải danh sách chuyên khoa..."
          errorText="Không tải được danh sách chuyên khoa."
          emptyText={
            searchTerm.trim()
              ? "Không có chuyên khoa phù hợp với từ khóa."
              : "Chưa có chuyên khoa nào."
          }
          onRetry={() => void refetchSpecialties()}
          onEdit={handleEditSpecialty}
          onDelete={handleDeleteSpecialty}
        />
      </Panel>
    </div>
  );
};

export default ManageSpecialty;
