import {config} from '../../config.js'

export function getBackgroundImage() {
  fetch(config.backgroundImage).then(function(response) {
    console.log(response);
    return response.blob();
  }).then(function(myBlob) {
    console.log("Error getting the backgroundImage");
  });
}
