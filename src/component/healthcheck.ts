import {
  ComponentType,
  HealthcheckCallbackResponse,
  HealthcheckComponentStatus,
} from './models';

class InvalidHealthcheckCallbackResponse extends Error {
  originalResponse: any; // eslint-disable-line @typescript-eslint/no-explicit-any

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  constructor(message: string, originalResponse: any) {
    super(message);

    this.originalResponse = originalResponse;
  }
}

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
        throw new InvalidHealthcheckCallbackResponse(
          'HealthcheckCallbackResponse expected',
          result
        );
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

export {
  HealthcheckComponentInterface,
  HealthcheckDatastoreComponent,
  HealthcheckInternalComponent,
  HealthcheckHTTPComponent,
  HealthcheckGenericComponent,
  InvalidHealthcheckCallbackResponse,
};
