// eslint-disable-next-line @typescript-eslint/no-extraneous-class
import { AbstractBaseQuery } from "aero-cqe";

export interface RequestServiceDescriptorQueryResult {
  name: string;
  commandHandlers: string[];
  queryHandlers: string[];
  eventHandlers: string[];
}

export class GetServiceDescriptorQuery extends AbstractBaseQuery<RequestServiceDescriptorQueryResult> {}
