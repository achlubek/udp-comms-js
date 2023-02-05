import * as Joi from "joi";

import { Level, availableLogLevels } from "@app/logger/Logger";

/* eslint-disable @typescript-eslint/naming-convention */
interface EnvType {
  LOG_LEVEL: Level;
  PORT: number;
  BROADCAST_ADDRESS: string;
}
/* eslint-enable @typescript-eslint/naming-convention */

export const getEnvironment = (): EnvType => {
  const schema = Joi.object<EnvType>({
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
  });

  const validationResult = schema.validate(process.env, { allowUnknown: true });

  if (validationResult.error || validationResult.warning) {
    throw new Error(
      validationResult.error?.message ?? validationResult.warning?.message
    );
  }
  return validationResult.value;
};
