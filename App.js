// src/App.js
import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import UrlShortenerPage from './pages/UrlShortener';
import UrlStatisticsPage from './pages/UrlStatisticsPage';
import { getUrlByShortcode } from './pages/urlService';
import { logEvent } from './loggingMiddleware';

const RedirectHandler = () => {
  const navigate = useNavigate();
  const path = window.location.pathname.substring(1); // Remove leading slash
  
  useEffect(() => {
    const urlData = getUrlByShortcode(path);
    if (urlData) {
      logEvent('REDIRECTION_SUCCESS', { shortcode: path, originalUrl: urlData.longUrl });
      window.location.href = urlData.longUrl;
    } else {
      logEvent('REDIRECTION_FAILED', { shortcode: path, reason: 'URL not found' });
      navigate('/');
    }
  }, [path, navigate]);

  return <Typography variant="h6" align="center">Redirecting...</Typography>;
};

const Header = () => {
  const navigate = useNavigate();
  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          URL Shortener
        </Typography>
        <Button color="inherit" onClick={() => navigate('/')}>Shortener</Button>
        <Button color="inherit" onClick={() => navigate('/stats')}>Statistics</Button>
      </Toolbar>
    </AppBar>
  );
};

function App() {
  return (
    <Router>
      <Header />
      <Box sx={{ mt: 4 }}>
        <Routes>
          <Route path="/" element={<UrlShortenerPage />} />
          <Route path="/stats" element={<UrlStatisticsPage />} />
          <Route path="/:shortcode" element={<RedirectHandler />} />
        </Routes>
      </Box>
    </Router>
  );
}

export default App;