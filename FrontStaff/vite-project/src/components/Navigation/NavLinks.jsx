import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';

import { AuthContext } from '../../context/auth-context';
import './NavLinks.css';

const NavLinks = props => {
  const auth = useContext(AuthContext);

  return (
    <ul className="nav-links">
      {auth.position === 'Receptionist' && (
        <>
          <li>
            <NavLink to="/receptionist/home" activeClassName="selected">Home</NavLink>
          </li>
          <li>
            <NavLink to="/receptionist/guest" activeClassName="selected">Guests</NavLink>
          </li>
          <li>
            <NavLink to="/receptionist/rooms" activeClassName="selected">Rooms</NavLink>
          </li>
          <li>
            <NavLink to="/receptionist/banquets" activeClassName="selected">Banquets</NavLink>
          </li>
        </>
      )}

      {auth.position === 'Restaurant Staff' && (
        <>
          <li>
            <NavLink to="/restaurant/orders" activeClassName="selected">Orders</NavLink>
          </li>
          <li>
            <NavLink to="/restaurant/menu" activeClassName="selected">Menu</NavLink>
          </li>
          
        </>
      )}

      {auth.position === 'Manager' && (
        <>
          <li>
            <NavLink to="/manager/staff" activeClassName="selected">Staff</NavLink>
          </li>
          <li>
            <NavLink to="/restaurant/orders" activeClassName="selected">Restaurant</NavLink>
          </li>
        </>
      )}
    </ul>
  );
};

export default NavLinks;
