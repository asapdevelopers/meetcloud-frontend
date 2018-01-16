import { api } from "../../configuration";

export function getBackgroundImage() {
  return fetch(api.site.backgroundImage, { mode: "cors" });
}

export default getBackgroundImage;
