import React from "react";

export function useTheme() {
  const localTheme = window.localStorage.getItem("theme");
  const [theme, setTheme] = React.useState<string>(localTheme || "light");

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
      window.localStorage.setItem("theme", "dark");
      document.body.classList.remove("light-mode");
      document.body.classList.add("dark-mode");
    } else {
      setTheme("light");
      window.localStorage.setItem("theme", "light");
      document.body.classList.remove("dark-mode");
      document.body.classList.add("light-mode");
    }
  };
  React.useEffect(() => {
    document.body.classList.add(`${theme}-mode`);
  }, []);
  return { theme, toggleTheme };
}
