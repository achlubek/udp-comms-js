import { AbstractBaseCommand } from "aero-cqe";

export interface CommandHandlerInterface<Command extends AbstractBaseCommand> {
  handle(command: Command): void;
}
