import React, { useState } from 'react';
import { GoogleMap, LoadScript, DirectionsService, DirectionsRenderer } from '@react-google-maps/api';

const MapComponent = () => {
  const [directions, setDirections] = useState(null);
  const [origin, setOrigin] = useState('');
  const [destination, setDestination] = useState('');

  const handleDirectionsCallback = (res) => {
    if (res !== null && res.status === 'OK') {
      setDirections(res);
    }
  };

  const handleGetRoute = () => {
    // Could call your backend or directly use DirectionsService
  };

  return (
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

      <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}>
        <GoogleMap 
          center={{ lat: 37.7749, lng: -122.4194 }} 
          zoom={8} 
          mapContainerStyle={{ height: '400px', width: '800px' }}
        >
          {origin && destination && (
            <DirectionsService
              options={{
                destination,
                origin,
                travelMode: 'DRIVING',
              }}
              callback={handleDirectionsCallback}
            />
          )}
          {directions && <DirectionsRenderer directions={directions} />}
        </GoogleMap>
      </LoadScript>
    </div>
  );
};

export default MapComponent;
