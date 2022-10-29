const express = require("express");
const { registerUser, loginUser, logoutUser, loggedIn, getUser, updateUser, changePassword } = require("../controllers/userController");
const protect = require("../middleWare/authMiddleware");

const router = express.Router();


router.post("/register", registerUser)
router.post('/login', loginUser)
router.get('/logout', logoutUser)
router.get('/loggedin', loggedIn)
router.get('/getuser', protect, getUser)
router.get('/updateuser', protect, updateUser)
router.get('/changepassword', protect, changePassword)



module.exports = router