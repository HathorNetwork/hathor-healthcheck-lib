enum ComponentType {
  DATASTORE = 'datastore',
  INTERNAL = 'internal',
  HTTP = 'http',
  GENERIC = 'generic',
}

enum HealthcheckStatus {
  PASS = 'pass',
  WARN = 'warn',
  FAIL = 'fail',
}

/**
 * The response from a healthcheck callback.
 */
class HealthcheckCallbackResponse {
  status: HealthcheckStatus;
  output: string;
  affectsServiceHealth?: boolean;

  constructor({
    status,
    output,
    affectsServiceHealth = true,
  }: {
    status: HealthcheckStatus;
    output: string;
    affectsServiceHealth?: boolean;
  }) {
    this.status = status;
    this.output = output;
    this.affectsServiceHealth = affectsServiceHealth;
  }
}

/**
 * The status of a health check in a specific component.
 */
class HealthcheckComponentStatus {
  componentName: string;
  componentType: ComponentType;
  status: HealthcheckStatus;
  output: string;
  time?: string;
  componentId?: string;
  observedValue?: string;
  observedUnit?: string;
  affectsServiceHealth?: boolean;

  constructor({
    componentName,
    componentType,
    status,
    output,
    componentId,
    observedValue,
    observedUnit,
    affectsServiceHealth = true,
  }: {
    componentName: string;
    componentType: ComponentType;
    status: HealthcheckStatus;
    output: string;
    componentId?: string;
    observedValue?: string;
    observedUnit?: string;
    affectsServiceHealth?: boolean;
  }) {
    this.componentName = componentName;
    this.componentType = componentType;
    this.status = status;
    this.output = output;
    this.time = new Date().toISOString();
    this.componentId = componentId;
    this.observedValue = observedValue;
    this.observedUnit = observedUnit;
    this.affectsServiceHealth = affectsServiceHealth;

    if (this.observedValue && !this.observedUnit) {
      throw new Error('observedUnit must be set if observedValue is set');
    }

    if (!Object.values(ComponentType).includes(componentType)) {
      throw new Error(`Invalid componentType: ${componentType}`);
    }

    if (!Object.values(HealthcheckStatus).includes(status)) {
      throw new Error(`Invalid status: ${status}`);
    }
  }
}

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

export {
  ComponentType,
  HealthcheckStatus,
  HealthcheckCallbackResponse,
  HealthcheckComponentStatus,
  HealthcheckResponse,
};
