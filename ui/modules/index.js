import { combineReducers } from 'redux';
import { routerStateReducer } from 'redux-router';

import project from './Project';
import testRun from './TestRun';
import testCase from './TestCase';

export default combineReducers({
  router: routerStateReducer,
  project,
  testRun,
  testCase
});
