export const INITIAL_STATE = {
  inputs: {
    amount: 5000000, // 50 Lakhs default
    rate: 8.5,       // 8.5% default
    tenure: 240,     // 20 years (240 months) default
  },
  comparison: [
    { id: 1, amount: 5000000, rate: 8.5, tenure: 240, label: "Scenario 1" },
    { id: 2, amount: 5000000, rate: 9.0, tenure: 240, label: "Scenario 2" },
    { id: 3, amount: 5000000, rate: 8.5, tenure: 180, label: "Scenario 3" },
  ],
  prepayments: [], // array of { month: number, amount: number }
  theme: 'light',
  mode: 'single', // 'single' | 'comparison' | 'prepayment' | 'sensitivity'
  presence: {}, // tabId -> { lastActive: timestamp, isLeader: boolean }
  tabId: null, // set dynamically at runtime
  leaderId: null,
};
