const asyncHandler = require('express-async-handler')
const User = require('../models/userModel')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1d" })
}

const registerUser = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body
    if (!name || !email || !password) {
        res.status(400)
        throw new Error("Please fill all required fields");
    }
    if (password.length < 6 || password.length > 20) {
        res.status(400)
        throw new Error("Passowrd length must be upto 6 and less than 20 characters")
    }

    const userExists = await User.findOne({ email })

    if (userExists) {
        res.status(400)
        throw new Error("Email has been already registered")
    }



    const user = await User.create({
        name, email, password
    })

    //Generate Token
    const token = generateToken(user._id)

    res.cookie("token", token, {
        path: '/',
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400),
        sameSite: "none",
        secure: true
    })

    if (user) {
        const { _id, name, email, photo, phone, bio } = user
        res.status(201).json({
            _id,
            name,
            email,
            photo,
            phone,
            bio,
            token
        })
    } else {
        throw new Error("Invalid User Data")
    }
})

const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body


    if (!email || !password) {
        res.status(400)
        throw new Error("Please add email and password");
    }

    // Check if user exists
    const user = await User.findOne({ email })

    if (!user) {
        res.status(400)
        throw new Error("User not found, Please Sign Up")
    }

    // User exists, check if password is correct

    const passwordIsCorrect = await bcrypt.compare(password, user.password)

    //Generate Token
    const token = generateToken(user._id)

    res.cookie("token", token, {
        path: '/',
        httpOnly: true,
        expires: new Date(Date.now() + 1000 * 86400),
        sameSite: "none",
        secure: true
    })

    if (user && passwordIsCorrect) {
        const { _id, name, email, photo, phone, bio } = user
        res.status(200).json({
            _id, name, email, photo, phone, bio, token
        })
    } else {
        res.status(400)
        throw new Error("Invalid email or password")
    }

})

const logoutUser = asyncHandler(async (req, res) => {

    res.cookie("token", '', {
        path: '/',
        httpOnly: true,
        expires: new Date(0),
        sameSite: "none",
        secure: true
    })
    return res.status(200).json({ message: "Successfully Logged out" })
})

const loggedIn = asyncHandler(async (req, res) => {
    const token = req.cookies.token
    if (!token) {
        return res.json(false)
    }
    // Verify Token

    const verified = jwt.verify(token, process.env.JWT_SECRET)
    if (verified) {
        return res.json(true)
    }

    res.json(false)


})

const getUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
    if (user) {
        const { _id, name, email, photo, phone, bio } = user
        res.status(200).json({
            _id, name, email, photo, phone, bio
        })
    } else {
        res.status(400)
        throw new Error("Invalid email or password")
    }
})

const updateUser = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
    if (user) {
        const { name, email, photo, bio, phone } = user;
        user.email = email;
        user.name = req.body.name || name
        user.phone = req.body.phone || phone
        user.bio = req.body.bio || bio
        user.photo = req.body.photo || photo

        const updatedUser = await user.save()
        res.status(200).json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            photo: updatedUser.photo,
            phone: updatedUser.phone,
            bio: updatedUser.bio
        })
    } else {
        res.status(404)
        throw new Error("User not found")
    }
})

const changePassword = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id)
    const { oldPassword, newPassword } = req.body

    if (!user) {
        res.status(404)
        throw new Error("User not found")
    }
    if (!oldPassword || !newPassword) {
        res.status(404)
        throw new Error("Please add old and new password")
    }

    const passwordIsCorrect = await bcrypt.compare(oldPassword, user.password)

    if (passwordIsCorrect && user) {
        user.password = newPassword
        await user.save()
        res.status(200).json({ message: "Password is changed Successfully." })
    }
    else {
        res.status(404)
        throw new Error("Old Password is not correct.")
    }



})


module.exports = {
    registerUser,
    loginUser,
    logoutUser,
    loggedIn,
    getUser,
    updateUser,
    changePassword,
}