import React, { useState, useEffect } from 'react';
import Slideshow from '../components/UIElements/Slideshow';
import "./Rooms.css";
import RoomCard from '../components/UIElements/RoomCard';
import DividerLine from '../components/UIElements/DividerLine';
import CenteredText from '../components/UIElements/CenteredText';
import image1 from '../assets/image1.png';
import swimming from "../assets/swimming.png";
import banquetimg from "../assets/banquet.png";
import roombed from "../assets/roombed.png";
import { useHttpClient } from '../hooks/http-hook';

const images = [
    banquetimg,
    image1,
    swimming,
    roombed
];

const Banquet = () => {
  const [prices, setPrices] = useState({
    A200: null,
    A250: null,
    A300: null,
    A350: null
  });

  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const data = await sendRequest('http://localhost:5000/guestportal/getbanquetsprice','GET', null);
        
        const priceMap = {};
        data.forEach(banquet => {
          priceMap[`A${banquet.capacity}`] = banquet.price_per_hour;
        });
        setPrices({
          A200: priceMap.A200 || 0,
          A250: priceMap.A250 || 0,
          A300: priceMap.A300 || 0,
          A350: priceMap.A350 || 0
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
      <CenteredText text="Banquet Hall" />
      <p>Celebrate your special moments in elegance at our hotel's luxurious banquet hall. Perfect for weddings, corporate events, parties,
         and celebrations, our venue offers exceptional service, exquisite décor, state-of-the-art amenities, and customizable packages to make your
         event truly unforgettable.</p>
<RoomCard 
      image=".\src\assets\singleroom.png" 
      price={prices.A200} 
      details="1"
      room_title="Capacity - 200"
    />
    <RoomCard 
      image=".\src\assets\doubleroom.png" 
      price={prices.A250} 
      details="1"
      room_title="Capacity - 250"
    />
    <RoomCard 
      image=".\src\assets\singleroom.png" 
      price={prices.A300} 
      details="1"
      room_title="Capacity - 300"
    />
    <RoomCard 
      image=".\src\assets\singleroom.png" 
      price={prices.A350} 
      details="1"
      room_title="Capacity - 350"
    />
    </div>
  )
}

export default Banquet
