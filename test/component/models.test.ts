import {
  ComponentType,
  HealthcheckCallbackResponse,
  HealthcheckComponentStatus,
} from '../../src/component/models';

import { HealthcheckStatus } from '../../src/shared/types';

describe('Models', () => {
  describe('HealthcheckCallbackResponse', () => {
    it('should create a new instance with default values', () => {
      const response = new HealthcheckCallbackResponse({
        status: HealthcheckStatus.PASS,
        output: 'Test output',
      });

      expect(response.status).toBe(HealthcheckStatus.PASS);
      expect(response.output).toBe('Test output');
      expect(response.affectsServiceHealth).toBe(true);
    });
  });

  describe('HealthcheckComponentStatus', () => {
    it('should create a new instance with default values', () => {
      const status = new HealthcheckComponentStatus({
        componentName: 'Test Component',
        componentType: ComponentType.GENERIC,
        status: HealthcheckStatus.PASS,
        output: 'Test output',
      });

      expect(status.componentName).toBe('Test Component');
      expect(status.componentType).toBe(ComponentType.GENERIC);
      expect(status.status).toBe(HealthcheckStatus.PASS);
      expect(status.output).toBe('Test output');
      expect(status.affectsServiceHealth).toEqual(true);
    });

    it('should not allow observedValue without observedUnit', () => {
      expect(() => {
        new HealthcheckComponentStatus({
          componentName: 'Test Component',
          componentType: ComponentType.GENERIC,
          status: HealthcheckStatus.PASS,
          output: 'Test output',
          observedValue: '100',
        });
      }).toThrow('observedUnit must be set if observedValue is set');
    });

    it('should not allow invalid componentType', () => {
      expect(() => {
        new HealthcheckComponentStatus({
          componentName: 'Test Component',
          componentType: 'invalid' as ComponentType,
          status: HealthcheckStatus.PASS,
          output: 'Test output',
        });
      }).toThrow('Invalid componentType: invalid');
    });

    it('should not allow invalid status', () => {
      expect(() => {
        new HealthcheckComponentStatus({
          componentName: 'Test Component',
          componentType: ComponentType.GENERIC,
          status: 'invalid' as HealthcheckStatus,
          output: 'Test output',
        });
      }).toThrow('Invalid status: invalid');
    });
  });
});
