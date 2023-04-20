const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const fetchuser = require('../middleware/getuser')
const { body, validationResult } = require('express-validator');
const otpGenerator = require('otp-generator');
const nodemailer = require("nodemailer");
const router =  express.Router();
const dotenv = require("dotenv")
dotenv.config()
const JWt_SECRET = 'myjwtsom@u';
var transporter =nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: `${process.env.EMAIL_ADDRESS}`,
      pass: `${process.env.EMAIL_PASS}`,
  },
})
// TODO:   Rote 1
router.post('/createuser',[
    body('name','enter a valid name').isLength({ min: 3 }),
    body('email','enter a valid email').isEmail(),
    body('password','enter a valid password atleast of 5 character').isLength({ min: 5 })
],async(req,res) => {
  let success = false;
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.status(400).json({success});
    }
    try {
    let user = await User.findOne({ email: req.body.email});
    if(user)
    {
        return res.status(400).json({ success,message: "a user with this email already exists"})
    }
    const salt= await bcrypt.genSalt(10);
    const secpassword = await bcrypt.hash(req.body.password,salt);
     user= await  User.create({
        name: req.body.name,
        password: secpassword,
        email: req.body.email,
      })
      const data={
        user: {
        id:user.id
        }
      }
      const authtoken=jwt.sign(data,JWt_SECRET);
      // console.log("user created successfully");
      success=true;
      res.json({success,authtoken});
    }
    catch (err) {
        console.error(err);
        success=false;
        res.status(400).json({success, message: err})
    }
})
// TODO:   Rote 3
router.post('/login', [
  body('email', 'Enter a valid email').isEmail(),
  body('password', 'Password cannot be blank').exists(),
], async (req, res) => {
  let success = false;
  // If there are errors, return Bad request and the errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) {
      success = false;
      return res.status(400).json({success, error: "Please try to login with correct credentials" });
    }

    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      success = false;
      return res.status(400).json({ success, error: "Please try to login with correct credentials" });
    }

    const data = {
      user: {
        id: user.id
      }
    }
    const authtoken = jwt.sign(data, JWt_SECRET);
    success = true;
    res.json({ success, authtoken,name:user.name })

  } catch (error) {
    console.error(error.message);
    res.status(500).send("Internal Server Error");
  }


});
// TODO:   Rote 3
router.post('/getuser', fetchuser, async (req, res) => {
    try {
      let userId=req.user.id;
      const user = await User.findById(userId).select("-password");
      res.send(user);
    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }

});
//TODO:   Rote4

router.post('/otp' ,[
  body('name','enter a valid name').isLength({ min: 3 }),
  body('email','enter a valid email').isEmail(),
  body('password','enter a valid password atleast of 5 character').isLength({ min: 5 })
], async (req, res) => {
  const errors = validationResult(req);
    let success= false;
  if (!errors.isEmpty()) {
    return res.status(400).json({success});
  }
  let user = await User.findOne({ email: req.body.email});
    if(user)
    {
        return res.status(400).json({ success,message: "a user with this email already exists"})
    }
    try {
      const { email } = req.body;
      let otp= otpGenerator.generate (6, { upperCaseAlphabets: false, specialChars: false,lowerCaseAlphabets: false});
      try {
        var mailOptions = {
          from: 'somnath553.in@gmail.com',
          to: email,
          subject: 'Somu note app',
          text: " Welcome to somu note app  here is your otp "+ otp
        };
        
        transporter.sendMail(mailOptions, function(error, info){
          if (error) {
            console.log(error);
          } else {
            success = true;
            res.json({success,otp}); 
          }
        });

      } catch (error) {
        res.send({success, message:error});
      }
  

    } catch (error) {
      console.error(error.message);
      res.status(500).send("Internal Server Error");
    }

});

module.exports = router


// .then(user => res.json(user))
//       .catch(err => {console.log(err)
//     res.json(
//         {
//           message:"error please enter a unique value for email address",
//             error: err.keyValue
//     });
//     })