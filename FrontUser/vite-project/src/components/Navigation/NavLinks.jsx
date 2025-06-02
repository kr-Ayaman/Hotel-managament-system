import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';

import { AuthContext } from '../../context/auth-context';
import './NavLinks.css';

const NavLinks = props => {
  const auth = useContext(AuthContext);

  return (
    <ul className="nav-links">
      <li>
        <NavLink to="/" activeClassName="selected" exact>
          Home
        </NavLink>
      </li>
        <li>
          <NavLink to="/facilities" activeClassName="selected">Facilities</NavLink>
        </li>
        <li>
          <NavLink to="/rooms" activeClassName="selected">Rooms</NavLink>
        </li>
        <li>
          <NavLink to="/banquets" activeClassName="selected">Banquets</NavLink>
        </li>
        <li>
          <NavLink to="/contact-us" activeClassName="selected">Contact-us</NavLink>
        </li>
    </ul>
  );
};

export default NavLinks;
