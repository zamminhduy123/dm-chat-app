import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUser } from "@fortawesome/free-regular-svg-icons";
import useTranslation from "../../adapter/translation.adapter";
import "./Menu.scss";
import { UserController } from "../../../controller";
import React from "react";

export type MenuItem = {
  icon?: React.ReactNode;
  text: string;
  onClick?: Function;
};

interface MenuProps {
  menus: MenuItem[];
}

export default function Menu({ menus }: MenuProps) {
  const { t } = useTranslation();
  return (
    <div className="menu">
      {menus.map((menu) => {
        return (
          <div key={menu.text}>
            <div
              className="menu-item"
              onClick={() => (menu.onClick ? menu.onClick() : null)}
            >
              <div
                className="d-flex flex-center"
                style={{ width: "20px", marginRight: "8px" }}
              >
                {menu.icon}
              </div>
              <span>{t(menu.text)}</span>
            </div>
          </div>
        );
      })}
      <div
        className="menu-item"
        onClick={() => UserController.getInstance().logout()}
      >
        <span style={{ color: "var(--color-danger)" }}>{t("Logout")}</span>
      </div>
    </div>
  );
}
