const fs = require('fs');
const path = require('path');
const dataPath = path.join(
  __dirname,
  '../apps/web/public/parameters/MESS_PARAMETERS_UNIFIED_FINAL.json'
);
const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

console.log(
  'Categories found:',
  data.categories.map((c) => c.id)
);

// Check all parameters across all categories
let totalParams = 0;
let measurableParams = 0;

for (const category of data.categories) {
  let categoryMeasurable = 0;

  for (const subcategory of category.subcategories) {
    for (const param of subcategory.parameters) {
      totalParams++;

      // Check if it's a measurable parameter (not categorical)
      const isCategorical = param.type === 'select' || (param.type === 'string' && !param.unit);
      if (!isCategorical && param.unit) {
        measurableParams++;
        categoryMeasurable++;
      }
    }
  }

  if (categoryMeasurable > 0) {
    console.log(`${category.name}: ${categoryMeasurable} measurable parameters`);
  }
}

console.log(`\nTotal parameters: ${totalParams}`);
console.log(`Measurable parameters: ${measurableParams}`);

// Show first few biological parameters
console.log('\nSample biological parameters:');
const bioCategory = data.categories.find(
  (c) => c.id === 'biological-parameters' || c.name.toLowerCase().includes('biological')
);
if (bioCategory) {
  console.log('Found biological category:', bioCategory.id);
  let count = 0;
  for (const subcategory of bioCategory.subcategories) {
    for (const param of subcategory.parameters) {
      if (param.unit && count < 5) {
        console.log(`- ${param.name} (${param.id}) - ${param.unit}`);
        count++;
      }
    }
  }
}
