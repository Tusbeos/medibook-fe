import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import HomeFooter from "layout/HomeFooter";
import HomeHeader from "layout/HomeHeader";
import { DataState } from "components/System/SystemShared";
import {
  ARTICLE_PUBLIC_LIVE_OPTIONS,
  useGetPublishedArticleQuery,
  useGetPublishedArticlesQuery,
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
  const relatedQuery = useGetPublishedArticlesQuery(
    { page: 0, size: 4, q: "" },
    ARTICLE_PUBLIC_LIVE_OPTIONS,
  );
  const [coverFailed, setCoverFailed] = useState(false);
  const responseStatus = (query.error as { status?: number } | undefined)
    ?.status;
  const isUnavailable =
    !article || (query.isError && responseStatus === 404);
  const safeContent = useMemo(
    () => sanitizeHtml(article?.contentHtml),
    [article?.contentHtml],
  );
  const relatedArticles = useMemo(
    () =>
      (relatedQuery.data?.data || [])
        .filter((item) => item.id !== article?.id)
        .slice(0, 3),
    [article?.id, relatedQuery.data?.data],
  );
  const publishedAt = article?.publishedAt
    ? new Intl.DateTimeFormat("vi-VN", {
        dateStyle: "long",
        timeStyle: "short",
      }).format(new Date(article.publishedAt))
    : "";

  useEffect(() => setCoverFailed(false), [article?.thumbnailUrl]);

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
              <i className="fas fa-chevron-right" />
              <span aria-current="page">Bài viết</span>
            </nav>
            <header>
              <span>
                <i className="fas fa-book-medical" /> Cẩm nang MediBook
                {article.featured && <em>Nổi bật</em>}
              </span>
              <h1>{article.title}</h1>
              {article.summary && <p>{article.summary}</p>}
              <div>
                <strong>
                  <i className="far fa-user" /> {article.authorName || "MediBook"}
                </strong>
                <time dateTime={article.publishedAt || undefined}>
                  <i className="far fa-calendar-alt" /> {publishedAt}
                </time>
              </div>
            </header>
            <div className="public-article-detail-cover">
              {article.thumbnailUrl && !coverFailed ? (
                <img
                  src={article.thumbnailUrl}
                  alt={article.title}
                  onError={() => setCoverFailed(true)}
                />
              ) : (
                <div className="public-article-detail-cover-fallback">
                  <i className="far fa-newspaper" />
                  <span>Cẩm nang sức khỏe MediBook</span>
                </div>
              )}
            </div>
            <div
              className="public-article-detail-content"
              dangerouslySetInnerHTML={{ __html: safeContent }}
            />
            {relatedArticles.length > 0 && (
              <section className="public-article-related" aria-labelledby="related-articles-title">
                <div>
                  <span>Đọc thêm</span>
                  <h2 id="related-articles-title">Bài viết mới khác</h2>
                </div>
                <div className="public-article-related-grid">
                  {relatedArticles.map((item) => (
                    <Link key={item.id} to={`/articles/${item.slug}`}>
                      <i className="far fa-newspaper" />
                      <span>
                        <strong>{item.title}</strong>
                        <small>{item.authorName || "MediBook"}</small>
                      </span>
                      <i className="fas fa-arrow-right" />
                    </Link>
                  ))}
                </div>
              </section>
            )}
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
