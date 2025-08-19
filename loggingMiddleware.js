// src/loggingMiddleware.js
let logs = [];

const logEvent = (eventType, payload) => {
  const event = {
    timestamp: new Date().toISOString(),
    eventType,
    payload
  };
  logs.push(event);
  console.log('Logging Middleware:', event); // For development
};

const getLogs = () => logs;

const clearLogs = () => {
  logs = [];
};

export { logEvent, getLogs, clearLogs };