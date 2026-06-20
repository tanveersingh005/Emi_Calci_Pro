import { useContext, useMemo } from 'react';
import { WorkspaceContext } from '../context/WorkspaceContext';
import * as types from '../constants/actionTypes';
import { calculatePrepaymentImpact, generateAmortizationSchedule } from '../engines/financialEngine';

/**
 * Hook to manage prepayment additions, removals, and impact calculations.
 */
export function usePrepaymentPlanner() {
  const { state, dispatch } = useContext(WorkspaceContext);
  const { inputs, prepayments } = state;

  const impact = useMemo(() => {
    return calculatePrepaymentImpact(
      inputs.amount,
      inputs.rate,
      inputs.tenure,
      prepayments
    );
  }, [inputs.amount, inputs.rate, inputs.tenure, prepayments]);

  const schedule = useMemo(() => {
    return generateAmortizationSchedule(
      inputs.amount,
      inputs.rate,
      inputs.tenure,
      prepayments
    );
  }, [inputs.amount, inputs.rate, inputs.tenure, prepayments]);

  const addPrepayment = (month, amount) => {
    dispatch({
      type: types.ADD_PREPAYMENT,
      payload: { month, amount },
    });
  };

  const removePrepayment = (index) => {
    dispatch({
      type: types.REMOVE_PREPAYMENT,
      payload: index,
    });
  };

  const clearPrepayments = () => {
    dispatch({
      type: types.CLEAR_PREPAYMENTS,
    });
  };

  return {
    prepayments,
    addPrepayment,
    removePrepayment,
    clearPrepayments,
    impact,
    schedule,
  };
}
