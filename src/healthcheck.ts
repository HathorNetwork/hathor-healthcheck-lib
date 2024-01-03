import {
  ComponentType,
  HealthcheckCallbackResponse,
  HealthcheckComponentStatus,
  HealthcheckResponse,
  HealthcheckStatus,
} from './models';

abstract class HealthcheckComponentInterface {
  abstract component_type: ComponentType;
  name: string;
  id?: string;
  healthchecks: (() => Promise<HealthcheckCallbackResponse>)[];

  constructor({ name, id }: { name: string; id?: string }) {
    this.name = name;
    this.id = id;
    this.healthchecks = [];
  }

  add_healthcheck(
    callback: () => Promise<HealthcheckCallbackResponse>
  ): HealthcheckComponentInterface {
    this.healthchecks.push(callback);
    return this;
  }

  async _run_async_healthchecks(): Promise<HealthcheckCallbackResponse[]> {
    const responses: HealthcheckCallbackResponse[] = await Promise.all(
      this.healthchecks.map((callback) => callback())
    );
    return responses;
  }

  async run(): Promise<HealthcheckComponentStatus[]> {
    const results: HealthcheckComponentStatus[] = [];

    const healthcheck_results = await this._run_async_healthchecks();

    for (const result of healthcheck_results) {
      if (!(result instanceof HealthcheckCallbackResponse)) {
        throw new Error('HealthcheckCallbackResponse expected');
      }

      results.push(
        new HealthcheckComponentStatus({
          componentName: this.name,
          componentType: this.component_type,
          status: result.status,
          output: result.output,
          componentId: this.id,
          affectsServiceHealth: result.affectsServiceHealth,
        })
      );
    }

    return results;
  }
}

class HealthcheckDatastoreComponent extends HealthcheckComponentInterface {
  component_type = ComponentType.DATASTORE;
}

class HealthcheckInternalComponent extends HealthcheckComponentInterface {
  component_type = ComponentType.INTERNAL;
}

class HealthcheckHTTPComponent extends HealthcheckComponentInterface {
  component_type = ComponentType.HTTP;
}

class HealthcheckGenericComponent extends HealthcheckComponentInterface {
  component_type = ComponentType.GENERIC;
}

class Healthcheck {
  name: string;
  components: HealthcheckComponentInterface[];
  warn_is_unhealthy: boolean;
  checks: { [key: string]: HealthcheckComponentStatus[] };

  constructor({
    name,
    components = [],
    warn_is_unhealthy = false,
  }: {
    name: string;
    components?: HealthcheckComponentInterface[];
    warn_is_unhealthy?: boolean;
  }) {
    this.name = name;
    this.components = components;
    this.warn_is_unhealthy = warn_is_unhealthy;
    this.checks = {};
  }

  get status(): HealthcheckStatus {
    let status = HealthcheckStatus.PASS;

    for (const component_checks of Object.values(this.checks)) {
      for (const check of component_checks) {
        if (!check.affectsServiceHealth) {
          continue;
        }

        if (check.status === HealthcheckStatus.FAIL) {
          return HealthcheckStatus.FAIL;
        } else if (check.status === HealthcheckStatus.WARN) {
          status = HealthcheckStatus.WARN;
        }
      }
    }

    return status;
  }

  get description(): string {
    return 'Health status of ' + this.name;
  }

  add_component(component: HealthcheckComponentInterface): void {
    this.components.push(component);
  }

  reset_checks(): void {
    this.checks = {};
  }

  async run(): Promise<HealthcheckResponse> {
    this.reset_checks();

    const results = await Promise.all(
      this.components.map((component) => component.run())
    );

    for (let i = 0; i < this.components.length; i++) {
      const component = this.components[i];
      const result = results[i];
      this.checks[component.name] = result;
    }

    return new HealthcheckResponse({
      status: this.status,
      description: this.description,
      checks: this.checks,
      httpStatusCode: this.http_status_code,
    });
  }

  get http_status_code(): number {
    if (this.status === HealthcheckStatus.PASS) {
      return 200;
    } else if (
      this.status === HealthcheckStatus.WARN &&
      !this.warn_is_unhealthy
    ) {
      return 200;
    } else if (
      this.status === HealthcheckStatus.WARN &&
      this.warn_is_unhealthy
    ) {
      return 503;
    } else if (this.status === HealthcheckStatus.FAIL) {
      return 503;
    } else {
      throw new Error(`Unrecognized status ${this.status}`);
    }
  }
}

export {
  Healthcheck,
  HealthcheckComponentInterface,
  HealthcheckDatastoreComponent,
  HealthcheckGenericComponent,
  HealthcheckHTTPComponent,
  HealthcheckInternalComponent,
};
