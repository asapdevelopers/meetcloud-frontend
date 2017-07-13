import {config} from '../../config.js'

export function getBackgroundImage() {
  return fetch(config.backgroundImage, {mode: 'cors'});
}
