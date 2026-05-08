import axios from "../axiosClient";
import { IBookingData } from "../types";

const postPatientBookAppointment = (data: IBookingData): Promise<any> => {
  return axios.post(`/api/bookings`, data);
};

const handleVerifyEmail = (data: {
  token: string;
  doctorId: number;
}): Promise<any> => {
  return axios.post(`/api/bookings/verify`, data);
};

const getClinicBookings = (
  clinicId: number | string,
  status?: string,
): Promise<any> => {
  const params = status ? `?status=${status}` : "";
  return axios.get(`/api/clinic-manager/clinics/${clinicId}/bookings${params}`);
};

const confirmClinicBooking = (
  bookingId: number | string,
  clinicId: number | string,
): Promise<any> => {
  return axios.post(
    `/api/clinic-manager/bookings/${bookingId}/confirm?clinicId=${clinicId}`,
  );
};

const rejectClinicBooking = (
  bookingId: number | string,
  clinicId: number | string,
): Promise<any> => {
  return axios.post(
    `/api/clinic-manager/bookings/${bookingId}/reject?clinicId=${clinicId}`,
  );
};

export {
  postPatientBookAppointment,
  handleVerifyEmail,
  getClinicBookings,
  confirmClinicBooking,
  rejectClinicBooking,
};
