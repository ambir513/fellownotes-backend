import { ZodSchema } from "zod";

/**
 * A wrapper for function for zod error
 * @param schema
 * @param body
 * @returns number
 */
export default function verifyInputs(schema?: ZodSchema, body?: any): any {
  const error = schema?.safeParse(body);

  if (
    !error?.success &&
    error?.error?.issues &&
    Array.isArray(error.error.issues)
  ) {
    return error.error.issues
      .map((issue: any) => {
        if (issue?.message) {
          return issue.message;
        }
        return "Invalid input";
      })
      .join(", ");
  }

  return false;
}
