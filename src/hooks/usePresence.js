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

    // Helper: Write our presence key to localStorage
    const writeSelfPresence = () => {
      try {
        const currentTabId = stateRef.current.tabId;
        if (!currentTabId || typeof window === 'undefined' || !localStorage) return;
        const currentIsLeader = stateRef.current.tabId === stateRef.current.leaderId;
        localStorage.setItem(`emi_presence_${currentTabId}`, JSON.stringify({
          tabId: currentTabId,
          lastActive: Date.now(),
          isLeader: currentIsLeader
        }));
      } catch (e) {
        console.warn('localStorage is disabled or unavailable.', e);
      }
    };

    // Helper: Read and clean presence keys in localStorage, then dispatch
    const compilePresence = () => {
      try {
        if (typeof window === 'undefined' || !localStorage) return;
        const now = Date.now();
        const presenceMap = {};
        
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith('emi_presence_')) {
            try {
              const data = JSON.parse(localStorage.getItem(key));
              // 45-second timeout to easily tolerate throttled background tabs
              if (now - data.lastActive <= 45000) {
                presenceMap[data.tabId] = {
                  lastActive: data.lastActive,
                  isLeader: data.isLeader
                };
              } else {
                localStorage.removeItem(key); // Cleanup stale/crashed tab key
              }
            } catch (e) {
              console.error('Error parsing presence record', e);
            }
          }
        }

        // Ensure self is in the map
        const currentTabId = stateRef.current.tabId;
        if (currentTabId) {
          const currentIsLeader = stateRef.current.tabId === stateRef.current.leaderId;
          presenceMap[currentTabId] = {
            lastActive: now,
            isLeader: currentIsLeader
          };
        }

        // Deterministic leader selection
        const activeIds = Object.keys(presenceMap);
        let electedLeaderId = stateRef.current.leaderId;
        if (activeIds.length > 0) {
          activeIds.sort();
          electedLeaderId = activeIds[0];
        } else {
          electedLeaderId = currentTabId;
        }

        dispatch({
          type: types.SYNC_PRESENCE,
          payload: {
            presence: presenceMap,
            leaderId: electedLeaderId
          }
        });
      } catch (e) {
        console.warn('Failed to compile presence list from localStorage.', e);
      }
    };

    // 1. Listen for heartbeats and tab shutdowns on the BroadcastChannel
    const handlePresenceMessage = (message) => {
      const { type } = message;
      // Compile immediately when a tab joins (heartbeat) or leaves (closed)
      if (type === 'HEARTBEAT' || type === 'TAB_CLOSED') {
        compilePresence();
      }
    };

    const unsubscribe = broadcastService.subscribe(handlePresenceMessage);

    // 2. Broadcast own heartbeat immediately and then every 1000ms
    const sendHeartbeat = () => {
      const currentIsLeader = stateRef.current.tabId === stateRef.current.leaderId;
      // Update our localStorage presence stamp
      writeSelfPresence();
      // Publish heartbeat on channel
      broadcastService.publish('HEARTBEAT', {
        tabId: stateRef.current.tabId,
        isLeader: currentIsLeader,
      });
      // Compile presence registry
      compilePresence();
    };

    // Initial immediate invocation
    sendHeartbeat();

    const heartbeatInterval = setInterval(sendHeartbeat, 1000);

    // 3. Visibility Change: force immediate refresh to handle thread sleeping
    const handleVisibilityChange = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        sendHeartbeat();
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    // 4. Send tab ID on presence start
    writeSelfPresence();
    compilePresence();

    // 5. Broadcast close signal when unloading (reload or tab close) and delete localStorage presence key
    const handleBeforeUnload = () => {
      const currentTabId = stateRef.current.tabId;
      if (currentTabId && typeof window !== 'undefined' && localStorage) {
        localStorage.removeItem(`emi_presence_${currentTabId}`);
      }
      broadcastService.publish('TAB_CLOSED', { tabId: currentTabId });
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('beforeunload', handleBeforeUnload);
    }

    return () => {
      unsubscribe();
      clearInterval(heartbeatInterval);
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
      if (typeof window !== 'undefined') {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      }
    };
  }, [tabId, dispatch]);

  return {
    tabId,
    leaderId,
    activeCount: Math.max(1, activeCount), // At least self
    isLeader,
    presence,
  };
}
