import { Injectable } from '@nestjs/common';
import { auth } from 'firebase-admin';

@Injectable()
export class SocketJWTExtractors {
  constructor() {}

  static fromHeader = function () {
    return function (request) {
      let token = null;
      if (request.auth.token) {
        token = request.auth.token;
      }
      return token;
    };
  };
}
