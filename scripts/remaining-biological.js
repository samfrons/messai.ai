const fs = require('fs');
const data = JSON.parse(fs.readFileSync('scripts/all-parameters-list.json', 'utf8'));
const biologicalParams = data.categories.biological.parameters;

// Filter out already generated ones
const existing = [
  'biofilm_conductivity',
  'biofilm_coverage',
  'biofilm_density',
  'biofilm_porosity',
  'biofilm_roughness',
  'biofilm_adhesion_strength',
  'metabolic_activity',
  'substrate_utilization_rate',
  'biofilm_thickness',
  'electron_transfer_rate',
  'growth_rate',
  'microbial_diversity',
  'substrate_utilization',
];

const remaining = biologicalParams.filter((p) => !existing.includes(p.id));
console.log('Remaining biological parameters:', remaining.length);
console.log('\nNext 15 to generate:');
remaining.slice(0, 15).forEach((p, i) => {
  console.log(`${i + 1}. ${p.name} (${p.id}) - ${p.unit} - ${p.description}`);
});

// Save list for generation
fs.writeFileSync('scripts/remaining-biological.json', JSON.stringify(remaining, null, 2));
