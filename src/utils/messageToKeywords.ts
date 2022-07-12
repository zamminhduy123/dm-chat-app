const messageToKeywords = (message: string) => {
  message = message
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");

  const segmentVN = new Intl.Segmenter(undefined, { granularity: "word" });

  const segments = segmentVN.segment(message);

  const iterator1 = segments[Symbol.iterator]();

  const result = [];
  const seen: any = {};

  while (iterator1) {
    const word = iterator1.next().value;
    if (word) {
      if (word.isWordLike) {
        if (!seen.hasOwnProperty(word.segment)) {
          result.push(word.segment);
          seen[word] = true;
        }
      }
    } else {
      break;
    }
  }
  console.log(result);
  return result;
};
export default messageToKeywords;
