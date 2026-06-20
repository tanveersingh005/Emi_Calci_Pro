'use client';

import React, { createContext, useReducer, useEffect } from 'react';
import { INITIAL_STATE } from '../constants/defaultState';
import * as types from '../constants/actionTypes';
import broadcastService from '../services/broadcastService';

export const WorkspaceContext = createContext(null);

// Helper to copy state for history
function createHistoryItem(state) {
  return {
    inputs: { ...state.inputs },
    comparison: state.comparison.map(c => ({ ...c })),
    prepayments: state.prepayments.map(p => ({ ...p })),
    theme: state.theme,
    mode: state.mode,
  };
}

function workspaceReducer(state, action) {
  switch (action.type) {
    case types.UPDATE_INPUTS: {
      const history = [createHistoryItem(state), ...state.history || []].slice(0, 50);
      const nextInputs = { ...state.inputs, ...action.payload };
      
      const newState = {
        ...state,
        inputs: nextInputs,
        history,
      };
      
      // Auto-broadcast user changes
      if (!action.meta?.fromSync) {
        broadcastService.publish(types.SYNC_STATE, {
          inputs: newState.inputs,
          comparison: newState.comparison,
          prepayments: newState.prepayments,
          theme: newState.theme,
          mode: newState.mode,
          history: newState.history,
        });
      }
      return newState;
    }

    case types.UPDATE_COMPARISON: {
      const history = [createHistoryItem(state), ...state.history || []].slice(0, 50);
      const newState = {
        ...state,
        comparison: action.payload,
        history,
      };
      
      if (!action.meta?.fromSync) {
        broadcastService.publish(types.SYNC_STATE, {
          inputs: newState.inputs,
          comparison: newState.comparison,
          prepayments: newState.prepayments,
          theme: newState.theme,
          mode: newState.mode,
          history: newState.history,
        });
      }
      return newState;
    }

    case types.ADD_PREPAYMENT: {
      const history = [createHistoryItem(state), ...state.history || []].slice(0, 50);
      
      // Prevent duplicate prepayment in the same month by merging them or keeping them separate.
      // The prompt says: "Multiple prepayments in same month: handle edge case". 
      // We can allow multiple prepayments in the same month, we just append them.
      const newPrepayments = [...state.prepayments, action.payload]
        .sort((a, b) => a.month - b.month);
        
      const newState = {
        ...state,
        prepayments: newPrepayments,
        history,
      };

      if (!action.meta?.fromSync) {
        broadcastService.publish(types.SYNC_STATE, {
          inputs: newState.inputs,
          comparison: newState.comparison,
          prepayments: newState.prepayments,
          theme: newState.theme,
          mode: newState.mode,
          history: newState.history,
        });
      }
      return newState;
    }

    case types.REMOVE_PREPAYMENT: {
      const history = [createHistoryItem(state), ...state.history || []].slice(0, 50);
      const newPrepayments = state.prepayments.filter((_, idx) => idx !== action.payload);
      const newState = {
        ...state,
        prepayments: newPrepayments,
        history,
      };

      if (!action.meta?.fromSync) {
        broadcastService.publish(types.SYNC_STATE, {
          inputs: newState.inputs,
          comparison: newState.comparison,
          prepayments: newState.prepayments,
          theme: newState.theme,
          mode: newState.mode,
          history: newState.history,
        });
      }
      return newState;
    }

    case types.CLEAR_PREPAYMENTS: {
      const history = [createHistoryItem(state), ...state.history || []].slice(0, 50);
      const newState = {
        ...state,
        prepayments: [],
        history,
      };

      if (!action.meta?.fromSync) {
        broadcastService.publish(types.SYNC_STATE, {
          inputs: newState.inputs,
          comparison: newState.comparison,
          prepayments: newState.prepayments,
          theme: newState.theme,
          mode: newState.mode,
          history: newState.history,
        });
      }
      return newState;
    }

    case types.SET_THEME: {
      const history = [createHistoryItem(state), ...state.history || []].slice(0, 50);
      const newState = {
        ...state,
        theme: action.payload,
        history,
      };

      if (!action.meta?.fromSync) {
        broadcastService.publish(types.SYNC_STATE, {
          inputs: newState.inputs,
          comparison: newState.comparison,
          prepayments: newState.prepayments,
          theme: newState.theme,
          mode: newState.mode,
          history: newState.history,
        });
      }
      return newState;
    }

    case types.SET_MODE: {
      const history = [createHistoryItem(state), ...state.history || []].slice(0, 50);
      const newState = {
        ...state,
        mode: action.payload,
        history,
      };

      if (!action.meta?.fromSync) {
        broadcastService.publish(types.SYNC_STATE, {
          inputs: newState.inputs,
          comparison: newState.comparison,
          prepayments: newState.prepayments,
          theme: newState.theme,
          mode: newState.mode,
          history: newState.history,
        });
      }
      return newState;
    }

    case types.SYNC_STATE: {
      // Completely replace workspace settings, but keep local tabId and presence intact
      return {
        ...state,
        inputs: action.payload.inputs,
        comparison: action.payload.comparison,
        prepayments: action.payload.prepayments,
        theme: action.payload.theme,
        mode: action.payload.mode,
        history: action.payload.history || [],
      };
    }

    case types.UNDO: {
      const history = state.history || [];
      if (history.length === 0) return state;

      const previous = history[0];
      const newHistory = history.slice(1);

      const newState = {
        ...state,
        inputs: previous.inputs,
        comparison: previous.comparison,
        prepayments: previous.prepayments,
        theme: previous.theme,
        mode: previous.mode,
        history: newHistory,
      };

      if (!action.meta?.fromSync) {
        broadcastService.publish(types.SYNC_STATE, {
          inputs: newState.inputs,
          comparison: newState.comparison,
          prepayments: newState.prepayments,
          theme: newState.theme,
          mode: newState.mode,
          history: newState.history,
        });
      }
      return newState;
    }

    case types.UPDATE_PRESENCE: {
      const { tabId, lastActive, isLeader } = action.payload;
      const nextPresence = {
        ...state.presence,
        [tabId]: { lastActive, isLeader },
      };
      return {
        ...state,
        presence: nextPresence,
      };
    }

    case types.CLEANUP_PRESENCE: {
      const now = Date.now();
      const nextPresence = {};
      let activeLeaderId = state.leaderId;

      Object.entries(state.presence).forEach(([tId, info]) => {
        if (now - info.lastActive <= 3000) {
          nextPresence[tId] = info;
        }
      });

      // Recalculate Leader based on presence
      const activeTabs = Object.keys(nextPresence);
      if (activeTabs.length > 0) {
        // Sort lexicographically
        activeTabs.sort();
        activeLeaderId = activeTabs[0];
      } else {
        activeLeaderId = state.tabId; // Fallback to self
      }

      return {
        ...state,
        presence: nextPresence,
        leaderId: activeLeaderId,
      };
    }

    case types.SET_LEADER: {
      return {
        ...state,
        leaderId: action.payload,
      };
    }

    case 'SET_TAB_ID': {
      return {
        ...state,
        tabId: action.payload,
      };
    }

    default:
      return state;
  }
}

export function WorkspaceProvider({ children }) {
  // Initialize history inside state as empty list
  const [state, dispatch] = useReducer(workspaceReducer, {
    ...INITIAL_STATE,
    history: [],
  });

  // Setup tabId on mount
  useEffect(() => {
    const generatedId = 'tab_' + Math.random().toString(36).substring(2, 9);
    dispatch({ type: 'SET_TAB_ID', payload: generatedId });
  }, []);

  return (
    <WorkspaceContext.Provider value={{ state, dispatch }}>
      {children}
    </WorkspaceContext.Provider>
  );
}
