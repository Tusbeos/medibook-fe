import React, { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  ARTICLE_STATUS,
  ArticleListItem,
  ArticleStatus,
  useApproveArticleMutation,
  useGetAdminArticleQuery,
  useGetAdminArticlesQuery,
  usePublishArticleMutation,
  useRejectArticleMutation,
  useUnpublishArticleMutation,
} from "store/api/articleApi";
import {
  DataState,
  DataTable,
  Panel,
  PanelHeading,
  SearchBox,
  StatusBadge,
} from "components/System/SystemShared";
import { sanitizeHtml } from "utils/sanitizeHtml";
import {
  ARTICLE_STATUS_OPTIONS,
  formatArticleDate,
  getApiErrorMessage,
  statusVariant,
} from "./articleHelpers";
import "./ArticleSystem.scss";

const AdminArticleReview: React.FC = () => {
  const [status, setStatus] = useState<ArticleStatus | "">(
    ARTICLE_STATUS.PENDING,
  );
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [reviewNote, setReviewNote] = useState("");
  const [featured, setFeatured] = useState(false);
  const listQuery = useGetAdminArticlesQuery({
    page,
    size: 10,
    q: search,
    status,
  });
  const detailQuery = useGetAdminArticleQuery(selectedId!, {
    skip: selectedId === null,
  });
  const [approveArticle, approveState] = useApproveArticleMutation();
  const [rejectArticle, rejectState] = useRejectArticleMutation();
  const [publishArticle, publishState] = usePublishArticleMutation();
  const [unpublishArticle, unpublishState] = useUnpublishArticleMutation();
  const isActing =
    approveState.isLoading ||
    rejectState.isLoading ||
    publishState.isLoading ||
    unpublishState.isLoading;

  const articles = listQuery.data?.data || [];
  const pagination = listQuery.data?.pagination;
  const article = detailQuery.data?.data;
  const safeContent = useMemo(
    () => sanitizeHtml(article?.contentHtml),
    [article?.contentHtml],
  );

  useEffect(() => {
    setReviewNote(article?.reviewNote || "");
    setFeatured(Boolean(article?.featured));
  }, [article?.id, article?.reviewNote, article?.featured]);

  const runAction = async (
    action: () => Promise<any>,
    successFallback: string,
    errorFallback: string,
  ) => {
    try {
      const response = await action();
      toast.success(response?.message || successFallback);
    } catch (error) {
      toast.error(getApiErrorMessage(error, errorFallback));
    }
  };

  const handleReject = () => {
    if (!article) return;
    if (!reviewNote.trim()) {
      toast.error("Vui lòng nhập lý do từ chối.");
      return;
    }
    runAction(
      () =>
        rejectArticle({ id: article.id, reviewNote: reviewNote.trim() }).unwrap(),
      "Đã từ chối bài viết.",
      "Không thể từ chối bài viết.",
    );
  };

  return (
    <div className="article-system-page admin-article-page">
      <Panel>
        <PanelHeading title="Duyệt bài viết" icon="fas fa-clipboard-check" />
        <div className="article-toolbar">
          <div className="article-status-tabs" role="tablist">
            {ARTICLE_STATUS_OPTIONS.map((option) => (
              <button
                key={option.value || "all"}
                type="button"
                className={status === option.value ? "active" : ""}
                onClick={() => {
                  setStatus(option.value);
                  setPage(0);
                  setSelectedId(null);
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
          <SearchBox
            value={search}
            onChange={(value) => {
              setSearch(value);
              setPage(0);
            }}
            placeholder="Tìm bài hoặc tác giả..."
          />
        </div>
        <DataTable<ArticleListItem>
          data={articles}
          rowKey={(item) => item.id}
          isLoading={listQuery.isLoading || listQuery.isFetching}
          isError={listQuery.isError}
          onRetry={listQuery.refetch}
          emptyText="Không có bài viết trong trạng thái này."
          columns={[
            {
              key: "title",
              title: "Bài viết",
              render: (item) => (
                <div className="article-title-cell">
                  <strong>{item.title}</strong>
                  <span>{item.summary || "Chưa có tóm tắt"}</span>
                </div>
              ),
            },
            {
              key: "authorName",
              title: "Tác giả",
              render: (item) => item.authorName || item.authorEmail || "—",
            },
            {
              key: "statusId",
              title: "Trạng thái",
              render: (item) => (
                <StatusBadge
                  label={item.statusValueVi || item.statusId}
                  variant={statusVariant(item.statusId)}
                />
              ),
            },
            {
              key: "updatedAt",
              title: "Cập nhật",
              render: (item) => formatArticleDate(item.updatedAt),
            },
          ]}
          renderActions={(item) => (
            <div className="article-table-actions">
              <button
                type="button"
                className={selectedId === item.id ? "submit" : ""}
                onClick={() => setSelectedId(item.id)}
              >
                <i className="far fa-eye" /> Xem
              </button>
            </div>
          )}
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

      {selectedId !== null && (
        <Panel className="article-review-panel">
          {detailQuery.isLoading || detailQuery.isFetching ? (
            <DataState variant="loading" text="Đang tải nội dung bài viết..." />
          ) : detailQuery.isError || !article ? (
            <DataState
              variant="error"
              text="Không thể tải nội dung bài viết."
              onRetry={detailQuery.refetch}
            />
          ) : (
            <>
              <div className="article-review-heading">
                <div>
                  <span className="article-review-eyebrow">Bản duyệt</span>
                  <h2>{article.title}</h2>
                  <p>
                    {article.authorName || article.authorEmail} · Gửi lúc {formatArticleDate(article.submittedAt)}
                  </p>
                </div>
                <StatusBadge
                  label={article.statusValueVi || article.statusId}
                  variant={statusVariant(article.statusId)}
                />
              </div>
              {article.thumbnailUrl && (
                <img
                  className="article-review-thumbnail"
                  src={article.thumbnailUrl}
                  alt=""
                />
              )}
              {article.summary && (
                <p className="article-review-summary">{article.summary}</p>
              )}
              <article
                className="article-review-content"
                dangerouslySetInnerHTML={{ __html: safeContent }}
              />
              <div className="article-review-controls">
                <label htmlFor="article-review-note">Ghi chú duyệt</label>
                <textarea
                  id="article-review-note"
                  rows={4}
                  maxLength={5000}
                  value={reviewNote}
                  onChange={(event) => setReviewNote(event.target.value)}
                  placeholder="Ghi chú cho Writer; bắt buộc khi từ chối"
                />
                {(article.statusId === ARTICLE_STATUS.APPROVED ||
                  article.statusId === ARTICLE_STATUS.ARCHIVED) && (
                  <label className="article-featured-control">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(event) => setFeatured(event.target.checked)}
                    />
                    Đánh dấu là bài nổi bật khi xuất bản
                  </label>
                )}
                <div className="article-review-actions">
                  {article.statusId === ARTICLE_STATUS.PENDING && (
                    <>
                      <button
                        type="button"
                        className="article-danger-button"
                        disabled={isActing}
                        onClick={handleReject}
                      >
                        Từ chối
                      </button>
                      <button
                        type="button"
                        className="article-primary-button"
                        disabled={isActing}
                        onClick={() =>
                          runAction(
                            () =>
                              approveArticle({
                                id: article.id,
                                reviewNote,
                              }).unwrap(),
                            "Đã duyệt bài viết.",
                            "Không thể duyệt bài viết.",
                          )
                        }
                      >
                        Duyệt bài
                      </button>
                    </>
                  )}
                  {(article.statusId === ARTICLE_STATUS.APPROVED ||
                    article.statusId === ARTICLE_STATUS.ARCHIVED) && (
                    <button
                      type="button"
                      className="article-primary-button"
                      disabled={isActing}
                      onClick={() =>
                        runAction(
                          () =>
                            publishArticle({ id: article.id, featured }).unwrap(),
                          "Đã xuất bản bài viết.",
                          "Không thể xuất bản bài viết.",
                        )
                      }
                    >
                      Xuất bản
                    </button>
                  )}
                  {article.statusId === ARTICLE_STATUS.PUBLISHED && (
                    <button
                      type="button"
                      className="article-danger-button"
                      disabled={isActing}
                      onClick={() =>
                        runAction(
                          () => unpublishArticle(article.id).unwrap(),
                          "Đã gỡ bài viết.",
                          "Không thể gỡ bài viết.",
                        )
                      }
                    >
                      Gỡ xuất bản
                    </button>
                  )}
                </div>
              </div>
            </>
          )}
        </Panel>
      )}
    </div>
  );
};

export default AdminArticleReview;
