import React from "react";
import SideBar from "../../components/SideBar/SideBar";
import Contact from "./Contact/Contact";
import { ChatSection } from "./ChatSection";
import WelcomePage from "../../components/WelcomePage/WelcomePage";
import { getMessageFromConversation } from "../../adapter/message.adapter";
import MainHeader from "./MainHeader/MainHeader";
import { default as ConversationTab } from "./Conversation/Conversation";
import SocketController from "../../../controller/SocketController/SocketController";
import Modal from "../../components/Modal/Modal";
import ErrorReload from "../../components/ErrorReload";
import useTranslation from "../../adapter/translation.adapter";
import useAuthApp from "../../adapter/useAuthApp";
import { useHistory } from "react-router-dom";
import { useCurrentConversation } from "../../adapter/useCurrentConversation";
import { getConversationById } from "../../adapter/conversation.adapter";
import {
  Conversation,
  ConversationEntity,
  GenderEnum,
  UserEntity,
} from "../../../entities";
import {
  ConversationController,
  MessageController,
  UserController,
} from "../../../controller";
import NewGroup from "./NewGroup/NewGroup";
import UserInfo from "../../components/Info/UserInfo";
import eventEmitter from "../../../utils/event-emitter";
import { userConstants } from "../../action";
import { useConversation } from "../../adapter/useConversation";
import FadeAlert from "../../components/FadeAlert/FadeAlert";
import NewKeyAlert from "../../components/NewKeyAlert/NewKeyAlert";
import { LocalStorage } from "../../../storage";

export interface MainProps {}

export type Page = "conversation" | "contact";

const Main = (props: MainProps) => {
  const [page, setPage] = React.useState<Page>("conversation");
  const [searchBarActive, setSearchBarActive] = React.useState<Boolean>(false);
  const [modalOpen, setModalOpen] = React.useState(false);
  const [activeConversation, setActiveConversation] =
    React.useState<ConversationEntity>();

  const { selected: activeConversationId } = useCurrentConversation();
  // console.log("activeConversationId", activeConversationId);

  const { user, avatar, name, phone, gender } = useAuthApp();
  React.useEffect(() => {
    if (!user) {
      setActiveConversation(undefined);
      isMounted.current = false;
      // history.replace("/login");
    }
    return () => {
      console.log("MAIN unmounted");
    };
  }, [user]);

  const isMounted = React.useRef(true);

  const { t } = useTranslation();

  const socketFail = () => {
    //display modal tell user to refresh the page
    if (isMounted.current) setModalOpen(true);
  };

  React.useEffect(() => {
    SocketController.getInstance().reconnectFail(socketFail);
    ConversationController.getInstance().getConversations();
    return () => {
      isMounted.current = false;
    };
  }, []);
  React.useEffect(() => {
    if (isMounted.current && activeConversationId)
      setActiveConversation(getConversationById(activeConversationId));
  }, [activeConversationId]);
  React.useEffect(() => {
    if (activeConversation?.id && isMounted.current) {
      getMessageFromConversation();
    } else {
      MessageController.getInstance().clearMessage();
    }
  }, [activeConversation]);

  // USER DISPLAY HANDLER
  const [userDisplayInfo, setUserDisplayInfo] =
    React.useState<UserEntity | null>(null);
  const [fadeAlert, setFadeAlert] = React.useState("");

  React.useEffect(() => {
    const displayUserListener = eventEmitter.addListener(
      userConstants.DISPLAY_USER,
      (info: string) => {
        if (info === user || info === phone) {
          setUserDisplayInfo({
            name: name,
            avatar: avatar,
            username: user,
            phone: phone,
            gender: gender,
          });
        } else {
          UserController.getInstance()
            .find(info)
            .then((users) => {
              if (users.length) {
                if (isMounted.current) {
                  setUserDisplayInfo({
                    name: users[0].getName(),
                    avatar: users[0].getAvatar(),
                    username: users[0].getUsername(),
                    phone: users[0].getPhone(),
                    gender: users[0].getGender(),
                  });
                }
              } else {
                if (isMounted.current) {
                  setFadeAlert("Phone number has not registered yet");
                }
              }
            });
        }
      }
    );

    return () => {
      displayUserListener.remove();
    };
  }, []);
  React.useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (fadeAlert) {
      timeout = setTimeout(() => {
        setFadeAlert("");
      }, 1000);
    }
    return () => clearTimeout(timeout);
  }, [fadeAlert]);

  return (
    <>
      <Modal
        title="User Info"
        isOpen={!!userDisplayInfo}
        hasBackdrop
        handleClose={() => {
          setUserDisplayInfo(null);
        }}
      >
        {userDisplayInfo ? (
          <UserInfo
            name={userDisplayInfo.name}
            avatar={userDisplayInfo.avatar}
            gender={userDisplayInfo.gender}
            phone={userDisplayInfo.phone}
          />
        ) : null}
      </Modal>
      {fadeAlert ? <FadeAlert message={t(fadeAlert)} /> : null}
      <Modal isOpen={modalOpen} hasBackdrop handleClose={() => {}}>
        <ErrorReload message={t("Socket connection error") + "!"} />
      </Modal>

      <div className="flex-container">
        <nav className="nav-tab">
          <SideBar
            curPage={page}
            onPageItemClick={(page) => {
              setSearchBarActive(false);
              setPage(page);
            }}
          />
          <div className="middle-tab">
            <MainHeader
              searchBarActive={searchBarActive}
              onSearchBarClick={() => {
                if (searchBarActive === false) setSearchBarActive(true);
              }}
              onClose={() => {
                setSearchBarActive(false);
                if (activeConversation) {
                  if (activeConversation.id !== activeConversationId) {
                    setActiveConversation(
                      getConversationById(activeConversationId)
                    );
                  }
                } else {
                  if (activeConversationId) {
                    setActiveConversation(
                      getConversationById(activeConversationId)
                    );
                  } else {
                    setActiveConversation(undefined);
                  }
                }
              }}
              onSearchItemClick={(conversation: ConversationEntity) => {
                setActiveConversation(conversation);
              }}
            />
            {!searchBarActive ? (
              page === "conversation" ? (
                <ConversationTab
                  username={user}
                  activeConversation={activeConversationId}
                />
              ) : (
                <Contact />
              )
            ) : null}
          </div>
        </nav>
        <div className="chat-view">
          {activeConversation ? (
            <ChatSection conversation={activeConversation} username={user} />
          ) : (
            <WelcomePage />
          )}
        </div>
      </div>
    </>
  );
};
export default Main;
