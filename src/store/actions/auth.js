import * as authActions from "../../constants/actions/authActions";

export const authorize = (email, password) => ({
  type: authActions.AUTH_REQUEST,
  payload: { email, password }
});

export const register = (username, password, firstName, lastName) => ({
  type: authActions.AUTH_REGISTER,
  payload: { username, password, firstName, lastName }
});

export const logout = () => ({ type: authActions.AUTH_LOGOUT });
