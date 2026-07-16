import React, { useCallback, useEffect, useState } from "react";
import MarkdownIt from "markdown-it";
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  SaveArticlePayload,
  useCreateArticleMutation,
  useGetWriterArticleQuery,
  useUpdateArticleMutation,
} from "store/api/articleApi";
import {
  DataState,
  FormField,
  Panel,
  PanelHeading,
} from "components/System/SystemShared";
import { getApiErrorMessage } from "./articleHelpers";
import "./ArticleSystem.scss";

const mdParser = new MarkdownIt({ html: false, linkify: true, breaks: true });

const ArticleEditor: React.FC = () => {
  const navigate = useNavigate();
  const { articleId } = useParams();
  const id = articleId ? Number(articleId) : undefined;
  const isEditing = Number.isFinite(id);
  const { data, isLoading, isError, refetch } = useGetWriterArticleQuery(id!, {
    skip: !isEditing,
  });
  const [createArticle, { isLoading: isCreating }] = useCreateArticleMutation();
  const [updateArticle, { isLoading: isUpdating }] = useUpdateArticleMutation();
  const [title, setTitle] = useState("");
  const [summary, setSummary] = useState("");
  const [thumbnailUrl, setThumbnailUrl] = useState("");
  const [contentMarkdown, setContentMarkdown] = useState("");
  const [contentHtml, setContentHtml] = useState("");

  useEffect(() => {
    const article = data?.data;
    if (!article) return;
    setTitle(article.title || "");
    setSummary(article.summary || "");
    setThumbnailUrl(article.thumbnailUrl || "");
    setContentMarkdown(article.contentMarkdown || "");
    setContentHtml(article.contentHtml || "");
  }, [data]);

  const handleEditorChange = useCallback(
    ({ html, text }: { html: string; text: string }) => {
      setContentHtml(html);
      setContentMarkdown(text);
    },
    [],
  );

  const handleSave = async () => {
    if (!title.trim()) return toast.error("Vui lòng nhập tiêu đề.");
    if (!contentMarkdown.trim() || !contentHtml.trim()) {
      return toast.error("Vui lòng nhập nội dung bài viết.");
    }
    if (title.trim().length > 255) {
      return toast.error("Tiêu đề không được vượt quá 255 ký tự.");
    }
    if (summary.trim().length > 1000) {
      return toast.error("Tóm tắt không được vượt quá 1000 ký tự.");
    }

    const payload: SaveArticlePayload = {
      title: title.trim(),
      summary: summary.trim(),
      thumbnailUrl: thumbnailUrl.trim(),
      contentMarkdown,
      contentHtml,
    };

    try {
      const response = isEditing
        ? await updateArticle({ id: id!, data: payload }).unwrap()
        : await createArticle(payload).unwrap();
      toast.success(response.message || "Đã lưu bài viết.");
      navigate("/system/writer/articles");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Không thể lưu bài viết."));
    }
  };

  if (isEditing && isLoading) {
    return <DataState variant="loading" text="Đang tải bài viết..." />;
  }
  if (isEditing && isError) {
    return (
      <DataState
        variant="error"
        text="Không thể tải bài viết."
        onRetry={refetch}
      />
    );
  }

  return (
    <div className="article-system-page article-editor-page">
      <Panel>
        <PanelHeading
          title={isEditing ? "Chỉnh sửa bài viết" : "Tạo bài viết mới"}
          icon="fas fa-pen-nib"
        />
        <div className="article-form-grid">
          <FormField label="Tiêu đề" required>
            <input
              value={title}
              maxLength={255}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Nhập tiêu đề bài viết"
            />
          </FormField>
          <FormField label="URL ảnh đại diện">
            <input
              value={thumbnailUrl}
              maxLength={2048}
              onChange={(event) => setThumbnailUrl(event.target.value)}
              placeholder="https://..."
            />
          </FormField>
        </div>
        <FormField label="Tóm tắt">
          <textarea
            value={summary}
            maxLength={1000}
            rows={3}
            onChange={(event) => setSummary(event.target.value)}
            placeholder="Mô tả ngắn hiển thị trên danh sách bài viết"
          />
        </FormField>
        {thumbnailUrl && (
          <div className="article-thumbnail-preview">
            <img src={thumbnailUrl} alt="Xem trước ảnh đại diện" />
          </div>
        )}
        <FormField label="Nội dung" required>
          <MdEditor
            value={contentMarkdown}
            style={{ height: "520px" }}
            renderHTML={(text) => mdParser.render(text)}
            onChange={handleEditorChange}
          />
        </FormField>
        <div className="article-editor-actions">
          <button
            type="button"
            className="article-secondary-button"
            onClick={() => navigate("/system/writer/articles")}
          >
            Hủy
          </button>
          <button
            type="button"
            className="article-primary-button"
            disabled={isCreating || isUpdating}
            onClick={handleSave}
          >
            <i className="far fa-save" />
            {isCreating || isUpdating ? "Đang lưu..." : "Lưu bản nháp"}
          </button>
        </div>
      </Panel>
    </div>
  );
};

export default ArticleEditor;
