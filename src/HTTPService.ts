import { HTTPError } from './HTTPError';
import type { RequestOpts, RequestOptsWithBody, ResponseType, ServiceResponse } from './types';

export class HTTPService {
  static pathPrefix: string = '';
  static retryCount: number = 1;
  static defaultHeaders: Record<string, string> = {};

  private getHeaders(additional: Record<string, string | undefined> = {}): Headers {
    const merged = { ...HTTPService.defaultHeaders, ...additional };
    const headers = new Headers();
    Object.keys(merged).forEach((key) => {
      const value = merged[key];
      if (value) {
        headers.append(key, value);
      }
    });
    return headers;
  }

  private async req(method: string, path: string, opts?: RequestOptsWithBody) {
    const {
      responseType,
      headers = {},
      data,
      pathPrefix = HTTPService.pathPrefix,
      retryCount = HTTPService.retryCount,
      checkResponseRetry,
      checkResponse = HTTPService.checkResponse,
      processResponse = this.processResponse,
      processError = this.processError,
      processNetworkError = this.processNetworkError,
      signal,
    } = opts ?? {};

    if (data instanceof FormData) {
      headers['Content-Type'] = undefined;
    }
    if (opts?.responseType === 'blob') {
      headers.Accept = headers.Accept ?? '*/*';
    }

    const body = typeof data === 'object' && !(data instanceof FormData) ? JSON.stringify(data) : data;

    let response: Response;

    try {
      response = await fetch(pathPrefix + path, { method, headers: this.getHeaders(headers), body, signal });
    } catch (e: unknown) {
      throw new Error(await processNetworkError(e as Error));
    }

    let count = retryCount;
    while (count > 0 && checkResponseRetry && (await checkResponseRetry(response.clone()))) {
      response = await fetch(pathPrefix + path, { method, headers: this.getHeaders(headers), body, signal });
      count--;
    }

    const ok = await checkResponse(response.clone());
    if (!ok) {
      throw new HTTPError(response, await processError(response.clone()));
    }

    return processResponse(response, responseType);
  }

  static checkResponse = async (resp: Response): Promise<boolean> => Promise.resolve(resp.ok);
  static checkResponseRetry = async (_resp: Response): Promise<boolean> => Promise.resolve(false);

  private processResponse = async (resp: Response, type?: ResponseType): Promise<any> => {
    switch (type) {
      case 'text': {
        return resp.text();
      }
      case 'blob': {
        return resp.blob();
      }
      case 'response': {
        return resp;
      }
      case 'json': {
        return resp.json();
      }
      default: {
        const resType = resp.headers.get('Content-Type');
        if (resType?.includes('application/json')) {
          return resp.json();
        } else {
          return resp.text();
        }
      }
    }
  };

  private processError = async (resp: Response): Promise<string> => {
    return resp.text();
  };

  private processNetworkError = async (e: Error): Promise<string> => {
    return new Promise((res) => {
      res(e.message);
    });
  };

  private requestViaAbortController = <T>(
    method: string,
    path: string,
    opts?: RequestOptsWithBody,
  ): ServiceResponse<T> => {
    const ac = new AbortController();
    return {
      promise: this.req(method, path, { ...opts, signal: ac.signal }),
      abort: () => ac.abort(),
    };
  };

  get = <T>(path: string, opts?: RequestOpts) => {
    return this.requestViaAbortController<T>('GET', path, opts);
  };

  post = <T>(path: string, opts?: RequestOptsWithBody) => {
    return this.requestViaAbortController<T>('POST', path, opts);
  };

  put = <T>(path: string, opts?: RequestOptsWithBody) => {
    return this.requestViaAbortController<T>('PUT', path, opts);
  };

  patch = <T>(path: string, opts?: RequestOptsWithBody) => {
    return this.requestViaAbortController<T>('PATCH', path, opts);
  };

  delete = <T>(path: string, opts?: RequestOptsWithBody) => {
    return this.requestViaAbortController<T>('DELETE', path, opts);
  };
}
