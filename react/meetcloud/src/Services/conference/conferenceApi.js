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
