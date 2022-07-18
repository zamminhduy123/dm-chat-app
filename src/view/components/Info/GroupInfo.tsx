import useTranslation from "../../adapter/translation.adapter";
import GroupAvatar from "../GroupAvatar/GroupAvatar";
import "./UserInfo.scss";

interface GroupInfoProps {
  name: string;
  avatars: string[];
  userNumber: number;
}

const GroupInfo = ({ name, avatars, userNumber }: GroupInfoProps) => {
  const { t } = useTranslation();
  return (
    <div className="user-info-container">
      <div>
        <GroupAvatar avatars={avatars} />
        <p style={{ fontSize: "large" }}>{name}</p>
        <div className="user-info-section">
          <p className="title">{t("Group profile")}</p>
          <div className="user-info-section row">
            <p>{t("User number")}</p>
            <p>{userNumber}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GroupInfo;
