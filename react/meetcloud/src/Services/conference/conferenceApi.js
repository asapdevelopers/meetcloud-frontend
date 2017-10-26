import {config} from '../../config.js'


export function authenticateDomain(domain, room) {
  return fetch(config.api.conference.authenticateDomain, {
    method: "POST",
    body: JSON.stringify({domain, room}),
    headers: {
      "Content-Type": "application/json"
    }
  });
}

export function authenticateToken(token) {
  return fetch(config.api.conference.authenticateToken({token}), {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  });
}

export function inviteToConference(email, link) {
  return fetch(config.api.site.inviteToConference, {
    method: "POST",
    body: JSON.stringify({email, link}),
    headers: {
      "Content-Type": "application/json"
    }
  });
}
