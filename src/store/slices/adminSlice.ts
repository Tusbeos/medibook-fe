import { createSlice, PayloadAction } from "@reduxjs/toolkit";

import {
  IAdminState,
  IAllCode,
  IDetailDoctor,
  IDoctorService,
  IUser,
} from "types";

const initialState: IAdminState = {
  isLoadingGender: false,
  genders: [],
  role: [],
  position: [],
  users: [],
  topDoctors: [],
  allDoctors: [],
  allScheduleTime: [],
  allRequiredDoctorInfo: {},
  allDoctorServices: [],
};

const adminSlice = createSlice({
  name: "admin",
  initialState,
  reducers: {
    fetchGenderStart: (state) => {
      state.isLoadingGender = true;
    },
    fetchGenderSuccess: (state, action: PayloadAction<IAllCode[]>) => {
      state.genders = action.payload;
      state.isLoadingGender = false;
    },
    fetchGenderFailed: (state) => {
      state.genders = [];
      state.isLoadingGender = false;
    },
    fetchPositionSuccess: (state, action: PayloadAction<IAllCode[]>) => {
      state.position = action.payload;
    },
    fetchPositionFailed: (state) => {
      state.position = [];
    },
    fetchRoleSuccess: (state, action: PayloadAction<IAllCode[]>) => {
      state.role = action.payload;
    },
    fetchRoleFailed: (state) => {
      state.role = [];
    },
    fetchAllUsersSuccess: (state, action: PayloadAction<IUser[]>) => {
      state.users = action.payload;
    },
    fetchAllUsersFailed: (state) => {
      state.users = [];
    },
    fetchTopDoctorsSuccess: (state, action: PayloadAction<IDetailDoctor[]>) => {
      state.topDoctors = action.payload;
    },
    fetchTopDoctorsFailed: (state) => {
      state.topDoctors = [];
    },
    fetchAllDoctorsSuccess: (state, action: PayloadAction<IDetailDoctor[]>) => {
      state.allDoctors = action.payload;
    },
    fetchAllDoctorsFailed: (state) => {
      state.allDoctors = [];
    },
    fetchAllScheduleTimeSuccess: (state, action: PayloadAction<IAllCode[]>) => {
      state.allScheduleTime = action.payload;
    },
    fetchAllScheduleTimeFailed: (state) => {
      state.allScheduleTime = [];
    },
    fetchRequiredDoctorInfoSuccess: (
      state,
      action: PayloadAction<IAdminState["allRequiredDoctorInfo"]>,
    ) => {
      state.allRequiredDoctorInfo = action.payload;
    },
    fetchRequiredDoctorInfoFailed: (state) => {
      state.allRequiredDoctorInfo = {};
    },
    fetchDoctorServicesSuccess: (
      state,
      action: PayloadAction<IDoctorService[]>,
    ) => {
      state.allDoctorServices = action.payload;
    },
    fetchDoctorServicesFailed: (state) => {
      state.allDoctorServices = [];
    },
    saveUserSuccess: () => {},
    saveUserFailed: () => {},
    editUserSuccess: () => {},
    editUserFailed: () => {},
    deleteUserSuccess: () => {},
    deleteUserFailed: () => {},
    saveDetailDoctorSuccess: () => {},
    saveDetailDoctorFailed: () => {},
    saveDoctorServicesSuccess: () => {},
    saveDoctorServicesFailed: () => {},
  },
});

export const {
  fetchGenderStart,
  fetchGenderSuccess,
  fetchGenderFailed,
  fetchPositionSuccess,
  fetchPositionFailed,
  fetchRoleSuccess,
  fetchRoleFailed,
  fetchAllUsersSuccess,
  fetchAllUsersFailed,
  fetchTopDoctorsSuccess,
  fetchTopDoctorsFailed,
  fetchAllDoctorsSuccess,
  fetchAllDoctorsFailed,
  fetchAllScheduleTimeSuccess,
  fetchAllScheduleTimeFailed,
  fetchRequiredDoctorInfoSuccess,
  fetchRequiredDoctorInfoFailed,
  fetchDoctorServicesSuccess,
  fetchDoctorServicesFailed,
  saveUserSuccess,
  saveUserFailed,
  editUserSuccess,
  editUserFailed,
  deleteUserSuccess,
  deleteUserFailed,
  saveDetailDoctorSuccess,
  saveDetailDoctorFailed,
  saveDoctorServicesSuccess,
  saveDoctorServicesFailed,
} = adminSlice.actions;

export default adminSlice.reducer;
