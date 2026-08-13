const allPlans = [
  { id: 'plus-monthly', name: 'Plus Plan (Monthly)' },
  { id: 'pro-monthly', name: 'Pro Plan (Monthly)' },
  { id: 'max-monthly', name: 'Max Plan (Monthly)' },
  { id: 'free', name: 'Free' }
];
const ghostIds = ['solo', 'team', 'agency', 'solo-monthly', 'solo-annual', 'team-monthly', 'team-annual', 'agency-monthly', 'agency-annual'];
const validPlans = allPlans.filter(p => !ghostIds.includes(p.id) && !ghostIds.includes(p.id.replace('-monthly', '').replace('-annual', '')));
console.log(validPlans);
