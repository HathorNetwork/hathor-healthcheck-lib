import { HealthcheckComponentStatus } from '../component/models';
import { HealthcheckStatus } from '../shared/types';

// We currently only consider 200 and 503 as valid HTTP status codes for healthchecks.
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
   * This function turns the object into a JSON string
   *
   * @returns The JSON string
   */
  toJson(): string {
    return JSON.stringify(this);
  }
}

export { HealthcheckResponse };
