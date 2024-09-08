import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import Select from 'react-select';
// Removed react-leaflet imports

import './CitiesTable.css'; // Assuming you have the CSS file

const CitiesTable = () => {
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [time, setTime] = useState('');
  const [currentCity, setCurrentCity] = useState(null);
  const [currentTemperature, setCurrentTemperature] = useState(null);
  const citiesPerPage = 10;

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      const seconds = now.getSeconds().toString().padStart(2, '0');
      setTime(`${hours}:${minutes}:${seconds}`);
    };

    const intervalId = setInterval(updateTime, 1000);
    return () => clearInterval(intervalId);
  }, []);

  const fetchCityFromCoords = async (lat, lon) => {
    try {
      const apiKey = '9c802809880932c2feeece5e5b804b2d'; // Replace with your OpenWeatherMap API key
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`
      );
      return response.data.name; // City name from the response
    } catch (error) {
      console.error('Error fetching city name from coordinates:', error);
      return null;
    }
  };

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          const cityName = await fetchCityFromCoords(latitude, longitude);
          setCurrentCity(cityName);
          try {
            const apiKey = '9c802809880932c2feeece5e5b804b2d'; // Replace with your OpenWeatherMap API key
            const response = await axios.get(
              `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`
            );
            setCurrentTemperature(response.data.main.temp);
          } catch (error) {
            console.error('Error fetching current temperature:', error);
            setCurrentTemperature(null);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  const fetchCities = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `https://public.opendatasoft.com/api/records/1.0/search/?dataset=geonames-all-cities-with-a-population-1000&q=&rows=${citiesPerPage}&start=${(currentPage - 1) * citiesPerPage}`
      );
      setCities(response.data.records);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching cities:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCities();
  }, [currentPage]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  const handleSelectChange = (selectedOption) => {
    setSelectedCity(selectedOption);
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const filteredCities = cities.filter((city) =>
    city.fields.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const paginatedCities = filteredCities.slice(
    (currentPage - 1) * citiesPerPage,
    currentPage * citiesPerPage
  );

  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(filteredCities.length / citiesPerPage); i++) {
    pageNumbers.push(i);
  }

  const customStyles = {
    control: (provided) => ({
      ...provided,
      backgroundColor: '#3498db',
      borderColor: '#2980b9',
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#1f78d1',
      },
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: '#2980b9',
      color: 'white',
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#1f78d1' : '#2980b9',
      color: 'white',
      '&:hover': {
        backgroundColor: '#1f78d1',
      },
    }),
    singleValue: (provided) => ({
      ...provided,
      color: 'white',
    }),
    placeholder: (provided) => ({
      ...provided,
      color: 'white',
    }),
  };

  const selectedCityData = cities.find((city) => city.fields.name === selectedCity?.value);

  return (
    <div className="cities-table-container">
      {/* Navbar */}
      <nav className="navbar">
        <h1 className="navbar-title">Weather Forecast☔</h1>
        <div className="clock">{time}</div>

        <div className="navbar-search">
          <input
            type="text"
            placeholder="Search cities..."
            value={searchTerm}
            onChange={handleSearch}
            className="navbar-input"
          />
          <Select
            value={selectedCity}
            onChange={handleSelectChange}
            options={filteredCities.map((city) => ({
              value: city.fields.name,
              label: city.fields.name,
            }))}
            placeholder="Select a city"
            className="navbar-select"
            styles={customStyles}
          />
        </div>
      </nav>
      {currentCity && currentTemperature !== null && (
        <div className="current-location">
          <p style={{ fontFamily: "'Courier New', Courier, monospace", fontWeight: "bold" }}>
            Current Location📌: <span className="location">{currentCity}</span>
          </p>

          <p style={{ fontFamily: "'Courier New', Courier, monospace", fontWeight: "bold" }}>
            Current Temperature🌡️: <span className="temperature">{currentTemperature} °C</span>
          </p>
        </div>
      )}

      {/* Cities Table */}
      <h2 style={{ textAlign: 'center' }}>Cities 🏙️</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <>
          <table>
            <thead>
              <tr>
                <th>City</th>
                <th>Country</th>
                <th>Timezone</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {selectedCityData && (
                <tr key={selectedCityData.recordid} className="selected-city-row">
                  <td>{selectedCityData.fields.name}</td>
                  <td>{selectedCityData.fields.cou_name_en}</td>
                  <td>{selectedCityData.fields.timezone}</td>
                  <td>
                    <Link to={`/weather/${selectedCityData.fields.name}`}>View Weather</Link>
                  </td>
                </tr>
              )}

              {paginatedCities.map((city) => (
                <tr key={city.recordid}>
                  <td>{city.fields.name}</td>
                  <td>{city.fields.cou_name_en}</td>
                  <td>{city.fields.timezone}</td>
                  <td>
                    <Link to={`/weather/${city.fields.name}`}>View Weather</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="pagination">
            {pageNumbers.map((number) => (
              <button
                key={number}
                onClick={() => handlePageChange(number)}
                className={currentPage === number ? 'active' : ''}
              >
                {number}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default CitiesTable;
