import React, {
  useState,
  useEffect,
  useCallback,
  useImperativeHandle,
  forwardRef,
} from "react";
import "./DoctorServices.scss";
import { toast } from "react-toastify";
import { useGetDoctorServicesQuery } from "../../../store/api/publicApi";
import { DataState } from "components/System/SystemShared";

interface IDoctorServiceItem {
  nameVi: string;
  nameEn: string;
  price: string;
  descriptionVi: string;
  descriptionEn: string;
}

interface IDoctorServicesProps {
  doctorIdFromParent: number | string;
}

const emptyRow: IDoctorServiceItem = {
  nameVi: "",
  nameEn: "",
  price: "",
  descriptionVi: "",
  descriptionEn: "",
};

const DoctorServices = forwardRef<any, IDoctorServicesProps>(
  ({ doctorIdFromParent }, ref) => {
    const [arrServices, setArrServices] = useState<IDoctorServiceItem[]>([
      { ...emptyRow },
    ]);

    const {
      data: servicesResponse,
      isLoading,
      isFetching,
      isError,
      refetch,
    } = useGetDoctorServicesQuery(doctorIdFromParent, {
      skip: !doctorIdFromParent,
    });

    // Lấy dữ liệu dịch vụ khi mount hoặc khi doctorId thay đổi
    useEffect(() => {
      if (!doctorIdFromParent) {
        setArrServices([{ ...emptyRow }]);
        return;
      }

      if (!servicesResponse) return;

      if (
        servicesResponse.errCode === 0 &&
        Array.isArray(servicesResponse.data) &&
        servicesResponse.data.length > 0
      ) {
        setArrServices(servicesResponse.data);
      } else {
        setArrServices([{ ...emptyRow }]);
      }
    }, [doctorIdFromParent, servicesResponse]);

    const handleOnChangeInput = useCallback(
      (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        index: number,
        key: string,
      ) => {
        setArrServices((prev) => {
          const data = [...prev];
          data[index] = { ...data[index], [key]: event.target.value };
          return data;
        });
      },
      [],
    );

    const handleAddNewRow = useCallback(() => {
      setArrServices((prev) => [...prev, { ...emptyRow }]);
    }, []);

    const handleRemoveRow = useCallback((index: number) => {
      setArrServices((prev) => {
        if (prev.length === 1) {
          return [{ ...emptyRow }];
        }
        const data = [...prev];
        data.splice(index, 1);
        return data;
      });
    }, []);

    // Expose getDataFromChild cho parent component thông qua ref
    useImperativeHandle(
      ref,
      () => ({
        getDataFromChild: () => {
          let isValid = true;
          for (let i = 0; i < arrServices.length; i++) {
            if (arrServices[i].nameVi && !arrServices[i].price) {
              isValid = false;
              toast.error(
                `Please fill in the price in the number line  ${i + 1}`,
              );
              break;
            }
            if (!arrServices[i].nameVi && arrServices[i].price) {
              isValid = false;
              toast.error(
                `Please fill in the service name in the number line  ${i + 1}`,
              );
              break;
            }
          }
          return { isValid, data: arrServices };
        },
      }),
      [arrServices],
    );

    return (
      <div className="doctor-service-container">
        <div className="info-card">
          <div className="card-header">
            <span>
              <i className="fas fa-stethoscope"></i> Quản lý danh sách dịch vụ
              khám
            </span>
          </div>

          <div className="card-body">
            <div className="row header-row">
              <div className="col-3 header-item">
                Tên dịch vụ <span className="text-danger">*</span>
              </div>
              <div className="col-2 header-item">
                Giá (VND) <span className="text-danger">*</span>
              </div>
              <div className="col-3 header-item">Mô tả chi tiết</div>
              <div className="col-3 header-item">Tên & Mô tả (Tiếng Anh)</div>
              <div className="col-1 header-item text-center">Hành động</div>
            </div>
            <div className="service-body">
              {isLoading || isFetching ? (
                <DataState
                  variant="loading"
                  text="Đang tải dữ liệu dịch vụ..."
                  compact
                />
              ) : isError ? (
                <DataState
                  variant="error"
                  text="Không thể tải danh sách dịch vụ."
                  onRetry={() => void refetch()}
                  compact
                />
              ) : (
                <>
                  {servicesResponse?.errCode === 0 &&
                    Array.isArray(servicesResponse.data) &&
                    servicesResponse.data.length === 0 && (
                      <DataState
                        variant="empty"
                        text="Bác sĩ chưa có dịch vụ; hãy nhập dịch vụ đầu tiên."
                        compact
                      />
                    )}
                  {arrServices.map((item, index) => {
                    return (
                      <div className="row service-row" key={index}>
                      {/* Cột 1: Tên TV */}
                      <div className="col-3">
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Tên dịch vụ (TV)"
                          value={item.nameVi}
                          onChange={(e) =>
                            handleOnChangeInput(e, index, "nameVi")
                          }
                        />
                      </div>
                      <div className="col-2">
                        <input
                          type="number"
                          className="form-control"
                          placeholder="Giá tiền..."
                          value={item.price}
                          onChange={(e) =>
                            handleOnChangeInput(e, index, "price")
                          }
                        />
                      </div>
                      <div className="col-3">
                        <textarea
                          className="form-control"
                          rows={1}
                          placeholder="Chi tiết dịch vụ..."
                          value={item.descriptionVi}
                          onChange={(e) =>
                            handleOnChangeInput(e, index, "descriptionVi")
                          }
                        />
                      </div>
                      <div className="col-3 group-en">
                        <input
                          type="text"
                          className="form-control mb-1"
                          placeholder="Name (En)"
                          value={item.nameEn}
                          onChange={(e) =>
                            handleOnChangeInput(e, index, "nameEn")
                          }
                        />
                        <textarea
                          className="form-control"
                          rows={1}
                          placeholder="Description (En)"
                          value={item.descriptionEn}
                          onChange={(e) =>
                            handleOnChangeInput(e, index, "descriptionEn")
                          }
                        />
                      </div>
                      <div className="col-1 d-flex justify-content-center align-items-center">
                        <button
                          className="btn-delete"
                          onClick={() => handleRemoveRow(index)}
                          title="Xóa dòng này"
                        >
                          <i className="fas fa-trash-alt"></i>
                        </button>
                      </div>
                      </div>
                    );
                  })}
                </>
              )}
            </div>
            <div className="action-row">
              <button
                className="btn btn-primary btn-add-new"
                onClick={() => handleAddNewRow()}
                disabled={isLoading || isFetching || isError}
              >
                <i className="fas fa-plus-circle"></i> Thêm dịch vụ
              </button>
              <small className="text-note">
                <i className="fas fa-exclamation-circle"></i> Lưu ý: Nhập giá
                tiền dạng số. Dữ liệu Tiếng Anh là tùy chọn.
              </small>
            </div>
          </div>
        </div>
      </div>
    );
  },
);

export default DoctorServices;
