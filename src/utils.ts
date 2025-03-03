type ValueType = string | number | boolean | undefined;

export function getQueryParams(params?: Record<string, ValueType | ValueType[]>) {
  if (params) {
    const urlParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      const value = params[key];
      if (value !== undefined) {
        if (Array.isArray(value)) {
          urlParams.append(key, value.join(','));
        } else {
          urlParams.append(key, `${value}`);
        }
      }
    });
    const res = urlParams.toString();
    return res.length > 0 ? `?${res}` : '';
  }
  return '';
}
