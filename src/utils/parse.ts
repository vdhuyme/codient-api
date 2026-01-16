import logger from '@config/logging';

export const parseBoolean = (value?: string, defaultValue = false): boolean => {
  if (value === undefined || value === null) {
    return defaultValue;
  }

  const normalized = value.trim().toLowerCase();

  if (['true', 'True', '1', 'yes', 'y'].includes(normalized)) {
    return true;
  }
  if (['false', 'False', '0', 'no', 'n'].includes(normalized)) {
    return false;
  }

  logger.warn(
    `[parseBoolean] Unrecognized boolean value "${value}", falling back to default: ${defaultValue}`,
  );
  return defaultValue;
};
