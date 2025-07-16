const fs = require('fs');
const path = require('path');
const dataPath = path.join(
  __dirname,
  '../apps/web/public/parameters/MESS_PARAMETERS_UNIFIED_FINAL.json'
);
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

// Function to check if parameter is categorical
function isCategoricalVariable(param) {
  if (param.type === 'select') return true;
  if (param.type === 'string' && !param.unit) return true;
  if (param.unit) return false;

  const categoricalIds = [
    'microbial_species',
    'dominant_species',
    'species_selection',
    'organism_type',
    'bacterial_strain',
    'microbe_selection',
  ];

  return categoricalIds.includes(param.id?.toLowerCase());
}

// Get all measurable parameters by category
const allParameters = {};
let totalMeasurable = 0;

for (const category of data.categories) {
  const categoryParams = [];

  for (const subcategory of category.subcategories) {
    for (const param of subcategory.parameters) {
      if (!isCategoricalVariable(param)) {
        categoryParams.push({
          id: param.id,
          name: param.name,
          description: param.description,
          unit: param.unit,
          type: param.type,
          subcategory: subcategory.name,
          subcategoryId: subcategory.id,
        });
        totalMeasurable++;
      }
    }
  }

  if (categoryParams.length > 0) {
    allParameters[category.id] = {
      name: category.name,
      id: category.id,
      count: categoryParams.length,
      parameters: categoryParams,
    };
  }
}

console.log('=== MESSAI PARAMETER DOCUMENTATION PROJECT ===');
console.log(`Total measurable parameters: ${totalMeasurable}`);
console.log('\nParameters by category:');

Object.values(allParameters).forEach((cat) => {
  console.log(`${cat.name}: ${cat.count} parameters`);
});

// Save complete parameter list for systematic generation
const outputData = {
  totalParameters: totalMeasurable,
  categories: allParameters,
  generatedDate: new Date().toISOString(),
};

fs.writeFileSync(
  path.join(__dirname, 'all-parameters-list.json'),
  JSON.stringify(outputData, null, 2)
);

console.log('\n✅ Complete parameter list saved to all-parameters-list.json');
console.log('\nNext steps: Generate documentation for all categories systematically');
