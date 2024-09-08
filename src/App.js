import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CitiesTable from './components/CitiesTable';
import WeatherPage from './components/WeatherPage';

const App = () => {
  return (
    <Router>
      
      <Routes>
        <Route path="/" element={<CitiesTable />} />
        <Route path="/weather/:city" element={<WeatherPage />} />

      </Routes>
    </Router>
  );
};

export default App;
