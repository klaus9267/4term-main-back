export interface APIResponse {
  msg?: string;
  response?: object;
}

export interface ApiErrorResponse {
  name: string;
  example: ApiErrorExample;
}

export interface ApiErrorExample {
  msg: string;
  response?: any;
  success?: boolean;
}

export interface JsonArray {
  no?: string;
  userNo?: string;
}
