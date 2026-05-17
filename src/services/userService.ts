import axios from "../axiosClient";
import { IUser } from "../types";

const handleLoginApi = (
  userEmail: string,
  userPassword: string,
): Promise<any> => {
  return axios.post("/api/auth/login", {
    email: userEmail,
    password: userPassword,
  });
};

const handleSystemLoginApi = (
  userEmail: string,
  userPassword: string,
): Promise<any> => {
  return handleLoginApi(userEmail, userPassword);
};

const handlePatientLoginApi = (
  userEmail: string,
  userPassword: string,
): Promise<any> => {
  return handleLoginApi(userEmail, userPassword);
};

const handleGetAllUsers = (): Promise<any> => {
  return axios.get("/api/users");
};

const handleCreateNewUser = (data: Partial<IUser>): Promise<any> => {
  return axios.post("/api/users", data);
};

const handleDeleteUser = (userId: number | string): Promise<any> => {
  return axios.delete(`/api/users/${userId}`);
};

const handleGetUserById = (userId: number | string): Promise<any> => {
  return axios.get(`/api/users/${userId}`);
};

const handleEditUser = (inputData: Partial<IUser>): Promise<any> => {
  return axios.put(`/api/users/${inputData.id}`, inputData);
};

const handleGetAllCode = (inputType: string): Promise<any> => {
  return axios.get("/api/all-codes", { params: { type: inputType } });
};

const handleChangePassword = (
  userId: number | string,
  data: { oldPassword: string; newPassword: string; confirmPassword: string },
): Promise<any> => {
  return axios.put(`/api/users/${userId}/change-password`, data);
};

const handleGenerateEmail = (
  firstName: string,
  lastName?: string,
  role?: string,
): Promise<any> => {
  return axios.get("/api/users/generate-email", {
    params: { firstName, lastName: lastName || "", role: role || "R2" },
  });
};

export {
  handleLoginApi,
  handleSystemLoginApi,
  handlePatientLoginApi,
  handleGetAllUsers,
  handleGetUserById,
  handleCreateNewUser,
  handleDeleteUser,
  handleEditUser,
  handleGetAllCode,
  handleChangePassword,
  handleGenerateEmail,
};
