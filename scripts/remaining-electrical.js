const data = JSON.parse(require('fs').readFileSync('scripts/all-parameters-list.json', 'utf8'));
const electricalParams = data.categories.electrical.parameters;

// Filter out already generated ones
const existing = [
  'power_density',
  'current_density',
  'voltage_output',
  'coulombic_efficiency',
  'internal_resistance',
];

const remaining = electricalParams.filter((p) => !existing.includes(p.id));
console.log('Remaining electrical parameters:', remaining.length);
console.log('\nNext 10 to generate:');
remaining.slice(0, 10).forEach((p, i) => {
  console.log(`${i + 1}. ${p.name} (${p.id}) - ${p.unit} - ${p.description || 'No description'}`);
});
