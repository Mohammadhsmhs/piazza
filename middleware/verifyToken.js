const { send } = require('express/lib/response')
const jwt = require('jsonwebtoken')

function verifyToken(req, res, next) {
    // get the token from the header
    const token = req.header('auth-token')
    // if there is no token, return an error
    if (!token) return res.status(401).send('Access Denied')

    try {
        // verify the token
        const verified = jwt.verify(token, process.env.TOKEN_SECRET)
        console.log('Verified token payload:', verified)
        // add the user to the request
        req.user = verified
        // call the next middleware
        next()
    } catch (error) {
        res.status(400).send('Invalid Token')
    }
}

module.exports = verifyToken

