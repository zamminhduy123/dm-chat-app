import React from "react";
import { UserController } from "../../../controller";
import { GenderEnum, User, UserEntity } from "../../../entities";
import { capitalizeFirstLetter, mapGender } from "../../../utils/utils";
import useTranslation from "../../adapter/translation.adapter";
import Avatar from "../Avatar/Avatar";
import "./UserInfo.scss";

interface UserInfoProps {
  name: string;
  avatar: string;
  gender: GenderEnum;
  phone: string;
}

const UserInfo = ({ name, avatar, gender, phone }: UserInfoProps) => {
  const { t } = useTranslation();
  return (
    <div className="user-info-container">
      <div>
        <Avatar left={false} size="extra-large" src={avatar} />
        <p style={{ fontSize: "large" }}>{name}</p>
        <div className="user-info-section">
          <p className="title">{t("Personal profile")}</p>
          <div className="user-info-section row">
            <p>{t("Phone")}</p>
            <p>{phone}</p>
          </div>
          <div className="user-info-section row">
            <p>{t("Gender")}</p>
            <p>{t(capitalizeFirstLetter(mapGender(+gender)))}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;
