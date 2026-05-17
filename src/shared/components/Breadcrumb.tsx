import React from "react";
import { Link } from "react-router-dom";
import "./Breadcrumb.scss";

interface IBreadcrumbItem {
  label: string;
  to?: string;
}

interface IBreadcrumbProps {
  items: IBreadcrumbItem[];
  containerClassName?: string;
}

const Breadcrumb: React.FC<IBreadcrumbProps> = ({ items, containerClassName }) => {
  if (!items || items.length === 0) return null;

  return (
    <div className="breadcrumb-section-wrapper">
      <div
        className={`breadcrumb-content-container ${containerClassName || ""}`}
      >
        <nav aria-label="breadcrumb">
          <ol className="breadcrumb-list">
            {items.map((item, idx) => {
              const isLast = idx === items.length - 1;
              return (
                <li
                  key={idx}
                  className={`custom-breadcrumb-item${isLast ? " active" : ""}`}
                  aria-current={isLast ? "page" : undefined}
                >
                  {isLast ? (
                    <span>{item.label}</span>
                  ) : (
                    <Link to={item.to || "/"}>{item.label}</Link>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
};

export default Breadcrumb;