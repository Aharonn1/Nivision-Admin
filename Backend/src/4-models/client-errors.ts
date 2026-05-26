abstract class ClientError {
    constructor(public status: number, public message: string) { }
}

export class RouteNotFoundError extends ClientError {
    constructor(route: string) {
        super(404, `Route ${route} not found`);
    }
}

export class ResourceNotFoundError extends ClientError {
    constructor(id: number) {
        super(404, `id ${id} not found`);

    }
}

export class ValidationError extends ClientError {
    constructor(error: string) {
        super(400, error);
    }
}

export class AuthenticationError extends ClientError {
    constructor(error: string) {
        super(401, error);
    }
}