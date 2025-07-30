const express = require("express");
const {userSignupValidator} = require("../validator/index")
const router = express.Router();

const {signin, signup, signout, requireSignin} = require("../controllers/auth")

router.post("/signup", userSignupValidator, signup);
router.post("/signin", signin);
router.post("/signout", signout);


module.exports = router;