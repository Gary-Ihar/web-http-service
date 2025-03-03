export type ResponseType = 'json' | 'text' | 'blob' | 'response';

export type RequestOpts = {
  responseType?: ResponseType;
  headers?: Record<string, string | undefined>;
  retryCount?: number;
  pathPrefix?: string;
  checkResponseRetry?: (resp: Response) => Promise<boolean>;
  checkResponse?: (resp: Response) => Promise<boolean>;
  processResponse?: (resp: Response) => Promise<any>;
  processError?: (resp: Response) => Promise<string>;
  processNetworkError?: (e: Error) => Promise<string>;
  signal?: AbortController['signal'];
};

export type RequestOptsWithBody = RequestOpts & { data?: string | object | FormData };

export type ServiceResponse<T = unknown> = {
  promise: Promise<T>;
  abort: () => void;
};
