import {
  ComponentType,
  HealthcheckComponentStatus,
} from '../../src/component/models';
import { HealthcheckResponse } from '../../src/service/models';

import { HealthcheckStatus } from '../../src/shared/types';

describe('Models', () => {
  describe('HealthcheckResponse', () => {
    it('should not allow invalid status', () => {
      expect(() => {
        new HealthcheckResponse({
          status: 'invalid' as HealthcheckStatus,
          description: 'Test description',
          checks: {},
          httpStatusCode: 200,
        });
      }).toThrow('Invalid status: invalid');
    });

    it('should not allow invalid httpStatusCode', () => {
      expect(() => {
        new HealthcheckResponse({
          status: HealthcheckStatus.PASS,
          description: 'Test description',
          checks: {},
          httpStatusCode: 999,
        });
      }).toThrow('Invalid httpStatusCode: 999');
    });

    it('should allow getting the httpStatusCode', () => {
      const response = new HealthcheckResponse({
        status: HealthcheckStatus.PASS,
        description: 'Test description',
        checks: {},
        httpStatusCode: 200,
      });

      expect(response.getHttpStatusCode()).toBe(200);
    });

    it('should convert the instance to a serializable object', () => {
      const response = new HealthcheckResponse({
        status: HealthcheckStatus.PASS,
        description: 'Test description',
        checks: {
          'Test Component': [
            new HealthcheckComponentStatus({
              componentName: 'Test Component',
              componentType: ComponentType.GENERIC,
              status: HealthcheckStatus.PASS,
              output: 'Test output',
            }),
          ],
        },
        httpStatusCode: 200,
      });

      expect(JSON.parse(response.toJson())).toEqual({
        status: HealthcheckStatus.PASS,
        description: 'Test description',
        httpStatusCode: 200,
        checks: {
          'Test Component': [
            {
              affectsServiceHealth: true,
              componentName: 'Test Component',
              componentType: ComponentType.GENERIC,
              status: HealthcheckStatus.PASS,
              output: 'Test output',
              time: expect.anything(),
            },
          ],
        },
      });
    });
  });
});
