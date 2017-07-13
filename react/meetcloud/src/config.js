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


export const config = {
  api: {
    conference: {
      authenticateDomain: conferenceApiPrefix + 'auth/domain/',
      authenticateToken: conferenceApiPrefix + 'auth/token/'
    },
    site: {
      backgroundImage: conferenceApiPrefix + 'site/background/'
    }
  }
};
