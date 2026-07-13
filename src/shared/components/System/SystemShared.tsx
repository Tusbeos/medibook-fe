import React from "react";
import "./SystemShared.scss";

// ==================== Panel ====================
interface PanelProps {
  children: React.ReactNode;
  className?: string;
}

export const Panel: React.FC<PanelProps> = ({ children, className = "" }) => (
  <div className={`sys-panel ${className}`}>{children}</div>
);

// ==================== PanelHeading ====================
interface PanelHeadingProps {
  title: string;
  icon?: string;
  children?: React.ReactNode; // extra elements like search box
}

export const PanelHeading: React.FC<PanelHeadingProps> = ({
  title,
  icon,
  children,
}) => {
  if (children) {
    return (
      <div className="sys-panel-heading sys-panel-heading-row">
        <h2>
          {icon && <i className={icon} />} {title}
        </h2>
        {children}
      </div>
    );
  }
  return (
    <div className="sys-panel-heading">
      <h2>
        {icon && <i className={icon} />} {title}
      </h2>
    </div>
  );
};

// ==================== SearchBox ====================
interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchBox: React.FC<SearchBoxProps> = ({
  value,
  onChange,
  placeholder = "Tìm nhanh...",
}) => (
  <div className="sys-search-box">
    <i className="fas fa-search" />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
    />
  </div>
);

// ==================== DataState ====================
interface DataStateProps {
  variant: "loading" | "error" | "empty";
  text: string;
  onRetry?: () => void;
  compact?: boolean;
}

export const DataState: React.FC<DataStateProps> = ({
  variant,
  text,
  onRetry,
  compact = false,
}) => (
  <div
    className={`sys-data-state sys-data-state-${variant}${
      compact ? " sys-data-state-compact" : ""
    }`}
    role="status"
    aria-live="polite"
  >
    <i
      className={
        variant === "loading"
          ? "fas fa-circle-notch fa-spin"
          : variant === "error"
            ? "fas fa-exclamation-circle"
            : "fas fa-inbox"
      }
    />
    <span>{text}</span>
    {variant === "error" && onRetry && (
      <button type="button" onClick={onRetry}>
        Thử lại
      </button>
    )}
  </div>
);

// ==================== DataTable ====================
interface Column<T> {
  key: string;
  title: string;
  render?: (item: T, index: number) => React.ReactNode;
  className?: string;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowKey: (item: T, index: number) => string | number;
  emptyText?: string;
  isLoading?: boolean;
  isError?: boolean;
  loadingText?: string;
  errorText?: string;
  onRetry?: () => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  renderActions?: (item: T) => React.ReactNode;
}

export function DataTable<T>({
  columns,
  data,
  rowKey,
  emptyText = "Không có dữ liệu",
  isLoading = false,
  isError = false,
  loadingText = "Đang tải dữ liệu...",
  errorText = "Không thể tải dữ liệu.",
  onRetry,
  onEdit,
  onDelete,
  renderActions,
}: DataTableProps<T>) {
  const showActions = onEdit || onDelete || renderActions;
  const allColumns = showActions
    ? [...columns, { key: "__actions", title: "Hành động" }]
    : columns;
  const state = isLoading ? "loading" : isError ? "error" : "empty";
  const stateText = isLoading
    ? loadingText
    : isError
      ? errorText
      : emptyText;

  return (
    <div className="sys-table-wrap">
      <table className="sys-table">
        <thead>
          <tr>
            {allColumns.map((col) => (
              <th key={col.key} className={col.className}>
                {col.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {!isLoading && !isError && data.length > 0 ? (
            data.map((item, index) => (
              <tr key={rowKey(item, index)}>
                {columns.map((col) => (
                  <td key={col.key} className={col.className}>
                    {col.render
                      ? col.render(item, index)
                      : (item as any)[col.key]}
                  </td>
                ))}
                {showActions && (
                  <td>
                    {renderActions ? (
                      renderActions(item)
                    ) : (
                      <div className="sys-table-actions">
                        {onEdit && (
                          <button
                            type="button"
                            className="sys-table-action sys-edit-action"
                            onClick={() => onEdit(item)}
                            title="Chỉnh sửa"
                          >
                            <i className="fas fa-pencil-alt" />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            type="button"
                            className="sys-table-action sys-delete-action"
                            onClick={() => onDelete(item)}
                            title="Xóa"
                          >
                            <i className="fas fa-trash" />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                )}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={allColumns.length}
                className="sys-empty-state"
              >
                <DataState
                  variant={state}
                  text={stateText}
                  onRetry={onRetry}
                />
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// ==================== SaveButton / CancelButton ====================
interface ActionButtonsProps {
  isEditing: boolean;
  onSave: () => void;
  onCancel: () => void;
  saveLabel?: string;
  editLabel?: string;
  cancelLabel?: string;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  isEditing,
  onSave,
  onCancel,
  saveLabel = "LƯU THÔNG TIN",
  editLabel = "CẬP NHẬT THÔNG TIN",
  cancelLabel = "HỦY CHỈNH SỬA",
}) => (
  <div className="sys-actions-row">
    <button type="button" className="sys-save-button" onClick={onSave}>
      <i className="far fa-save" />
      <span>{isEditing ? editLabel : saveLabel}</span>
    </button>
    {isEditing && (
      <button type="button" className="sys-cancel-button" onClick={onCancel}>
        {cancelLabel}
      </button>
    )}
  </div>
);

// ==================== StatusBadge ====================
interface StatusBadgeProps {
  label: string;
  variant?: "success" | "warning" | "default";
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({
  label,
  variant = "success",
}) => (
  <span className={`sys-status-badge sys-badge-${variant}`}>
    <i className="fas fa-circle" />
    {label}
  </span>
);

// ==================== FormField ====================
interface FormFieldProps {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  required,
  children,
}) => (
  <div className="sys-form-field">
    <label>
      {label} {required && <span className="sys-required">*</span>}
    </label>
    {children}
  </div>
);
