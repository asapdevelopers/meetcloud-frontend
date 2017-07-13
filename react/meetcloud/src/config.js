const environments = ['local', 'test', 'prod'];
const environment = environments[0]

let conferenceApiPrefix = "http://localhost:8000/"
switch (environment) {
  case 'test':
    conferenceApiPrefix = "http://localhost:8000/"
    break;
  case 'prod':
    conferenceApiPrefix = "http://localhost:8000/"
    break;
}

function parseRoute(route, params) {
  for (let k in params) {
    route = route.replace('{' + k + '}', params[k])
  }
  return route;
}

export const config = {
  api: {
    conference: {
      authenticateDomain: conferenceApiPrefix + 'auth/domain/',
      authenticateToken: function(obj) {
        return parseRoute(conferenceApiPrefix + 'auth/token/?token={token}', obj);
      }
    },
    site: {
      backgroundImage: conferenceApiPrefix + 'site/background/'
    }
  }
};
