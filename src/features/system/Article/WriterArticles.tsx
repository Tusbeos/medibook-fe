import React, { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  ARTICLE_STATUS,
  ArticleListItem,
  ArticleStatus,
  useGetWriterArticlesQuery,
  useSubmitArticleMutation,
} from "store/api/articleApi";
import {
  DataTable,
  Panel,
  PanelHeading,
  SearchBox,
  StatusBadge,
} from "components/System/SystemShared";
import {
  ARTICLE_STATUS_OPTIONS,
  formatArticleDate,
  getApiErrorMessage,
  statusVariant,
} from "./articleHelpers";
import "./ArticleSystem.scss";

const WriterArticles: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const status = (searchParams.get("status") || "") as ArticleStatus | "";
  const [search, setSearch] = useState(searchParams.get("q") || "");
  const [page, setPage] = useState(0);
  const { data, isLoading, isFetching, isError, refetch } =
    useGetWriterArticlesQuery({ page, size: 10, q: search, status });
  const [submitArticle, { isLoading: isSubmitting }] =
    useSubmitArticleMutation();

  const articles = useMemo(() => data?.data || [], [data]);
  const pagination = data?.pagination;

  const changeStatus = (nextStatus: ArticleStatus | "") => {
    const next = new URLSearchParams(searchParams);
    if (nextStatus) next.set("status", nextStatus);
    else next.delete("status");
    setSearchParams(next);
    setPage(0);
  };

  const changeSearch = (value: string) => {
    setSearch(value);
    setPage(0);
    const next = new URLSearchParams(searchParams);
    if (value.trim()) next.set("q", value);
    else next.delete("q");
    setSearchParams(next, { replace: true });
  };

  const handleSubmit = async (article: ArticleListItem) => {
    if (!window.confirm(`Gửi bài “${article.title}” cho quản trị viên duyệt?`)) {
      return;
    }
    try {
      const response = await submitArticle(article.id).unwrap();
      toast.success(response.message || "Đã gửi bài viết để duyệt.");
    } catch (error) {
      toast.error(getApiErrorMessage(error, "Không thể gửi bài viết."));
    }
  };

  return (
    <div className="article-system-page">
      <Panel>
        <PanelHeading title="Bài viết của tôi" icon="far fa-newspaper">
          <button
            type="button"
            className="article-primary-button"
            onClick={() => navigate("/system/writer/articles/new")}
          >
            <i className="fas fa-plus" /> Tạo bài viết
          </button>
        </PanelHeading>

        <div className="article-toolbar">
          <div className="article-status-tabs" role="tablist">
            {ARTICLE_STATUS_OPTIONS.map((option) => (
              <button
                key={option.value || "all"}
                type="button"
                className={status === option.value ? "active" : ""}
                onClick={() => changeStatus(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <SearchBox
            value={search}
            onChange={changeSearch}
            placeholder="Tìm theo tiêu đề..."
          />
        </div>

        <DataTable<ArticleListItem>
          data={articles}
          rowKey={(article) => article.id}
          isLoading={isLoading || isFetching}
          isError={isError}
          onRetry={refetch}
          emptyText="Chưa có bài viết phù hợp."
          columns={[
            {
              key: "title",
              title: "Bài viết",
              render: (article) => (
                <div className="article-title-cell">
                  <strong>{article.title}</strong>
                  <span>{article.summary || "Chưa có tóm tắt"}</span>
                </div>
              ),
            },
            {
              key: "statusId",
              title: "Trạng thái",
              render: (article) => (
                <StatusBadge
                  label={article.statusValueVi || article.statusId}
                  variant={statusVariant(article.statusId)}
                />
              ),
            },
            {
              key: "updatedAt",
              title: "Cập nhật",
              render: (article) => formatArticleDate(article.updatedAt),
            },
            {
              key: "reviewNote",
              title: "Phản hồi",
              render: (article) => article.reviewNote || "—",
            },
          ]}
          renderActions={(article) => {
            const editable =
              article.statusId === ARTICLE_STATUS.DRAFT ||
              article.statusId === ARTICLE_STATUS.REJECTED;
            return (
              <div className="article-table-actions">
                {editable && (
                  <button
                    type="button"
                    onClick={() =>
                      navigate(`/system/writer/articles/${article.id}/edit`)
                    }
                  >
                    <i className="fas fa-pencil-alt" /> Sửa
                  </button>
                )}
                {editable && (
                  <button
                    type="button"
                    className="submit"
                    disabled={isSubmitting}
                    onClick={() => handleSubmit(article)}
                  >
                    <i className="fas fa-paper-plane" /> Gửi duyệt
                  </button>
                )}
                {!editable && <span>Chỉ xem</span>}
              </div>
            );
          }}
        />

        {pagination && pagination.totalPages > 1 && (
          <div className="article-pagination">
            <button
              type="button"
              disabled={pagination.first}
              onClick={() => setPage((value) => Math.max(0, value - 1))}
            >
              Trước
            </button>
            <span>
              Trang {pagination.page + 1}/{pagination.totalPages} · {pagination.totalElements} bài
            </span>
            <button
              type="button"
              disabled={pagination.last}
              onClick={() => setPage((value) => value + 1)}
            >
              Sau
            </button>
          </div>
        )}
      </Panel>
    </div>
  );
};

export default WriterArticles;
