import React, { useState, useEffect } from 'react';
import './Slideshow.css';

function Slideshow({ images }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000); // Change image every 5 seconds
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div className="slideshow">
      {images.map((image, index) => (
        <div
          key={index}
          className={`slide ${index === currentIndex ? 'active' : ''}`}
          style={{ backgroundImage: `url(${image})` }}
        ></div>
      ))}
      {/* Text overlay outside of individual slides */}
      <div className="text-overlay">
        <h1>WELCOME TO</h1>
        <h2>XYZ</h2>
        <p>Book your stay and enjoy luxury redefined at the most affordable rates.</p>
      </div>
    </div>
  );
}

export default Slideshow;
