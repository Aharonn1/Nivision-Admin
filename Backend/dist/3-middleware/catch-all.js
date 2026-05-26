"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function catchAll(err, request, response, next) {
    // Log error to the console:
    console.log(err);
    // Take error status code:
    const statusCode = err.status || 500;
    // Return back error:
    response.status(statusCode).send(err.message);
}
exports.default = catchAll;
