import { prettyPrint } from "@app/logger/prettyPrint";

// eslint-disable-next-line
// @ts-ignore
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Source = any;
export const availableLogLevels = [
  "none",
  "error",
  "warn",
  "info",
  "debug",
  "trace",
] as const;
export type Level = (typeof availableLogLevels)[number];

export class Logger {
  private effectiveLogLevels: string[];

  public constructor(level: Level) {
    this.effectiveLogLevels = Logger.getEffectiveLogLevels(level);
    this.debug(this, `Current log level: ${level}`);
  }

  public error(source: Source, message: string): void {
    if (this.effectiveLogLevels.includes("error")) {
      // eslint-disable-next-line no-console
      console.log(prettyPrint(source, message));
    }
  }

  public info(source: Source, message: string): void {
    if (this.effectiveLogLevels.includes("log")) {
      // eslint-disable-next-line no-console
      console.log(prettyPrint(source, message));
    }
  }

  public warn(source: Source, message: string): void {
    if (this.effectiveLogLevels.includes("warn")) {
      // eslint-disable-next-line no-console
      console.log(prettyPrint(source, message));
    }
  }

  public debug(source: Source, message: string): void {
    if (this.effectiveLogLevels.includes("debug")) {
      // eslint-disable-next-line no-console
      console.log(prettyPrint(source, message));
    }
  }

  public trace(source: Source, message: string): void {
    if (this.effectiveLogLevels.includes("trace")) {
      // eslint-disable-next-line no-console
      console.log(prettyPrint(source, message));
    }
  }

  private static getEffectiveLogLevels(logLevel: Level): string[] {
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
    return ["error", "warn", "log"];
  }
}
