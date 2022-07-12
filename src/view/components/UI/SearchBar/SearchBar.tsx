import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMagnifyingGlass,
  faCircleXmark,
} from "@fortawesome/free-solid-svg-icons";
import React, { useEffect, useLayoutEffect, useRef, useState } from "react";
import useTranslation from "../../../adapter/translation.adapter";
import "./SearchBar.scss";

interface SearchBarProps {
  value?: string;
  onClick?: () => void;
  onChange?: (event: React.FormEvent<HTMLInputElement>) => void;
  onSubmit?: (event: React.FormEvent<HTMLInputElement>) => void;
  onClearValue?: () => void;
}

const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onClick = () => {},
  onChange = (event) => {},
  onSubmit = (event) => {},
  onClearValue = () => {},
}: SearchBarProps) => {
  //styling logic
  const { t } = useTranslation();
  const [focus, setFocus] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div
      onClick={() => onClick()}
      className={`search-bar ${focus ? " focus" : ""}`}
    >
      <div
        className="search-bar-icon flex-center"
        onClick={() => {
          setFocus(true);
          inputRef.current?.focus();
        }}
      >
        <FontAwesomeIcon id="contact-search" icon={faMagnifyingGlass} />
      </div>
      <input
        id="contact-search-input"
        ref={inputRef}
        placeholder={t("Search")}
        value={value}
        autoComplete="off"
        type="text"
        maxLength={100}
        onFocus={() => {
          setFocus(true);
        }}
        onBlur={() => {
          setFocus(false);
        }}
        onChange={(event) => onChange(event)}
        onSubmit={(event) => onSubmit(event)}
      />
      <div
        className={"search-bar-icon flex-center"}
        onClick={() => {
          inputRef.current?.focus();
        }}
      >
        <FontAwesomeIcon
          className={!value ? "hide" : ""}
          style={{ cursor: `${!value ? "text" : "pointer"}` }}
          id="cancel-button"
          icon={faCircleXmark}
          onClick={() => {
            value
              ? onClearValue()
              : () => {
                  inputRef.current?.focus();
                };
          }}
        />
      </div>
    </div>
  );
};

export default SearchBar;
