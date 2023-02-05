import { LogLevel } from "@app/logger/LoggerInterface";

export interface ConfigurationInterface {
  getLogLevel(): LogLevel;

  getPort(): number;

  getBroadcastAddress(): string;

  getServiceName(): string;
}
