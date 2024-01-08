import { HealthcheckStatus } from '../shared/models';

enum ComponentType {
  DATASTORE = 'datastore',
  INTERNAL = 'internal',
  HTTP = 'http',
  GENERIC = 'generic',
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
  // The fields are based on the fields described in
  // https://datatracker.ietf.org/doc/html/draft-inadarei-api-health-check#name-the-checks-object
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

export {
  ComponentType,
  HealthcheckCallbackResponse,
  HealthcheckComponentStatus,
};
