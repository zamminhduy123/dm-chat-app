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
import LoadingList from "../../../components/LoadingSkeleton/LoadingList";
import { getConversationById } from "../../../adapter/conversation.adapter";
import Icon from "../../../components/UI/Icon/Icon";
import {
  faUserGroup,
  faUsers,
  faUsersRectangle,
} from "@fortawesome/free-solid-svg-icons";
import NewGroup from "../NewGroup/NewGroup";
import Modal from "../../../components/Modal/Modal";
import addGroupURL from "../../../../assets/add-group.png";
import debounce from "../../../../utils/debounce";
import useAuthApp from "../../../adapter/useAuthApp";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import SocketController from "../../../../controller/SocketController/SocketController";

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

  const isMounted = React.useRef(true);

  const [hasMore, setHasMore] = React.useState(false);

  const loadMoreMessage = async () => {
    if (messageList) {
      const newList = await MessageController.getInstance().searchMessage(
        searchContent,
        messageList.length
      );
      if (!newList.length) {
        setHasMore(false);
      } else if (isMounted.current) {
        console.log(newList);
        if (
          newList[0].getId() === messageList[messageList.length - 1].getId()
        ) {
          newList.shift();
        }

        if (newList.length) {
          setHasMore(true);
          setMessageList([...messageList, ...newList]);
        } else {
          setHasMore(false);
        }
      }
    }
  };

  const search = async (value: string) => {
    const phoneReg = /(84|0[3|5|7|8|9])+([0-9]{8})\b/g;
    if (value[0] === "@") {
      value = value.slice(1);
      if (value && isMounted.current) {
        userSearch(value);
      } else {
        setUserList([]);
      }
    } else if (value.match(phoneReg)) {
      userSearch(value);
    } else {
      if (isMounted.current) setUserList([]);
    }
    messageSearch(value, 0);
  };

  const userSearch = async (value: string) => {
    const userList = await UserController.getInstance().find(value);
    // let currentSearch = searchContent;
    // if (currentSearch[0] === "@") {
    //   currentSearch = currentSearch.slice(1);
    // }
    // console.log(searchContent, currentSearch, userList[0]);
    if (isMounted.current) {
      setUserList(userList.filter((el) => el.getUsername() !== user));
      setLoading(false);
    }
  };
  const messageSearch = async (value: string, offset: number) => {
    const newList = await MessageController.getInstance().searchMessage(value);
    if (isMounted.current) {
      if (newList.length) setHasMore(true);
      setMessageList(newList);
      console.log(newList);
      setLoading(false);
    }
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

  React.useEffect(() => {
    if (searchContent == "" && isMounted.current) {
      setUserList([]);
      setMessageList([]);
      setLoading(false);
    }
    // console.log(searchContent);
  }, [searchContent]);

  React.useEffect(() => {
    return () => {
      console.log("HI");
      isMounted.current = false;
    };
  }, []);

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
          create_at: msg.getCreateAt(),
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

  console.log(loading, "HUH");

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
            <Icon
              style="contained"
              icon={faUserGroup}
              onClick={() => {
                setNewGroupOpen(true);
              }}
            />
          )}
        </div>
      </div>
      {searchBarActive ? (
        <p className="search-info" style={{ margin: "0px 16px" }}>
          {"*" + t("Search user by") + " " + t("Phone") + ", " + "@username"}
        </p>
      ) : null}
      {searchBarActive ? (
        !loading ? (
          (userList && userList.length) ||
          (messageList && messageList.length) ? (
            <div className="d-flex flex-column" style={{ flex: 1 }}>
              <div
                className=""
                style={{
                  height: "fit-content",
                  flex: `${userList?.length === 0 ? 0 : 1}`,
                }}
              >
                <div className="list-title">
                  {t("User")} ({userList?.length || 0})
                </div>
                <ConversationList
                  username={user}
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
                      SocketController.getInstance().typingRegister("-1");
                      ConversationController.getInstance().select("");
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
                  username={user}
                  hasMore={hasMore}
                  onLoadMore={loadMoreMessage}
                  list={tempMessageConversationList()}
                  onItemClick={(conversation) => {
                    ConversationController.getInstance().select(
                      conversation.id,
                      conversation.lastMessage!
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
