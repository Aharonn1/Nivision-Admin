"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationError = exports.ValidationError = exports.ResourceNotFoundError = exports.RouteNotFoundError = void 0;
class ClientError {
    status;
    message;
    constructor(status, message) {
        this.status = status;
        this.message = message;
    }
}
class RouteNotFoundError extends ClientError {
    constructor(route) {
        super(404, `Route ${route} not found`);
    }
}
exports.RouteNotFoundError = RouteNotFoundError;
class ResourceNotFoundError extends ClientError {
    constructor(id) {
        super(404, `id ${id} not found`);
    }
}
exports.ResourceNotFoundError = ResourceNotFoundError;
class ValidationError extends ClientError {
    constructor(error) {
        super(400, error);
    }
}
exports.ValidationError = ValidationError;
class AuthenticationError extends ClientError {
    constructor(error) {
        super(401, error);
    }
}
exports.AuthenticationError = AuthenticationError;
