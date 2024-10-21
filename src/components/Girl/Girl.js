import React, { useState } from 'react';
import './Girl.css';
import Anna from '../../assets/girl/Anna.png';
import Ava from '../../assets/girl/Ava.png';
import Candy from '../../assets/girl/Candy.png';
import Chloe from '../../assets/girl/Chloe.png';
import Ella from '../../assets/girl/Ella.png';
import Emma from '../../assets/girl/Emma.png';
import Grace from '../../assets/girl/Grace.png';
import Isabella from '../../assets/girl/Isabella.png';
import Ivy from '../../assets/girl/Ivy.png';
import Lili from '../../assets/girl/Lili.png';
import Mia from '../../assets/girl/Mia.png';
import Olivia from '../../assets/girl/Olivia.png';
import Queen from '../../assets/girl/Queen.png';
import Ruby from '../../assets/girl/Ruby.png';
import Sophia from '../../assets/girl/Sophia.png';
import Zoe from '../../assets/girl/Zoe.png';

const girls = [
  { name: 'Anna', age: 19, image: Anna },
  { name: 'Ava', age: 26, image: Ava },
  { name: 'Candy', age: 20, image: Candy },
  { name: 'Chloe', age: 18, image: Chloe },
  { name: 'Ella', age: 25, image: Ella },
  { name: 'Emma', age: 22, image: Emma },
  { name: 'Grace', age: 26, image: Grace },
  { name: 'Isabella', age: 28, image: Isabella },
  { name: 'Ivy', age: 29, image: Ivy },
  { name: 'Lili', age: 21, image: Lili },
  { name: 'Mia', age: 18, image: Mia },
  { name: 'Olivia', age: 25, image: Olivia },
  { name: 'Queen', age: 26, image: Queen },
  { name: 'Ruby', age: 19, image: Ruby },
  { name: 'Sophia', age: 23, image: Sophia },
  { name: 'Zoe', age: 19, image: Zoe }
];

const Girl = () => {
  const [visibleGirls, setVisibleGirls] = useState(8);

  const showMoreGirls = () => {
    setVisibleGirls(prevVisibleGirls => prevVisibleGirls + 4);
  };

  return (
    <div className="girl">
      <div className="girl__container">
        <div className="girl__grid">
          {girls.slice(0, visibleGirls).map((girl, index) => (
            <div className={`girl__card ${index >= 8 ? 'slide-in' : ''}`} key={index}>
              <img src={girl.image} alt={girl.name} className="girl__card-image" />
              <h3>{girl.name}</h3>
              <p>Age: {girl.age}</p>
            </div>
          ))}
        </div>
        {visibleGirls < girls.length && (
          <button className="more-btn" onClick={showMoreGirls}>More Girls</button>
        )}
      </div>
    </div>
  );
};

export default Girl;
