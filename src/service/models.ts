import { HealthcheckComponentStatus } from '../component/models';
import { HealthcheckStatus } from '../shared/models';

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

    if (httpStatusCode < 100 || httpStatusCode > 599) {
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
   * This function turns the object into a JSON serializable using the jsonReplacer function.
   *
   * @returns The JSON serializable object
   */
  toJsonSerializable(): string {
    return JSON.parse(JSON.stringify(this, this.jsonReplacer()));
  }
}

export { HealthcheckResponse };
