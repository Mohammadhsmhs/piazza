const express = require('express')
const router = express.Router()
const User = require('../models/User')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const { registerValidation, loginValidation } = require('../validations/validations')


router.post('/register', async (req, res) => {
    // validate the data before creating a user
    const { error } = registerValidation(req.body)
    if (error) return res.status(400).json({ error: error.details[0].message })

    // check if the user is already in the database
    const emailExist = await User.findOne({ email: req.body.email })
    if (emailExist) return res.status(400).json({ error: 'Email already exists' })

    // check if the username is already in the database
    const usernameExist = await User.findOne({ username: req.body.username })
    if (usernameExist) return res.status(400).json({ error: 'Username already exists' })

    // hash the password
    const salt = await bcrypt.genSalt(5)
    const hashedPassword = await bcrypt.hash(req.body.password, salt)

    // create a new user
    const { username, email } = req.body
    const user = new User({
        username,
        email,
        password: hashedPassword
    })

    console.log(user)


    // add the user to the database
    try {
        const savedUser = await user.save()
        // send a 201 status and the user data
        res.status(201).json(savedUser)
    } catch (error) {
        // if there is an error, send a 400 status and the error message
        res.status(400).json({ error: error.message })
    }
})

router.post('/login', async (req, res) => {
    try {
        // validate the data before logging in
        const { error } = loginValidation(req.body)
        if (error) return res.status(400).json({ error: error.details[0].message })
        
        // check if the email exists
        const user = await User.findOne({ email: req.body.email })
        if (!user) return res.status(400).json({ error: 'Email or password is incorrect' })

        // check if the password is correct
        const validPassword = await bcrypt.compare(req.body.password, user.password)
        if (!validPassword) return res.status(400).json({ error: 'Email or password is incorrect' })

        // create and assign a token
        const token = jwt.sign({ _id: user._id }, process.env.TOKEN_SECRET)
        res.header('auth-token', token).json({'auth_token': token})
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' })
    }
})

module.exports = router