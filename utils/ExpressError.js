class ExpressError extends Error {
    constructor(statusCode, message) {
        super(message); // ✅ Correctly pass the message
        this.statusCode = statusCode;
    }
}

module.exports = ExpressError;
