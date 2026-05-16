export function formatSupportError(error: unknown) {
  if (typeof error === 'string') {
    return error;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  if (!error || typeof error !== 'object') {
    return 'Support chat request failed';
  }

  const candidate = error as {
    error?: unknown;
    formErrors?: string[];
    fieldErrors?: Record<string, string[] | undefined>;
  };

  if (typeof candidate.error === 'string') {
    return candidate.error;
  }

  const formMessage = candidate.formErrors?.find(Boolean);
  if (formMessage) {
    return formMessage;
  }

  const fieldMessage = Object.values(candidate.fieldErrors ?? {})
    .flat()
    .find(Boolean);

  return fieldMessage ?? 'Support chat request failed';
}
