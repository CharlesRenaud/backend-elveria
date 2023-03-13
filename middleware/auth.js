const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(' ')[1];
        const decodedToken = jwt.verify(token, 'LE_GAMING_UNE_PASSION');
        console.log(decodedToken)
        const userId = decodedToken.userId;
        const isAdmin = decodedToken.isAdmin;

        if (req.body.userId && req.body.userId !== userId) {
            throw 'User ID non valable';
        } else {
            req.userId = userId;
            req.isAdmin = isAdmin;
            console.log("auth")
            next();
        }
    } catch (error) {
        res.status(401).json({ error: error | 'Requête non authentifiée'});
    }
};