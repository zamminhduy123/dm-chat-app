import React from "react";
import { ConversationEntity } from "../../../entities";
import useTranslation from "../../adapter/translation.adapter";
import Empty from "../Empty/Empty";
import ConversationItem from "./ConversationItem";

import "./ConversationList.scss";

export interface ConversationProps {
  list: ConversationEntity[];
  onItemClick: (conv: ConversationEntity) => void;
  selectedItemId?: string;
}

const ConversationList: React.FC<ConversationProps> = ({
  list,
  onItemClick,
  selectedItemId,
}: ConversationProps) => {
  return (
    <>
      {list.length > 0 ? (
        <ul className="conversation-list">
          {list.map((conversation: ConversationEntity, index: number) => {
            return (
              <ConversationItem
                selected={
                  selectedItemId ? selectedItemId === conversation.id : false
                }
                key={conversation.id + "index" + index}
                conversation={conversation}
                onClick={onItemClick}
              />
            );
          })}
        </ul>
      ) : null}
    </>
  );
};

export default ConversationList;
