import { toast } from "react-toastify";
import {
  handleGetAllCode,
  handleCreateNewUser,
  handleGetAllUsers,
  handleDeleteUser,
  handleEditUser,
} from "../../services/userService";
import {
  handleGetTopDoctorHome,
  handleGetAllDoctors,
  saveDetailDoctor,
  saveBulkDoctor,
  getAllDoctorService,
} from "../../services/doctorService";
import { IUser } from "../../types";
import {
  deleteUserFailed,
  deleteUserSuccess,
  editUserFailed,
  editUserSuccess,
  fetchAllDoctorsFailed,
  fetchAllDoctorsSuccess,
  fetchAllScheduleTimeFailed,
  fetchAllScheduleTimeSuccess,
  fetchAllUsersFailed,
  fetchAllUsersSuccess,
  fetchDoctorServicesFailed,
  fetchDoctorServicesSuccess,
  fetchGenderFailed,
  fetchGenderStart as fetchGenderStartAction,
  fetchGenderSuccess,
  fetchPositionFailed,
  fetchPositionSuccess,
  fetchRequiredDoctorInfoFailed,
  fetchRequiredDoctorInfoSuccess,
  fetchRoleFailed,
  fetchRoleSuccess,
  fetchTopDoctorsFailed,
  fetchTopDoctorsSuccess,
  saveDetailDoctorFailed,
  saveDetailDoctorSuccess,
  saveDoctorServicesFailed,
  saveDoctorServicesSuccess,
  saveUserFailed,
  saveUserSuccess,
} from "store/slices/adminSlice";

// Create a new user
export const createNewUser = (data: Partial<IUser>) => {
  return async (dispatch: any) => {
    try {
      let res = await handleCreateNewUser(data);
      console.log("check create user redux", res);
      if (res && res.errCode === 0) {
        toast.success("Create a new user success!");
        dispatch(saveUserSuccess());
        dispatch(fetchAllUsersStart());
      } else {
        dispatch(saveUserFailed());
      }
    } catch (e) {
      dispatch(saveUserFailed());
      console.error(e);
    }
  };
};

