import { ConstructorOf } from "@app/util/ConstructorOf";

export const getStatic = <T, E extends keyof T>(
  type: ConstructorOf<T>,
  fieldName: E
): T[E] => {
  return new type()[fieldName];
};
