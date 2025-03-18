// App.js
import React, { useState } from 'react';
import './App.css';
import { GoogleMap, LoadScript, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';

function App() {
  const [directions, setDirections] = useState(null);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');

  // Callback that the DirectionsService will call once it gets the route
  const handleDirectionsCallback = (res) => {
    if (res !== null && res.status === 'OK') {
      setDirections(res);
    }
  };

  const handleGetRoute = () => {
    // You could also call your Node/Express backend here if you prefer
    // For now, we'll rely on the built-in DirectionsService below
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Daily Commute Portal</h1>
        
        <div>
          <input
            type="text"
            placeholder="Enter origin"
            value={origin}
            onChange={(e) => setOrigin(e.target.value)}
          />
          <input
            type="text"
            placeholder="Enter destination"
            value={destination}
            onChange={(e) => setDestination(e.target.value)}
          />
          <button onClick={handleGetRoute}>Get Route</button>
        </div>

        <div style={{ marginTop: '20px' }}>
          <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
            <GoogleMap
              center={{ lat: 37.7749, lng: -122.4194 }}
              zoom={8}
              mapContainerStyle={{ height: '400px', width: '800px' }}
            >
              {/* Only load DirectionsService if both origin and destination are set */}
              {origin && destination && (
                <DirectionsService
                  options={{
                    origin,
                    destination,
                    travelMode: 'DRIVING',
                  }}
                  callback={handleDirectionsCallback}
                />
              )}
              
              {/* Render the route once we receive it */}
              {directions && <DirectionsRenderer directions={directions} />}
            </GoogleMap>
          </LoadScript>
        </div>
      </header>
    </div>
  );
}

export default App;
