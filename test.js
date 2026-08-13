const ghostIds = ['solo', 'team', 'agency', 'solo-monthly', 'solo-annual', 'team-monthly', 'team-annual', 'agency-monthly', 'agency-annual'];
const id = 'plus-monthly';
console.log(ghostIds.includes(id));
console.log(ghostIds.includes(id.replace('-monthly', '').replace('-annual', '')));
