// Custom Jest matchers for MESSAI.AI testing

declare global {
  namespace jest {
    interface Matchers<R> {
      toBeValidPowerDensity(): R;
      toBeValidCurrentDensity(): R;
      toBeValidVoltage(): R;
      toBeValidEfficiency(): R;
      toBeValidPH(): R;
      toBeValidTemperature(): R;
      toHaveValidApiResponse(): R;
      toHaveValidExperimentStructure(): R;
    }
  }
}

// Bioelectrochemical validation matchers
export const customMatchers = {
  toBeValidPowerDensity(received: number) {
    const pass = typeof received === 'number' && received >= 0 && received <= 100; // W/m²

    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid power density`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid power density (0-100 W/m²)`,
        pass: false,
      };
    }
  },

  toBeValidCurrentDensity(received: number) {
    const pass = typeof received === 'number' && received >= 0 && received <= 1000; // A/m²

    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid current density`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid current density (0-1000 A/m²)`,
        pass: false,
      };
    }
  },

  toBeValidVoltage(received: number) {
    const pass = typeof received === 'number' && received >= 0 && received <= 2.0; // V

    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid voltage`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid voltage (0-2.0 V)`,
        pass: false,
      };
    }
  },

  toBeValidEfficiency(received: number) {
    const pass = typeof received === 'number' && received >= 0 && received <= 1.0;

    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid efficiency`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid efficiency (0-1.0)`,
        pass: false,
      };
    }
  },

  toBeValidPH(received: number) {
    const pass = typeof received === 'number' && received >= 0 && received <= 14;

    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid pH`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid pH (0-14)`,
        pass: false,
      };
    }
  },

  toBeValidTemperature(received: number) {
    const pass = typeof received === 'number' && received >= -273.15 && received <= 100; // °C

    if (pass) {
      return {
        message: () => `expected ${received} not to be a valid temperature`,
        pass: true,
      };
    } else {
      return {
        message: () => `expected ${received} to be a valid temperature (-273.15 to 100 °C)`,
        pass: false,
      };
    }
  },

  toHaveValidApiResponse(received: any) {
    const hasStatus = typeof received.status === 'number';
    const hasData = received.data !== undefined;
    const hasTimestamp = typeof received.timestamp === 'string';

    const pass = hasStatus && hasData && hasTimestamp;

    if (pass) {
      return {
        message: () => `expected response not to have valid API structure`,
        pass: true,
      };
    } else {
      const missing: string[] = [];
      if (!hasStatus) missing.push('status');
      if (!hasData) missing.push('data');
      if (!hasTimestamp) missing.push('timestamp');

      return {
        message: () =>
          `expected response to have valid API structure. Missing: ${missing.join(', ')}`,
        pass: false,
      };
    }
  },

  toHaveValidExperimentStructure(received: any) {
    const hasId = typeof received.id === 'string';
    const hasName = typeof received.name === 'string';
    const hasStatus = typeof received.status === 'string';
    const hasConfiguration = received.configuration && typeof received.configuration === 'object';
    // const hasResults = received.results && typeof received.results === 'object';

    const pass = hasId && hasName && hasStatus && hasConfiguration;

    if (pass) {
      return {
        message: () => `expected experiment not to have valid structure`,
        pass: true,
      };
    } else {
      const missing: string[] = [];
      if (!hasId) missing.push('id');
      if (!hasName) missing.push('name');
      if (!hasStatus) missing.push('status');
      if (!hasConfiguration) missing.push('configuration');

      return {
        message: () =>
          `expected experiment to have valid structure. Missing: ${missing.join(', ')}`,
        pass: false,
      };
    }
  },
};

// Setup function to register custom matchers
export const setupCustomMatchers = () => {
  if (typeof expect !== 'undefined') {
    expect.extend(customMatchers);
  }
};

// Utility functions for testing bioelectrochemical data
export const testUtils = {
  isValidMFCData: (data: any) => {
    return (
      typeof data.powerDensity === 'number' &&
      typeof data.currentDensity === 'number' &&
      typeof data.voltage === 'number' &&
      data.powerDensity >= 0 &&
      data.currentDensity >= 0 &&
      data.voltage >= 0
    );
  },

  isValidExperimentalConditions: (conditions: any) => {
    return (
      typeof conditions.temperature === 'number' &&
      typeof conditions.pH === 'number' &&
      conditions.temperature >= 0 &&
      conditions.temperature <= 100 &&
      conditions.pH >= 0 &&
      conditions.pH <= 14
    );
  },

  generateMockPerformanceData: (count: number = 10) => {
    return Array.from({ length: count }, (_, i) => ({
      timestamp: new Date(Date.now() + i * 3600000).toISOString(),
      powerDensity: Math.random() * 5, // 0-5 W/m²
      currentDensity: Math.random() * 20, // 0-20 A/m²
      voltage: Math.random() * 0.8, // 0-0.8 V
      temperature: 20 + Math.random() * 15, // 20-35 °C
      pH: 6.5 + Math.random() * 1, // 6.5-7.5
    }));
  },

  expectValidBioelectrochemicalData: (data: any) => {
    if (typeof expect !== 'undefined') {
      expect(data).toBeDefined();
      expect(data.powerDensity).toBeValidPowerDensity();
      expect(data.currentDensity).toBeValidCurrentDensity();
      expect(data.voltage).toBeValidVoltage();
    }
  },
};
