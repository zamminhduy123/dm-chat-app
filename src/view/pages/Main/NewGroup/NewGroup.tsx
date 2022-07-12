import React from "react";
import { ConversationController, UserController } from "../../../../controller";
import { ConversationEntity, User } from "../../../../entities";
import useTranslation from "../../../adapter/translation.adapter";
import Avatar from "../../../components/Avatar/Avatar";
import ConversationList from "../../../components/ConversationList/ConversationList";
import Button from "../../../components/UI/Button/Button";
import SearchBar from "../../../components/UI/SearchBar/SearchBar";
import Spinner from "../../../components/UI/Spinner/Spinner";
import Notification from "../../../components/UI/Notification/Notification";

import "./NewGroup.scss";
import NewGroupListItem from "./NewGroupListItem";
import useAuthApp from "../../../adapter/useAuthApp";

interface NewGroupProps {
  onClose: Function;
}

const initNotification = {
  type: "loading",
  message: "",
};

const NewGroup = ({ onClose }: NewGroupProps) => {
  const [notification, setNotification] = React.useState(initNotification);
  const [groupMember, setGroupMember] = React.useState<User[]>([]);
  const [userList, setUserList] = React.useState<User[]>([]);

  const [searchContent, setSearchContent] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const { t } = useTranslation();
  const typingTimeout = React.useRef(setTimeout(async () => {}, 0));

  const { user } = useAuthApp();

  const contentChangeHandler = (event: React.FormEvent<HTMLInputElement>) => {
    setLoading(true);
    let value: string = event.currentTarget.value;
    setSearchContent(value);
    value = value.trim();
    if (value.length) {
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(async () => {
        const userList = await UserController.getInstance().find(value);
        // console.log(list);
        setUserList(userList.filter((u) => u.getUsername() !== user));
        setLoading(false);
      }, 500);
    }
  };

  const createGroupHandler = async () => {
    setNotification({ type: "loading", message: t("Loading") });
    if (groupMember && groupMember.length > 1) {
      const newGroupConversation: ConversationEntity = {
        id: "",
        name:
          groupNameInput.current?.value ||
          groupMember
            .slice(0, 2)
            .map((u) => u.getName())
            .join(", "),
        avatar: "",
        users: groupMember.map((user) => {
          return {
            username: user.getUsername(),
            gender: user.getGender(),
            avatar: user.getAvatar(),
            name: user.getName(),
            phone: user.getPhone(),
          };
        }),
        totalMessage: 0,
        lastMessage: null,
      };
      console.log(newGroupConversation);
      try {
        await ConversationController.getInstance().addNewGroupConversation(
          newGroupConversation
        );
        setNotification({ type: "success", message: t("Group created") });
        setTimeout(() => {
          onClose();
        }, 100);
      } catch (err) {
        setNotification({
          type: "warning",
          message: t("Something went wrong"),
        });
      }
    } else {
      setNotification({
        type: "warning",
        message: t("At least 3 people"),
      });
    }
  };

  const deleteMember = (user: User) => {
    const indexU = groupMember.findIndex(
      (u) => u.getUsername() === user.getUsername()
    );
    setGroupMember([
      ...groupMember.slice(0, indexU),
      ...groupMember.slice(indexU + 1),
    ]);
  };

  const groupNameInput = React.useRef<HTMLInputElement>(null);
  return (
    <div className="d-flex new-group-container">
      <div className="d-flex">
        <input
          ref={groupNameInput}
          className="new-group-name"
          autoComplete="true"
          type="text"
          placeholder={t("Type your") + " " + t("group name").toLowerCase()}
        />
      </div>
      <p className="text-xs" style={{ marginBottom: "4px" }}>
        {t("Add people to group")}
      </p>
      <SearchBar
        value={searchContent}
        onClick={() => {}}
        onChange={contentChangeHandler}
        onClearValue={() => setSearchContent("")}
      />
      <span className="search-info">
        {"*" + t("Search by") + " " + t("Phone") + ", " + t("Username")}
      </span>
      {!loading ? (
        <ul className="new-group-search-list">
          {userList.length ? (
            userList.map((user, id) => (
              <NewGroupListItem
                key={user.getUsername()}
                avatar={user.getAvatar()}
                name={user.getName()}
                onClick={() => {
                  if (
                    !groupMember.length ||
                    !groupMember.find(
                      (u) => u.getUsername() === user.getUsername()
                    )
                  ) {
                    setGroupMember([...groupMember, user]);
                    setUserList([]);
                  }
                }}
              />
            ))
          ) : (
            <span className="search-info d-flex flex-center">{t("Empty")}</span>
          )}
        </ul>
      ) : (
        <div>
          <Spinner size="small" />
        </div>
      )}
      <div className="seperator"></div>
      <p className="text-xs">
        {t("Selected User")} ({groupMember?.length || 0})
      </p>
      <ul className="new-group-member-list">
        {groupMember.map((user, id) => (
          <NewGroupListItem
            key={user.getUsername()}
            avatar={user.getAvatar()}
            name={user.getName()}
            deleteItem={() => deleteMember(user)}
          />
        ))}
      </ul>
      {notification.message && notification.type != "loading" ? (
        <Notification
          type={notification.type}
          message={notification.message}
          variant="contained"
        />
      ) : null}
      <div className="d-flex w-100 flex-center">
        <div style={{ width: "5px" }}></div>
        <Button
          onClick={createGroupHandler}
          color={"primary"}
          variant={"contained"}
        >
          {t("Create Group")}
        </Button>
      </div>
    </div>
  );
};
export default NewGroup;
