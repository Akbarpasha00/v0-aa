// EMERGENCY SAFE UTILITIES - Use these everywhere
export const safeHasProperty = (obj: any, prop: string): boolean => {
  return obj != null && obj[prop] !== undefined
}

export const safeGetProperty = <T>(obj: any, prop: string, defaultValue?: T): T => {
  return obj && obj[prop] !== undefined ? obj[prop] : defaultValue;
};

export const isSuccess = (result: any): boolean => {
  return result && result.success === true;
};

export const isError = (result: any): boolean => {
  return result && result.success === false;
};

export const getErrorMessage = (result: any): string => {
  return result?.error || result?.message || "Unknown error occurred";
};

// Replace ALL 'in' operator usage with these functions
export const checkProperty = (obj: any, property: string): boolean => {
  try {
    return obj != null && typeof obj === 'object' && obj.hasOwnProperty(property);
  } catch {
    return false;
  }
};
