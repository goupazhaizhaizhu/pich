export default class RefreshTokenException extends Error {
    inner: Error;

    constructor(message: string, error?: Error) { 
        super(message);
        if (error) { 
            this.inner = error
        }
    }
}