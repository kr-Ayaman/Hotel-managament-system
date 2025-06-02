import { createContext } from 'react';

export const AuthContext = createContext({
  isLoggedIn: false,
  guestId: null,
  token: null,
  login: () => {},
  logout: () => {}
});