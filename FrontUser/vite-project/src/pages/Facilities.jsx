import React from 'react'
import Slideshow from '../components/UIElements/Slideshow';
import "./Facilities.css"
import DividerLine from '../components/UIElements/DividerLine';
import CenteredText from '../components/UIElements/CenteredText';
import FeatureSection from '../components/UIElements/FeatureSection';
import image1 from '../assets/image1.png';
import swimming from "../assets/swimming.png";
import roombed from "../assets/roombed.png"
const images = [
  swimming,
    image1,
    roombed
  ];

const Facilities = () => {
  return (
    <div className="Facilities">
        <Slideshow images={images} />
      <DividerLine/>
      <CenteredText text="Facilities" />
      <p>We want your stay at our lush hotel to be truly unforgettable.  That's why we give special attention to all of your needs so
that we can ensure an experience quite unique. Luxury hotels offers the perfect setting with stunning views for leisure
and our modern luxury resort facilities will help you enjoy the best of all. </p>
<FeatureSection
        heading="State-of-the-Art Gym"
        text="Our modern gym is fully equipped with the latest fitness machines and free weights, offering everything you need for a comprehensive workout. Whether you’re maintaining your routine or trying something new, enjoy a dynamic fitness experience in a comfortable and motivating environment."
        imageSrc=".\src\assets\Gym.png"
        textPosition="left"
      />
      <FeatureSection
        heading="Refreshing Pool"
        text="Dive into relaxation with our sparkling swimming pool. Perfect for a refreshing swim or a leisurely float, it’s an ideal spot to unwind and enjoy a tranquil moment."
        imageSrc=".\src\assets\pool.png"
        textPosition="right"
      />
      <FeatureSection
        heading="Delightful Dining"
        text="Savor a delightful array of dishes at our restaurant, where exquisite flavors and a welcoming atmosphere come together to create a memorable dining experience."
        imageSrc=".\src\assets\restaurant.png"
        textPosition="left"
      />
      <FeatureSection
        heading="Sparkling Clean"
        text="Our efficient laundry service ensures your clothes are fresh and clean, providing a hassle-free way to stay looking sharp during your stay."
        imageSrc=".\src\assets\laundary.png"
        textPosition="right"
      />
    </div>
    
  )
}

export default Facilities
