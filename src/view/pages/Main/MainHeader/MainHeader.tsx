import SearchBar from "../../../components/UI/SearchBar/SearchBar";
import "./MainHeader.scss";
import React from "react";
import {
  ConversationController,
  MessageController,
  UserController,
} from "../../../../controller";
import Button from "../../../components/UI/Button/Button";
import {
  ConversationEntity,
  GenderEnum,
  Message,
  MessageEntity,
  User,
} from "../../../../entities";
import useTranslation from "../../../adapter/translation.adapter";
import Empty from "../../../components/Empty/Empty";
import ConversationList from "../../../components/ConversationList/ConversationList";
import LoadingList from "../../../components/LoadingList/LoadingList";
import { getConversationById } from "../../../adapter/conversation.adapter";
import Icon from "../../../components/UI/Icon/Icon";
import { faUsersRectangle } from "@fortawesome/free-solid-svg-icons";
import NewGroup from "../NewGroup/NewGroup";
import Modal from "../../../components/Modal/Modal";
import addGroupURL from "../../../../assets/add-group.png";
import debounce from "../../../../utils/debounce";
import useAuthApp from "../../../adapter/useAuthApp";

interface MainHeaderProps {
  searchBarActive: Boolean;
  onSearchBarClick: Function;
  onClose: Function;
  onSearchItemClick: Function;
}

const DEBOUNCE_TIME = 500;

const MainHeader = ({
  searchBarActive,
  onSearchBarClick,
  onClose,
  onSearchItemClick,
}: MainHeaderProps) => {
  const [userList, setUserList] = React.useState<User[]>();
  const [messageList, setMessageList] = React.useState<Message[]>();

  const [searchContent, setSearchContent] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const { t } = useTranslation();

  const typingTimeout = React.useRef(setTimeout(async () => {}, 0));

  const search = async (value: string) => {
    const phoneReg = /(84|0[3|5|7|8|9])+([0-9]{8})\b/g;
    if (value[0] === "@") {
      value = value.slice(1);
      if (value) {
        const userList = await UserController.getInstance().find(value);
        setUserList(userList.filter((el) => el.getUsername() !== user));
      } else {
        setUserList([]);
      }
    } else if (value.match(phoneReg)) {
      const userList = await UserController.getInstance().find(value);
      setUserList(userList);
    } else {
      setUserList([]);
    }

    const messageList = await MessageController.getInstance().searchMessage(
      value
    );
    // console.log(list);

    setMessageList(messageList);
    setLoading(false);
  };

  const { user } = useAuthApp();

  const goSearch = React.useMemo(() => {
    return debounce(search, DEBOUNCE_TIME);
  }, []);
  const contentChangeHandler = (event: React.FormEvent<HTMLInputElement>) => {
    setLoading(true);
    let value: string = event.currentTarget.value;
    setSearchContent(value);

    value = value.trim();
    if (value.length) {
      goSearch(value);
      clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(async () => {}, 500);
    }
  };

  const tempUserConversationList = () => {
    if (userList && userList.length) {
      return userList.map((u: User) => {
        return {
          id: "",
          name: u.getName(),
          avatar: u.getAvatar(),
          users: [
            {
              username: u.getUsername(),
              name: u.getName(),
              avatar: u.getAvatar(),
              gender: u.getGender(),
              phone: u.getPhone(),
            },
          ],
          lastMessage: null,
          totalMessage: 0,
        };
      });
    }
    return [];
  };
  const tempMessageConversationList = () => {
    if (messageList && messageList.length) {
      return messageList.map((msg: Message) => {
        const conversation = {
          ...getConversationById(msg.getConversationId()),
        };
        conversation.lastMessage = {
          ...conversation.lastMessage!,
          id: msg.getId(),
          content: msg.getContent(),
          sender: msg.getSender(),
        };
        return conversation;
      });
    }
    return [];
  };

  React.useEffect(() => {
    if (!searchBarActive) {
      setSearchContent("");
    }
  }, [searchBarActive]);

  //NEW GROUP
  const [newGroupOpen, setNewGroupOpen] = React.useState(false);
  return (
    <div
      className="d-flex flex-column"
      style={{ flex: `${searchBarActive ? 1 : 0}`, maxHeight: "100%" }}
    >
      <Modal
        title="Create Group"
        isOpen={newGroupOpen}
        hasBackdrop
        handleClose={() => setNewGroupOpen(false)}
      >
        <NewGroup onClose={() => setNewGroupOpen(false)} />
      </Modal>
      <div className="conversation-tab-search">
        <div style={{ flex: "1" }}>
          <SearchBar
            value={searchContent}
            onClick={() => onSearchBarClick()}
            onChange={contentChangeHandler}
            onClearValue={() => setSearchContent("")}
          />
        </div>

        <div
          className="d-flex flex-center"
          style={{
            width: "fit-content",
            height: "32px",
            marginLeft: "4px",
          }}
        >
          {searchBarActive ? (
            <Button
              variant="outlined"
              size="medium"
              color={"primary"}
              onClick={() => {
                setSearchContent("");
                onClose();
                setUserList([]);
                setMessageList([]);
              }}
            >
              {t("Close")}
            </Button>
          ) : (
            <Button
              variant="outlined"
              size="medium"
              color={"primary"}
              onClick={() => {
                setNewGroupOpen(true);
              }}
            >
              {t("Add Group")}
              <p style={{ fontSize: "16px", paddingBottom: "2px" }}>+</p>
            </Button>
            // <Icon
            //   icon={faUsersRectangle}
            //   size="large"
            //   onClick={() => setNewGroupOpen(true)}
            // />
          )}
        </div>
      </div>
      {searchBarActive ? (
        <p className="search-info" style={{ margin: "0px 16px" }}>
          {"*" + t("Search by") + " " + t("Phone") + ", " + "@username"}
        </p>
      ) : null}
      {searchBarActive ? (
        !loading ? (
          (userList && userList.length) ||
          (messageList && messageList.length) ? (
            <div
              className="d-flex flex-column"
              style={{ flex: 1, minHeight: 0, overflowY: "scroll" }}
            >
              <div>
                <div className="list-title">
                  {t("User")} ({userList?.length || 0})
                </div>
                <ConversationList
                  list={tempUserConversationList()}
                  onItemClick={(conversation) => {
                    const converationExisted =
                      ConversationController.getInstance().findConversationByUsername(
                        conversation.users[0].username
                      );
                    console.log("FIND", converationExisted);
                    if (converationExisted) {
                      ConversationController.getInstance().select(
                        converationExisted.id
                      );
                    } else {
                      // ConversationController.getInstance().select("");
                      onSearchItemClick(conversation);
                    }
                  }}
                />
              </div>
              <div className="list-container">
                <div className="list-title">
                  {t("Message")} ({messageList?.length || 0})
                </div>
                <ConversationList
                  list={tempMessageConversationList()}
                  onItemClick={(conversation) => {
                    ConversationController.getInstance().select(
                      conversation.id,
                      conversation.lastMessage!.id
                    );
                  }}
                />
              </div>
            </div>
          ) : (
            <Empty />
          )
        ) : (
          <LoadingList />
        )
      ) : null}
    </div>
  );
};
export default MainHeader;
