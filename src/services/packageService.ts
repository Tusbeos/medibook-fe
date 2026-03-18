import axios from "../axiosClient";

const createNewPackageService = (data: any): Promise<any> => {
  return axios.post("/api/packages", data);
};

const updatePackageService = (data: any): Promise<any> => {
  const { id, ...body } = data;
  return axios.put(`/api/packages/${id}`, body);
};

const deletePackageService = (id: number | string): Promise<any> => {
  return axios.delete(`/api/packages/${id}`);
};

const handleGetAllPackages = (limit?: number): Promise<any> => {
  return axios.get("/api/packages", {
    params: { limit },
  });
};

const getPackageById = (id: number | string): Promise<any> => {
  return axios.get(`/api/packages/${id}`);
};

export {
  createNewPackageService,
  updatePackageService,
  deletePackageService,
  handleGetAllPackages,
  getPackageById,
};
