import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-section address">
        <h2 className="footer-logo">
          <Link to="/">X Y Z A</Link>
        </h2>
        <p>HOTELS</p>
        <p>497 Mansarovar Rd. Indore, MP</p>
        <p>Pin-452020</p>
        <p>+91 8302XXXXXX</p>
        <p>xyzindore@gmail.com</p>
      </div>
      <div className="footer-section links">
        <Link to="/about-us">About Us</Link>
        <Link to="/careers">Careers</Link>
        <Link to="/contact-us">Contact</Link>
        <Link to="/terms-and-conditions">Terms & Conditions</Link>
      </div>
      <div className="footer-section social">
        <p><i className="fab fa-facebook-f"></i> Facebook</p>
        <p><i className="fab fa-twitter"></i> Twitter</p>
        <p><i className="fab fa-instagram"></i> Instagram</p>
      </div>
    
    </footer>
  );
};

export default Footer;
