import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';

const Map = ({ weatherData }) => {
  const { coord } = weatherData;

  return (
    <MapContainer center={[coord.lat, coord.lon]} zoom={10} style={{ height: '400px', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[coord.lat, coord.lon]}>
        <Popup>{weatherData.name}</Popup>
      </Marker>
    </MapContainer>
  );
};

export default Map;

