import { useEffect, useContext, useRef } from 'react';
import { WorkspaceContext } from '../context/WorkspaceContext';
import broadcastService from '../services/broadcastService';
import * as types from '../constants/actionTypes';

/**
 * Custom hook to manage BroadcastChannel synchronization.
 * Listens for state changes from other tabs and applies them.
 */
export function useBroadcastSync() {
  const { state, dispatch } = useContext(WorkspaceContext);
  const stateRef = useRef(state);

  // Keep stateRef up to date to avoid stale closures in broadcast listener
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  useEffect(() => {
    const handleBroadcastMessage = (message) => {
      const { type, payload } = message;
      
      switch (type) {
        case types.SYNC_STATE:
          // Sync state from another tab
          dispatch({
            type: types.SYNC_STATE,
            payload: payload,
            meta: { fromSync: true }
          });
          break;

        case 'REQUEST_STATE':
          // A new tab is requesting the initial state.
          // If we are the leader, broadcast our current state.
          const isCurrentTabLeader = stateRef.current.tabId === stateRef.current.leaderId;
          if (isCurrentTabLeader) {
            broadcastService.publish(types.SYNC_STATE, {
              inputs: stateRef.current.inputs,
              comparison: stateRef.current.comparison,
              prepayments: stateRef.current.prepayments,
              theme: stateRef.current.theme,
              mode: stateRef.current.mode,
              history: stateRef.current.history,
            });
          }
          break;

        default:
          break;
      }
    };

    const unsubscribe = broadcastService.subscribe(handleBroadcastMessage);
    return () => {
      unsubscribe();
    };
  }, [dispatch]);
}
