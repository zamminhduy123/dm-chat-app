import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faComments as c2,
  faUserGroup as cb2,
  faGear as h,
  faUser,
  faCircleHalfStroke,
} from "@fortawesome/free-solid-svg-icons";
import React from "react";

import SideBarItem from "./SideBarItem";
import { Page } from "../../pages/Main/Main";
import "./SideBar.scss";
import PopUp from "../UI/PopUp/PopUp";
import Menu, { MenuItem } from "../Menu/Menu";
import Avatar from "../Avatar/Avatar";
import useAuthApp from "../../adapter/useAuthApp";

import vnImg from "../../../assets/vn.png";
import engImg from "../../../assets/eng.png";
import useTranslation from "../../adapter/translation.adapter";
import eventEmitter from "../../../utils/event-emitter";
import { userConstants } from "../../action";
import { useTheme } from "../../adapter/useTheme";
import { capitalizeFirstLetter } from "../../../utils/utils";

interface SideBarProps {
  curPage: Page;
  onPageItemClick: (page: Page) => void;
}

const SideBar: React.FC<SideBarProps> = ({
  curPage,
  onPageItemClick,
}: SideBarProps) => {
  const { user, avatar } = useAuthApp();
  const [showModal, setShowModal] = React.useState(false);
  const { t, lang, changeLang } = useTranslation();

  const { theme, toggleTheme } = useTheme();

  const MenuItems: MenuItem[] = [
    {
      icon: <FontAwesomeIcon icon={faUser} />,
      text: "Account",
      onClick: () => {
        eventEmitter.emit(userConstants.DISPLAY_USER, user);
      },
    },
    {
      icon: <FontAwesomeIcon icon={faCircleHalfStroke} />,
      text: capitalizeFirstLetter(theme === "light" ? "dark" : "light"),
      onClick: () => {
        toggleTheme();
      },
    },
    {
      icon: <img width={"18px"} src={lang === "vn" ? vnImg : engImg} />,
      text: "Language",
      onClick: () => {
        changeLang(lang === "vn" ? "en" : "vn");
      },
    },
  ];
  return (
    <div className="main-tab">
      <div className="logo">
        <Avatar src={avatar || undefined} left={false} />
      </div>
      <div className="top-tab">
        <div className="nav-list">
          <div
            className={["nav-item"].join(" ")}
            onClick={() => onPageItemClick("conversation")}
          >
            <SideBarItem icon={c2} selected={curPage === "conversation"} />
          </div>
          <div
            className={["nav-item"].join(" ")}
            onClick={() => onPageItemClick("contact")}
          >
            <SideBarItem icon={cb2} selected={curPage === "contact"} />
          </div>
        </div>
      </div>
      <div style={{ flexGrow: 1 }}></div>
      <div className="bot-tab">
        <div className="nav-list">
          <div
            className={["nav-item", showModal ? `selected` : ""].join(" ")}
            onClick={() => setShowModal((prev) => !prev)}
          >
            <PopUp
              isOpen={showModal}
              closeHandler={() => {
                setShowModal(false);
              }}
              top
              right
            >
              <Menu menus={MenuItems} />
            </PopUp>
            <SideBarItem icon={h} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SideBar;
