import * as Joi from "joi";

import { ConfigurationInterface } from "@app/configuration/ConfigurationInterface";
import { LogLevel, availableLogLevels } from "@app/logger/LoggerInterface";

/* eslint-disable @typescript-eslint/naming-convention */
interface ProcessEnv {
  LOG_LEVEL: LogLevel;
  PORT: number;
  BROADCAST_ADDRESS: string;
  SERVICE_NAME: string;
}
/* eslint-enable @typescript-eslint/naming-convention */

export class ConfigurationValidationFailedException extends Error {}

const parseProcessEnv = (): ProcessEnv => {
  const schema = Joi.object<ProcessEnv>({
    LOG_LEVEL: Joi.string()
      .equal(...availableLogLevels)
      .required(),
    PORT: Joi.number().min(1).max(65535).required(),
    BROADCAST_ADDRESS: Joi.string()
      .ip({
        version: ["ipv4"],
        cidr: "forbidden",
      })
      .required(),
    SERVICE_NAME: Joi.string().required(),
  });

  const validationResult = schema.validate(process.env, { allowUnknown: true });

  if (validationResult.error || validationResult.warning) {
    throw new ConfigurationValidationFailedException(
      validationResult.error?.message ?? validationResult.warning?.message
    );
  }
  return validationResult.value;
};

export class Configuration implements ConfigurationInterface {
  private readonly logLevel: LogLevel;
  private readonly port: number;
  private readonly broadcastAddress: string;
  private readonly serviceName: string;

  public constructor() {
    const env = parseProcessEnv();
    this.logLevel = env.LOG_LEVEL;
    this.port = env.PORT;
    this.broadcastAddress = env.BROADCAST_ADDRESS;
    this.serviceName = env.SERVICE_NAME;
  }

  public getLogLevel(): LogLevel {
    return this.logLevel;
  }

  public getPort(): number {
    return this.port;
  }

  public getBroadcastAddress(): string {
    return this.broadcastAddress;
  }

  public getServiceName(): string {
    return this.serviceName;
  }
}
