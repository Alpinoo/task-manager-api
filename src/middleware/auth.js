const jwt = require('jsonwebtoken');
const User = require('../models/user');
const auth = async (req, res, next) => {
   try {
      const token = req
         .header('Authorization')
         .replace('Bearer ', '');
      const decoded = jwt.verify(
         token,
         process.env.JWT_KEY
      );
      const user = await User.findOne({
         _id: decoded._id,
         'tokens.token': token,
         e,
      });

      if (!user) throw new Error();

      req.token = token;
      req.user = user; //set the user as requested user.
      next();
   } catch (e) {
      res.status(401).send({
         error: 'Unable to authorize',
      });
   }
};

module.exports = auth;
