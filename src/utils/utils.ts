import { MessageEnum } from "../entities";
import useTranslation from "../view/adapter/translation.adapter";

export const updateObject = (oldObject: any, updatedProperties: any) => {
  return {
    ...oldObject,
    ...updatedProperties,
  };
};

export default function isFunc(maybeFunction: any): boolean {
  return maybeFunction instanceof Function;
}

/**
 * Function for classify displaying 'in' or 'ago' when display time
 * @param {*} time the time input
 * @returns the remaining time with value (integer) and type (string)
 */
export function getRemainingTime(time: number): {
  value: number;
  type: string;
} {
  const { t } = useTranslation();
  const remainingTime = Date.now() - new Date(time).getTime();
  const days = Math.floor(remainingTime / (1000 * 60 * 60 * 24));
  let returnedTime = {
    value: days,
    type: t("day"),
  };
  if (returnedTime.value === 0) {
    returnedTime = {
      value: Math.floor((remainingTime / (1000 * 60 * 60)) % 24), // convert to hours
      type: t("hour"),
    };
    //check if hours === 0 or Not
    if (returnedTime.value === 0) {
      returnedTime = {
        value: Math.floor((remainingTime / 1000 / 60) % 60), // convert to minutes
        type: t("minute"),
      };
    }
  }

  return returnedTime;
}

/*Fibonacci function */
export class Fibonacci {
  private static fibo = [0, 1];

  public static getFibo = (index: number) => {
    if (index >= this.fibo.length) {
      for (let i = this.fibo.length - 1; i <= index; i++) {
        this.fibo.push(this.fibo[i] + this.fibo[i - 1]);
      }
    }
    return this.fibo[index];
  };
}

export function capitalizeFirstLetter(string: string) {
  return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
}

export function mapMessageType(type: number): string {
  switch (type) {
    case 0:
      return "text";
    case 1:
      return "image";
    case 2:
      return "video";
    case 3:
      return "file";
    default:
      throw new Error("unknown message type");
  }
}

export function mapTypeMessage(mimeType: string) {
  const imageFile = /image.*/;
  const videoFile = /video.*/;
  if (mimeType.match(imageFile)) {
    return MessageEnum.image;
  }
  if (mimeType.match(videoFile)) {
    return MessageEnum.video;
  }
  return MessageEnum.file;
}

export function mapMessageStatus(status: number) {
  switch (status) {
    case 0:
      return "Sending";
    case 1:
      return "Sent";
    case 2:
      return "Received";
    case 3:
      return "Seen";
    case 4:
      return "Error";
    case 5:
      return "Decrypt fail";
    default:
      return "Error";
    //throw new Error("unknown message status");
  }
}

export function mapGender(gender: number) {
  switch (gender) {
    case 0:
      return "male";
    case 1:
      return "female";
    case 2:
      return "other";
    default:
      return "Unknown";
    //throw new Error("unknown message status");
  }
}

export function generateClientId() {
  return Date.now().toString();
}

export const imageValidation = (filedata: string) => {
  var extension = filedata.substring(5, filedata.lastIndexOf(";"));
  // console.log(extension);
  // Only process image files.
  var validFileType = "image/jpeg , image/png , image/jpg , image/webp";
  if (validFileType.toLowerCase().indexOf(extension) < 0) {
    return false;
  }
  return true;
};

export const isValidHttpUrl = (string: string) => {
  let url;

  try {
    url = new URL(string);
  } catch (_) {
    return false;
  }

  return url.protocol === "http:" || url.protocol === "https:";
};
