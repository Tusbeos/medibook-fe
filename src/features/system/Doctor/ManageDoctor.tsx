import React, {
  useState,
  useEffect,
  useRef,
  useCallback,
  useMemo,
} from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import "./ManageDoctor.scss";
import "@fortawesome/fontawesome-free/css/all.min.css";
import MarkdownIt from "markdown-it";
import MdEditor from "react-markdown-editor-lite";
import "react-markdown-editor-lite/lib/index.css";
import Select from "react-select";
import { CRUD_ACTIONS, LANGUAGES } from "utils";
import { FormattedMessage, useIntl } from "react-intl";
import DoctorServices from "./DoctorServices";
import { DataState } from "components/System/SystemShared";
import { IRootState } from "../../../types";
import { toast } from "react-toastify";
import CommonUtils, {
  getBase64FromBuffer,
  generateMedibookEmail,
} from "../../../utils/CommonUtils";
import {
  type DoctorsPaginatedArgs,
  useCreateUserMutation,
  useDeleteUserMutation,
  useGetAllCodeQuery,
  useGetAllDoctorsQuery,
  useGetClinicsQuery,
  useGetDoctorByIdQuery,
  useGetDoctorsPaginatedQuery,
  useGetDoctorSpecialtiesQuery,
  useGetSpecialtiesQuery,
  useLazyGenerateUserEmailQuery,
  useSaveDoctorInfoMutation,
  useSaveDoctorServicesMutation,
  useUpdateUserMutation,
} from "../../../store/api/publicApi";

const mdParser = new MarkdownIt();

const getResponseList = (response: any) =>
  response?.errCode === 0 && Array.isArray(response.data) ? response.data : [];

interface ManageDoctorProps {
  initialMode?: "list" | "create" | "edit";
}

