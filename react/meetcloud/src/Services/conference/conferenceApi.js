import {config} from '../../config.js'

export function authenticateDomain(domain, room) {
  return fetch(config.api.conferente.authenticateDomain, {
    method: "POST",
    body: JSON.stringify({domain, room}),
    headers: {
      "Content-Type": "application/json"
    }
  });
}

export function authenticateToken(token) {
  return fetch(config.api.conferente.authenticateToken, {
    method: "POST",
    body: JSON.stringify({token}),
    headers: {
      "Content-Type": "application/json"
    }
  });
}
