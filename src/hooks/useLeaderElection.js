import { useEffect, useContext } from 'react';
import { WorkspaceContext } from '../context/WorkspaceContext';
import broadcastService from '../services/broadcastService';

/**
 * Hook to manage leader election and state initialization.
 * Triggers a workspace state request from the leader upon tab startup.
 */
export function useLeaderElection() {
  const { state } = useContext(WorkspaceContext);
  const { tabId } = state;

  useEffect(() => {
    if (!tabId) return;

    const requestState = () => {
      broadcastService.publish('REQUEST_STATE', {
        requestingTabId: tabId,
      });
    };

    // 1. Request state upon mount/identity resolution
    requestState();

    // 2. Request state on visibility focus (solves background browser thread throttling)
    const handleVisibilityChange = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        requestState();
      }
    };

    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      if (typeof document !== 'undefined') {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      }
    };
  }, [tabId]);
}
