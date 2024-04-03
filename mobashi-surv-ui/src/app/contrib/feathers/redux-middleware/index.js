// eslint no-unused-vars: 0,
import reduxThunk from 'redux-thunk';
import promise from 'redux-promise-middleware';
// import { routerMiddleware } from 'react-router-redux';
// import { browserHistory } from 'react-router';
import logger from './logger'; // eslint-disable-line no-unused-vars
import crashReporter from './crash-reporter'; // eslint-disable-line no-unused-vars

export default [
  reduxThunk, // Thunk middleware for Redux
  promise, // Resolve, reject promises with conditional optimistic updates
  // routerMiddleware(browserHistory), // !! IMPORTANT for location.href changes
  logger, // A basic middleware logger
  crashReporter, // A basic middleware crashReporter
];
