import React, { Fragment, useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from "react-router-dom";
import { FormattedMessage } from 'react-intl';

import './Navigator.scss';
import { IMenuGroup } from 'types';

// Sub-components chuyển sang Function Component
const MenuGroupFC: React.FC<{ name: string; children?: React.ReactNode }> = ({ name, children }) => {
  return (
    <li className="menu-group">
      <div className="menu-group-name">
        <FormattedMessage id={name} />
      </div>
      <ul className="menu-list list-unstyled">
        {children}
      </ul>
    </li>
  );
};

interface IMenuFCProps {
  name: string;
  active?: boolean;
  link?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  hasSubMenu?: boolean;
  isOpen?: boolean;
  onLinkClick?: () => void;
}

const MenuFC: React.FC<IMenuFCProps> = ({ name, active, link, children, onClick, hasSubMenu, onLinkClick }) => {
  return (
    <li className={"menu" + (hasSubMenu ? " has-sub-menu" : "") + (active ? " active" : "")}>
      {hasSubMenu ? (
        <Fragment>
          <span
            data-toggle="collapse"
            className={"menu-link collapsed"}
            onClick={onClick}
            aria-expanded={"false"}
          >
            <FormattedMessage id={name} />
            <div className="icon-right">
              <i className={"far fa-angle-right"} />
            </div>
          </span>
          <div>
            <ul className="sub-menu-list list-unstyled">
              {children}
            </ul>
          </div>
        </Fragment>
      ) : (
        <Link to={link || ""} className="menu-link" onClick={onLinkClick}>
          <FormattedMessage id={name} />
        </Link>
      )}
    </li>
  );
};

interface ISubMenuFCProps {
  name: string;
  link: string;
  onLinkClick?: () => void;
  onClick?: () => void;
}

const SubMenuFC: React.FC<ISubMenuFCProps> = ({ name, link, onLinkClick }) => {
  const location = useLocation();
  const getItemClass = (path: string) => {
    return location.pathname === path ? "active" : "";
  };

  return (
    <li className={"sub-menu " + getItemClass(link)}>
      <Link to={link} className="sub-menu-link" onClick={onLinkClick}>
        <FormattedMessage id={name} />
      </Link>
    </li>
  );
};

interface INavigatorProps {
  menus: IMenuGroup[];
  onLinkClick?: () => void;
}

// Navigator chuyển sang Function Component + Hooks
const Navigator: React.FC<INavigatorProps> = ({ menus, onLinkClick }) => {
  const [expandedMenu, setExpandedMenu] = useState<Record<string, boolean>>({});
  const location = useLocation();

  const isMenuHasSubMenuActive = useCallback((loc: any, subMenus: any, link: string | null) => {
    if (subMenus) {
      if (subMenus.length === 0) return false;
      const currentPath = loc.pathname;
      for (let i = 0; i < subMenus.length; i++) {
        if (subMenus[i].link === currentPath) return true;
      }
    }
    if (link) return loc.pathname === link;
    return false;
  }, []);

  const checkActiveMenu = useCallback(() => {
    for (let i = 0; i < menus.length; i++) {
      const group = menus[i];
      if (group.menus && group.menus.length > 0) {
        for (let j = 0; j < group.menus.length; j++) {
          const menu = group.menus[j];
          if (menu.subMenus && menu.subMenus.length > 0) {
            if (isMenuHasSubMenuActive(location, menu.subMenus, null)) {
              const key = i + '_' + j;
              setExpandedMenu({ [key]: true });
              return;
            }
          }
        }
      }
    }
  }, [menus, location, isMenuHasSubMenuActive]);

  // componentDidMount + componentDidUpdate khi location thay đổi
  useEffect(() => {
    checkActiveMenu();
  }, [location, checkActiveMenu]);

  const toggle = (groupIndex: number, menuIndex: number) => {
    const newExpanded: Record<string, boolean> = {};
    const needExpand = !(expandedMenu[groupIndex + '_' + menuIndex] === true);
    if (needExpand) {
      newExpanded[groupIndex + '_' + menuIndex] = true;
    }
    setExpandedMenu(newExpanded);
  };

  return (
    <Fragment>
      <ul className="navigator-menu list-unstyled">
        {
          menus.map((group, groupIndex) => {
            return (
              <Fragment key={groupIndex}>
                <MenuGroupFC name={group.name}>
                  {group.menus ? (
                    group.menus.map((menu, menuIndex) => {
                      const isActive = isMenuHasSubMenuActive(location, menu.subMenus, menu.link);
                      const isSubMenuOpen = expandedMenu[groupIndex + '_' + menuIndex] === true;
                      return (
                        <MenuFC
                          key={menuIndex}
                          active={isActive}
                          name={menu.name}
                          link={menu.link}
                          hasSubMenu={!!menu.subMenus}
                          isOpen={isSubMenuOpen}
                          onClick={() => toggle(groupIndex, menuIndex)}
                          onLinkClick={onLinkClick}
                        >
                          {menu.subMenus && menu.subMenus.map((subMenu, subMenuIndex) => (
                            <SubMenuFC
                              key={subMenuIndex}
                              name={subMenu.name}
                              link={subMenu.link}
                              onLinkClick={onLinkClick}
                            />
                          ))}
                        </MenuFC>
                      );
                    })
                  ) : null}
                </MenuGroupFC>
              </Fragment>
            );
          })
        }
      </ul>
    </Fragment>
  );
};

export default Navigator;
