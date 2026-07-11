import { createApi } from "@reduxjs/toolkit/query/react";
import type { AxiosError, AxiosRequestConfig } from "axios";
import axios from "../../axiosClient";

type ApiResponse<T = any> = {
  errCode?: number;
  errMessage?: string;
  data?: T;
};

type HomeStats = {
  clinicCount: number;
  doctorCount: number;
  bookingCount: number;
};

export type DoctorsPaginatedArgs = {
  page: number;
  limit: number;
  search?: string;
  specialty?: string;
  clinic?: string;
};

type DoctorsPaginatedData = {
  doctors: any[];
  totalPages: number;
  totalElements: number;
  currentPage: number;
};

type PublicTagType =
  | "Specialty"
  | "Clinic"
  | "Doctor"
  | "Package"
  | "Schedule"
  | "User"
  | "AllCode"
  | "History"
  | "Booking";

export type SearchResult = {
  type: "doctor" | "clinic" | "specialty" | "package";
  id: number;
  title: string;
  subtitle?: string;
  url: string;
  thumbnail?: string;
};

export type SearchResponse = {
  query: string;
  type: string;
  total: number;
  items: SearchResult[];
};

type AxiosBaseQueryArgs = {
  url: string;
  method?: AxiosRequestConfig["method"];
  data?: AxiosRequestConfig["data"];
  params?: AxiosRequestConfig["params"];
};

const axiosBaseQuery = async ({
  url,
  method = "GET",
  data,
  params,
}: AxiosBaseQueryArgs) => {
  try {
    const result = await axios({ url, method, data, params });
    return { data: result };
  } catch (axiosError) {
    const error = axiosError as AxiosError<any>;
    return {
      error: {
        status: error.response?.status,
        data: error.response?.data || error.message,
      },
    };
  }
};

const buildListTags = <T extends PublicTagType>(
  type: T,
  result: ApiResponse<any[]> | undefined,
  listId: string | number = "LIST",
) => [
  ...(Array.isArray(result?.data)
    ? result.data
        .map((item) => item?.id ?? item?.keyMap)
        .filter(
          (id): id is string | number =>
            id !== undefined && id !== null && id !== "",
        )
        .map((id) => ({ type, id }))
    : []),
  { type, id: listId },
];

