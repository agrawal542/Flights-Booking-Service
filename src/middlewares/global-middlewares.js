

const reqUserMiddleware = (req, res, next) => {
    const userDataHeader = req.headers['x-user-data']; // Extract header
    if (userDataHeader) {
        try {
            req.user = JSON.parse(userDataHeader); // Attach user data to req.user
        } catch (error) {
            return res.status(400).json({ error: "Invalid user data format" });
        }
    }

    next(); // Proceed to next middleware or route
};


module.exports = {
    reqUserMiddleware
}