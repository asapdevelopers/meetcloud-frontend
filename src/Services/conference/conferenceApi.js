import { api } from "../../configuration";

export function authenticateDomain(domain, room) {
  return fetch(api.conference.authenticateDomain, {
    method: "POST",
    body: JSON.stringify({ domain, room }),
    headers: {
      "Content-Type": "application/json"
    }
  });
}

export function authenticateToken(token) {
  return fetch(api.conference.authenticateToken({ token }), {
    method: "GET",
    headers: {
      "Content-Type": "application/json"
    }
  });
}

export function inviteToConference(email, link) {
  return fetch(api.site.inviteToConference, {
    method: "POST",
    body: JSON.stringify({ email, link }),
    headers: {
      "Content-Type": "application/json"
    }
  });
}
