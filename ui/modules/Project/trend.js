import _fetch from 'isomorphic-fetch';
import _ from 'lodash';
import constants from '../../lib/constants';

export const ACTION = constants('PROJECT_', [
  'RECEIVE_TREND',
  'INVALIDATE_TREND',
]);

function receiveTrend(run, json) {
  const data = patchData(json);
  console.info(json, data);
  return {
    type: ACTION.RECEIVE_TREND,
    run,
    data: data
  };
}

function patchData(json) {
  const template = _.reduce(json, (template, d) => {
    template = {};
    for(let k in d) {
      template[k] = 0;
    }
    return template;
  });
  return json.map((d) => {
    return _.assign({}, template, d);
  });
}

function shouldFetchTrend(state, run) {
  const projectId = state.router.params.projectId;
  const trends = state.project.trends;
  return !(trends && trends[run]);
}

export function fetchTrend(run) {
  return (dispatch, getState) => {
    let state = getState();
    const projectId = state.router.params.projectId;
    if (shouldFetchTrend(getState(), run)) {
      return _fetch(`/api/projects/${projectId}/trend?name=${run}`)
        .then(response => response.json())
        .then(json => dispatch(receiveTrend(run, json)));
    } else {
      return Promise.resolve();
    }
  };
}

export function invalidateTrend() {
  return {
    type: ACTION.INVALIDATE_TREND
  };
}

// reducer

import { combineReducers } from 'redux';

function trend(state = [], action = {}) {
  switch (action.type) {
    case ACTION.RECEIVE_TREND:
      return action.data;
    default:
      return state;
  }
}

export default function trends(state = {}, action) {
  switch (action.type) {
    case ACTION.RECEIVE_TREND:
      return _.assign({}, state, {
        [action.run]: trend(state[action.run], action)
      });
    case ACTION.INVALIDATE_TREND:
      return {};
    default:
      return state;
  }
}
