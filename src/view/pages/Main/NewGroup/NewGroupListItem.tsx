import { faXmark, faXmarkCircle } from "@fortawesome/free-solid-svg-icons";
import React from "react";
import Avatar from "../../../components/Avatar/Avatar";
import Icon from "../../../components/UI/Icon/Icon";

interface NewGroupListItemProps {
  avatar: string;
  name: string;
  deleteItem?: Function;
  onClick?: Function;
}
const NewGroupListItem = ({
  avatar,
  name,
  deleteItem,
  onClick = () => {},
}: NewGroupListItemProps) => {
  return (
    <li onClick={() => onClick()}>
      <Avatar src={avatar} size="small" />
      <p>{name}</p>
      <div style={{ flex: 1 }}></div>
      {deleteItem ? (
        <Icon
          icon={faXmark}
          size="small"
          rounded
          onClick={() => deleteItem()}
        />
      ) : null}
    </li>
  );
};

export default NewGroupListItem;
