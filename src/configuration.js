const conferenceApiPrefix = process.env.REACT_APP_API_PREFIX;

function parseRoute(route, params) {
  let newRoute = route;
  Object.keys(params).forEach(key => {
    newRoute = route.replace(`{${key}}`, params[key]);
  });
  return newRoute;
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

export default api;
