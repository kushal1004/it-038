// src/urlService.js
import { logEvent } from '../loggingMiddleware';

const urls = new Map();

const generateShortcode = () => {
  return Math.random().toString(36).substring(2, 8);
};

const createUrl = (longUrl, validityPeriod, preferredShortcode) => {
  let shortcode = preferredShortcode || generateShortcode();

  // Ensure shortcode is unique
  while (urls.has(shortcode)) {
    shortcode = generateShortcode();
  }

  const creationDate = new Date();
  const validityMinutes = validityPeriod ? parseInt(validityPeriod, 10) : 30;
  const expiryDate = new Date(creationDate.getTime() + validityMinutes * 60 * 1000);

  const newUrl = {
    longUrl,
    creationDate,
    expiryDate,
    totalClicks: 0,
    clicks: [],
  };

  urls.set(shortcode, newUrl);
  logEvent('URL_CREATED', { shortcode, longUrl });

  return shortcode;
};

const getUrls = () => {
  const urlList = Array.from(urls, ([shortcode, data]) => ({
    shortcode,
    ...data,
  }));
  return urlList;
};

const getUrlByShortcode = (shortcode) => {
  const urlData = urls.get(shortcode);
  if (urlData) {
    urlData.totalClicks += 1;
    urlData.clicks.push({
      timestamp: new Date(),
      source: 'Direct', // Mock source
      location: 'Unknown', // Mock location
    });
    logEvent('URL_CLICKED', { shortcode, longUrl: urlData.longUrl });
  }
  return urlData;
};

export { createUrl, getUrls, getUrlByShortcode };