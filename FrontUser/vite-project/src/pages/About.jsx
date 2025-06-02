import React from 'react';
import './About.css'; // Create a separate CSS file for styling
import aboutimage from "../../src/assets/aboutimage.png"
import FeatureSection from '../components/UIElements/FeatureSection';
const About = () => {
  return (
    <React.Fragment>
    <div className='About'>
      <h2 className="about-title">ABOUT US</h2>
      <div className="about-content">
        <img 
          src={aboutimage} // Replace with the path to the image you want to use
          alt="Hotel exterior"
          className="about-image"
          />
        <div className="about-text">
          <h3 className="about-heading">----- THE ULTIMATE HEAVEN OF LUXURY -----</h3>
          <p>
            XYZA Hotels are a luxurious retreat that offers an unparalleled blend of comfort, elegance, and warm hospitality.
            Our hotel is dedicated to providing an exceptional experience for our guests, making us the perfect destination 
            for business travelers, couples, and families alike.
          </p>
        </div>
      </div>
    </div>
    <div className="Values">
    <FeatureSection
      text= "The essence of X Y Z A is reflected in every aspect of who we are and what we do. We provide unparalleled service, comfort, and style while creating meaningful and memorable experiences.<br> By paying close attention to the small details that make a big difference, we inspire unforgettable experiences with every stay."
      imageSrc=".\src\assets\values1.png"
      textPosition="left"
    />
    <FeatureSection
      text= "The essence of X Y Z A is reflected in every aspect of who we are and what we do. We provide unparalleled service, comfort, and style while creating meaningful and memorable experiences.<br> By paying close attention to the small details that make a big difference, we inspire unforgettable experiences with every stay."
      imageSrc=".\src\assets\values2.png"
      textPosition="right"
    />
    <FeatureSection
      text= "The essence of X Y Z A is reflected in every aspect of who we are and what we do. We provide unparalleled service, comfort, and style while creating meaningful and memorable experiences.<br> By paying close attention to the small details that make a big difference, we inspire unforgettable experiences with every stay."
      imageSrc=".\src\assets\values3.png"
      textPosition="left"
    />
    <FeatureSection
      text= "The essence of X Y Z A is reflected in every aspect of who we are and what we do. We provide unparalleled service, comfort, and style while creating meaningful and memorable experiences.<br> By paying close attention to the small details that make a big difference, we inspire unforgettable experiences with every stay."
      imageSrc=".\src\assets\values4.png"
      textPosition="right"
    />
    </div>
          </React.Fragment>
  );
};

export default About;
