export interface QueryHandlerInterface<Query, Result> {
  handle(query: Query): Result;
}