const ManageDoctor: React.FC<ManageDoctorProps> = ({
  initialMode = "list",
}) => {
  const navigate = useNavigate();
  const { doctorId } = useParams<{ doctorId: string }>();
  const intl = useIntl();
  const language = useSelector((state: IRootState) => state.app.language);
  const {
    data: doctorsResponse,
    isLoading: isLoadingDoctors,
    isError: isDoctorsError,
    refetch: refetchDoctors,
  } = useGetAllDoctorsQuery();
  const {
    data: specialtiesResponse,
    isLoading: isLoadingSpecialties,
    isError: isSpecialtiesError,
    refetch: refetchSpecialties,
  } = useGetSpecialtiesQuery();
  const {
    data: clinicsResponse,
    isLoading: isLoadingClinics,
    isError: isClinicsError,
    refetch: refetchClinics,
  } = useGetClinicsQuery();
  const {
    data: pricesResponse,
    isLoading: isLoadingPrices,
    isError: isPricesError,
    refetch: refetchPrices,
  } = useGetAllCodeQuery("PRICE");
  const {
    data: paymentsResponse,
    isLoading: isLoadingPayments,
    isError: isPaymentsError,
    refetch: refetchPayments,
  } = useGetAllCodeQuery("PAYMENT");
  const {
    data: provincesResponse,
    isLoading: isLoadingProvinces,
    isError: isProvincesError,
    refetch: refetchProvinces,
  } = useGetAllCodeQuery("PROVINCE");
  const {
    data: gendersResponse,
    isLoading: isLoadingGenders,
    isError: isGendersError,
    refetch: refetchGenders,
  } = useGetAllCodeQuery("GENDER");
  const {
    data: positionsResponse,
    isLoading: isLoadingPositions,
    isError: isPositionsError,
    refetch: refetchPositions,
  } = useGetAllCodeQuery("POSITION");
  const [generateUserEmail] = useLazyGenerateUserEmailQuery();
  const [createUser] = useCreateUserMutation();
  const [updateUser] = useUpdateUserMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [saveDoctorInfo] = useSaveDoctorInfoMutation();
  const [saveDoctorServices] = useSaveDoctorServicesMutation();

  // View mode from URL
  const [viewMode, setViewMode] = useState<"list" | "edit" | "create">(
    initialMode,
  );

  // Sync viewMode when initialMode changes (route change)
  useEffect(() => {
    setViewMode(initialMode);
  }, [initialMode]);

  const serviceRef = useRef<any>(null);

  // form state
  const [contentHTML, setContentHTML] = useState("");
  const [contentMarkdown, setContentMarkdown] = useState("");
  const [description, setDescription] = useState("");
  const [selectedOption, setSelectedOption] = useState<any>(null);
  const [hasOldData, setHasOldData] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterSpecialty, setFilterSpecialty] = useState("");
  const [filterClinic, setFilterClinic] = useState("");
  const selectedDoctorId =
    selectedOption?.value || (viewMode === "edit" ? doctorId || "" : "");
  const {
    currentData: doctorDetailResponse,
    isLoading: isLoadingDoctorDetail,
    isFetching: isFetchingDoctorDetail,
    isError: isDoctorDetailError,
    refetch: refetchDoctorDetail,
  } = useGetDoctorByIdQuery(selectedDoctorId, {
    skip: !selectedDoctorId,
  });
  const {
    currentData: doctorSpecialtiesResponse,
    isLoading: isLoadingDoctorSpecialties,
    isFetching: isFetchingDoctorSpecialties,
    isError: isDoctorSpecialtiesError,
    refetch: refetchDoctorSpecialties,
  } = useGetDoctorSpecialtiesQuery(selectedDoctorId, {
    skip: !selectedDoctorId,
  });

  // Create User States
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newPhoneNumber, setNewPhoneNumber] = useState("");
  const [newAddress, setNewAddress] = useState("");
  const [newGender, setNewGender] = useState("M");
  const [newPosition, setNewPosition] = useState("P0");
  const [newAvatar, setNewAvatar] = useState("");
  const [newAvatarPreview, setNewAvatarPreview] = useState("");

  // Auto-generate email for R2 doctor: lastName+firstName@medibook.com
  useEffect(() => {
    if (!newFirstName && !newLastName) {
      setNewEmail("");
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await generateUserEmail({
          firstName: newFirstName,
          lastName: newLastName,
          role: "R2",
        }).unwrap();
        if (res?.errCode === 0 && res.data) {
          setNewEmail(res.data);
        }
      } catch {
        setNewEmail(generateMedibookEmail(newFirstName, newLastName));
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [generateUserEmail, newFirstName, newLastName]);

  // Edit Profile States
  const [activeEditMenu, setActiveEditMenu] = useState<string | null>(null);
  const [showEditProfileModal, setShowEditProfileModal] = useState(false);
  const [editProfileData, setEditProfileData] = useState<any>(null);

  // Pagination & Filter States
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedArgs, setPaginatedArgs] = useState<DoctorsPaginatedArgs>({
    page: 1,
    limit: 10,
    search: "",
    specialty: "",
    clinic: "",
  });
  const {
    currentData: paginatedDoctorsResponse,
    isLoading: isLoadingPaginatedDoctors,
    isFetching: isFetchingPaginatedDoctors,
    isError: isPaginatedDoctorsError,
    refetch: refetchPaginatedDoctors,
  } = useGetDoctorsPaginatedQuery(paginatedArgs, {
    skip: viewMode !== "list",
  });

  // select options
  const [selectedPrice, setSelectedPrice] = useState<any>(null);
  const [selectedPayment, setSelectedPayment] = useState<any>(null);
  const [selectedProvince, setSelectedProvince] = useState<any>(null);
  const [nameClinic, setNameClinic] = useState("");
  const [addressClinic, setAddressClinic] = useState("");
  const [note, setNote] = useState("");
  const [selectedSpecialty, setSelectedSpecialty] = useState<any[]>([]);
  const [selectedClinic, setSelectedClinic] = useState<any>(null);

  const buildDataClinicSelect = useCallback((inputData: any[] = []) => {
    return inputData
      .filter((item) => item && item.id && item.name)
      .map((item) => ({
        label: item.name,
        value: item.id,
        address: item.address || "",
      }));
  }, []);

  const buildDataSpecialtySelect = useCallback((inputData: any[] = []) => {
    return inputData
      .filter((item) => item && item.id && item.name)
      .map((item) => ({
        label: item.name,
        value: item.id,
      }));
  }, []);

  const buildDataInputSelect = useCallback(
    (inputData: any, type: string) => {
      if (!inputData) return [];
      return inputData.map((item: any) => {
        let label = "";
        let objectValue = "";
        if (type === "USERS") {
          const labelVi = `${item.lastName ?? ""} ${item.firstName ?? ""}`;
          const labelEn = `${item.firstName ?? ""} ${item.lastName ?? ""}`;
          label = language === LANGUAGES.VI ? labelVi : labelEn;
          objectValue = item.id;
        } else {
          label = language === LANGUAGES.VI ? item.valueVi : item.valueEn;
          objectValue = item.keyMap;
        }
        return {
          label: label ? label.trim() : "",
          value: objectValue,
          raw: item,
        };
      });
    },
    [language],
  );

  const listDoctors = useMemo(
    () => buildDataInputSelect(getResponseList(doctorsResponse), "USERS"),
    [buildDataInputSelect, doctorsResponse],
  );
  const listSpecialty = useMemo(
    () => buildDataSpecialtySelect(getResponseList(specialtiesResponse)),
    [buildDataSpecialtySelect, specialtiesResponse],
  );
  const listClinic = useMemo(
    () => buildDataClinicSelect(getResponseList(clinicsResponse)),
    [buildDataClinicSelect, clinicsResponse],
  );
  const listPrice = useMemo(
    () => buildDataInputSelect(getResponseList(pricesResponse), "PRICE"),
    [buildDataInputSelect, pricesResponse],
  );
  const listPayment = useMemo(
    () => buildDataInputSelect(getResponseList(paymentsResponse), "PAYMENT"),
    [buildDataInputSelect, paymentsResponse],
  );
  const listProvince = useMemo(
    () => buildDataInputSelect(getResponseList(provincesResponse), "PROVINCE"),
    [buildDataInputSelect, provincesResponse],
  );
  const genderRedux = useMemo(
    () => getResponseList(gendersResponse),
    [gendersResponse],
  );
  const positionRedux = useMemo(
    () => getResponseList(positionsResponse),
    [positionsResponse],
  );
  const isReferenceDataLoading =
    isLoadingDoctors ||
    isLoadingSpecialties ||
    isLoadingClinics ||
    isLoadingPrices ||
    isLoadingPayments ||
    isLoadingProvinces ||
    isLoadingGenders ||
    isLoadingPositions ||
    isLoadingDoctorDetail ||
    isFetchingDoctorDetail ||
    isLoadingDoctorSpecialties ||
    isFetchingDoctorSpecialties;
  const isReferenceDataError =
    isDoctorsError ||
    isSpecialtiesError ||
    isClinicsError ||
    isPricesError ||
    isPaymentsError ||
    isProvincesError ||
    isGendersError ||
    isPositionsError ||
    isDoctorDetailError ||
    isDoctorSpecialtiesError;

  // Keep the existing 300 ms debounce while RTK Query owns the server request.
  useEffect(() => {
    const delay = setTimeout(() => {
      setPaginatedArgs({
        page: currentPage,
        limit: 10,
        search: searchQuery,
        specialty: filterSpecialty,
        clinic: filterClinic,
      });
    }, 300);
    return () => clearTimeout(delay);
  }, [
    currentPage,
    searchQuery,
    filterSpecialty,
    filterClinic,
  ]);

  const paginatedDoctors = useMemo(
    () =>
      buildDataInputSelect(
        paginatedDoctorsResponse?.errCode === 0
          ? paginatedDoctorsResponse.data?.doctors || []
          : [],
        "USERS",
      ),
    [buildDataInputSelect, paginatedDoctorsResponse],
  );
  const totalPages =
    paginatedDoctorsResponse?.errCode === 0
      ? paginatedDoctorsResponse.data?.totalPages || 0
      : 0;
  const totalElements =
    paginatedDoctorsResponse?.errCode === 0
      ? paginatedDoctorsResponse.data?.totalElements || 0
      : 0;
  const isPaginatedDoctorsPending =
    isLoadingPaginatedDoctors || isFetchingPaginatedDoctors;

  // Reset page to 1 when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterSpecialty, filterClinic]);

  // Sync default gender/position from Redux when they load
  useEffect(() => {
    if (genderRedux && genderRedux.length > 0 && !newGender) {
      setNewGender(genderRedux[0].keyMap);
    }
  }, [genderRedux]); // eslint-disable-line

  useEffect(() => {
    if (positionRedux && positionRedux.length > 0 && !newPosition) {
      setNewPosition(positionRedux[0].keyMap);
    }
  }, [positionRedux]); // eslint-disable-line

  const handleChangeSelectSpecialty = useCallback((value: any) => {
    setSelectedSpecialty(value || []);
  }, []);

  const handleChangeSelectClinic = useCallback((value: any) => {
    if (!value) return;
    setSelectedClinic(value);
    setNameClinic(value.label || "");
    setAddressClinic(value.address || "");
  }, []);

  const handleEditorChange = useCallback(
    ({ html, text }: { html: string; text: string }) => {
      setContentMarkdown(text);
      setContentHTML(html);
    },
    [],
  );

  useEffect(() => {
    if (viewMode !== "edit" || !doctorId || listDoctors.length === 0) return;
    const routeDoctor = listDoctors.find(
      (item) => String(item.value) === String(doctorId),
    );
    if (
      routeDoctor &&
      String(selectedOption?.value || "") !== String(routeDoctor.value)
    ) {
      setSelectedOption(routeDoctor);
    }
  }, [doctorId, listDoctors, selectedOption?.value, viewMode]);

  useEffect(() => {
    const res = doctorDetailResponse;
    const specialtyRes = doctorSpecialtiesResponse;
    if (res && res.errCode === 0 && res.data) {
      const data = res.data;
      let markdown = data.Markdown;
      let doctorInfo = data.DoctorInfo;
      let addrClinic = "",
        nmClinic = "",
        nt = "";
      let selPayment: any = null,
        selPrice: any = null,
        selProvince: any = null,
        selSpecialty: any[] = [],
        selClinic: any = null;
      let cHTML = "",
        cMarkdown = "",
        desc = "";
      let oldData = false;

      if (markdown) {
        cHTML = markdown.contentHTML;
        cMarkdown = markdown.contentMarkdown;
        desc = markdown.description;
        oldData = true;
      }

      if (doctorInfo) {
        addrClinic = doctorInfo.addressClinic;
        nmClinic = doctorInfo.nameClinic;
        nt = doctorInfo.note;
        oldData = true;
        selPayment = listPayment.find(
          (item) => item.value === doctorInfo.paymentId,
        );
        selPrice = listPrice.find((item) => item.value === doctorInfo.priceId);
        selProvince = listProvince.find(
          (item) => item.value === doctorInfo.provinceId,
        );
        if (doctorInfo.clinicId && Array.isArray(listClinic)) {
          selClinic = listClinic.find(
            (item) => item.value === doctorInfo.clinicId,
          );
          if (selClinic) {
            nmClinic = selClinic.label || nmClinic;
            addrClinic = selClinic.address || addrClinic;
          }
        }
        if (listSpecialty && listSpecialty.length > 0) {
          const apiSpecialtyIds =
            specialtyRes && specialtyRes.errCode === 0 ? specialtyRes.data : [];
          const normalizedIds = Array.isArray(apiSpecialtyIds)
            ? apiSpecialtyIds.map((id: any) => Number(id))
            : [];
          if (normalizedIds.length > 0) {
            selSpecialty = listSpecialty.filter((item) =>
              normalizedIds.includes(Number(item.value)),
            );
          }
        }
      }
      setContentHTML(cHTML);
      setContentMarkdown(cMarkdown);
      setDescription(desc);
      setHasOldData(oldData);
      setAddressClinic(addrClinic);
      setNameClinic(nmClinic);
      setNote(nt);
      setSelectedPayment(selPayment);
      setSelectedPrice(selPrice);
      setSelectedProvince(selProvince);
      setSelectedSpecialty(selSpecialty);
      setSelectedClinic(selClinic);
    } else if (isDoctorDetailError) {
      setContentHTML("");
      setContentMarkdown("");
      setDescription("");
      setHasOldData(false);
      setAddressClinic("");
      setNameClinic("");
      setNote("");
      setSelectedPayment(null);
      setSelectedPrice(null);
      setSelectedProvince(null);
      setSelectedSpecialty([]);
      setSelectedClinic(null);
    }
  }, [
    doctorDetailResponse,
    doctorSpecialtiesResponse,
    isDoctorDetailError,
    listClinic,
    listPayment,
    listPrice,
    listProvince,
    listSpecialty,
  ]);

  const handleChange = useCallback(
    (option: any) => {
      setSelectedOption(option);
    },
    [],
  );

  const handleChangeSelectDoctorInfo = useCallback((value: any, name: any) => {
    let nameState = name.name;
    switch (nameState) {
      case "selectedPrice":
        setSelectedPrice(value);
        break;
      case "selectedPayment":
        setSelectedPayment(value);
        break;
      case "selectedProvince":
        setSelectedProvince(value);
        break;
    }
  }, []);

  const handleSaveContentMarkDown = useCallback(async () => {
    if (!selectedOption)
      return alert(
        intl.formatMessage({ id: "menu.manage-doctor.error-selected-doctor" }),
      );
    if (!selectedPrice)
      return alert(
        intl.formatMessage({ id: "menu.manage-doctor.error-selected-price" }),
      );
    if (!selectedPayment)
      return alert(
        intl.formatMessage({ id: "menu.manage-doctor.error-selected-payment" }),
      );
    if (!selectedProvince)
      return alert(
        intl.formatMessage({
          id: "menu.manage-doctor.error-selected-province",
        }),
      );

    let arrDoctorService: any[] = [];
    if (serviceRef.current) {
      const childData = serviceRef.current.getDataFromChild();
      if (childData.isValid === false) return;
      arrDoctorService = childData.data;
    }

    try {
      const res = await saveDoctorInfo({
        contentHTML,
        contentMarkdown,
        description,
        doctorId: selectedOption.value,
        selectedPrice: selectedPrice.value,
        selectedPayment: selectedPayment.value,
        selectedProvince: selectedProvince.value,
        nameClinic,
        addressClinic,
        note,
        specialtyIds:
          selectedSpecialty && selectedSpecialty.length > 0
            ? selectedSpecialty.map((item) => item.value)
            : [],
        clinicId: selectedClinic ? selectedClinic.value : null,
        action: hasOldData === true ? CRUD_ACTIONS.EDIT : CRUD_ACTIONS.CREATE,
      }).unwrap();

      if (!res || res.errCode !== 0) {
        toast.error(res?.errMessage || "Lưu thông tin bác sĩ thất bại!");
        return;
      }

      if (arrDoctorService && arrDoctorService.length > 0) {
        const serviceRes = await saveDoctorServices({
          arrDoctorService,
          doctorId: selectedOption.value,
        }).unwrap();
        if (!serviceRes || serviceRes.errCode !== 0) {
          toast.error(
            serviceRes?.errMessage || "Lưu dịch vụ bác sĩ thất bại!",
          );
          return;
        }
      }

      toast.success("Lưu thông tin bác sĩ thành công!");
      navigate("/system/manage-doctor");
    } catch {
      toast.error("Lưu thông tin bác sĩ thất bại!");
    }
  }, [
    intl,
    navigate,
    selectedOption,
    selectedPrice,
    selectedPayment,
    selectedProvince,
    contentHTML,
    contentMarkdown,
    description,
    nameClinic,
    addressClinic,
    note,
    selectedSpecialty,
    selectedClinic,
    hasOldData,
    saveDoctorInfo,
    saveDoctorServices,
  ]);

  const handleOnChangeText = useCallback(
    (
      event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      id: string,
    ) => {
      const value = event.target.value;
      switch (id) {
        case "description":
          setDescription(value);
          break;
        case "nameClinic":
          setNameClinic(value);
          break;
        case "addressClinic":
          setAddressClinic(value);
          break;
        case "note":
          setNote(value);
          break;
      }
    },
    [],
  );

  const handleAddNew = () => {
    setSelectedOption(null);
    setContentHTML("");
    setContentMarkdown("");
    setDescription("");
    setHasOldData(false);
    setAddressClinic("");
    setNameClinic("");
    setNote("");
    setSelectedPayment(null);
    setSelectedPrice(null);
    setSelectedProvince(null);
    setSelectedSpecialty([]);
    setSelectedClinic(null);
    // Reset create form fields
    setNewEmail("");
    setNewPassword("");
    setNewFirstName("");
    setNewLastName("");
    setNewPhoneNumber("");
    setNewAddress("");
    setNewAvatar("");
    setNewAvatarPreview("");
    navigate("/system/manage-doctor/create");
  };

  const handleCreateDoctorUser = async () => {
    if (!newEmail || !newPassword || !newFirstName || !newLastName) {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }
    try {
      const res = await createUser({
        email: newEmail,
        password: newPassword,
        firstName: newFirstName,
        lastName: newLastName,
        address: newAddress,
        phoneNumber: newPhoneNumber,
        gender: newGender,
        roleId: "R2",
        positionId: newPosition,
        avatar: newAvatar,
      }).unwrap();
      if (res && res.errCode === 0) {
        toast.success("Tạo bác sĩ mới thành công!");
        navigate("/system/manage-doctor");
      } else {
        toast.error(res?.errMessage || "Lỗi khi tạo bác sĩ");
      }
    } catch {
      toast.error("Lỗi khi tạo bác sĩ");
    }
  };

  const handleOnchangeImage = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    let data = event.target.files;
    if (!data) return;
    let file = data[0];
    if (file) {
      let Base64 = await CommonUtils.getBase64(file);
      let objectUrl = URL.createObjectURL(file);
      setNewAvatarPreview(objectUrl);
      setNewAvatar(Base64);
    }
  };

  const handleEditDoctor = (doctorOpt: any) => {
    setActiveEditMenu(null);
    setSelectedOption(doctorOpt);
    navigate(`/system/manage-doctor/edit/${doctorOpt.value}`);
  };

  const toggleEditMenu = (id: string) => {
    if (activeEditMenu === id) setActiveEditMenu(null);
    else setActiveEditMenu(id);
  };

  const handleDeleteDoctor = async (doc: any) => {
    const doctorId = doc.raw?.id || doc.value;
    if (!doctorId) return;
    if (!window.confirm("Bạn có chắc chắn muốn xóa bác sĩ này?")) return;
    try {
      const res = await deleteUser(doctorId).unwrap();
      if (res?.errCode === 0) {
        toast.success("Xóa bác sĩ thành công!");
      } else {
        toast.error(res?.errMessage || "Xóa bác sĩ thất bại.");
      }
    } catch {
      toast.error("Xóa bác sĩ thất bại.");
    }
    setActiveEditMenu(null);
  };

  const handleOpenEditProfile = (doc: any) => {
    setActiveEditMenu(null);
    const raw = doc.raw;
    setEditProfileData({
      id: raw.id,
      email: raw.email,
      firstName: raw.firstName,
      lastName: raw.lastName,
      phoneNumber: raw.phoneNumber,
      address: raw.address,
      positionId: raw.positionId || "P0",
      gender: raw.gender || "M",
      roleId: raw.roleId || "R2",
      avatar: raw.image ? getBase64FromBuffer(raw.image) : "",
    });
    setShowEditProfileModal(true);
  };

  const handleSaveEditProfile = async () => {
    if (!editProfileData) return;
    if (!editProfileData.firstName || !editProfileData.lastName) {
      toast.error("Vui lòng nhập đầy đủ họ và tên!");
      return;
    }

    const payload: any = {
      id: editProfileData.id,
      firstName: editProfileData.firstName,
      lastName: editProfileData.lastName,
      phoneNumber: editProfileData.phoneNumber,
      address: editProfileData.address,
      positionId: editProfileData.positionId,
      gender: editProfileData.gender,
      roleId: editProfileData.roleId,
    };

    // Chỉ gửi avatar nếu người dùng thực sự upload ảnh mới (Base64 string)
    if (editProfileData.avatarPreview) {
      payload.avatar = editProfileData.avatar;
    }

    try {
      const res = await updateUser(payload).unwrap();
      if (res && res.errCode === 0) {
        toast.success("Cập nhật thông tin bác sĩ thành công!");
        setShowEditProfileModal(false);
        setEditProfileData(null);
      } else {
        toast.error(res?.errMessage || "Cập nhật thất bại, vui lòng thử lại!");
      }
    } catch (error: any) {
      toast.error(
        error?.response?.data?.message || "Lỗi hệ thống: Cập nhật thất bại!",
      );
    }
  };

  const handleOnchangeEditImage = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    let data = event.target.files;
    if (!data) return;
    let file = data[0];
    if (file) {
      let Base64 = await CommonUtils.getBase64(file);
      let objectUrl = URL.createObjectURL(file);
      setEditProfileData((prev: any) => ({
        ...prev,
        avatar: Base64,
        avatarPreview: objectUrl,
      }));
    }
  };

  // Derive unique specialty & clinic options from loaded doctors
  const specialtyOptions = Array.from(
    new Set(listDoctors.map((d) => d.raw?.specialtyName).filter(Boolean)),
  ) as string[];

  const clinicOptions = Array.from(
    new Set(listDoctors.map((d) => d.raw?.clinicName).filter(Boolean)),
  ) as string[];

  // Render logic for pagination array
  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  };

  const referenceDataStatus = isReferenceDataLoading ? (
    <DataState
      variant="loading"
      text="Đang tải dữ liệu bác sĩ..."
      compact
    />
  ) : isReferenceDataError ? (
    <DataState
      variant="error"
      text="Không thể tải đầy đủ dữ liệu bác sĩ."
      onRetry={() => {
        void refetchDoctors();
        void refetchSpecialties();
        void refetchClinics();
        void refetchPrices();
        void refetchPayments();
        void refetchProvinces();
        void refetchGenders();
        void refetchPositions();
        if (selectedDoctorId) {
          void refetchDoctorDetail();
          void refetchDoctorSpecialties();
        }
      }}
      compact
    />
  ) : null;

  if (viewMode === "create") {
    return (
      <div className="create-doctor-wrapper">
        <div className="create-header">
          <div className="title-area">
            <h1>Tạo mới tài khoản Bác sĩ</h1>
            <p>
              Create a new medical professional account to access the system.
            </p>
          </div>
          <button
            className="btn-cancel-top"
            onClick={() => navigate("/system/manage-doctor")}
          >
            Hủy
          </button>
        </div>

        {referenceDataStatus}

        <div className="create-form-card">
          <h2 className="card-title">Thông tin cá nhân</h2>

          <div className="form-grid">
            <div className="form-group">
              <label>Email</label>
              <span className="auto-generated-email">
                {newEmail || <em>Tự động tạo từ họ tên</em>}
              </span>
            </div>
            <div className="form-group">
              <label>
                Mật khẩu <span className="required">*</span>
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>
                Tên <span className="required">*</span>
              </label>
              <input
                type="text"
                placeholder="Văn A"
                value={newFirstName}
                onChange={(e) => setNewFirstName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>
                Họ <span className="required">*</span>
              </label>
              <input
                type="text"
                placeholder="Nguyễn"
                value={newLastName}
                onChange={(e) => setNewLastName(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label>Số điện thoại</label>
              <input
                type="text"
                placeholder="0901 234 567"
                value={newPhoneNumber}
                onChange={(e) => setNewPhoneNumber(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label>Địa chỉ</label>
              <input
                type="text"
                placeholder="123 Đường Y Khoa, Quận 1, TP.HCM"
                value={newAddress}
                onChange={(e) => setNewAddress(e.target.value)}
              />
            </div>
          </div>

          <div className="form-bottom-grid">
            <div className="selects-column">
              <div className="form-group">
                <label>Giới tính</label>
                <div className="select-wrapper">
                  <select
                    value={newGender}
                    onChange={(e) => setNewGender(e.target.value)}
                  >
                    {genderRedux && genderRedux.length > 0 ? (
                      genderRedux.map((item: any, idx: number) => (
                        <option key={idx} value={item.keyMap}>
                          {language === LANGUAGES.VI
                            ? item.valueVi
                            : item.valueEn}
                        </option>
                      ))
                    ) : (
                      <option value="">Đang tải...</option>
                    )}
                  </select>
                </div>
              </div>
              <div className="form-group">
                <label>Chức danh</label>
                <div className="select-wrapper">
                  <select
                    value={newPosition}
                    onChange={(e) => setNewPosition(e.target.value)}
                  >
                    {positionRedux && positionRedux.length > 0 ? (
                      positionRedux.map((item: any, idx: number) => (
                        <option key={idx} value={item.keyMap}>
                          {language === LANGUAGES.VI
                            ? item.valueVi
                            : item.valueEn}
                        </option>
                      ))
                    ) : (
                      <option value="">Đang tải...</option>
                    )}
                  </select>
                </div>
              </div>
            </div>

            <div className="avatar-column">
              <label>Ảnh đại diện</label>
              <div
                className="upload-box"
                style={{
                  backgroundImage: newAvatarPreview
                    ? `url(${newAvatarPreview})`
                    : "none",
                }}
                onClick={() =>
                  document.getElementById("previewImgCreate")?.click()
                }
              >
                <input
                  id="previewImgCreate"
                  type="file"
                  hidden
                  onChange={handleOnchangeImage}
                />
                {!newAvatarPreview && (
                  <div className="upload-placeholder">
                    <div className="icon-circle">
                      <i className="fas fa-cloud-upload-alt"></i>
                    </div>
                    <span className="upload-text">Tải ảnh lên</span>
                    <span className="upload-hint">PNG, JPG tối đa 5MB</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="form-actions">
            <button
              className="btn-cancel"
              onClick={() => navigate("/system/manage-doctor")}
            >
              Hủy
            </button>
            <button className="btn-submit" onClick={handleCreateDoctorUser}>
              Tạo tài khoản
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (viewMode === "list") {
    return (
      <div className="manage-doctor-list-container">
        <div className="header-section">
          <div className="title-area">
            <h1>Danh sách bác sĩ</h1>
            <p>
              Quản lý {listDoctors.length} bác sĩ đang hoạt động tại{" "}
              {listClinic.length || 8} cơ sở y tế.
            </p>
          </div>
          <button className="btn-add-new" onClick={handleAddNew}>
            <i className="fas fa-plus"></i> Thêm bác sĩ
          </button>
        </div>

        {referenceDataStatus}

        <div className="stats-cards-container">
          <div className="stat-card">
            <div className="card-top">
              <div className="card-info">
                <span className="label">TỔNG BÁC SĨ</span>
                <span className="value">{listDoctors.length}</span>
              </div>
              <div className="card-icon">
                <i className="fas fa-user-friends"></i>
              </div>
            </div>
            <div className="card-bottom">
              <span className="badge-growth">+4 tháng này</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="card-top">
              <div className="card-info">
                <span className="label">NGHỈ PHÉP</span>
                <span className="value">12</span>
              </div>
              <div className="card-icon red">
                <i className="far fa-calendar-times"></i>
              </div>
            </div>
            <div className="card-bottom progress">
              <div className="progress-bar">
                <div className="fill" style={{ width: "20%" }}></div>
              </div>
            </div>
          </div>
          <div className="stat-card">
            <div className="card-top">
              <div className="card-info">
                <span className="label">KINH NGHIỆM TB</span>
                <span className="value">
                  8.4 <span className="unit">năm</span>
                </span>
              </div>
              <div className="card-icon purple">
                <i className="fas fa-star"></i>
              </div>
            </div>
            <div className="card-bottom text">
              <span>Đỉnh cao chuyên môn</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="card-top">
              <div className="card-info">
                <span className="label">TẢI TB</span>
                <span className="value">
                  82<span className="unit">%</span>
                </span>
              </div>
              <div className="card-icon blue">
                <i className="fas fa-chart-line"></i>
              </div>
            </div>
            <div className="card-bottom progress">
              <div className="progress-bar">
                <div className="fill blue" style={{ width: "82%" }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="table-controls">
          <div className="filters">
            <input
              type="text"
              className="filter-select search-input"
              placeholder="Tìm kiếm tên bác sĩ..."
              style={{ width: "250px" }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <select
              className="filter-select"
              value={filterSpecialty}
              onChange={(e) => setFilterSpecialty(e.target.value)}
            >
              <option value="">Tất cả chuyên khoa</option>
              {specialtyOptions.map((s, i) => (
                <option key={i} value={s}>
                  {s}
                </option>
              ))}
            </select>
            <select
              className="filter-select"
              value={filterClinic}
              onChange={(e) => setFilterClinic(e.target.value)}
            >
              <option value="">Tất cả cơ sở</option>
              {clinicOptions.map((c, i) => (
                <option key={i} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="doctor-table-wrapper">
          <table className="doctor-table">
            <thead>
              <tr>
                <th>TÊN BÁC SĨ</th>
                <th>CHUYÊN KHOA</th>
                <th>CƠ SỞ</th>
                <th>TRẠNG THÁI</th>
                <th>THAO TÁC</th>
              </tr>
            </thead>
            <tbody>
              {isPaginatedDoctorsPending ? (
                <tr>
                  <td colSpan={5}>
                    <DataState
                      variant="loading"
                      text="Đang tải danh sách bác sĩ..."
                    />
                  </td>
                </tr>
              ) : isPaginatedDoctorsError ? (
                <tr>
                  <td colSpan={5}>
                    <DataState
                      variant="error"
                      text="Không thể tải danh sách bác sĩ."
                      onRetry={() => void refetchPaginatedDoctors()}
                    />
                  </td>
                </tr>
              ) : paginatedDoctors.length > 0 ? (
                paginatedDoctors.map((doc, idx) => (
                  <tr key={idx}>
                    <td>
                      <div className="doc-profile">
                        <img
                          src={
                            doc.raw?.image
                              ? getBase64FromBuffer(doc.raw.image)
                              : "https://i.pravatar.cc/150?img=" +
                                ((idx % 70) + 1)
                          }
                          alt="doc"
                          className="doc-avatar"
                        />
                        <div className="doc-info">
                          <span className="doc-name">{doc.label}</span>
                          <span className="doc-id">
                            ID: DOC-{doc.value + 1000}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span className="text-secondary">
                        {doc.raw?.specialtyName || "Chưa có"}
                      </span>
                    </td>
                    <td>
                      <span className="text-secondary">
                        {doc.raw?.clinicName || "Chưa có"}
                      </span>
                    </td>
                    <td>
                      {(() => {
                        const status = doc.raw?.statusData;
                        if (!status)
                          return (
                            <span className="badge-pill green">
                              <i className="fas fa-circle"></i> Hoạt động
                            </span>
                          );
                        const colorMap: Record<string, string> = {
                          SD1: "orange",
                          SD2: "green",
                          SD3: "gray",
                          SD4: "blue",
                          SD5: "red",
                        };
                        const color = colorMap[status.keyMap] || "gray";
                        return (
                          <span className={`badge-pill ${color}`}>
                            <i className="fas fa-circle"></i> {status.valueEn}
                          </span>
                        );
                      })()}
                    </td>
                    <td className="action-cell">
                      <div className="dropdown-action">
                        <button
                          className="btn-edit"
                          onClick={() => toggleEditMenu(doc.value)}
                        >
                          Sửa{" "}
                          <i className="fas fa-chevron-down ms-1 icon-chevron"></i>
                        </button>
                        {activeEditMenu === doc.value && (
                          <div className="dropdown-menu-action">
                            <div
                              className="dropdown-item"
                              onClick={() => handleOpenEditProfile(doc)}
                            >
                              <i className="far fa-edit"></i>
                              <span>Cập nhật bác sĩ</span>
                            </div>
                            <div
                              className="dropdown-item"
                              onClick={() => handleEditDoctor(doc)}
                            >
                              <i className="fas fa-user-edit"></i>
                              <span>Cập nhật thông tin bác sĩ</span>
                            </div>
                            <div
                              className="dropdown-item dropdown-item-danger"
                              onClick={() => handleDeleteDoctor(doc)}
                            >
                              <i className="fas fa-trash-alt"></i>
                              <span>Xóa bác sĩ</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5}>
                    <DataState
                      variant="empty"
                      text={
                        searchQuery || filterSpecialty || filterClinic
                          ? "Không có bác sĩ phù hợp với bộ lọc."
                          : "Chưa có bác sĩ nào."
                      }
                    />
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="pagination">
          <span className="info">
            Hiển thị{" "}
            <b>
              {totalElements === 0 ? 0 : (currentPage - 1) * 10 + 1}-
              {Math.min(currentPage * 10, totalElements)}
            </b>{" "}
            trên <b>{totalElements}</b> bác sĩ
          </span>
          <div className="page-numbers">
            <button
              className="btn-page"
              disabled={isPaginatedDoctorsPending || currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            >
              <i className="fas fa-chevron-left"></i>
            </button>
            {getPageNumbers().map((p) => (
              <button
                key={p}
                className={`btn-page ${p === currentPage ? "active" : ""}`}
                onClick={() => setCurrentPage(p)}
              >
                {p}
              </button>
            ))}
            <button
              className="btn-page"
              disabled={
                isPaginatedDoctorsPending ||
                currentPage === totalPages ||
                totalPages === 0
              }
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            >
              <i className="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>

        {/* Edit Profile Modal */}
        {showEditProfileModal && editProfileData && (
          <div
            className="edit-profile-modal-overlay"
            onClick={() => setShowEditProfileModal(false)}
          >
            <div
              className="edit-profile-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h2>Chỉnh sửa hồ sơ bác sĩ</h2>
                <button
                  className="btn-close-modal"
                  onClick={() => setShowEditProfileModal(false)}
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              <div className="modal-body">
                <div className="avatar-section">
                  <div className="avatar-preview">
                    {editProfileData.avatarPreview || editProfileData.avatar ? (
                      <img
                        src={
                          editProfileData.avatarPreview ||
                          editProfileData.avatar
                        }
                        alt="avatar"
                      />
                    ) : (
                      <div className="avatar-placeholder">
                        <i className="fas fa-user-md"></i>
                      </div>
                    )}
                  </div>
                  <div className="avatar-info">
                    <h4>Ảnh đại diện</h4>
                    <p>JPG hoặc PNG. Tối đa 2MB.</p>
                    <label className="btn-upload">
                      Tải ảnh mới
                      <input
                        type="file"
                        hidden
                        onChange={handleOnchangeEditImage}
                      />
                    </label>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label>TÊN</label>
                    <input
                      type="text"
                      value={editProfileData.firstName}
                      onChange={(e) =>
                        setEditProfileData({
                          ...editProfileData,
                          firstName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>HỌ</label>
                    <input
                      type="text"
                      value={editProfileData.lastName}
                      onChange={(e) =>
                        setEditProfileData({
                          ...editProfileData,
                          lastName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="form-group">
                    <label>SỐ ĐIỆN THOẠI</label>
                    <div className="input-with-icon">
                      <i className="fas fa-phone"></i>
                      <input
                        type="text"
                        value={editProfileData.phoneNumber}
                        onChange={(e) =>
                          setEditProfileData({
                            ...editProfileData,
                            phoneNumber: e.target.value,
                          })
                        }
                      />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>CHỨC DANH</label>
                    <select
                      value={editProfileData.positionId}
                      onChange={(e) =>
                        setEditProfileData({
                          ...editProfileData,
                          positionId: e.target.value,
                        })
                      }
                    >
                      {positionRedux &&
                        positionRedux.length > 0 &&
                        positionRedux.map((item: any, idx: number) => (
                          <option key={idx} value={item.keyMap}>
                            {language === LANGUAGES.VI
                              ? item.valueVi
                              : item.valueEn}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>

                <div className="form-group full-width">
                  <label>ĐỊA CHỈ PHÒNG KHÁM</label>
                  <div className="input-with-icon">
                    <i className="fas fa-map-marker-alt"></i>
                    <input
                      type="text"
                      value={editProfileData.address}
                      onChange={(e) =>
                        setEditProfileData({
                          ...editProfileData,
                          address: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <span
                  className="btn-cancel-link"
                  onClick={() => setShowEditProfileModal(false)}
                >
                  Hủy
                </span>
                <button
                  className="btn-save-changes"
                  onClick={handleSaveEditProfile}
                >
                  <i className="fas fa-check-circle"></i> Lưu thay đổi
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="manage-doctor-form-container">
      <div className="form-header">
        <div className="title-area">
          <h1>
            {hasOldData
              ? "Chỉnh sửa thông tin bác sĩ"
              : "Thêm thông tin bác sĩ"}
          </h1>
          <p>Cấu hình hồ sơ lâm sàng và quản lý dịch vụ chuyên khoa.</p>
        </div>
        <button className="btn-preview">Xem trước hồ sơ</button>
      </div>

      {referenceDataStatus}

      <div className="form-content">
        {/* Block 1: General Info */}
        <div className="form-card">
          <div className="row">
            <div className="col-md-5 form-group">
              <label className="label-sm">CHỌN BÁC SĨ</label>
              <Select
                value={selectedOption}
                onChange={handleChange}
                options={listDoctors}
                placeholder="Chọn bác sĩ từ danh sách..."
                classNamePrefix="react-select"
              />
            </div>
          </div>
          <div className="row mt-3">
            <div className="col-md-8 form-group">
              <label className="label-sm">THÔNG TIN GIỚI THIỆU</label>
              <textarea
                className="form-control"
                rows={4}
                placeholder="Cung cấp thông tin giới thiệu ngắn gọn về bác sĩ bằng Markdown..."
                onChange={(event) => handleOnChangeText(event, "description")}
                value={description}
              ></textarea>
            </div>
          </div>
        </div>

        {/* Block 2: Professional Setting */}
        <div className="form-card has-border-left blue">
          <div className="card-title">Thiết lập chuyên môn & Quản trị</div>
          <div className="row">
            <div className="col-md-4 form-group">
              <label className="label-sm">GIÁ KHÁM (VND)</label>
              <Select
                value={selectedPrice}
                onChange={handleChangeSelectDoctorInfo}
                options={listPrice}
                name="selectedPrice"
                placeholder="0.00 VND"
                classNamePrefix="react-select"
              />
            </div>
            <div className="col-md-4 form-group">
              <label className="label-sm">PHƯƠNG THỨC THANH TOÁN</label>
              <Select
                value={selectedPayment}
                onChange={handleChangeSelectDoctorInfo}
                options={listPayment}
                name="selectedPayment"
                placeholder="Tiền mặt"
                classNamePrefix="react-select"
              />
            </div>
            <div className="col-md-4 form-group">
              <label className="label-sm">TỈNH / THÀNH PHỐ</label>
              <Select
                value={selectedProvince}
                onChange={handleChangeSelectDoctorInfo}
                options={listProvince}
                name="selectedProvince"
                placeholder="TP. Hồ Chí Minh"
                classNamePrefix="react-select"
              />
            </div>
          </div>
          <div className="row mt-3">
            <div className="col-md-8 form-group">
              <label className="label-sm">CHUYÊN KHOA (CHỌN NHIỀU)</label>
              <Select
                value={selectedSpecialty}
                onChange={handleChangeSelectSpecialty}
                options={listSpecialty}
                name="selectedSpecialty"
                isMulti
                placeholder="+ Thêm chuyên khoa"
                classNamePrefix="react-select"
              />
            </div>
            <div className="col-md-4 form-group">
              <label className="label-sm">CHỌN CƠ SỞ Y TẾ</label>
              <Select
                value={selectedClinic}
                onChange={handleChangeSelectClinic}
                options={listClinic}
                name="selectedClinic"
                placeholder="Chọn cơ sở y tế..."
                classNamePrefix="react-select"
              />
            </div>
          </div>
        </div>

        {/* Block 3: Clinic Details */}
        <div className="form-card has-border-left blue">
          <div className="card-title">Chi tiết tại phòng khám</div>
          <div className="row">
            <div className="col-md-6 form-group">
              <label className="label-sm">TÊN PHÒNG KHÁM</label>
              <input
                className="form-control"
                placeholder="Tên phòng khám"
                onChange={(event) => handleOnChangeText(event, "nameClinic")}
                value={nameClinic}
                disabled
              />
            </div>
          </div>
          <div className="row mt-3">
            <div className="col-md-6 form-group">
              <label className="label-sm">ĐỊA CHỈ</label>
              <input
                className="form-control"
                placeholder="Địa chỉ phòng khám..."
                onChange={(event) => handleOnChangeText(event, "addressClinic")}
                value={addressClinic}
                disabled
              />
            </div>
          </div>
          <div className="row mt-3">
            <div className="col-md-6 form-group">
              <label className="label-sm">GHI CHÚ</label>
              <textarea
                className="form-control"
                rows={3}
                placeholder="Hướng dẫn thêm hoặc ghi chú..."
                onChange={(event) => handleOnChangeText(event, "note")}
                value={note}
              />
            </div>
          </div>
        </div>

        {/* Block 4: Doctor Services */}
        <div className="form-card has-border-left red p-0 pb-3">
          <div className="card-title service-title-row">
            <span>QUẢN LÝ DANH SÁCH DỊCH VỤ KHÁM</span>
            <button
              className="btn-add-service-inline"
              onClick={() => {
                if (serviceRef.current && serviceRef.current.handleAddService) {
                  serviceRef.current.handleAddService();
                }
              }}
            >
              <i className="fas fa-plus"></i> Thêm dịch vụ
            </button>
          </div>
          <div className="service-list-container">
            {selectedOption ? (
              <DoctorServices
                ref={serviceRef}
                doctorIdFromParent={selectedOption.value}
              />
            ) : (
              <div className="p-4 text-center text-secondary">
                Vui lòng chọn bác sĩ để thêm dịch vụ
              </div>
            )}
          </div>
        </div>

        {/* Block 5: Markdown */}
        <div className="form-card has-border-left blue">
          <div className="card-title">Chi tiết bài viết</div>
          <div className="markdown-wrapper mt-3">
            <MdEditor
              value={contentMarkdown}
              style={{ height: "500px" }}
              renderHTML={(text) => mdParser.render(text)}
              onChange={handleEditorChange}
            />
          </div>
        </div>
      </div>

      <div className="form-footer-sticky">
        <div className="footer-left">
          <i className="fas fa-info-circle text-primary me-2"></i>
          <span>Last updated: Oct 24, 2023 by System Admin</span>
        </div>
        <div className="footer-right">
          <button
            className="btn-cancel"
            onClick={() => navigate("/system/manage-doctor")}
          >
            Hủy bỏ
          </button>
          <button className="btn-save" onClick={handleSaveContentMarkDown}>
            {hasOldData ? "Cập nhật thông tin" : "Lưu thông tin"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageDoctor;
