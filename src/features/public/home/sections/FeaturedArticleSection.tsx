import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { DataState } from "components/System/SystemShared";
import {
  ARTICLE_PUBLIC_LIVE_OPTIONS,
  ARTICLE_STATUS,
  ArticleListItem,
  useGetFeaturedArticlesQuery,
  useGetPublishedArticlesQuery,
} from "store/api/articleApi";

const formatDate = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : new Intl.DateTimeFormat("vi-VN", { dateStyle: "long" }).format(date);
};

const FeaturedArticleCard: React.FC<{ article: ArticleListItem }> = ({ article }) => {
  const [imageFailed, setImageFailed] = useState(false);
  return (
    <Link className="home-article-card" to={`/articles/${article.slug}`}>
      <div className="home-article-image">
        {article.thumbnailUrl && !imageFailed ? (
          <img
            src={article.thumbnailUrl}
            alt={article.title}
            onError={() => setImageFailed(true)}
          />
        ) : (
          <i className="far fa-newspaper" aria-hidden="true" />
        )}
        <span>{article.featured ? "Nổi bật" : "Mới cập nhật"}</span>
      </div>
      <div className="home-article-body">
        <time dateTime={article.publishedAt || undefined}>
          {formatDate(article.publishedAt)}
        </time>
        <h3>{article.title}</h3>
        <p>{article.summary || "Đọc bài viết để xem nội dung chi tiết."}</p>
        <span className="home-article-link">
          Đọc tiếp <i className="fas fa-arrow-right" />
        </span>
      </div>
    </Link>
  );
};

const FeaturedArticleSection: React.FC = () => {
  const featuredQuery = useGetFeaturedArticlesQuery(
    3,
    ARTICLE_PUBLIC_LIVE_OPTIONS,
  );
  const featuredArticles = useMemo(
    () =>
      (featuredQuery.data?.data || []).filter(
        (article) => article.statusId === ARTICLE_STATUS.PUBLISHED,
      ),
    [featuredQuery.data],
  );
  const shouldLoadLatest =
    !featuredQuery.isLoading &&
    (featuredQuery.isError || featuredArticles.length === 0);
  const latestQuery = useGetPublishedArticlesQuery(
    { page: 0, size: 3 },
    {
      ...ARTICLE_PUBLIC_LIVE_OPTIONS,
      skip: !shouldLoadLatest,
    },
  );
  const latestArticles = useMemo(
    () =>
      (latestQuery.data?.data || []).filter(
        (article) => article.statusId === ARTICLE_STATUS.PUBLISHED,
      ),
    [latestQuery.data],
  );
  const articles =
    featuredArticles.length > 0 ? featuredArticles : latestArticles;
  const isLoading =
    featuredQuery.isLoading || (shouldLoadLatest && latestQuery.isLoading);
  const isError =
    shouldLoadLatest && latestQuery.isError && articles.length === 0;
  const retry = () => {
    void featuredQuery.refetch();
    if (shouldLoadLatest) {
      void latestQuery.refetch();
    }
  };

  return (
    <section className="section-share section-featured-articles" aria-labelledby="home-articles-title">
      <div className="section-container">
        <div className="section-header">
          <div>
            <h2 className="title-section" id="home-articles-title">
              Cẩm nang sức khỏe
            </h2>
            <div className="section-subtitle">
              Kiến thức hữu ích được đội ngũ MediBook biên soạn và kiểm duyệt.
            </div>
          </div>
          <Link className="btn-section" to="/articles">
            Xem tất cả <i className="fas fa-arrow-right" />
          </Link>
        </div>

        {isLoading ? (
          <DataState variant="loading" text="Đang tải cẩm nang..." />
        ) : isError ? (
          <DataState
            variant="error"
            text="Không thể tải cẩm nang sức khỏe."
            onRetry={retry}
          />
        ) : articles.length === 0 ? (
          <DataState variant="empty" text="Chưa có bài viết nổi bật." />
        ) : (
          <div className="home-article-grid">
            {articles.map((article) => (
              <FeaturedArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedArticleSection;
