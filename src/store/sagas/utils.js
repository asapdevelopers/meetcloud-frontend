export const fetchJSON = (url, options = {}) => {
  // Include JWT Token
  let authData = {};
  if (localStorage.auth) {
    authData = JSON.parse(localStorage.auth);
    options.headers.Authorization = `Token ${authData.token}`;
  }
  return new Promise((resolve, reject) =>
    fetch(url, options)
      .then(
        response =>
          response.status !== 200 && response.status !== 201
            ? reject(response)
            : response
      )
      .then(response => response.json().catch(err => ({})))
      .then(response => resolve(response))
      .catch(error => reject(error))
  );
};

export const handleError = status => {
  let message = "";
  switch (status) {
    case 500:
      message = "Internal Server Error";
      break;
    case 401:
      message = "Invalid credentials";
      break;
    case 403:
      message = "Invalid credentials";
      break;
    default:
      console.log("Error ", status);
      message = "Something went wrong";
  }
  return message;
};
