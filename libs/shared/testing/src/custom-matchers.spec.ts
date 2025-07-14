import { setupCustomMatchers, testUtils } from './custom-matchers';

// Setup custom matchers before tests
setupCustomMatchers();

describe('Custom Matchers', () => {
  describe('bioelectrochemical matchers', () => {
    describe('toBeValidPowerDensity', () => {
      it('should pass for valid power densities', () => {
        expect(1.5).toBeValidPowerDensity();
        expect(0).toBeValidPowerDensity();
        expect(50).toBeValidPowerDensity();
      });

      it('should fail for invalid power densities', () => {
        expect(() => expect(-1).toBeValidPowerDensity()).toThrow();
        expect(() => expect(101).toBeValidPowerDensity()).toThrow();
        expect(() => expect('invalid').toBeValidPowerDensity()).toThrow();
      });
    });

    describe('toBeValidCurrentDensity', () => {
      it('should pass for valid current densities', () => {
        expect(5.2).toBeValidCurrentDensity();
        expect(0).toBeValidCurrentDensity();
        expect(100).toBeValidCurrentDensity();
      });

      it('should fail for invalid current densities', () => {
        expect(() => expect(-1).toBeValidCurrentDensity()).toThrow();
        expect(() => expect(1001).toBeValidCurrentDensity()).toThrow();
      });
    });

    describe('toBeValidVoltage', () => {
      it('should pass for valid voltages', () => {
        expect(0.65).toBeValidVoltage();
        expect(0).toBeValidVoltage();
        expect(1.5).toBeValidVoltage();
      });

      it('should fail for invalid voltages', () => {
        expect(() => expect(-1).toBeValidVoltage()).toThrow();
        expect(() => expect(2.1).toBeValidVoltage()).toThrow();
      });
    });

    describe('toBeValidEfficiency', () => {
      it('should pass for valid efficiencies', () => {
        expect(0.85).toBeValidEfficiency();
        expect(0).toBeValidEfficiency();
        expect(1.0).toBeValidEfficiency();
      });

      it('should fail for invalid efficiencies', () => {
        expect(() => expect(-0.1).toBeValidEfficiency()).toThrow();
        expect(() => expect(1.1).toBeValidEfficiency()).toThrow();
      });
    });

    describe('toBeValidPH', () => {
      it('should pass for valid pH values', () => {
        expect(7.0).toBeValidPH();
        expect(0).toBeValidPH();
        expect(14).toBeValidPH();
      });

      it('should fail for invalid pH values', () => {
        expect(() => expect(-1).toBeValidPH()).toThrow();
        expect(() => expect(15).toBeValidPH()).toThrow();
      });
    });

    describe('toBeValidTemperature', () => {
      it('should pass for valid temperatures', () => {
        expect(25).toBeValidTemperature();
        expect(0).toBeValidTemperature();
        expect(-100).toBeValidTemperature();
      });

      it('should fail for invalid temperatures', () => {
        expect(() => expect(-300).toBeValidTemperature()).toThrow();
        expect(() => expect(150).toBeValidTemperature()).toThrow();
      });
    });
  });

  describe('API response matchers', () => {
    describe('toHaveValidApiResponse', () => {
      it('should pass for valid API responses', () => {
        const response = {
          status: 200,
          data: { message: 'success' },
          timestamp: '2025-01-01T00:00:00.000Z',
        };

        expect(response).toHaveValidApiResponse();
      });

      it('should fail for invalid API responses', () => {
        const invalidResponse = { data: 'test' };
        expect(() => expect(invalidResponse).toHaveValidApiResponse()).toThrow();
      });
    });

    describe('toHaveValidExperimentStructure', () => {
      it('should pass for valid experiment structure', () => {
        const experiment = {
          id: 'exp-1',
          name: 'Test Experiment',
          status: 'completed',
          configuration: {
            temperature: 25,
            pH: 7.0,
          },
          results: {
            powerDensity: 1.5,
          },
        };

        expect(experiment).toHaveValidExperimentStructure();
      });

      it('should fail for invalid experiment structure', () => {
        const invalidExperiment = { name: 'Test' };
        expect(() => expect(invalidExperiment).toHaveValidExperimentStructure()).toThrow();
      });
    });
  });

  describe('testUtils', () => {
    describe('isValidMFCData', () => {
      it('should validate MFC data correctly', () => {
        const validData = {
          powerDensity: 1.5,
          currentDensity: 5.2,
          voltage: 0.65,
        };

        expect(testUtils.isValidMFCData(validData)).toBe(true);
      });

      it('should reject invalid MFC data', () => {
        const invalidData = {
          powerDensity: -1,
          currentDensity: 'invalid',
          voltage: 0.65,
        };

        expect(testUtils.isValidMFCData(invalidData)).toBe(false);
      });
    });

    describe('isValidExperimentalConditions', () => {
      it('should validate experimental conditions correctly', () => {
        const validConditions = {
          temperature: 25,
          pH: 7.0,
        };

        expect(testUtils.isValidExperimentalConditions(validConditions)).toBe(true);
      });

      it('should reject invalid experimental conditions', () => {
        const invalidConditions = {
          temperature: -300,
          pH: 15,
        };

        expect(testUtils.isValidExperimentalConditions(invalidConditions)).toBe(false);
      });
    });

    describe('generateMockPerformanceData', () => {
      it('should generate performance data with correct count', () => {
        const data = testUtils.generateMockPerformanceData(5);

        expect(data).toHaveLength(5);
        expect(data[0]).toHaveProperty('timestamp');
        expect(data[0]).toHaveProperty('powerDensity');
        expect(data[0]).toHaveProperty('currentDensity');
        expect(data[0]).toHaveProperty('voltage');
      });

      it('should generate valid performance values', () => {
        const data = testUtils.generateMockPerformanceData(3);

        data.forEach((point) => {
          expect(point.powerDensity).toBeValidPowerDensity();
          expect(point.currentDensity).toBeValidCurrentDensity();
          expect(point.voltage).toBeValidVoltage();
          expect(point.temperature).toBeValidTemperature();
          expect(point.pH).toBeValidPH();
        });
      });
    });

    describe('expectValidBioelectrochemicalData', () => {
      it('should pass for valid data', () => {
        const validData = {
          powerDensity: 1.5,
          currentDensity: 5.2,
          voltage: 0.65,
        };

        expect(() => testUtils.expectValidBioelectrochemicalData(validData)).not.toThrow();
      });
    });
  });
});
