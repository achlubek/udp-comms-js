import { ConfigurationInterface } from "@app/configuration/ConfigurationInterface";
import { LogLevel, LoggerInterface } from "@app/logger/LoggerInterface";
import { prettyPrint } from "@app/logger/prettyPrint";

export class Logger implements LoggerInterface {
  private effectiveLogLevels: string[];

  public constructor(configurationInterface: ConfigurationInterface) {
    this.effectiveLogLevels = Logger.getEffectiveLogLevels(
      configurationInterface.getLogLevel()
    );
    this.debug(
      this,
      `Current log level: ${configurationInterface.getLogLevel()}`
    );
  }

  public error<T>(source: T, message: string): void {
    if (this.effectiveLogLevels.includes("error")) {
      this.print(prettyPrint(source, message));
    }
  }

  public warn<T>(source: T, message: string): void {
    if (this.effectiveLogLevels.includes("warn")) {
      this.print(prettyPrint(source, message));
    }
  }

  public info<T>(source: T, message: string): void {
    if (this.effectiveLogLevels.includes("log")) {
      this.print(prettyPrint(source, message));
    }
  }

  public debug<T>(source: T, message: string): void {
    if (this.effectiveLogLevels.includes("debug")) {
      this.print(prettyPrint(source, message));
    }
  }

  public trace<T>(source: T, message: string): void {
    if (this.effectiveLogLevels.includes("trace")) {
      this.print(prettyPrint(source, message));
    }
  }

  private print(line: string): void {
    // eslint-disable-next-line no-console
    console.log(line);
  }

  private static getEffectiveLogLevels(logLevel: LogLevel): string[] {
    switch (logLevel) {
      case "none":
        return [];
      case "error":
        return ["error"];
      case "warn":
        return ["error", "warn"];
      case "info":
        return ["error", "warn", "log"];
      case "debug":
        return ["error", "warn", "log", "debug"];
      case "trace":
        return ["error", "warn", "log", "debug", "trace"];
    }
  }
}
