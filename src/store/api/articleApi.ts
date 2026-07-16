import { publicApi } from "./publicApi";

export const ARTICLE_STATUS = {
  DRAFT: "AS1",
  PENDING: "AS2",
  APPROVED: "AS3",
  PUBLISHED: "AS4",
  REJECTED: "AS5",
  ARCHIVED: "AS6",
} as const;

export type ArticleStatus =
  (typeof ARTICLE_STATUS)[keyof typeof ARTICLE_STATUS];

export type PageMetadata = {
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
};

export type ApiResponse<T> = {
  success?: boolean;
  errCode?: number;
  errMessage?: string;
  message?: string;
  data?: T;
  pagination?: PageMetadata;
};

export type ArticleListItem = {
  id: number;
  title: string;
  slug: string;
  summary?: string | null;
  thumbnailUrl?: string | null;
  authorId: number;
  authorName?: string | null;
  authorEmail?: string | null;
  statusId: ArticleStatus;
  statusValueVi?: string | null;
  featured: boolean;
  reviewNote?: string | null;
  publishedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type ArticleDetail = ArticleListItem & {
  contentHtml: string;
  contentMarkdown: string;
  reviewerId?: number | null;
  reviewerName?: string | null;
  submittedAt?: string | null;
  reviewedAt?: string | null;
};

export type ArticleListArgs = {
  page?: number;
  size?: number;
  q?: string;
  status?: ArticleStatus | "";
};

export type SaveArticlePayload = {
  title: string;
  summary?: string;
  contentHtml: string;
  contentMarkdown: string;
  thumbnailUrl?: string;
};

const listParams = ({ page = 0, size = 10, q, status }: ArticleListArgs) => ({
  page,
  size,
  ...(q?.trim() ? { q: q.trim() } : {}),
  ...(status ? { status } : {}),
});

export const articleApi = publicApi.injectEndpoints({
  endpoints: (builder) => ({
    getPublishedArticles: builder.query<
      ApiResponse<ArticleListItem[]>,
      ArticleListArgs
    >({
      query: (args) => ({ url: "/api/articles", params: listParams(args) }),
      providesTags: (result) => [
        { type: "Article", id: "PUBLIC" },
        ...(result?.data || []).map((article) => ({
          type: "Article" as const,
          id: article.id,
        })),
      ],
    }),
    getFeaturedArticles: builder.query<
      ApiResponse<ArticleListItem[]>,
      number | void
    >({
      query: (limit = 6) => ({
        url: "/api/articles/featured",
        params: { limit },
      }),
      providesTags: [{ type: "Article", id: "FEATURED" }],
    }),
    getPublishedArticle: builder.query<ApiResponse<ArticleDetail>, string>({
      query: (slug) => ({ url: `/api/articles/${encodeURIComponent(slug)}` }),
      providesTags: (result) =>
        result?.data ? [{ type: "Article", id: result.data.id }] : [],
    }),
    getWriterArticles: builder.query<
      ApiResponse<ArticleListItem[]>,
      ArticleListArgs
    >({
      query: (args) => ({
        url: "/api/writer/articles",
        params: listParams(args),
      }),
      providesTags: (result) => [
        { type: "Article", id: "WRITER" },
        ...(result?.data || []).map((article) => ({
          type: "Article" as const,
          id: article.id,
        })),
      ],
    }),
    getWriterArticle: builder.query<ApiResponse<ArticleDetail>, number>({
      query: (id) => ({ url: `/api/writer/articles/${id}` }),
      providesTags: (_result, _error, id) => [{ type: "Article", id }],
    }),
    createArticle: builder.mutation<
      ApiResponse<ArticleDetail>,
      SaveArticlePayload
    >({
      query: (data) => ({ url: "/api/writer/articles", method: "POST", data }),
      invalidatesTags: [{ type: "Article", id: "WRITER" }],
    }),
    updateArticle: builder.mutation<
      ApiResponse<ArticleDetail>,
      { id: number; data: SaveArticlePayload }
    >({
      query: ({ id, data }) => ({
        url: `/api/writer/articles/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Article", id },
        { type: "Article", id: "WRITER" },
      ],
    }),
    submitArticle: builder.mutation<ApiResponse<ArticleDetail>, number>({
      query: (id) => ({
        url: `/api/writer/articles/${id}/submit`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Article", id },
        { type: "Article", id: "WRITER" },
        { type: "Article", id: "ADMIN" },
      ],
    }),
    getAdminArticles: builder.query<
      ApiResponse<ArticleListItem[]>,
      ArticleListArgs
    >({
      query: (args) => ({
        url: "/api/admin/articles",
        params: listParams(args),
      }),
      providesTags: (result) => [
        { type: "Article", id: "ADMIN" },
        ...(result?.data || []).map((article) => ({
          type: "Article" as const,
          id: article.id,
        })),
      ],
    }),
    getAdminArticle: builder.query<ApiResponse<ArticleDetail>, number>({
      query: (id) => ({ url: `/api/admin/articles/${id}` }),
      providesTags: (_result, _error, id) => [{ type: "Article", id }],
    }),
    approveArticle: builder.mutation<
      ApiResponse<ArticleDetail>,
      { id: number; reviewNote?: string }
    >({
      query: ({ id, reviewNote }) => ({
        url: `/api/admin/articles/${id}/approve`,
        method: "POST",
        data: reviewNote?.trim() ? { reviewNote: reviewNote.trim() } : {},
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Article", id },
        { type: "Article", id: "ADMIN" },
        { type: "Article", id: "WRITER" },
      ],
    }),
    rejectArticle: builder.mutation<
      ApiResponse<ArticleDetail>,
      { id: number; reviewNote: string }
    >({
      query: ({ id, reviewNote }) => ({
        url: `/api/admin/articles/${id}/reject`,
        method: "POST",
        data: { reviewNote: reviewNote.trim() },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Article", id },
        { type: "Article", id: "ADMIN" },
        { type: "Article", id: "WRITER" },
      ],
    }),
    publishArticle: builder.mutation<
      ApiResponse<ArticleDetail>,
      { id: number; featured: boolean }
    >({
      query: ({ id, featured }) => ({
        url: `/api/admin/articles/${id}/publish`,
        method: "POST",
        data: { featured },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Article", id },
        { type: "Article", id: "ADMIN" },
        { type: "Article", id: "WRITER" },
        { type: "Article", id: "PUBLIC" },
        { type: "Article", id: "FEATURED" },
      ],
    }),
    unpublishArticle: builder.mutation<ApiResponse<ArticleDetail>, number>({
      query: (id) => ({
        url: `/api/admin/articles/${id}/unpublish`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, id) => [
        { type: "Article", id },
        { type: "Article", id: "ADMIN" },
        { type: "Article", id: "WRITER" },
        { type: "Article", id: "PUBLIC" },
        { type: "Article", id: "FEATURED" },
      ],
    }),
  }),
  overrideExisting: false,
});

export const {
  useGetPublishedArticlesQuery,
  useGetFeaturedArticlesQuery,
  useGetPublishedArticleQuery,
  useGetWriterArticlesQuery,
  useGetWriterArticleQuery,
  useCreateArticleMutation,
  useUpdateArticleMutation,
  useSubmitArticleMutation,
  useGetAdminArticlesQuery,
  useGetAdminArticleQuery,
  useApproveArticleMutation,
  useRejectArticleMutation,
  usePublishArticleMutation,
  useUnpublishArticleMutation,
} = articleApi;
