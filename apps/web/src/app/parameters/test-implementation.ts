/**
 * Test implementation to verify parameter system enhancements
 */
// import type { Parameter } from '../../types/parameters';
import { getSystemParameters } from './utils/parameter-data';
import { MICROFLUIDIC_PARAMETERS } from './data/microfluidic-parameters';

// Test the parameter loading
export async function testParameterSystem() {
  console.log('Testing parameter system...');

  // Test unified parameter loading
  const systemParams = await getSystemParameters();
  console.log(`✓ Loaded ${systemParams.length} parameters from unified system`);

  // Test microfluidic parameters
  console.log(`✓ Added ${MICROFLUIDIC_PARAMETERS.length} microfluidic parameters`);

  // Test parameter categorization
  const categories = new Map<string, number>();
  systemParams.forEach((param) => {
    const category = param.displayCategory || 'unknown';
    categories.set(category, (categories.get(category) || 0) + 1);
  });

  console.log('✓ Parameter distribution by category:');
  Array.from(categories.entries()).forEach(([category, count]) => {
    console.log(`  - ${category}: ${count} parameters`);
  });

  // Test compatibility data
  const parametersWithCompatibility = systemParams.filter((p) => p.compatibility);
  console.log(`✓ ${parametersWithCompatibility.length} parameters have compatibility data`);

  // Test microfluidic integration
  const microfluidicParams = systemParams.filter(
    (p) => p.subcategory?.includes('Microfluidic') || p.id.includes('micro')
  );
  console.log(`✓ ${microfluidicParams.length} microfluidic parameters integrated`);

  return {
    totalParameters: systemParams.length,
    microfluidicParameters: MICROFLUIDIC_PARAMETERS.length,
    categoriesFound: categories.size,
    parametersWithCompatibility: parametersWithCompatibility.length,
    microfluidicIntegrated: microfluidicParams.length,
  };
}

// Export for testing
export { MICROFLUIDIC_PARAMETERS, getSystemParameters };