export const publicApi = createApi({
  reducerPath: "publicApi",
  baseQuery: axiosBaseQuery,
  tagTypes: [
    "Specialty",
    "Clinic",
    "Doctor",
    "Package",
    "Schedule",
    "User",
    "AllCode",
    "History",
    "Booking",
  ],
  keepUnusedDataFor: 30,
  refetchOnMountOrArgChange: false,
  refetchOnFocus: false,
  refetchOnReconnect: false,
  endpoints: (builder) => ({
    getHomeStats: builder.query<ApiResponse<HomeStats>, void>({
      query: () => ({ url: "/api/home/stats" }),
      keepUnusedDataFor: 300,
    }),
    searchPublic: builder.query<
      ApiResponse<SearchResponse>,
      { q: string; type?: string; size?: number }
    >({
      query: ({ q, type = "all", size = 10 }) => ({
        url: "/api/search",
        params: { q, type, size },
      }),
    }),
    getSpecialties: builder.query<ApiResponse<any[]>, number | void>({
      query: (limit) => ({
        url: "/api/specialties",
        params: { limit },
      }),
      providesTags: (result) => buildListTags("Specialty", result),
      keepUnusedDataFor: 300,
    }),
    getSpecialtiesByIds: builder.query<
      ApiResponse<any[]>,
      Array<number | string>
    >({
      query: (ids) => ({
        url: "/api/specialties/by-ids",
        params: { ids: ids.join(",") },
      }),
      providesTags: (_result, _error, ids) => [
        ...ids.map((id) => ({ type: "Specialty" as const, id })),
        "Specialty",
      ],
      keepUnusedDataFor: 300,
    }),
    getClinics: builder.query<ApiResponse<any[]>, number | void>({
      query: (limit) => ({
        url: "/api/clinics",
        params: { limit },
      }),
      providesTags: (result) => buildListTags("Clinic", result),
      keepUnusedDataFor: 300,
    }),
    getClinicById: builder.query<ApiResponse<any>, number | string>({
      query: (clinicId) => ({ url: `/api/clinics/${clinicId}` }),
      providesTags: (_result, _error, clinicId) => [
        { type: "Clinic", id: clinicId },
      ],
      keepUnusedDataFor: 300,
    }),
    getTopDoctors: builder.query<ApiResponse<any[]>, number>({
      query: (limit) => ({
        url: "/api/doctors/top",
        params: { limit },
      }),
      providesTags: (result) => buildListTags("Doctor", result, "TOP"),
      keepUnusedDataFor: 300,
    }),
    getAllDoctors: builder.query<ApiResponse<any[]>, void>({
      query: () => ({ url: "/api/doctors" }),
      providesTags: (result) => buildListTags("Doctor", result),
      keepUnusedDataFor: 300,
    }),
    getDoctorsPaginated: builder.query<
      ApiResponse<DoctorsPaginatedData>,
      DoctorsPaginatedArgs
    >({
      query: ({ page, limit, search, specialty, clinic }) => ({
        url: "/api/doctors/paginated",
        params: { page, limit, search, specialty, clinic },
      }),
      providesTags: (result) => [
        ...(Array.isArray(result?.data?.doctors)
          ? result.data.doctors
              .map((doctor) => doctor?.id)
              .filter(
                (id): id is string | number =>
                  id !== undefined && id !== null && id !== "",
              )
              .map((id) => ({ type: "Doctor" as const, id }))
          : []),
        { type: "Doctor", id: "LIST" },
      ],
      keepUnusedDataFor: 30,
    }),
    getDoctorById: builder.query<ApiResponse<any>, number | string>({
      query: (doctorId) => ({ url: `/api/doctors/${doctorId}` }),
      providesTags: (_result, _error, doctorId) => [
        { type: "Doctor", id: doctorId },
      ],
      keepUnusedDataFor: 300,
    }),
    getDoctorSpecialties: builder.query<
      ApiResponse<Array<number | string>>,
      number | string
    >({
      query: (doctorId) => ({
        url: `/api/doctors/${doctorId}/specialties`,
      }),
      providesTags: (_result, _error, doctorId) => [
        { type: "Doctor", id: doctorId },
      ],
      keepUnusedDataFor: 300,
    }),
    getDoctorsBySpecialtyId: builder.query<ApiResponse<any[]>, number | string>(
      {
        query: (specialtyId) => ({
          url: `/api/specialties/${specialtyId}/doctors`,
        }),
        providesTags: (result, _error, specialtyId) => [
          { type: "Specialty", id: specialtyId },
          ...buildListTags("Doctor", result, `specialty-${specialtyId}`),
        ],
        keepUnusedDataFor: 300,
      },
    ),
    getDoctorsByClinicId: builder.query<ApiResponse<any[]>, number | string>({
      query: (clinicId) => ({ url: `/api/clinics/${clinicId}/doctors` }),
      providesTags: (result, _error, clinicId) => [
        { type: "Clinic", id: clinicId },
        ...buildListTags("Doctor", result, `clinic-${clinicId}`),
      ],
      keepUnusedDataFor: 300,
    }),
    getDoctorSchedule: builder.query<
      ApiResponse<any[]>,
      { doctorId: number | string; date: number | string }
    >({
      query: ({ doctorId, date }) => ({
        url: `/api/doctors/${doctorId}/schedules`,
        params: { date },
      }),
      providesTags: (_result, _error, arg) => [
        { type: "Schedule", id: `${arg.doctorId}-${arg.date}` },
      ],
      keepUnusedDataFor: 10,
    }),
    getDoctorExtraInfo: builder.query<ApiResponse<any>, number | string>({
      query: (doctorId) => ({ url: `/api/doctors/${doctorId}/extra-info` }),
      providesTags: (_result, _error, doctorId) => [
        { type: "Doctor", id: doctorId },
      ],
      keepUnusedDataFor: 300,
    }),
    getDoctorServices: builder.query<ApiResponse<any[]>, number | string>({
      query: (doctorId) => ({ url: `/api/doctors/${doctorId}/services` }),
      providesTags: (_result, _error, doctorId) => [
        { type: "Doctor", id: doctorId },
      ],
      keepUnusedDataFor: 300,
    }),
    getPackages: builder.query<ApiResponse<any[]>, number | void>({
      query: (limit) => ({
        url: "/api/packages",
        params: { limit },
      }),
      providesTags: (result) => buildListTags("Package", result),
      keepUnusedDataFor: 300,
    }),
    getPackageById: builder.query<ApiResponse<any>, number | string>({
      query: (packageId) => ({ url: `/api/packages/${packageId}` }),
      providesTags: (_result, _error, packageId) => [
        { type: "Package", id: packageId },
      ],
      keepUnusedDataFor: 300,
    }),
    getUserById: builder.query<ApiResponse<any>, number | string>({
      query: (userId) => ({ url: `/api/users/${userId}` }),
      providesTags: (_result, _error, userId) => [{ type: "User", id: userId }],
    }),
    getUsers: builder.query<ApiResponse<any[]>, void>({
      query: () => ({ url: "/api/users" }),
      providesTags: (result) => buildListTags("User", result),
      keepUnusedDataFor: 30,
    }),
    generateUserEmail: builder.query<
      ApiResponse<string>,
      { firstName: string; lastName?: string; role?: string }
    >({
      query: ({ firstName, lastName = "", role = "R2" }) => ({
        url: "/api/users/generate-email",
        params: { firstName, lastName, role },
      }),
    }),
    getAllCode: builder.query<ApiResponse<any[]>, string>({
      query: (type) => ({
        url: "/api/all-codes",
        params: { type },
      }),
      providesTags: (result, _error, type) =>
        buildListTags("AllCode", result, type),
      keepUnusedDataFor: 300,
    }),
    getPatientHistory: builder.query<ApiResponse<any[]>, number | string>({
      query: (patientId) => ({ url: `/api/histories/patient/${patientId}` }),
      providesTags: (_result, _error, patientId) => [
        { type: "History", id: `patient-${patientId}` },
      ],
    }),
    getPatientsByDoctor: builder.query<
      ApiResponse<any[]>,
      { doctorId: number | string; date: number | string }
    >({
      query: ({ doctorId, date }) => ({
        url: `/api/doctors/${doctorId}/patients`,
        params: { date },
      }),
      providesTags: (_result, _error, arg) => [
        { type: "Booking", id: `doctor-${arg.doctorId}-${arg.date}` },
      ],
      keepUnusedDataFor: 10,
    }),
    getClinicBookings: builder.query<
      ApiResponse<any[]>,
      { clinicId: number | string; status?: string }
    >({
      query: ({ clinicId, status }) => ({
        url: `/api/clinic-manager/clinics/${clinicId}/bookings`,
        params: status ? { status } : undefined,
      }),
      providesTags: (_result, _error, arg) => [
        {
          type: "Booking",
          id: `clinic-${arg.clinicId}-${arg.status || "all"}`,
        },
      ],
      keepUnusedDataFor: 10,
    }),
    getClinicManagerPackages: builder.query<
      ApiResponse<any[]>,
      number | string
    >({
      query: (clinicId) => ({
        url: `/api/clinic-manager/clinics/${clinicId}/packages`,
      }),
      providesTags: (result, _error, clinicId) =>
        buildListTags("Package", result, `clinic-${clinicId}`),
    }),
    getHistoryByBooking: builder.query<ApiResponse<any>, number | string>({
      query: (bookingId) => ({ url: `/api/histories/booking/${bookingId}` }),
      providesTags: (_result, _error, bookingId) => [
        { type: "History", id: `booking-${bookingId}` },
      ],
    }),
    createUser: builder.mutation<ApiResponse<any>, any>({
      query: (data) => ({ url: "/api/users", method: "POST", data }),
      invalidatesTags: [
        { type: "User", id: "LIST" },
        { type: "Doctor", id: "LIST" },
      ],
    }),
    updateUser: builder.mutation<ApiResponse<any>, any>({
      query: ({ id, ...data }) => ({
        url: `/api/users/${id}`,
        method: "PUT",
        data: { id, ...data },
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "User", id: arg.id },
        { type: "User", id: "LIST" },
        { type: "Doctor", id: arg.id },
        { type: "Doctor", id: "LIST" },
      ],
    }),
    deleteUser: builder.mutation<ApiResponse<any>, number | string>({
      query: (userId) => ({
        url: `/api/users/${userId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, userId) => [
        { type: "User", id: userId },
        { type: "User", id: "LIST" },
        { type: "Doctor", id: userId },
        { type: "Doctor", id: "LIST" },
      ],
    }),
    createClinic: builder.mutation<ApiResponse<any>, any>({
      query: (data) => ({ url: "/api/clinics", method: "POST", data }),
      invalidatesTags: [{ type: "Clinic", id: "LIST" }],
    }),
    updateClinic: builder.mutation<ApiResponse<any>, any>({
      query: ({ id, ...data }) => ({
        url: `/api/clinics/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Clinic", id: arg.id },
        { type: "Clinic", id: "LIST" },
      ],
    }),
    deleteClinic: builder.mutation<ApiResponse<any>, number | string>({
      query: (clinicId) => ({
        url: `/api/clinics/${clinicId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, clinicId) => [
        { type: "Clinic", id: clinicId },
        { type: "Clinic", id: "LIST" },
      ],
    }),
    createSpecialty: builder.mutation<ApiResponse<any>, any>({
      query: (data) => ({ url: "/api/specialties", method: "POST", data }),
      invalidatesTags: [{ type: "Specialty", id: "LIST" }],
    }),
    updateSpecialty: builder.mutation<ApiResponse<any>, any>({
      query: ({ id, ...data }) => ({
        url: `/api/specialties/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Specialty", id: arg.id },
        { type: "Specialty", id: "LIST" },
      ],
    }),
    deleteSpecialty: builder.mutation<ApiResponse<any>, number | string>({
      query: (specialtyId) => ({
        url: `/api/specialties/${specialtyId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, specialtyId) => [
        { type: "Specialty", id: specialtyId },
        { type: "Specialty", id: "LIST" },
      ],
    }),
    createPackage: builder.mutation<ApiResponse<any>, any>({
      query: (data) => ({ url: "/api/packages", method: "POST", data }),
      invalidatesTags: [{ type: "Package", id: "LIST" }],
    }),
    updatePackage: builder.mutation<ApiResponse<any>, any>({
      query: ({ id, ...data }) => ({
        url: `/api/packages/${id}`,
        method: "PUT",
        data,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Package", id: arg.id },
        { type: "Package", id: "LIST" },
      ],
    }),
    deletePackage: builder.mutation<ApiResponse<any>, number | string>({
      query: (packageId) => ({
        url: `/api/packages/${packageId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, packageId) => [
        { type: "Package", id: packageId },
        { type: "Package", id: "LIST" },
      ],
    }),
    approveClinicManagerPackage: builder.mutation<
      ApiResponse<any>,
      number | string
    >({
      query: (packageId) => ({
        url: `/api/clinic-manager/packages/${packageId}/approve`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, packageId) => [
        { type: "Package", id: packageId },
      ],
    }),
    saveDoctorInfo: builder.mutation<ApiResponse<any>, any>({
      query: ({ doctorId, ...data }) => ({
        url: `/api/doctors/${doctorId}/info`,
        method: "POST",
        data,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Doctor", id: arg.doctorId },
        { type: "Doctor", id: "LIST" },
      ],
    }),
    saveDoctorServices: builder.mutation<ApiResponse<any>, any>({
      query: ({ doctorId, ...data }) => ({
        url: `/api/doctors/${doctorId}/services`,
        method: "POST",
        data,
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Doctor", id: arg.doctorId },
      ],
    }),
    saveDoctorSchedule: builder.mutation<ApiResponse<any>, any>({
      query: ({ doctorId, ...data }) => ({
        url: `/api/doctors/${doctorId}/schedules`,
        method: "POST",
        data,
      }),
      invalidatesTags: (_result, _error, arg) => [
        {
          type: "Schedule",
          id: `${arg.doctorId}-${arg.formattedDate}`,
        },
      ],
    }),
    deleteDoctorSchedule: builder.mutation<
      ApiResponse<any>,
      {
        doctorId: number | string;
        scheduleId: number | string;
        date: number | string;
      }
    >({
      query: ({ doctorId, scheduleId }) => ({
        url: `/api/doctors/${doctorId}/schedules/${scheduleId}`,
        method: "DELETE",
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Schedule", id: `${arg.doctorId}-${arg.date}` },
      ],
    }),
    approveClinicManagerDoctor: builder.mutation<
      ApiResponse<any>,
      number | string
    >({
      query: (doctorId) => ({
        url: `/api/clinic-manager/doctors/${doctorId}/approve`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, doctorId) => [
        { type: "Doctor", id: doctorId },
      ],
    }),
    reviewClinicManagerDoctor: builder.mutation<
      ApiResponse<any>,
      {
        doctorId: number | string;
        decision: "approve" | "reject";
        reviewNote?: string;
      }
    >({
      query: ({ doctorId, decision, reviewNote }) => ({
        url: `/api/clinic-manager/doctors/${doctorId}/review/${decision}`,
        method: "POST",
        params: { reviewNote },
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Doctor", id: arg.doctorId },
      ],
    }),
    updateClinicManagerDoctorStatus: builder.mutation<
      ApiResponse<any>,
      { doctorId: number | string; statusId: string }
    >({
      query: ({ doctorId, statusId }) => ({
        url: `/api/clinic-manager/doctors/${doctorId}/status`,
        method: "PATCH",
        params: { statusId },
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Doctor", id: arg.doctorId },
      ],
    }),
    updateClinicBookingStatus: builder.mutation<
      ApiResponse<any>,
      {
        bookingId: number | string;
        clinicId: number | string;
        decision: "confirm" | "reject";
      }
    >({
      query: ({ bookingId, clinicId, decision }) => ({
        url: `/api/clinic-manager/bookings/${bookingId}/${decision}`,
        method: "POST",
        params: { clinicId },
      }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Booking", id: `clinic-${arg.clinicId}-all` },
      ],
    }),
    confirmPatientBooking: builder.mutation<
      ApiResponse<any>,
      {
        bookingId: number | string;
        doctorId: number | string;
        statusId?: string;
        date: number | string;
      }
    >({
      query: ({ bookingId, doctorId, statusId = "S3" }) => ({
        url: `/api/bookings/${bookingId}/confirm`,
        method: "POST",
        data: { doctorId, statusId },
      }),
      invalidatesTags: (_result, _error, arg) => [
        {
          type: "Booking",
          id: `doctor-${arg.doctorId}-${arg.date}`,
        },
      ],
    }),
    bookAppointment: builder.mutation<ApiResponse<any>, any>({
      query: (data) => ({ url: "/api/bookings", method: "POST", data }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Schedule", id: `${arg.doctorId}-${arg.date}` },
      ],
    }),
    verifyBooking: builder.mutation<
      ApiResponse<any>,
      { token: string; doctorId: number }
    >({
      query: (data) => ({ url: "/api/bookings/verify", method: "POST", data }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "Doctor", id: arg.doctorId },
      ],
    }),
    changePassword: builder.mutation<
      ApiResponse<any>,
      {
        userId: number | string;
        oldPassword: string;
        newPassword: string;
        confirmPassword: string;
      }
    >({
      query: ({ userId, ...data }) => ({
        url: `/api/users/${userId}/change-password`,
        method: "PUT",
        data,
      }),
    }),
    createHistory: builder.mutation<ApiResponse<any>, any>({
      query: (data) => ({ url: "/api/histories", method: "POST", data }),
      invalidatesTags: (_result, _error, arg) => [
        { type: "History", id: `booking-${arg.bookingId}` },
      ],
    }),
  }),
});

export const {
  useGetHomeStatsQuery,
  useSearchPublicQuery,
  useLazySearchPublicQuery,
  useGetSpecialtiesQuery,
  useGetSpecialtiesByIdsQuery,
  useGetClinicsQuery,
  useGetClinicByIdQuery,
  useLazyGetClinicByIdQuery,
  useGetTopDoctorsQuery,
  useGetAllDoctorsQuery,
  useGetDoctorsPaginatedQuery,
  useGetDoctorByIdQuery,
  useGetDoctorSpecialtiesQuery,
  useGetDoctorsBySpecialtyIdQuery,
  useGetDoctorsByClinicIdQuery,
  useGetDoctorScheduleQuery,
  useGetDoctorExtraInfoQuery,
  useGetDoctorServicesQuery,
  useGetPackagesQuery,
  useGetPackageByIdQuery,
  useLazyGetPackageByIdQuery,
  useGetUserByIdQuery,
  useGetUsersQuery,
  useLazyGenerateUserEmailQuery,
  useGetAllCodeQuery,
  useGetPatientHistoryQuery,
  useGetPatientsByDoctorQuery,
  useGetClinicBookingsQuery,
  useGetClinicManagerPackagesQuery,
  useGetHistoryByBookingQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useCreateClinicMutation,
  useUpdateClinicMutation,
  useDeleteClinicMutation,
  useCreateSpecialtyMutation,
  useUpdateSpecialtyMutation,
  useDeleteSpecialtyMutation,
  useCreatePackageMutation,
  useUpdatePackageMutation,
  useDeletePackageMutation,
  useApproveClinicManagerPackageMutation,
  useSaveDoctorInfoMutation,
  useSaveDoctorServicesMutation,
  useSaveDoctorScheduleMutation,
  useDeleteDoctorScheduleMutation,
  useApproveClinicManagerDoctorMutation,
  useReviewClinicManagerDoctorMutation,
  useUpdateClinicManagerDoctorStatusMutation,
  useUpdateClinicBookingStatusMutation,
  useConfirmPatientBookingMutation,
  useBookAppointmentMutation,
  useVerifyBookingMutation,
  useChangePasswordMutation,
  useCreateHistoryMutation,
} = publicApi;
