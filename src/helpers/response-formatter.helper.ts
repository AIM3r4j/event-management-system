import { responseBodyLog } from '../config/logger';

//200 series
export const OK = (payload, statusCode, message, req) => {
  const response = {
    success: true,
    statusCode: statusCode || 200,
    payload: payload || null,
    message: message || req.i18n.__('ok'),
  };

  // responseBodyLog(response);
  return response;
};

//400 series
export const BAD_REQUEST = (message, payload, req) => {
  const response = {
    success: false,
    statusCode: 400,
    errors: payload || null,
    message: message || req.i18n.__('bad_request'),
  };

  // responseBodyLog(response);
  return response;
};

//401
export const UNAUTHORIZED = (message, req) => {
  const response = {
    success: false,
    statusCode: 401,
    errors: null,
    message: message || req.i18n.__('unauthorized'),
  };

  // responseBodyLog(response);
  return response;
};

//403
export const FORBIDDEN = (message, req) => {
  const response = {
    success: false,
    statusCode: 403,
    errors: null,
    message: message || req.i18n.__('forbidden'),
  };

  // responseBodyLog(response);
  return response;
};

//404
export const NOT_FOUND = (message, req) => {
  const response = {
    success: false,
    statusCode: 404,
    errors: null,
    message: message || req.i18n.__('notfound'),
  };

  // responseBodyLog(response);
  return response;
};

//422
export const UNPROCESSABLE_ENTITY = (message, payload, req) => {
  const response = {
    success: false,
    statusCode: 422,
    errors: payload || null,
    message: message || req.i18n.__('unprocessable'),
  };

  // responseBodyLog(response);
  return response;
};

//500 series
export const INTERNAL_SERVER_ERROR = (message, payload, req) => {
  const response = {
    success: false,
    statusCode: 500,
    errors: payload || null,
    message: message || req.i18n.__('internalservererror'),
  };

  // responseBodyLog(response);
  return response;
};
