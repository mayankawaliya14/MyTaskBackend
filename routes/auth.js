const express = require('express');
const User = require('../models/User');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fetchUser = require('../middleware/fetchUser');

const JWT_SECRET = "MynameisMayank";


//Route 1: Create a user using: POST "/api/auth/createuser". No login require
router.post('/createuser', 
  body('name', "Name should contain atleast 3 cherecters").isLength({min: 3}),
  body('Username', "Username should contain atleast 3 cherecters").isLength({min: 3}),
  body('email', "Enter a valid email").isEmail(),
  body('password', "password lenght should be atleast 5").isLength({ min: 5 }),
async(req, res) =>{
  let success = false;

    // If there are errors, return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      success = false;
      return res.status(400).json({success, errors: errors.array() });
    }

    // Check whether the user with the same email or username exist already//
    try{
    let user = await User.findOne({email: req.body.email} || {Username: req.body.Username});
    if(user){
      success = false;
      return res.status(400).json({error: "Sorry a user with this email is already exist"})
    }
    const salt = await bcrypt.genSaltSync(10);
    const SecPass = await bcrypt.hash(req.body.password, salt)
    user = await User.create({
        name: req.body.name,
      Username: req.body.Username,
      email: req.body.email,
      password: SecPass,
    })

    const data = {
     user : {
      id: user.id
    }
  }
    const AuthToken = jwt.sign(data, JWT_SECRET)
    success = true;
    res.json({success, AuthToken})
  } catch (error) {
    success = false;
    console.error(success, error.message);
    res.status(500).send(success, "Internal server error");
  }
})

//Route 2: Authenticate a user using: POST "/api/auth/login". No login require

router.post('/login', [
  body('email', "Enter a valid email").isEmail(),
  body('password', "password can not be blank").exists()],
async(req, res) =>{
   
  let success = false;
    // If there are errors, return bad request and the errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Check whether the user with the same email or username exist already//
    const {email, password} = req.body;
    try {
      let user = await User.findOne({email});
      if(!user){
        success = false
        return res.status(400).json({success, errors: "Try to login with the correct credentials" });
      }
      
      const passwordCompare = await bcrypt.compare(password, user.password)
      if(!passwordCompare){
        success = false
        return res.status(400).json({success, errors: "Try to login with the correct credentials" });
      }
      const data = {
        user : {
         id: user.id
       }
     }
       const AuthToken = jwt.sign(data, JWT_SECRET)
     
       success = true; 
       res.json({success, AuthToken})
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal server error");
    }   
  }
);

// Route 3: Get loggedin user details using: POST "/api/auth/getuser" login require.

router.post('/getuser', fetchUser, async(req, res) => {
  try {
    userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    res.send(user)
    success = true; 
  } catch (error) {
    console.error(error.message);
      res.status(500).send("Internal server error");
  }
}
)

module.exports = router;