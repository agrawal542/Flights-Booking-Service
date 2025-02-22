const { StatusCodes } = require("http-status-codes");

const info = (req, res, next) => {
    return res.status(StatusCodes.OK).json(
        {
            sussess: true,
            message: 'OK! Flight booking service is running successfully.',
            error: {},
            data: {},
        });
}


module.exports = {
    info
}