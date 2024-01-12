import {
  Healthcheck,
} from '../src/service/healthcheck';

import {
  HealthcheckComponentInterface,
  HealthcheckDatastoreComponent,
  HealthcheckGenericComponent,
  HealthcheckHTTPComponent,
  HealthcheckInternalComponent,
} from '../src/component/healthcheck';

import {
  HealthcheckStatus,
} from '../src/shared/types';
import { ComponentType, HealthcheckCallbackResponse, HealthcheckComponentStatus } from '../src/component/models';
import { HealthcheckResponse } from '../src/service/models';

describe('Healthcheck', () => {
  let healthcheck: Healthcheck;

  beforeEach(() => {
    healthcheck = new Healthcheck({ name: 'MyHealthcheck' });
  });

  it('should add a component to the healthcheck', () => {
    const component: HealthcheckComponentInterface =
      new HealthcheckDatastoreComponent({ name: 'Datastore' });
    healthcheck.add_component(component);

    expect(healthcheck.components).toContain(component);
  });

  it('should reset the checks', async () => {
    const component: HealthcheckComponentInterface =
      new HealthcheckGenericComponent({ name: 'Generic' });
    component.add_healthcheck(
      async () =>
        new HealthcheckCallbackResponse({
          status: HealthcheckStatus.PASS,
          output: 'Generic healthcheck passed',
        })
    );

    healthcheck.add_component(component);

    await healthcheck.run();

    expect(healthcheck.checks).not.toEqual({});

    healthcheck.reset_checks();

    expect(healthcheck.checks).toEqual({});
  });

  it('should throw if a component healthcheck returns an invalid response', async () => {
    const component: HealthcheckComponentInterface =
      new HealthcheckGenericComponent({ name: 'Generic' });
    component.add_healthcheck(async () => ({}) as any); // eslint-disable-line @typescript-eslint/no-explicit-any

    healthcheck.add_component(component);

    try {
      await healthcheck.run();
    } catch (error: any) {
      expect(error.message).toBe('HealthcheckCallbackResponse expected');
      expect(error.originalResponse).toEqual({});
    }
  });

  it('should run the healthchecks and return the healthcheck response', async () => {
    const component1: HealthcheckComponentInterface =
      new HealthcheckHTTPComponent({ name: 'HTTP' });
    const component2: HealthcheckComponentInterface =
      new HealthcheckInternalComponent({ name: 'Internal' });

    component1.add_healthcheck(
      async () =>
        new HealthcheckCallbackResponse({
          status: HealthcheckStatus.PASS,
          output: 'HTTP healthcheck passed',
        })
    );
    component2.add_healthcheck(
      async () =>
        new HealthcheckCallbackResponse({
          status: HealthcheckStatus.PASS,
          output: 'Internal healthcheck passed',
        })
    );

    healthcheck.add_component(component1);
    healthcheck.add_component(component2);

    const response = await healthcheck.run();

    expect(response).toBeInstanceOf(HealthcheckResponse);
    expect(response.checks['HTTP'][0]).toBeInstanceOf(
      HealthcheckComponentStatus
    );
    expect(response.checks['Internal'][0]).toBeInstanceOf(
      HealthcheckComponentStatus
    );

    expect(response).toMatchObject({
      status: HealthcheckStatus.PASS,
      description: 'Health status of MyHealthcheck',
      checks: {
        HTTP: [
          {
            componentName: 'HTTP',
            componentType: ComponentType.HTTP,
            status: HealthcheckStatus.PASS,
            output: 'HTTP healthcheck passed',
          },
        ],
        Internal: [
          {
            componentName: 'Internal',
            componentType: ComponentType.INTERNAL,
            status: HealthcheckStatus.PASS,
            output: 'Internal healthcheck passed',
          },
        ],
      },
    });
  });

  it('should set the right status if a healthcheck doesnt affect service health', async () => {
    const component: HealthcheckComponentInterface =
      new HealthcheckGenericComponent({ name: 'Generic' });
    component.add_healthcheck(
      async () =>
        new HealthcheckCallbackResponse({
          status: HealthcheckStatus.PASS,
          output: 'Generic healthcheck passed',
          affectsServiceHealth: true,
        })
    );
    component.add_healthcheck(
      async () =>
        new HealthcheckCallbackResponse({
          status: HealthcheckStatus.FAIL,
          output: 'Generic healthcheck failed',
          affectsServiceHealth: false,
        })
    );

    healthcheck.add_component(component);

    const response = await healthcheck.run();

    expect(response.status).toBe(HealthcheckStatus.PASS);
  });

  it('should set failed status if a healthcheck fails', async () => {
    const component: HealthcheckComponentInterface =
      new HealthcheckGenericComponent({ name: 'Generic' });
    component.add_healthcheck(
      async () =>
        new HealthcheckCallbackResponse({
          status: HealthcheckStatus.PASS,
          output: 'Generic healthcheck passed',
        })
    );
    component.add_healthcheck(
      async () =>
        new HealthcheckCallbackResponse({
          status: HealthcheckStatus.FAIL,
          output: 'Generic healthcheck failed',
        })
    );

    healthcheck.add_component(component);

    const response = await healthcheck.run();

    expect(response.status).toBe(HealthcheckStatus.FAIL);
  });

  it('should set warn status if a healthcheck warns and none fail', async () => {
    const component: HealthcheckComponentInterface =
      new HealthcheckGenericComponent({ name: 'Generic' });
    component.add_healthcheck(
      async () =>
        new HealthcheckCallbackResponse({
          status: HealthcheckStatus.PASS,
          output: 'Generic healthcheck passed',
        })
    );
    component.add_healthcheck(
      async () =>
        new HealthcheckCallbackResponse({
          status: HealthcheckStatus.WARN,
          output: 'Generic healthcheck warns',
        })
    );

    healthcheck.add_component(component);

    const response = await healthcheck.run();

    expect(response.status).toBe(HealthcheckStatus.WARN);
  });

  it('should return 503 status code if a healthcheck warns and warn_is_unhealthy is true', async () => {
    healthcheck.warn_is_unhealthy = true;

    const component: HealthcheckComponentInterface =
      new HealthcheckGenericComponent({ name: 'Generic' });
    component.add_healthcheck(
      async () =>
        new HealthcheckCallbackResponse({
          status: HealthcheckStatus.PASS,
          output: 'Generic healthcheck passed',
        })
    );
    component.add_healthcheck(
      async () =>
        new HealthcheckCallbackResponse({
          status: HealthcheckStatus.WARN,
          output: 'Generic healthcheck warns',
        })
    );

    healthcheck.add_component(component);

    const response = await healthcheck.run();

    expect(response.status).toBe(HealthcheckStatus.WARN);
    expect(healthcheck.http_status_code).toBe(503);
  });
});
