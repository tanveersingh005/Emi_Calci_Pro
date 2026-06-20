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

    // Send a request for state to all tabs.
    // The active leader tab will reply with its current state.
    broadcastService.publish('REQUEST_STATE', {
      requestingTabId: tabId,
    });
  }, [tabId]);
}
