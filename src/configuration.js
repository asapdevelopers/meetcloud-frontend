const environments = ["local", "test", "prod"];
const environment = environments[2];

let conferenceApiPrefix;

switch (environment) {
  case "test":
    conferenceApiPrefix = "http://localhost:8000/";
    break;
  case "prod":
    conferenceApiPrefix = "https://meetcloud-api.asapdevelopers.com/";
    break;
  default:
    conferenceApiPrefix = "https://localhost:8000/";
}

function parseRoute(route, params) {
  for (const k in params) {
    route = route.replace(`{${k}}`, params[k]);
  }
  return route;
}

export const api = {
  conference: {
    authenticateDomain: `${conferenceApiPrefix}auth/domain/`,
    authenticateToken(obj) {
      return parseRoute(`${conferenceApiPrefix}auth/token/?token={token}`, obj);
    }
  },
  site: {
    backgroundImage: `${conferenceApiPrefix}site/background/`,
    inviteToConference: `${conferenceApiPrefix}site/inviteToConference/`
  }
};
