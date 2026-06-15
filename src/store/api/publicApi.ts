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
  keepUnusedDataFor: 10,
  refetchOnMountOrArgChange: false,
  refetchOnFocus: false,
  refetchOnReconnect: false,
  endpoints: (builder) => ({
    getHomeStats: builder.query<ApiResponse<HomeStats>, void>({
      query: () => ({ url: "/api/home/stats" }),
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
      providesTags: ["Specialty"],
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
    }),
    getClinics: builder.query<ApiResponse<any[]>, number | void>({
      query: (limit) => ({
        url: "/api/clinics",
        params: { limit },
      }),
      providesTags: ["Clinic"],
    }),
    getClinicById: builder.query<ApiResponse<any>, number | string>({
      query: (clinicId) => ({ url: `/api/clinics/${clinicId}` }),
      providesTags: (_result, _error, clinicId) => [
        { type: "Clinic", id: clinicId },
      ],
    }),
    getTopDoctors: builder.query<ApiResponse<any[]>, number>({
      query: (limit) => ({
        url: "/api/doctors/top",
        params: { limit },
      }),
      providesTags: ["Doctor"],
    }),
    getAllDoctors: builder.query<ApiResponse<any[]>, void>({
      query: () => ({ url: "/api/doctors" }),
      providesTags: ["Doctor"],
    }),
    getDoctorById: builder.query<ApiResponse<any>, number | string>({
      query: (doctorId) => ({ url: `/api/doctors/${doctorId}` }),
      providesTags: (_result, _error, doctorId) => [
        { type: "Doctor", id: doctorId },
      ],
    }),
    getDoctorsBySpecialtyId: builder.query<ApiResponse<any[]>, number | string>(
      {
        query: (specialtyId) => ({
          url: `/api/specialties/${specialtyId}/doctors`,
        }),
        providesTags: (_result, _error, specialtyId) => [
          { type: "Specialty", id: specialtyId },
          "Doctor",
        ],
      },
    ),
    getDoctorsByClinicId: builder.query<ApiResponse<any[]>, number | string>({
      query: (clinicId) => ({ url: `/api/clinics/${clinicId}/doctors` }),
      providesTags: (_result, _error, clinicId) => [
        { type: "Clinic", id: clinicId },
        "Doctor",
      ],
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
    }),
    getDoctorExtraInfo: builder.query<ApiResponse<any>, number | string>({
      query: (doctorId) => ({ url: `/api/doctors/${doctorId}/extra-info` }),
      providesTags: (_result, _error, doctorId) => [
        { type: "Doctor", id: doctorId },
      ],
    }),
    getDoctorServices: builder.query<ApiResponse<any[]>, number | string>({
      query: (doctorId) => ({ url: `/api/doctors/${doctorId}/services` }),
      providesTags: (_result, _error, doctorId) => [
        { type: "Doctor", id: doctorId },
      ],
    }),
    getPackages: builder.query<ApiResponse<any[]>, number | void>({
      query: (limit) => ({
        url: "/api/packages",
        params: { limit },
      }),
      providesTags: ["Package"],
    }),
    getPackageById: builder.query<ApiResponse<any>, number | string>({
      query: (packageId) => ({ url: `/api/packages/${packageId}` }),
      providesTags: (_result, _error, packageId) => [
        { type: "Package", id: packageId },
      ],
    }),
    getUserById: builder.query<ApiResponse<any>, number | string>({
      query: (userId) => ({ url: `/api/users/${userId}` }),
      providesTags: (_result, _error, userId) => [{ type: "User", id: userId }],
    }),
    getAllCode: builder.query<ApiResponse<any[]>, string>({
      query: (type) => ({
        url: "/api/all-codes",
        params: { type },
      }),
      providesTags: (_result, _error, type) => [{ type: "AllCode", id: type }],
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
    }),
    getClinicManagerPackages: builder.query<
      ApiResponse<any[]>,
      number | string
    >({
      query: (clinicId) => ({
        url: `/api/clinic-manager/clinics/${clinicId}/packages`,
      }),
      providesTags: (_result, _error, clinicId) => [
        { type: "Package", id: `clinic-${clinicId}` },
      ],
    }),
    getHistoryByBooking: builder.query<ApiResponse<any>, number | string>({
      query: (bookingId) => ({ url: `/api/histories/booking/${bookingId}` }),
      providesTags: (_result, _error, bookingId) => [
        { type: "History", id: `booking-${bookingId}` },
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
  useGetTopDoctorsQuery,
  useGetAllDoctorsQuery,
  useGetDoctorByIdQuery,
  useGetDoctorsBySpecialtyIdQuery,
  useGetDoctorsByClinicIdQuery,
  useGetDoctorScheduleQuery,
  useGetDoctorExtraInfoQuery,
  useGetDoctorServicesQuery,
  useGetPackagesQuery,
  useGetPackageByIdQuery,
  useGetUserByIdQuery,
  useGetAllCodeQuery,
  useGetPatientHistoryQuery,
  useGetPatientsByDoctorQuery,
  useGetClinicBookingsQuery,
  useGetClinicManagerPackagesQuery,
  useGetHistoryByBookingQuery,
} = publicApi;
