import React from 'react';
import './App.css';
import Header from "./components/Header/Header";
import Banner from "./components/Banner/Banner";

function App() {


  return (
    <div className="App">
      <header className="App-header">
        <Header />
        <Banner />
      </header>
    </div>
  );
}

export default App;
