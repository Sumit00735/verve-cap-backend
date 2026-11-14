export class AppException extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly statusCode = 500,
  ) {
    super(message);
    this.name = 'AppException';
  }
}
