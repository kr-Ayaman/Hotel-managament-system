import { createContext } from 'react';

export const AuthContext = createContext({
  isLoggedIn: false,
  position: null,
  token: null,
  staffId: null,
  login: () => {},
  logout: () => {}
});
