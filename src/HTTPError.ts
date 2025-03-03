export class HTTPError extends Error {
  response: Response;

  constructor(response: Response, message?: string) {
    super(message);
    this.response = response;
  }
}
