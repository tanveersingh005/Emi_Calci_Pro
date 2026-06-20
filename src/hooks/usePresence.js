import { useEffect, useContext, useRef } from 'react';
import { WorkspaceContext } from '../context/WorkspaceContext';
import broadcastService from '../services/broadcastService';
import * as types from '../constants/actionTypes';

/**
 * Hook to manage workspace presence.
 * Broadcasts heartbeats, receives heartbeats, and cleans up inactive tabs.
 */
export function usePresence() {
  const { state, dispatch } = useContext(WorkspaceContext);
  const stateRef = useRef(state);

  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const { tabId, leaderId, presence } = state;
  const activeTabsList = Object.keys(presence);
  const activeCount = activeTabsList.length;
  const isLeader = tabId !== null && tabId === leaderId;

  useEffect(() => {
    if (!tabId) return;

    // 1. Listen for heartbeats and tab shutdowns
    const handlePresenceMessage = (message) => {
      const { type, payload } = message;
      if (type === 'HEARTBEAT') {
        dispatch({
          type: types.UPDATE_PRESENCE,
          payload: {
            tabId: payload.tabId,
            lastActive: Date.now(),
            isLeader: payload.isLeader,
          },
        });
      } else if (type === 'TAB_CLOSED') {
        dispatch({
          type: types.REMOVE_PRESENCE,
          payload: { tabId: payload.tabId },
        });
      }
    };

    const unsubscribe = broadcastService.subscribe(handlePresenceMessage);

    // 2. Broadcast own heartbeat immediately and then every 1000ms
    const sendHeartbeat = () => {
      const currentIsLeader = stateRef.current.tabId === stateRef.current.leaderId;
      broadcastService.publish('HEARTBEAT', {
        tabId: stateRef.current.tabId,
        isLeader: currentIsLeader,
      });
    };

    sendHeartbeat(); // Immediate
    const heartbeatInterval = setInterval(sendHeartbeat, 1000);

    // 3. Cleanup stale tabs (>3s inactive) every 1000ms
    const cleanupInterval = setInterval(() => {
      dispatch({ type: types.CLEANUP_PRESENCE });
    }, 1000);

    // 3b. Force quick heartbeat on visibility focus to counter browser background thread throttling
    const handleVisibilityChange = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        sendHeartbeat();
        dispatch({ type: types.CLEANUP_PRESENCE });
      }
    };
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    // 4. Send tab ID on presence start
    dispatch({
      type: types.UPDATE_PRESENCE,
      payload: {
        tabId,
        lastActive: Date.now(),
        isLeader: tabId === leaderId,
      },
    });

    // 5. Broadcast close signal when unloading (reload or tab close)
    const handleBeforeUnload = () => {
      broadcastService.publish('TAB_CLOSED', { tabId });
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      unsubscribe();
      clearInterval(heartbeatInterval);
      clearInterval(cleanupInterval);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      }
    };
  }, [tabId, leaderId, dispatch]);

  return {
    tabId,
    leaderId,
    activeCount: Math.max(1, activeCount), // At least self
    isLeader,
    presence,
  };
}
