const fs = require('fs');
const path = require('path');
const dataPath = path.join(
  __dirname,
  '../apps/web/public/parameters/MESS_PARAMETERS_UNIFIED_FINAL.json'
);
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Find biological parameters that need docs
const biologicalParams = [];
for (const category of data.categories) {
  if (category.id === 'biological-parameters') {
    for (const subcategory of category.subcategories) {
      for (const param of subcategory.parameters) {
        // Skip categorical variables
        if (param.type === 'select' || (param.type === 'string' && !param.unit)) continue;
        if (param.unit) {
          biologicalParams.push({
            id: param.id,
            name: param.name,
            description: param.description,
            unit: param.unit,
            subcategory: subcategory.name,
          });
        }
      }
    }
  }
}

// Get existing documented parameters
const existingDocs = [
  'biofilm_thickness',
  'electron_transfer_rate',
  'growth_rate',
  'microbial_diversity',
  'substrate_utilization',
];

const needsDocs = biologicalParams.filter((p) => !existingDocs.includes(p.id));

console.log('Total biological parameters:', biologicalParams.length);
console.log('Already documented:', existingDocs.length);
console.log('Needing documentation:', needsDocs.length);
console.log('\nNext 20 parameters to document:');
needsDocs.slice(0, 20).forEach((p, i) => {
  console.log(`${i + 1}. ${p.name} (${p.id}) - ${p.unit} - ${p.description || 'No description'}`);
});
