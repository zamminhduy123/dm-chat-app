import React from "react";
import useTranslation from "../../../adapter/translation.adapter";
import { ConversationController } from "../../../../controller";
import { useConversation } from "../../../adapter/useConversation";
import { useCurrentConversation } from "../../../adapter/useCurrentConversation";
import ConversationList from "../../../components/ConversationList/ConversationList";
import Empty from "../../../components/Empty/Empty";
import useAuthApp from "../../../adapter/useAuthApp";
import { ConversationEntity } from "../../../../entities";

export type ConversationProps = {
  // loggedOut: Boolean;
  activeConversation: string;
  username: string;
};

const Conversation: React.FC<ConversationProps> = ({
  activeConversation,
  username,
}: ConversationProps) => {
  const { t } = useTranslation();

  let conversationList = useConversation();

  return (
    <div className="conversation-tab-container">
      <div className="conversation-tab-header">
        <select className="filter">
          <option value={"all"}>{t("All")}</option>
        </select>
      </div>
      {conversationList && conversationList.length ? (
        <ConversationList
          username={username}
          list={conversationList}
          selectedItemId={activeConversation}
          onItemClick={(conversation) => {
            // console.log("ITEMCLICK");
            ConversationController.getInstance().select(conversation.id);
          }}
        />
      ) : (
        <Empty message={t("Conversation empty")} />
      )}
    </div>
  );
};

export default Conversation;
