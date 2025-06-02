import React from 'react';
import { Link } from 'react-router-dom';
import './FeatureSection.css';

const FeatureSection = ({ 
  heading, 
  text, 
  buttonText, 
  buttonLink, // Link for the button
  imageSrc, 
  textPosition = 'left' 
}) => {
  return (
    <div className={`feature-section ${textPosition === 'right' ? 'text-right' : 'text-left'}`}>
      <div className="feature-content">
        {heading && <h2 className="feature-heading">{heading}</h2>}
        {text && <p className="feature-text">{text.split('<br>').map((line, index) => (
        <p key={index}>{line}</p>
      ))}</p>}
        {buttonText && buttonLink ? (
          <Link to={buttonLink} className="feature-button">
            {buttonText}
          </Link>
        ) : (
          buttonText && <button className="feature-button">{buttonText}</button>
        )}
      </div>
      <div className="feature-image">
        <img src={imageSrc} alt="Feature" />
      </div>
    </div>
  );
};

export default FeatureSection;
