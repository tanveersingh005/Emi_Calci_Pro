import { useContext, useMemo } from 'react';
import { WorkspaceContext } from '../context/WorkspaceContext';
import { UPDATE_COMPARISON } from '../constants/actionTypes';
import { calculateEMI, calculateTotals } from '../engines/financialEngine';

/**
 * Hook to manage loan comparisons.
 * Computes EMIs, totals, and finds the cheapest option.
 */
export function useComparison() {
  const { state, dispatch } = useContext(WorkspaceContext);
  const { comparison } = state;

  const comparisonResults = useMemo(() => {
    if (!comparison) return [];

    const computed = comparison.map(scenario => {
      const emi = calculateEMI(scenario.amount, scenario.rate, scenario.tenure);
      const { totalInterest, totalPayable } = calculateTotals(scenario.amount, emi, scenario.tenure);
      
      return {
        ...scenario,
        emi,
        totalInterest,
        totalPayable,
      };
    });

    // Find the cheapest scenario based on lowest total interest paid
    let cheapestId = null;
    let minInterest = Infinity;

    computed.forEach(scenario => {
      if (scenario.amount > 0 && scenario.totalInterest < minInterest) {
        minInterest = scenario.totalInterest;
        cheapestId = scenario.id;
      }
    });

    return computed.map(scenario => ({
      ...scenario,
      isCheapest: scenario.id === cheapestId && scenario.amount > 0,
    }));
  }, [comparison]);

  const updateScenario = (id, fields) => {
    const updated = comparison.map(scenario => {
      if (scenario.id === id) {
        return { ...scenario, ...fields };
      }
      return scenario;
    });

    dispatch({
      type: UPDATE_COMPARISON,
      payload: updated,
    });
  };

  return {
    scenarios: comparisonResults,
    updateScenario,
  };
}
