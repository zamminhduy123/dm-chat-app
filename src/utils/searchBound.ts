export const lastCharacterBefore = (text: string) => {
  return (
    text.slice(0, text.length - 1) +
    String.fromCharCode(text.charCodeAt(text.length - 1) - 1)
  );
};

export const lastCharacterAfter = (text: string) => {
  return (
    text.slice(0, text.length - 1) +
    String.fromCharCode(text.charCodeAt(text.length - 1) + 1)
  );
};
