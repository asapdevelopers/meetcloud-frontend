import {config} from '../../config.js'

export function getBackgroundImage() {
  return fetch(config.api.site.backgroundImage, {mode: 'cors'});
}
