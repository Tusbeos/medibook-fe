import axios from "../axiosClient";

const getPatientsByDoctor = (
  doctorId: number | string,
  date: string,
): Promise<any> => {
  return axios.get(`/api/doctors/${doctorId}/patients`, {
    params: { date },
  });
};

const confirmPatientBooking = (
  bookingId: number | string,
  doctorId: number | string,
  statusId: string = "S3",
): Promise<any> => {
  return axios.post(`/api/bookings/${bookingId}/confirm`, {
    doctorId,
    statusId,
  });
};

const getPatientHistory = (patientId: number | string): Promise<any> => {
  return axios.get(`/api/histories/patient/${patientId}`);
};

export { getPatientsByDoctor, confirmPatientBooking, getPatientHistory };
