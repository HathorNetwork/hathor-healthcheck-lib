import { HealthcheckStatus } from '../shared/types';

enum ComponentType {
  DATASTORE = 'datastore',
  INTERNAL = 'internal',
  HTTP = 'http',
  GENERIC = 'generic',
}

/**
 * The response from a healthcheck callback.
 *
 * @property {HealthcheckStatus} status - the status of the component health
 * @property {string} output - a human-readable description of the status
 * @property {boolean} affectsServiceHealth - indicates whether the status of this component affects the overall service status.
 *  This is present here so that the callback have control over this behaviour.
 */
class HealthcheckCallbackResponse {
  status: HealthcheckStatus;
  output: string;
  affectsServiceHealth: boolean;

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
 *
 * The fields are based on the fields described in
 * https://datatracker.ietf.org/doc/html/draft-inadarei-api-health-check#name-the-checks-object
 *
 * @property {string} componentName - human-readable name for the component
 * @property {ComponentType} componentType - the type of component
 * @property {HealthcheckStatus} status - the status of the component health
 * @property {string} output - a human-readable description of the status
 * @property {string} time - the time the status was recorded
 * @property {string} componentId - a unique identifier of the component, if any
 * @property {string} observedValue - this could be used in case there is any kind of value associated with the healthcheck
 * @property {string} observedUnit - the unit of the observedValue. e.g. for a time-based value it is important to know whether the time is reported in seconds, minutes, hours or something else
 * @property {boolean} affectsServiceHealth - indicates whether the status of this component affects the overall service status
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

export {
  ComponentType,
  HealthcheckCallbackResponse,
  HealthcheckComponentStatus,
};
