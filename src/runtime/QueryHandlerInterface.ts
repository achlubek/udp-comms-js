import { AbstractBaseQuery } from "aero-cqe";

export interface QueryHandlerInterface<
  Query extends AbstractBaseQuery<Result>,
  Result
> {
  handle(query: Query): Result;
}
