const { check, validationResult } = require('express-validator');

// exports.userSignupValidator = (req,res,next)=>{
//     req.check("name", "name is required").notEmpty();
//     req.check("email", "email must be between 3 to 32 characters")
//      .matches(/.+\@.+\..+/).withMessage("Email must contain @")
//      .isLength({
//         min:4,
//         max: 32
//      });

//   req.check("password","password is required").notEmpty();
//   req.check("password")
//    .isLength({min:6}).withMessage("password must contain at least 6 characters")
//    .matches(/\d/).withMessage("password must contain a number");

//    const errors = req.validationErrors();
//     if (errors) {
//         const firstError = errors.map(error => error.msg)[0];
//          return res.status(400).json({error: firstError});
//     }

//   next();  
// }

exports.userSignupValidator = [
  check('name')
    .notEmpty().withMessage('Name is required'),

  check('email')
    .isEmail().withMessage('Must be a valid email address')
    .isLength({ min: 4, max: 32 }).withMessage('Email must be between 4 to 32 characters'),

  check('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must contain at least 6 characters')
    .matches(/\d/).withMessage('Password must contain a number'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const firstError = errors.array()[0].msg;
      return res.status(400).json({ error: firstError });
    }
    next();
  }
];
