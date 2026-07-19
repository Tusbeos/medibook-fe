import React, { FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import HomeFooter from "layout/HomeFooter";
import HomeHeader from "layout/HomeHeader";
import { DataState } from "components/System/SystemShared";
import {
  ARTICLE_PUBLIC_LIVE_OPTIONS,
  ArticleListItem,
  useGetFeaturedArticlesQuery,
  useGetPublishedArticlesQuery,
} from "store/api/articleApi";
import "./Article.scss";

const formatDate = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : new Intl.DateTimeFormat("vi-VN", { dateStyle: "long" }).format(date);
};

const ArticleCard: React.FC<{
  article: ArticleListItem;
  featured?: boolean;
}> = ({ article, featured = false }) => (
  <Link
    className={`public-article-card${featured ? " featured" : ""}`}
    to={`/articles/${article.slug}`}
  >
    <div className="public-article-image">
      {article.thumbnailUrl ? (
        <img src={article.thumbnailUrl} alt="" />
      ) : (
        <div className="public-article-image-fallback">
          <i className="far fa-newspaper" />
        </div>
      )}
      {article.featured && <span>Nổi bật</span>}
    </div>
    <div className="public-article-card-body">
      <time>{formatDate(article.publishedAt)}</time>
      <h2>{article.title}</h2>
      <p>{article.summary || "Đọc bài viết để xem nội dung chi tiết."}</p>
      <div>
        <span>{article.authorName || "MediBook"}</span>
        <strong>Đọc tiếp <i className="fas fa-arrow-right" /></strong>
      </div>
    </div>
  </Link>
);

const ArticleList: React.FC = () => {
  const [page, setPage] = useState(0);
  const [searchInput, setSearchInput] = useState("");
  const [query, setQuery] = useState("");
  const articlesQuery = useGetPublishedArticlesQuery(
    {
      page,
      size: 9,
      q: query,
    },
    ARTICLE_PUBLIC_LIVE_OPTIONS,
  );
  const featuredQuery = useGetFeaturedArticlesQuery(
    3,
    ARTICLE_PUBLIC_LIVE_OPTIONS,
  );
  const articles = articlesQuery.data?.data || [];
  const featuredArticles = featuredQuery.data?.data || [];
  const pagination = articlesQuery.data?.pagination;

  const handleSearch = (event: FormEvent) => {
    event.preventDefault();
    setQuery(searchInput.trim());
    setPage(0);
  };

  return (
    <div className="public-article-page">
      <HomeHeader isShowBanner={false} />
      <main>
        <section className="public-article-hero">
          <div>
            <span>Cẩm nang sức khỏe</span>
            <h1>Thông tin hữu ích cho hành trình chăm sóc sức khỏe</h1>
            <p>
              Kiến thức y khoa và hướng dẫn thực tế được đội ngũ MediBook biên
              soạn, kiểm duyệt trước khi xuất bản.
            </p>
            <form onSubmit={handleSearch}>
              <i className="fas fa-search" />
              <input
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                placeholder="Tìm trong cẩm nang..."
                aria-label="Tìm bài viết"
              />
              <button type="submit">Tìm kiếm</button>
            </form>
          </div>
        </section>

        {!query && featuredArticles.length > 0 && (
          <section className="public-article-section">
            <div className="public-article-section-heading">
              <div>
                <span>Được quan tâm</span>
                <h2>Bài viết nổi bật</h2>
              </div>
            </div>
            <div className="public-article-featured-grid">
              {featuredArticles.map((article) => (
                <ArticleCard key={article.id} article={article} featured />
              ))}
            </div>
          </section>
        )}

        <section className="public-article-section">
          <div className="public-article-section-heading">
            <div>
              <span>{query ? "Kết quả tìm kiếm" : "Mới cập nhật"}</span>
              <h2>{query ? `Bài viết cho “${query}”` : "Tất cả bài viết"}</h2>
            </div>
            {pagination && <p>{pagination.totalElements} bài viết</p>}
          </div>

          {articlesQuery.isLoading ? (
            <DataState variant="loading" text="Đang tải bài viết..." />
          ) : articlesQuery.isError && articles.length === 0 ? (
            <DataState
              variant="error"
              text="Không thể tải danh sách bài viết."
              onRetry={articlesQuery.refetch}
            />
          ) : articles.length === 0 ? (
            <DataState
              variant="empty"
              text="Chưa có bài viết phù hợp với tìm kiếm."
            />
          ) : (
            <div className="public-article-grid">
              {articles.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          )}

          {pagination && pagination.totalPages > 1 && (
            <nav className="public-article-pagination" aria-label="Phân trang">
              <button
                type="button"
                disabled={pagination.first}
                onClick={() => setPage((value) => Math.max(0, value - 1))}
              >
                <i className="fas fa-chevron-left" /> Trước
              </button>
              <span>
                Trang {pagination.page + 1} / {pagination.totalPages}
              </span>
              <button
                type="button"
                disabled={pagination.last}
                onClick={() => setPage((value) => value + 1)}
              >
                Sau <i className="fas fa-chevron-right" />
              </button>
            </nav>
          )}
        </section>
      </main>
      <HomeFooter />
    </div>
  );
};

export default ArticleList;
