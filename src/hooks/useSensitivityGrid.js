import { useContext, useMemo } from 'react';
import { WorkspaceContext } from '../context/WorkspaceContext';
import { generateSensitivityGrid } from '../engines/financialEngine';

/**
 * Hook to memoize and return sensitivity grid calculations.
 */
export function useSensitivityGrid() {
  const { state } = useContext(WorkspaceContext);
  const { amount, rate, tenure } = state.inputs;

  const sensitivity = useMemo(() => {
    return generateSensitivityGrid(amount, rate, tenure);
  }, [amount, rate, tenure]);

  return {
    rates: sensitivity.rates,
    tenures: sensitivity.tenures,
    grid: sensitivity.grid,
    currentRate: rate,
    currentTenure: tenure,
  };
}
