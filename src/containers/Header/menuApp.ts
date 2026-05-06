import { IMenuGroup } from "../../types";

export const adminMenu: IMenuGroup[] = [
  {
    name: "menu.admin.manage-user",
    menus: [
      {
        name: "menu.admin.manage-user",
        link: "/system/user-management",
      },
    ],
  },
  {
    name: "menu.admin.doctor",
    menus: [
      {
        name: "menu.admin.manage-doctor",
        link: "/system/manage-doctor",
      },

      {
        name: "menu.doctor.schedule",
        link: "/doctor/manage-schedule",
      },
      {
        name: "menu.doctor.manage-patient",
        link: "/doctor/manage-patient",
      },
    ],
  },
  {
    name: "menu.admin.clinic",
    menus: [
      {
        name: "menu.admin.manage-clinic",
        link: "/system/manage-clinic",
      },
    ],
  },
  {
    name: "menu.admin.specialty",
    menus: [
      {
        name: "menu.admin.manage-specialty",
        link: "/system/manage-specialty",
      },
    ],
  },
  {
    name: "menu.admin.package",
    menus: [
      {
        name: "menu.admin.manage-package",
        link: "/system/manage-package",
      },
    ],
  },
  {
    name: "menu.admin.handbook",
    menus: [
      {
        name: "menu.admin.manage-handbook",
        link: "/system/manage-handbook",
      },
    ],
  },
];
export const doctorMenu: IMenuGroup[] = [
  {
    name: "menu.admin.manage-user",
    menus: [
      {
        name: "menu.doctor.manage-schedule",
        link: "/doctor/manage-schedule",
      },
      {
        name: "menu.doctor.manage-patient",
        link: "/doctor/manage-patient",
      },
    ],
  },
];

export const clinicManagerMenu: IMenuGroup[] = [
  {
    name: "menu.admin.dashboard",
    menus: [
      {
        name: "menu.admin.dashboard",
        link: "/system/clinic-manager",
      },
    ],
  },
];
