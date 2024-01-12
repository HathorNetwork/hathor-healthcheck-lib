import { HealthcheckStatus } from '../shared/types';
import { HealthcheckResponse } from './models';
import { HealthcheckComponentInterface } from '../component/healthcheck';
import { HealthcheckComponentStatus } from '../component/models';

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

export { Healthcheck };
