import { useState, useCallback, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
let logoutTimer;

export const useAuth = () => {
  const [token, setToken] = useState(null);
  const history = useHistory();
  const [tokenExpirationDate, setTokenExpirationDate] = useState();
  const [position, setPosition] = useState(null);
  const [staffId, setStaffId] = useState(null);

  const login = useCallback((staffId, position, token, expirationDate) => {
    setToken(token);
    setPosition(position);
    setStaffId(staffId);
    const tokenExpirationDate =
      expirationDate || new Date(new Date().getTime() + 1000 * 60 * 60); // Default to 1 hour
    setTokenExpirationDate(tokenExpirationDate);
    localStorage.setItem(
      'userData',
      JSON.stringify({
        staffId: staffId,
        position: position,
        token: token,
        expiration: tokenExpirationDate.toISOString()
      })
    );
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setTokenExpirationDate(null);
    setPosition(null);
    setStaffId(null);
    localStorage.removeItem('userData');
  }, []);

  useEffect(() => {
    if (token && tokenExpirationDate) {
      const remainingTime = tokenExpirationDate.getTime() - new Date().getTime();
      logoutTimer = setTimeout(logout, remainingTime);
    } else {
      clearTimeout(logoutTimer);
    }
  }, [token, logout, tokenExpirationDate]);

  useEffect(() => {
    const storedData = JSON.parse(localStorage.getItem('userData'));
    if (
      storedData &&
      storedData.token &&
      new Date(storedData.expiration) > new Date()
    ) {
      login(
        storedData.staffId,
        storedData.position,
        storedData.token,
        new Date(storedData.expiration)
      );
    }
  }, [login]);

  return { token, login, logout, position, staffId };
};
