// src/pages/UrlStatisticsPage.js
import { Link } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import { Container, Typography, Box, Paper, List, ListItem, ListItemText, Collapse } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { getUrls } from './urlService';

const UrlStatisticsPage = () => {
  const [urls, setUrls] = useState([]);
  const [expanded, setExpanded] = useState({});

  useEffect(() => {
    setUrls(getUrls());
  }, []);

  const handleExpandClick = (shortcode) => {
    setExpanded(prev => ({ ...prev, [shortcode]: !prev[shortcode] }));
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>URL Shortener Statistics</Typography>
      {urls.length === 0 ? (
        <Typography variant="body1">No shortened URLs have been created yet.</Typography>
      ) : (
        <List>
          {urls.map((url) => (
            <Paper key={url.shortcode} sx={{ mb: 2, p: 2 }}>
              <ListItem disablePadding onClick={() => handleExpandClick(url.shortcode)} sx={{ cursor: 'pointer' }}>
                <ListItemText
                  primary={
                    <Typography variant="h6">
                      <Link to={`/${url.shortcode}`} target="_blank" rel="noopener noreferrer">
  {`${window.location.protocol}//${window.location.host}/${url.shortcode}`}
</Link>
                    </Typography>
                  }
                  secondary={
                    <>
                      <Typography component="span" variant="body2" color="text.secondary">
                        Created: {new Date(url.creationDate).toLocaleString()} |
                      </Typography>
                      <Typography component="span" variant="body2" color="text.secondary">
                        Expires: {url.expiryDate ? new Date(url.expiryDate).toLocaleString() : 'Never'}
                      </Typography>
                    </>
                  }
                />
                <Box>
                  <Typography variant="subtitle1">
                    Clicks: {url.totalClicks}
                  </Typography>
                  {expanded[url.shortcode] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                </Box>
              </ListItem>
              <Collapse in={expanded[url.shortcode]} timeout="auto" unmountOnExit>
                <Box sx={{ mt: 2, ml: 4 }}>
                  {url.clicks.length > 0 ? (
                    url.clicks.map((click, index) => (
                      <Paper key={index} elevation={1} sx={{ p: 1, mb: 1 }}>
                        <Typography variant="body2">
                          Timestamp: {new Date(click.timestamp).toLocaleString()}
                        </Typography>
                        <Typography variant="body2">
                          Source: {click.source}
                        </Typography>
                        <Typography variant="body2">
                          Location: {click.location}
                        </Typography>
                      </Paper>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">No detailed click data available.</Typography>
                  )}
                </Box>
              </Collapse>
            </Paper>
          ))}
        </List>
      )}
    </Container>
  );
};

export default UrlStatisticsPage;