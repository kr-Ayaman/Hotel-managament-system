import React, { useState, useEffect } from 'react';
import Slideshow from '../components/UIElements/Slideshow';
import "./Rooms.css";
import RoomCard from '../components/UIElements/RoomCard';
import DividerLine from '../components/UIElements/DividerLine';
import CenteredText from '../components/UIElements/CenteredText';
import image1 from '../assets/image1.png';
import swimming from "../assets/swimming.png";
import roombed from "../assets/roombed.png";
import { useHttpClient } from '../hooks/http-hook';

const images = [
  roombed,
  image1,
  swimming
];

const Rooms = () => {
  const [prices, setPrices] = useState({
    Single: null,
    Double: null,
    Large: null
  });

  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const data = await sendRequest('http://localhost:5000/guestportal/getroomsprice','GET', null);
        
        // Map the fetched data into a key-value pair for easy access
        const priceMap = {};
        data.forEach(room => {
          priceMap[room.room_type] = room.price_per_night;
        });

        setPrices({
          Single: priceMap.Single || 0,
          Double: priceMap.Double || 0,
          Large: priceMap.Large || 0
        });
      } catch (error) {
        console.error('Error fetching prices:', error);
      }
    };

    fetchPrices();
  }, [sendRequest]);
  return (
    <div className='Rooms'>
      <Slideshow images={images} />
      <DividerLine />
      <CenteredText text="Rooms" />
      <p>We want your stay at our lush hotel to be truly unforgettable. That's why we give special attention to all of your needs so
        that we can ensure an experience quite unique. Luxury hotels offers the perfect setting with stunning views for leisure
        and our modern luxury resort facilities will help you enjoy the best of all.</p>
<RoomCard 
      image=".\src\assets\singleroom.png" 
      price={prices.Single} 
      details="1"
      room_title="Single Room"
    />
    <RoomCard 
      image=".\src\assets\doubleroom.png" 
      price={prices.Double} 
      details="1"
      room_title="Double Room"
    />
    <RoomCard 
      image=".\src\assets\singleroom.png" 
      price={prices.Large} 
      details="1"
      room_title="Large Room"
    />
    </div>
  )
}

export default Rooms
