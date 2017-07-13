const conferenceApiPrefix = "http://localhost:8000/"

export const config = {
  api: {
    conference: {
      authenticateDomain: conferenceApiPrefix + 'auth/domain/',
      authenticateToken: conferenceApiPrefix + 'auth/token/'
    }
  },
  backgroundImagePrefix: 'https://bing.com',
  backgroundImage: "http://feeds.feedburner.com/bingimages" //'http://www.bing.com/HPImageArchive.aspx?format=js&idx=0&n=1&mkt=en-US'
};
