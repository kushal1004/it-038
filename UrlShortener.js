// src/pages/UrlShortener.js
import { Link } from 'react-router-dom';
import React, { useState } from 'react';
import {
  Container, Typography, Box, TextField, Button, Grid, Paper,
  List, ListItem, ListItemText, Alert
} from '@mui/material';
import { createUrl } from './urlService';
import { logEvent } from '../loggingMiddleware';

const initialUrl = {
  longUrl: '',
  validityPeriod: '',
  preferredShortcode: ''
};

const UrlShortener = () => {
  const [urlForms, setUrlForms] = useState(Array(5).fill(initialUrl));
  const [results, setResults] = useState([]);
  const [error, setError] = useState('');

  const handleChange = (index, event) => {
    const { name, value } = event.target;
    const newForms = [...urlForms];
    newForms[index] = { ...newForms[index], [name]: value };
    setUrlForms(newForms);
  };

  const validateInputs = () => {
    // Basic validation
    // Add more robust validation using a library like yup if needed
    for (const form of urlForms) {
      if (form.longUrl) {
        if (!/^(https?:\/\/)?[\w.-]+\.[a-z]{2,}(\/\S*)?$/.test(form.longUrl)) {
          return 'Invalid URL format detected.';
        }
        if (form.validityPeriod && !/^\d+$/.test(form.validityPeriod)) {
          return 'Validity period must be an integer.';
        }
      }
    }
    return '';
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    logEvent('FORM_SUBMISSION_ATTEMPT', { forms: urlForms });
    setError('');
    const validationError = validateInputs();
    if (validationError) {
      setError(validationError);
      logEvent('FORM_SUBMISSION_FAILED', { reason: validationError });
      return;
    }

    const newResults = [];
    const usedShortcodes = new Set();
    const urlsToProcess = urlForms.filter(form => form.longUrl.trim() !== '');

    for (const form of urlsToProcess) {
      if (form.preferredShortcode && usedShortcodes.has(form.preferredShortcode)) {
        setError('Duplicate custom shortcode provided in the same request.');
        logEvent('SHORTCODE_COLLISION_DETECTED', { shortcode: form.preferredShortcode });
        return;
      }
      if (form.preferredShortcode) {
        usedShortcodes.add(form.preferredShortcode);
      }
      const shortcode = createUrl(form.longUrl, form.validityPeriod, form.preferredShortcode);
      const urlData = {
        longUrl: form.longUrl,
        shortUrl: `${window.location.protocol}//${window.location.host}/${shortcode}`,
        expiryDate: new Date(new Date().getTime() + (form.validityPeriod ? parseInt(form.validityPeriod, 10) : 30) * 60000).toLocaleString()
      };
      newResults.push(urlData);
    }
    setResults(newResults);
    setUrlForms(Array(5).fill(initialUrl)); // Reset forms
  };

  return (
    <Container maxWidth="md">
      <Typography variant="h4" gutterBottom>URL Shortener Page</Typography>
      <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3, mb: 4 }}>
        <Grid container spacing={2}>
          {urlForms.map((form, index) => (
            <Grid item xs={12} key={index}>
              <Paper elevation={2} sx={{ p: 2 }}>
                <Typography variant="subtitle1">URL {index + 1}</Typography>
                <TextField
                  fullWidth
                  name="longUrl"
                  label="Original Long URL"
                  value={form.longUrl}
                  onChange={(e) => handleChange(index, e)}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  name="validityPeriod"
                  label="Validity (in minutes, default 30)"
                  type="number"
                  value={form.validityPeriod}
                  onChange={(e) => handleChange(index, e)}
                  margin="normal"
                />
                <TextField
                  fullWidth
                  name="preferredShortcode"
                  label="Optional Preferred Shortcode"
                  value={form.preferredShortcode}
                  onChange={(e) => handleChange(index, e)}
                  margin="normal"
                />
              </Paper>
            </Grid>
          ))}
        </Grid>
        {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
        <Button type="submit" variant="contained" sx={{ mt: 3, p: 1.5, fontSize: '1.1rem' }}>
          Shorten URLs
        </Button>
      </Box>

      {results.length > 0 && (
        <Box sx={{ mt: 4 }}>
          <Typography variant="h5" gutterBottom>Results</Typography>
          <List>
            {results.map((result, index) => (
              <ListItem key={index} divider>
                <ListItemText
  primary={<Link to={`/${result.shortUrl.split('/').pop()}`} target="_blank" rel="noopener noreferrer">{result.shortUrl}</Link>}
  secondary={`Original: ${result.longUrl} | Expires: ${result.expiryDate}`}
/>
              </ListItem>
            ))}
          </List>
        </Box>
      )}
    </Container>
  );
};

export default UrlShortener;