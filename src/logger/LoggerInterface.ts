export interface LoggerInterface {
  error<T>(source: T, message: string): void;

  warn<T>(source: T, message: string): void;

  info<T>(source: T, message: string): void;

  debug<T>(source: T, message: string): void;

  trace<T>(source: T, message: string): void;
}