export const fetchAllUsersStart = () => {
  return async (dispatch: any) => {
    try {
      let res = await handleGetAllUsers();
      if (res && res.errCode === 0) {
        dispatch(fetchAllUsersSuccess(res.data.reverse()));
      } else {
        toast.error("Fetch all users failed!");
        dispatch(fetchAllUsersFailed());
      }
    } catch (e) {
      toast.error("Fetch all users failed!");
      dispatch(fetchAllUsersFailed());
      console.error(e);
    }
  };
};
// Delete a user
export const deleteUserStart = (userId: number | string) => {
  return async (dispatch: any) => {
    try {
      let res = await handleDeleteUser(userId);
      if (res && res.errCode === 0) {
        toast.success("Delete the user success!");
        dispatch(fetchAllUsersStart());
        dispatch(deleteUserSuccess(res.data));
      } else {
        toast.error("Delete the user failed!");
        dispatch(deleteUserFailed());
      }
    } catch (e) {
      toast.error("Delete the user failed!");
      dispatch(deleteUserFailed());
      console.error(e);
    }
  };
};
// Edit a user
export const editUserStart = (data: Partial<IUser>) => {
  return async (dispatch: any) => {
    try {
      let res = await handleEditUser(data);
      if (res && res.errCode === 0) {
        toast.success("Update the user success!");
        dispatch(editUserSuccess());
        dispatch(fetchAllUsersStart());
      } else {
        dispatch(editUserFailed());
      }
    } catch (e) {
      toast.error("Update the user failed!");
      dispatch(editUserFailed());
      console.error(e);
    }
  };
};
// Fetch top doctors for home page
export const fetchTopDoctorStart = () => {
  return async (dispatch: any) => {
    try {
      let res = await handleGetTopDoctorHome(10);
      if (res && res.errCode === 0) {
        dispatch(fetchTopDoctorsSuccess(res.data));
      } else {
        dispatch(fetchTopDoctorsFailed());
      }
    } catch (e) {
      dispatch(fetchTopDoctorsFailed());
      console.error(e);
    }
  };
};
// Fetch all doctors
export const fetchAllDoctorsStart = () => {
  return async (dispatch: any) => {
    try {
      let res = await handleGetAllDoctors();
      if (res && res.errCode === 0) {
        dispatch(fetchAllDoctorsSuccess(res.data));
      } else {
        dispatch(fetchAllDoctorsFailed());
      }
    } catch (e) {
      dispatch(fetchAllDoctorsFailed());
      console.error(e);
    }
  };
};
// Save Info doctor to Markdown table
export const saveDetailDoctorsStart = (data: any) => {
  return async (dispatch: any) => {
    try {
      let res = await saveDetailDoctor(data);
      if (res && res.errCode === 0) {
        toast.success("Save info doctor success!");
        dispatch(saveDetailDoctorSuccess());
      } else {
        toast.error("Save info doctor failed!");
        dispatch(saveDetailDoctorFailed());
      }
    } catch (e) {
      toast.error("Save info doctor failed!");
      dispatch(saveDetailDoctorFailed());
      console.error(e);
    }
  };
};
// Fetch all schedule time
export const fetchAllScheduleTime = () => {
  return async (dispatch: any) => {
    try {
      let res = await handleGetAllCode("TIME");
      if (res && res.errCode === 0) {
        dispatch(fetchAllScheduleTimeSuccess(res.data));
      } else {
        dispatch(fetchAllScheduleTimeFailed());
      }
    } catch (e) {
      dispatch(fetchAllScheduleTimeFailed());
      console.error(e);
    }
  };
};
// Fetch doctor price, payment, province
export const fetchRequiredDoctorInfo = () => {
  return async (dispatch: any) => {
    try {
      let resPrice = await handleGetAllCode("PRICE");
      let resPayment = await handleGetAllCode("PAYMENT");
      let resProvince = await handleGetAllCode("PROVINCE");
      if (
        resPrice &&
        resPrice.errCode === 0 &&
        resPayment &&
        resPayment.errCode === 0 &&
        resProvince &&
        resProvince.errCode === 0
      ) {
        let data = {
          resPrice: resPrice.data,
          resPayment: resPayment.data,
          resProvince: resProvince.data,
        };
        dispatch(fetchRequiredDoctorInfoSuccess(data));
      } else {
        dispatch(fetchRequiredDoctorInfoFailed());
      }
    } catch (e) {
      dispatch(fetchRequiredDoctorInfoFailed());
      console.error(e);
    }
  };
};
// Save doctor services
export const saveDoctorServices = (data: any) => {
  return async (dispatch: any) => {
    try {
      let res = await saveBulkDoctor(data);
      if (res && res.errCode === 0) {
        dispatch(saveDoctorServicesSuccess());
      } else {
        dispatch(saveDoctorServicesFailed());
      }
    } catch (e) {
      dispatch(saveDoctorServicesFailed());
    }
  };
};
// Fetch doctor services
export const fetchDoctorServices = (doctorId: number | string) => {
  return async (dispatch: any) => {
    try {
      let res = await getAllDoctorService(doctorId);
      if (res && res.errCode === 0) {
        dispatch(fetchDoctorServicesSuccess(res.data));
      } else {
        dispatch(fetchDoctorServicesFailed());
      }
    } catch (e) {
      dispatch(fetchDoctorServicesFailed());
      console.error(e);
    }
  };
};
export const fetchGenderStart = () => {
  return async (dispatch: any) => {
    try {
      dispatch(fetchGenderStartAction());
      let res = await handleGetAllCode("GENDER");
      if (res && (res.success || res.errCode === 0)) {
        dispatch(fetchGenderSuccess(res.data));
      } else {
        dispatch(fetchGenderFailed());
      }
    } catch (e) {
      dispatch(fetchGenderFailed());
      console.error(e);
    }
  };
};

export const fetchPositionStart = () => {
  return async (dispatch: any) => {
    try {
      let res = await handleGetAllCode("POSITION");
      if (res && (res.success || res.errCode === 0)) {
        dispatch(fetchPositionSuccess(res.data));
      } else {
        dispatch(fetchPositionFailed());
      }
    } catch (e) {
      dispatch(fetchPositionFailed());
      console.error(e);
    }
  };
};

export const fetchRoleStart = () => {
  return async (dispatch: any) => {
    try {
      let res = await handleGetAllCode("ROLE");
      if (res && (res.success || res.errCode === 0)) {
        dispatch(fetchRoleSuccess(res.data));
      } else {
        dispatch(fetchRoleFailed());
      }
    } catch (e) {
      dispatch(fetchRoleFailed());
      console.error(e);
    }
  };
};

