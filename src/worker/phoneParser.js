function isNumber(_string) {
  return _string >= "0" && _string <= "9";
}

/**
 * Encodes special html characters
 * @param string
 * @return {*}
 */
function escape(text) {
  return text.replace(/[<>\&\"\']/g, function (c) {
    return "&#" + c.charCodeAt(0) + ";";
  });
}
function phoneParser(longText) {
  const phoneReg = /(84|0[3|5|7|8|9])+([0-9]{8})\b/g;

  longText = escape(longText);

  let i = 0,
    j = 0;
  while (i < longText.length - 9 && j < longText.length) {
    if (isNumber(longText[j])) {
      i = j;
      let tempNumber = longText[i];
      for (j = i + 1; j < i + 10; j++) {
        if (isNumber(longText[j])) {
          tempNumber += longText[j];
        } else {
          i = j + 1;
          break;
        }
      }

      if (tempNumber.length === 10) {
        if (tempNumber.match(phoneReg)) {
          longText =
            longText.slice(0, i - 1 < 0 ? 0 : i - 1) +
            `<span class="user-phone">${tempNumber}</span>` +
            longText.slice(j);
        }
      }
      i += 43;
      j = i;
    } else {
      i = j;
    }
    j++;
  }
  return `<span>${longText}</span>`;
}

if ("function" === typeof self.importScripts) {
  self.addEventListener("message", async (event) => {
    switch (event.data.event) {
      case "phone-check":
        // console.log(event.data);
        postMessage({
          event: "phone-parse-result",
          text: phoneParser(event.data.text),
          id: event.data.id,
        });
        break;
    }
  });
}
