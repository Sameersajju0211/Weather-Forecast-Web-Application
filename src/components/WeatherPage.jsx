import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { Line } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import Select from 'react-select';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './WeatherPage.css';

const WeatherPage = () => {
  const { city } = useParams();
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [units, setUnits] = useState('metric');
  const [cityCoords, setCityCoords] = useState(null);
  const [isRainy, setIsRainy] = useState(false); // New state for rain effect

  const fetchWeatherData = async () => {
    try {
      const apiKey = '9c802809880932c2feeece5e5b804b2d'; 
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=${units}`
      );
      setWeatherData(response.data);

      
      const { lat, lon } = response.data.city.coord;
      setCityCoords({ lat, lon });

      
      const mainDescription = response.data.list[0].weather[0].main.toLowerCase();
      if (mainDescription === 'rain' || mainDescription === 'clouds') {
        setIsRainy(true);
      } else {
        setIsRainy(false);
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeatherData();
  }, [city, units]);

  const generateRaindrops = () => {
    const raindrops = [];
    if (isRainy) { 
      for (let i = 0; i < 100; i++) {
        const style = {
          left: `${Math.random() * 100}vw`,
          top: `${Math.random() * 100}vh`,
          width: `${Math.random() * 2 + 1}px`,
          height: `${Math.random() * 20 + 10}px`,
          animationDuration: `${Math.random() * 2 + 1}s`,
          animationDelay: `${Math.random() * 2}s`,
        };
        raindrops.push(<div key={i} className="drop" style={style}></div>);
      }
    }
    return raindrops;
  };

  // Prepare data for chart
  const chartData = {
    labels: weatherData ? weatherData.list.slice(0, 5).map(dayData => new Date(dayData.dt * 1000).toLocaleDateString('en-US', { weekday: 'long' })) : [],
    datasets: [
      {
        label: 'High Temperature',
        data: weatherData ? weatherData.list.slice(0, 5).map(dayData => dayData.main.temp_max) : [],
        borderColor: '#FF5733',
        backgroundColor: 'rgba(255, 87, 51, 0.2)',
        borderWidth: 2,
        fill: true,
      },
      {
        label: 'Low Temperature',
        data: weatherData ? weatherData.list.slice(0, 5).map(dayData => dayData.main.temp_min) : [],
        borderColor: '#33C1FF',
        backgroundColor: 'rgba(51, 193, 255, 0.2)',
        borderWidth: 2,
        fill: true,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    scales: {
      x: {
        beginAtZero: true,
      },
      y: {
        beginAtZero: true,
        ticks: {
          callback: (value) => `${value} ${units === 'metric' ? '°C' : '°F'}`,
        },
      },
    },
  };

  const unitOptions = [
    { value: 'metric', label: 'Celsius (°C)' },
    { value: 'imperial', label: 'Fahrenheit (°F)' },
  ];

  const handleUnitChange = (selectedOption) => {
    setUnits(selectedOption.value);
  };

  return (
    <div className={`weather-page ${isRainy ? 'rainy-background' : 'sunny-background'}`}>
      <div className="rain">
        {generateRaindrops()}
      </div>

      <h2>Weather in {city} (5-Day Forecast) 🌤️</h2>

      <div className="unit-selector">
        <Select
          value={unitOptions.find(option => option.value === units)}
          onChange={handleUnitChange}
          options={unitOptions}
          placeholder="Select unit"
          className='unit'
        />
      </div>

      {loading ? (
        <p className="loading-message">Loading...</p>
      ) : error ? (
        <p className="error-message">Error: {error.message}</p>
      ) : (
        <div>
          <div className="weather-cards-container">
            {weatherData ? (
              weatherData.list.slice(0, 5).map((dayData, index) => (
                <div key={index} className="day-weather">
                  <p>{new Date(dayData.dt * 1000).toLocaleDateString('en-US', { weekday: 'long' })}</p>
                  <img src={`http://openweathermap.org/img/wn/${dayData.weather[0].icon}@2x.png`} alt="Weather icon" className="weather-icon" />
                  <p className="high-temp">High: {dayData.main.temp_max} {units === 'metric' ? '°C' : '°F'}</p>
                  <p className="low-temp">Low: {dayData.main.temp_min} {units === 'metric' ? '°C' : '°F'}</p>
                  <p className="humidity">Humidity: {dayData.main.humidity}%</p>
                  <p className="wind-speed">Wind Speed: {dayData.wind.speed} {units === 'metric' ? 'm/s' : 'mph'}</p>
                  <p className="pressure">Pressure: {dayData.main.pressure} hPa</p>
                  <p className="description">Description: {dayData.weather[0].description}</p>
                </div>
              ))
            ) : (
              <p>Weather data not found.</p>
            )}
          </div>

          {cityCoords && (
            <div className="map-container">
              <MapContainer
                center={[cityCoords.lat, cityCoords.lon]}
                zoom={10}
                style={{ height: '400px', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={[cityCoords.lat, cityCoords.lon]}>
                  <Popup>{city}</Popup>
                </Marker>
              </MapContainer>
            </div>
          )}

          {weatherData && (
            <div className="chart-container">
              <Line data={chartData} options={chartOptions} />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WeatherPage;
