import React, { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { DataState } from "components/System/SystemShared";
import {
  ARTICLE_PUBLIC_LIVE_OPTIONS,
  ArticleListItem,
  useGetFeaturedArticlesQuery,
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
        <span>Nổi bật</span>
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
  const query = useGetFeaturedArticlesQuery(3, ARTICLE_PUBLIC_LIVE_OPTIONS);
  const articles = useMemo(
    () => (query.data?.data || []).filter((article) => article.statusId === "AS4"),
    [query.data],
  );

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

        {query.isLoading ? (
          <DataState variant="loading" text="Đang tải cẩm nang..." />
        ) : query.isError && articles.length === 0 ? (
          <DataState
            variant="error"
            text="Không thể tải cẩm nang sức khỏe."
            onRetry={query.refetch}
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
