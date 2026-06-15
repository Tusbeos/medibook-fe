
import { publicApi } from "../store/api/publicApi";

export interface IApiResponse<T = any> {
  success?: boolean;
  errCode: number;
  errMessage?: string;
  message?: string;
  data?: T;
  users?: T;
  user?: T;
}

// Kiểu dữ liệu AllCode
export interface IAllCode {
  id?: number;
  keyMap?: string;
  type?: string;
  valueVi?: string;
  valueEn?: string;
}

// Kiểu dữ liệu User
export interface IUser {
  id?: number;
  userId?: number | string;
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  address?: string;
  phoneNumber?: string;
  gender?: string;
  roleId?: string;
  positionId?: string;
  image?: string | any;
  avatar?: any;
  positionData?: IAllCode;
  roleData?: IAllCode;
  genderData?: IAllCode;
  clinicId?: number;
  clinicName?: string;
  token?: string;
  refreshToken?: string;
}

// Kiểu dữ liệu Doctor Info
export interface IDoctorInfo {
  doctorId?: number;
  priceId?: string;
  paymentId?: string;
  provinceId?: string;
  nameClinic?: string;
  addressClinic?: string;
  note?: string;
  clinicId?: number;
  priceTypeData?: IAllCode;
  paymentTypeData?: IAllCode;
  provinceTypeData?: IAllCode;
}

// Kiểu dữ liệu Markdown
export interface IMarkdown {
  id?: number;
  contentHTML?: string;
  contentMarkdown?: string;
  description?: string;
  doctorId?: number;
  specialtyId?: number;
}

// Kiểu dữ liệu Doctor Detail
export interface IDetailDoctor extends IUser {
  Markdown?: IMarkdown;
  DoctorInfo?: IDoctorInfo;
}

// Kiểu dữ liệu Schedule / Time Booking
export interface ITimeBooking {
  id?: number;
  currentNumber?: number;
  maxNumber?: number;
  date?: string | number;
  timeType?: string;
  doctorId?: number;
  timeTypeData?: IAllCode;
}

// Kiểu dữ liệu Booking
export interface IBookingData {
  fullName?: string;
  lastName?: string;
  firstName?: string;
  gender?: string;
  phoneNumber?: string;
  email?: string;
  date?: string | number;
  birthday?: string | number;
  address?: string;
  reason?: string;
  doctorId?: string | number;
  timeType?: string;
  language?: string;
  timeString?: string;
  doctorName?: string;
  // Đặt hộ cho người khác
  isForOther?: boolean;
  profileFirstName?: string;
  profileLastName?: string;
  profilePhoneNumber?: string;
  profileGender?: string;
  profileDateOfBirth?: string;
  profileAddress?: string;
  relationship?: string;
  medicalHistory?: string;
}

// Kiểu dữ liệu Specialty
export interface ISpecialty {
  id?: number;
  name?: string;
  image?: string | any;
  descriptionHTML?: string;
  descriptionMarkdown?: string;
}

// Kiểu dữ liệu Doctor Specialty
export interface IDoctorSpecialty {
  doctorId?: number;
  specialtyId?: number;
}

// Kiểu dữ liệu Clinic
export interface IClinic {
  id?: number;
  name?: string;
  address?: string;
  image?: string | any;
  imageCover?: string | any;
  descriptionHTML?: string;
  descriptionMarkdown?: string;
}

// Kiểu dữ liệu Doctor Service
export interface IDoctorService {
  id?: number;
  doctorId?: number;
  nameVi?: string;
  nameEn?: string;
  price?: number;
  descriptionVi?: string;
  descriptionEn?: string;
}

// Kiểu dữ liệu Patient Booking
export interface IPatientBooking {
  id?: number;
  statusId?: string;
  doctorId?: number;
  patientId?: number;
  date?: string | number;
  timeType?: string;
  token?: string;
  patientData?: IUser;
  bookingTimeTypeData?: IAllCode;
}

// =============================
// Redux State Types
// =============================

export interface IAppState {
  started: boolean;
  language: string;
  systemMenuPath: string;
  contentOfConfirmModal: {
    isOpen: boolean;
    messageId: string;
    handleFunc: ((...args: any[]) => void) | null;
    dataFunc: any;
  };
}

export interface IUserState {
  isLoggedIn: boolean;
  userInfo: IUser | null;
  token: string | null;
}

export interface IAdminState {
  isLoadingGender: boolean;
  genders: IAllCode[];
  role: IAllCode[];
  position: IAllCode[];
  users: IUser[];
  topDoctors: IDetailDoctor[];
  allDoctors: IDetailDoctor[];
  allScheduleTime: IAllCode[];
  allRequiredDoctorInfo: {
    resPrice?: IAllCode[];
    resPayment?: IAllCode[];
    resProvince?: IAllCode[];
  };
  allDoctorServices: IDoctorService[];
}

export interface IRootState {
  user: IUserState;
  app: IAppState;
  admin: IAdminState;
  [publicApi.reducerPath]: ReturnType<typeof publicApi.reducer>;
}

// =============================
// Menu Types
// =============================

export interface ISubMenu {
  name: string;
  link: string;
}

export interface IMenu {
  name: string;
  link?: string;
  subMenus?: ISubMenu[];
}

export interface IMenuGroup {
  name: string;
  menus?: IMenu[];
}
