import React, { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import HomeFooter from "layout/HomeFooter";
import HomeHeader from "layout/HomeHeader";
import {
  SearchResult,
  useSearchPublicQuery,
} from "store/api/publicApi";
import { normalizeImageSrc } from "utils/CommonUtils";
import "./SearchPage.scss";

const SEARCH_TYPES = [
  { key: "all", label: "Tất cả" },
  { key: "doctor", label: "Bác sĩ" },
  { key: "clinic", label: "Cơ sở y tế" },
  { key: "specialty", label: "Chuyên khoa" },
  { key: "package", label: "Gói khám" },
];

const SearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const [draftQuery, setDraftQuery] = useState(initialQuery);
  const activeType = searchParams.get("type") || "all";
  const query = initialQuery.trim();

  const { data, isFetching } = useSearchPublicQuery(
    { q: query, type: activeType, size: 30 },
    { skip: query.length < 2 },
  );

  const items = data?.data?.items || [];
  const resultTitle = useMemo(() => {
    if (query.length < 2) {
      return "Nhập ít nhất 2 ký tự để tìm kiếm";
    }
    if (isFetching) {
      return "Đang tìm kiếm...";
    }
    return `${items.length} kết quả cho "${query}"`;
  }, [isFetching, items.length, query]);

  const getTypeLabel = (type: SearchResult["type"]) => {
    switch (type) {
      case "doctor":
        return "Bác sĩ";
      case "clinic":
        return "Cơ sở y tế";
      case "specialty":
        return "Chuyên khoa";
      case "package":
        return "Gói khám";
      default:
        return "Kết quả";
    }
  };

  const getTypeIcon = (type: SearchResult["type"]) => {
    switch (type) {
      case "doctor":
        return "fas fa-user-md";
      case "clinic":
        return "fas fa-hospital";
      case "specialty":
        return "fas fa-stethoscope";
      case "package":
        return "fas fa-briefcase-medical";
      default:
        return "fas fa-search";
    }
  };

  const submitSearch = (event: React.FormEvent) => {
    event.preventDefault();
    const nextQuery = draftQuery.trim();
    if (nextQuery) {
      setSearchParams({ q: nextQuery, type: activeType });
    }
  };

  const changeType = (type: string) => {
    if (query) {
      setSearchParams({ q: query, type });
    }
  };

  return (
    <>
      <HomeHeader />
      <main className="search-page">
        <div className="search-page-inner">
          <form className="search-page-form" onSubmit={submitSearch}>
            <i className="fas fa-search" />
            <input
              type="text"
              value={draftQuery}
              onChange={(event) => setDraftQuery(event.target.value)}
              placeholder="Tìm bác sĩ, chuyên khoa, cơ sở y tế hoặc gói khám"
            />
            <button type="submit">Tìm kiếm</button>
          </form>

          <div className="search-tabs">
            {SEARCH_TYPES.map((item) => (
              <button
                key={item.key}
                type="button"
                className={activeType === item.key ? "active" : ""}
                onClick={() => changeType(item.key)}
              >
                {item.label}
              </button>
            ))}
          </div>

          <h1>{resultTitle}</h1>

          <div className="search-result-list">
            {!isFetching &&
              items.map((item) => (
                <button
                  key={`${item.type}-${item.id}`}
                  type="button"
                  className="search-page-result"
                  onClick={() => navigate(item.url)}
                >
                  <span className="search-page-thumbnail">
                    {normalizeImageSrc(item.thumbnail) ? (
                      <img
                        src={normalizeImageSrc(item.thumbnail)}
                        alt={item.title}
                      />
                    ) : (
                      <i className={getTypeIcon(item.type)} />
                    )}
                  </span>
                  <span>{getTypeLabel(item.type)}</span>
                  <strong>{item.title}</strong>
                  {item.subtitle && <small>{item.subtitle}</small>}
                </button>
              ))}

            {!isFetching && query.length >= 2 && items.length === 0 && (
              <div className="search-empty">
                Không tìm thấy kết quả phù hợp.
              </div>
            )}
          </div>
        </div>
      </main>
      <HomeFooter />
    </>
  );
};

export default SearchPage;
