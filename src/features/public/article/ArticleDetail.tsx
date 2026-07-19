import React, { useMemo } from "react";
import { Link, useParams } from "react-router-dom";
import HomeFooter from "layout/HomeFooter";
import HomeHeader from "layout/HomeHeader";
import { DataState } from "components/System/SystemShared";
import {
  ARTICLE_PUBLIC_LIVE_OPTIONS,
  useGetPublishedArticleQuery,
} from "store/api/articleApi";
import { sanitizeHtml } from "utils/sanitizeHtml";
import "./Article.scss";

const ArticleDetail: React.FC = () => {
  const { slug = "" } = useParams();
  const query = useGetPublishedArticleQuery(slug, {
    ...ARTICLE_PUBLIC_LIVE_OPTIONS,
    skip: !slug,
  });
  const article = query.data?.data;
  const responseStatus = (query.error as { status?: number } | undefined)
    ?.status;
  const isUnavailable =
    !article || (query.isError && responseStatus === 404);
  const safeContent = useMemo(
    () => sanitizeHtml(article?.contentHtml),
    [article?.contentHtml],
  );
  const publishedAt = article?.publishedAt
    ? new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "long",
        timeStyle: "short",
      }).format(new Date(article.publishedAt))
    : "";

  return (
    <div className="public-article-page public-article-detail-page">
      <HomeHeader isShowBanner={false} />
      <main>
        {query.isLoading ? (
          <div className="public-article-detail-state">
            <DataState variant="loading" text="Đang tải bài viết..." />
          </div>
        ) : isUnavailable ? (
          <div className="public-article-detail-state">
            <DataState
              variant="error"
              text="Bài viết không tồn tại hoặc chưa được xuất bản."
              onRetry={query.refetch}
            />
            <Link to="/articles">Quay lại cẩm nang</Link>
          </div>
        ) : (
          <article className="public-article-detail">
            <nav aria-label="Breadcrumb">
              <Link to="/home">Trang chủ</Link>
              <i className="fas fa-chevron-right" />
              <Link to="/articles">Cẩm nang</Link>
            </nav>
            <header>
              {article.featured && <span>Bài viết nổi bật</span>}
              <h1>{article.title}</h1>
              {article.summary && <p>{article.summary}</p>}
              <div>
                <strong>{article.authorName || "MediBook"}</strong>
                <time>{publishedAt}</time>
              </div>
            </header>
            {article.thumbnailUrl && (
              <img
                className="public-article-detail-cover"
                src={article.thumbnailUrl}
                alt={article.title}
              />
            )}
            <div
              className="public-article-detail-content"
              dangerouslySetInnerHTML={{ __html: safeContent }}
            />
            <footer>
              <Link to="/articles">
                <i className="fas fa-arrow-left" /> Xem các bài viết khác
              </Link>
            </footer>
          </article>
        )}
      </main>
      <HomeFooter />
    </div>
  );
};

export default ArticleDetail;
