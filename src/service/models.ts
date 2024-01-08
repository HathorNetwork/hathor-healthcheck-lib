import { HealthcheckComponentStatus } from '../component/models';
import { HealthcheckStatus } from '../shared/models';

// We currently only consider 200 and 503 as valid HTTP status codes for healchecks.
const VALID_HTTP_STATUS_CODES = [200, 503];

class HealthcheckResponse {
  status: HealthcheckStatus;
  description: string;
  checks: { [key: string]: HealthcheckComponentStatus[] };
  private httpStatusCode: number;

  constructor({
    status,
    description,
    checks,
    httpStatusCode,
  }: {
    status: HealthcheckStatus;
    description: string;
    checks: { [key: string]: HealthcheckComponentStatus[] };
    httpStatusCode: number;
  }) {
    this.status = status;
    this.description = description;
    this.checks = checks;
    this.httpStatusCode = httpStatusCode;

    if (!Object.values(HealthcheckStatus).includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }

    if (!VALID_HTTP_STATUS_CODES.includes(httpStatusCode)) {
      throw new Error(`Invalid httpStatusCode: ${httpStatusCode}`);
    }
  }

  getHttpStatusCode(): number {
    return this.httpStatusCode;
  }

  /**
   * We use this function to remove some fields from the JSON representation of the object.
   */
  private jsonReplacer() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (key: string, value: any) => {
      if (key === 'httpStatusCode' || key === 'affectsServiceHealth') {
        return undefined;
      }

      return value;
    };
  }

  /**
   * This function turns the object into a JSON string using the jsonReplacer function
   * to remove some fields.
   *
   * @returns The JSON string
   */
  toJson(): string {
    return JSON.stringify(this, this.jsonReplacer());
  }
}

export { HealthcheckResponse };
