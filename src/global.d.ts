import { API } from "../build/preload";

declare global {
  interface Window {
    electronAPI: typeof API;
  }
  declare module "*.png";
  declare module "*.jpg";
  declare module "*.svg";
}
