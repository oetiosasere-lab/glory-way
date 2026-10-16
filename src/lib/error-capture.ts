let lastCapturedError: Error | undefined;

export function captureError(error: unknown) {
  if (error instanceof Error) {
    lastCapturedError = error;
  } else {
    lastCapturedError = new Error(String(error));
  }
}

export function consumeLastCapturedError(): Error | undefined {
  const err = lastCapturedError;
  lastCapturedError = undefined;
  return err;
}
