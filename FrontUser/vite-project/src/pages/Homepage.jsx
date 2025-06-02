import React from 'react'
import Slideshow from '../components/UIElements/Slideshow';
import "./Homepage.css"
import DividerLine from '../components/UIElements/DividerLine';
import CenteredText from '../components/UIElements/CenteredText';
import FeatureSection from '../components/UIElements/FeatureSection';
import image1 from '../assets/image1.png';
import swimming from "../assets/swimming.png";
import roombed from "../assets/roombed.png"

import bedhome from "../assets/bedhome.png";
import overviewimg from"../assets/overviewimg.png"
import InfoCard from '../components/UIElements/InfoCard';
const images = [
    image1,
    swimming,
    roombed
  ];
const Homepage = () => {
  return (
    <div className="Homepage">
      <Slideshow images={images} />
      <DividerLine/>
      <CenteredText text="Overview" />
      <FeatureSection
      text= "The essence of X Y Z A is reflected in every aspect of who we are and what we do. We provide unparalleled service, comfort, and style while creating meaningful and memorable experiences.<br> By paying close attention to the small details that make a big difference, we inspire unforgettable experiences with every stay."
      imageSrc={overviewimg} // Replace with actual image path
      textPosition="left"
    />
    <h1>Welcome to XYZ</h1>
    <div className="card-container">
      <InfoCard
        image=".\src\assets\card1.png"
        heading="Seamless Connectivity"
        text="Driven by our commitment to providing exceptional and creative services, we offer complimentary Wi-Fi and relaxed workspaces. Equipped with all the essentials, you'll have everything you need for a productive and comfortable business experience."
      />
      <InfoCard
        image=".\src\assets\card2.png"
        heading="Elegant Sleep Experience"
        text="We offer carefully crafted, high-quality beds with cozy bedding designed to suit your personal preferences."
      />
      <InfoCard
        image=".\src\assets\card3.png"
        heading="Tailored Gourmet Dining"
        text="Indulge in our carefully curated menu featuring high-quality ingredients and flavors, offering a dining experience tailored to your taste and preferences."
      />
    </div>
      <FeatureSection
      heading="Comfort redefined"
      text="Our rooms are designed to transport you into an environment made for leisure. Take your mind off the day-to-day of home life and find a private paradise for yourself."
      buttonText="Explore"
      imageSrc={bedhome} // Replace with actual image path
      textPosition="left"
      buttonLink="/rooms"
    />
    <FeatureSection
      heading="Wellness and Recreation Awaits"
      text="Our hotel offers a range of top-tier services including a fully equipped gym, refreshing swimming pool, and rejuvenating spa, providing the perfect escape for both body and mind."
      buttonText="Explore"
      imageSrc=".\src\assets\wellness.png" // Replace with actual image path
      textPosition="right"
      buttonLink="/facilities"
    />
    </div>

  )
}

export default Homepage
