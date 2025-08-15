export function safeParse(schema, data) {
  const result = schema.safeParse(data);
  if (!result.success) {
    const err = new Error("ValidationError");
    err.details = result.error.flatten();
    throw err;
  }
  return result.data;
}
