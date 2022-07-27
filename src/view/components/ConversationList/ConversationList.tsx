import React from "react";
import { Virtuoso } from "react-virtuoso";
import { ConversationEntity } from "../../../entities";
import useTranslation from "../../adapter/translation.adapter";
import Empty from "../Empty/Empty";
import Button from "../UI/Button/Button";
import ConversationItem from "./ConversationItem";

import "./ConversationList.scss";

export interface ConversationProps {
  list: ConversationEntity[];
  onItemClick: (conv: ConversationEntity) => void;
  selectedItemId?: string;
  username: string;
  hasMore?: Boolean;
  onLoadMore?: Function;
}

const ConversationList: React.FC<ConversationProps> = ({
  list,
  onItemClick,
  username,
  selectedItemId,
  hasMore = false,
  onLoadMore = void 0,
}: ConversationProps) => {
  const virtuosoRef = React.useRef<any>();
  const { t } = useTranslation();
  return list.length > 0 ? (
    <div className="conversation-list">
      <Virtuoso
        style={{
          flex: "1",
          height: "100%",
          overflowX: "hidden",
          marginBottom: "10px",
        }}
        ref={virtuosoRef}
        data={list}
        endReached={() => onLoadMore?.()}
        components={{
          Header: () => {
            return <div></div>;
          },
          Footer: () => {
            return (
              <div
                className="d-flex flex-center"
                style={{
                  padding: "0px 16px",
                  width: "100%",
                }}
              >
                {/* {hasMore && (
                  <Button
                    color={"primary"}
                    variant={"contained"}
                    size={"medium"}
                    onClick={() => {
                      onLoadMore?.();
                    }}
                  >
                    {t("Load more")}
                  </Button>
                )} */}
              </div>
            );
          },
        }}
        itemContent={(index, conversation) => {
          return (
            <div key={conversation.id + "index" + index}>
              <ConversationItem
                username={username}
                selected={
                  selectedItemId ? selectedItemId === conversation.id : false
                }
                conversation={conversation}
                onClick={onItemClick}
              />
            </div>
          );
        }}
      />
    </div>
  ) : null;
};

export default ConversationList;
