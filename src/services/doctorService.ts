import axios from "../axiosClient";

const handleGetTopDoctorHome = (limit: number): Promise<any> => {
  return axios.get("/api/doctors/top", { params: { limit } });
};

const handleGetAllDoctors = (): Promise<any> => {
  return axios.get("/api/doctors");
};

const handleGetDoctorsPaginated = (page: number, limit: number, search?: string, specialty?: string, clinic?: string): Promise<any> => {
  return axios.get("/api/doctors/paginated", { params: { page, limit, search, specialty, clinic } });
};

const saveDetailDoctor = (data: any): Promise<any> => {
  const { doctorId, ...body } = data;
  return axios.post(`/api/doctors/${doctorId}/info`, body);
};

const getDetailInfoDoctor = (inputId: number | string): Promise<any> => {
  return axios.get(`/api/doctors/${inputId}`);
};

const saveBulkScheduleDoctor = (data: any): Promise<any> => {
  const { doctorId, ...body } = data;
  return axios.post(`/api/doctors/${doctorId}/schedules`, body);
};

const getScheduleDoctorByDate = (
  doctorId: number | string,
  date: number | string,
): Promise<any> => {
  return axios.get(`/api/doctors/${doctorId}/schedules`, {
    params: { date },
  });
};

const saveBulkDoctor = (data: any): Promise<any> => {
  const { doctorId, ...body } = data;
  return axios.post(`/api/doctors/${doctorId}/services`, body);
};

const getAllDoctorService = (doctorId: number | string): Promise<any> => {
  return axios.get(`/api/doctors/${doctorId}/services`);
};

const getExtraInfoDoctorById = (doctorId: number | string): Promise<any> => {
  return axios.get(`/api/doctors/${doctorId}/extra-info`);
};

const getSpecialtiesByDoctorId = (doctorId: number | string): Promise<any> => {
  return axios.get(`/api/doctors/${doctorId}/specialties`);
};

const HandleGetDoctorSpecialtyById = (
  specialtyId: number | string,
): Promise<any> => {
  return axios.get(`/api/specialties/${specialtyId}/doctors`);
};

const getDoctorsByClinicId = (clinicId: number | string): Promise<any> => {
  return axios.get(`/api/clinics/${clinicId}/doctors`);
};

const approveClinicManagerDoctor = (doctorId: number | string): Promise<any> => {
  return axios.post(`/api/clinic-manager/doctors/${doctorId}/approve`);
};

const approveClinicManagerDoctorReview = (
  doctorId: number | string,
  reviewNote?: string,
): Promise<any> => {
  return axios.post(`/api/clinic-manager/doctors/${doctorId}/review/approve`, null, {
    params: { reviewNote },
  });
};

const rejectClinicManagerDoctorReview = (
  doctorId: number | string,
  reviewNote: string,
): Promise<any> => {
  return axios.post(`/api/clinic-manager/doctors/${doctorId}/review/reject`, null, {
    params: { reviewNote },
  });
};

const updateClinicManagerDoctorStatus = (
  doctorId: number | string,
  statusId: string,
): Promise<any> => {
  return axios.patch(`/api/clinic-manager/doctors/${doctorId}/status`, null, {
    params: { statusId },
  });
};

export {
  handleGetTopDoctorHome,
  handleGetAllDoctors,
  handleGetDoctorsPaginated,
  saveDetailDoctor,
  getDetailInfoDoctor,
  saveBulkScheduleDoctor,
  getScheduleDoctorByDate,
  saveBulkDoctor,
  getAllDoctorService,
  getExtraInfoDoctorById,
  getSpecialtiesByDoctorId,
  HandleGetDoctorSpecialtyById,
  getDoctorsByClinicId,
  approveClinicManagerDoctor,
  approveClinicManagerDoctorReview,
  rejectClinicManagerDoctorReview,
  updateClinicManagerDoctorStatus,
};
