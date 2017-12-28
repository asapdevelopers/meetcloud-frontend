import * as authActions from '../../constants/actions/authActions';

export const authorize = (email, password) => ({ type: authActions.AUTH_REQUEST, payload: { email, password } });

export const register = (username, password, first_name, last_name) => ({ type: authActions.AUTH_REGISTER, payload: { username, password, first_name, last_name } });

export const logout = () => ({ type: authActions.AUTH_LOGOUT });