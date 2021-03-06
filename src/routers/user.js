const express = require('express');
const router = new express.Router();
const auth = require('../middleware/auth');
const sharp = require('sharp');
const User = require('../models/user');

const {
   sendWelcome,
   sendCancel,
} = require('../emails/accounts');

router.post('/users', async (req, res) => {
   const user = new User(req.body);
   try {
      await user.save(); 
      sendWelcome(user.email, user.name);
      const token =
         await user.generateAuthToken();
      res.status(201).send({user, token});
   } catch (e) {
      res.status(400).send(e);
   }
 
}); 

router.post('/users/login', async (req, res) => {
   try {
      const user = await User.findByCredentials(
         req.body.email,
         req.body.password
      );
      const token =
         await user.generateAuthToken();
      res.send({user, token});
   } catch (e) {
      res.status(400).send();
   }
}); 

router.post(
   '/users/logout',
   auth,
   async (req, res) => {
      try {
         req.user.tokens = req.user.tokens.filter(
            (token) => token.token !== req.token 
         ); 
         await req.user.save();
         res.send();
      } catch (e) {
         res.status(500).send();
      }
   }
); //?User logout

router.post(
   '/users/logoutAll',
   auth,
   async (req, res) => {
      try {
         req.user.tokens =
            req.user.tokens.splice();
         await req.user.save();
         res.status(200).send();
      } catch (e) {
         res.status(500).send();
      }
   }
); 

router.get(
   '/users/me',
   auth,
   async (req, res) => {
      res.send(req.user);
   }
); 

router.patch(
   '/users/me',
   auth,
   async (req, res) => {
      const updates = Object.keys(req.body); 
      const allowedUpdates = [
         'name',
         'email',
         'password',
         'age',
      ];
      const isValid = updates.every((update) =>
         allowedUpdates.includes(update)
      ); 

      if (!isValid)
         return res
            .status(404)
            .send({error: 'invalid update!'});

      try {
       

         updates.forEach(
            (update) =>
               (req.user[update] =
                  req.body[update])
         );

         await req.user.save();

         
         res.send(req.user);
      } catch (e) {
         res.status(400).send(e);
      }
   }
); 

router.delete(
   '/users/me',
   auth,
   async (req, res) => {
      try {
   
         await req.user.remove();
         sendCancel(
            req.user.email,
            req.user.name
         );

         res.send(req.user);
      } catch (e) {
         res.status(500).send(e);
      }
   }
);

const multer = require('multer');
const avatar = multer({
   
   limits: {
      fileSize: 1000000,
   },

   fileFilter(req, file, callback) {
      if (
         !file.originalname.match(
            /\.(jpg|jpeg|png)$/
         )
      )
         return callback(
            new Error(
               'Please upload an image file'
            )
         );

      callback(undefined, true);
   },
});

router.post(
   '/users/me/avatar',
   auth,
   avatar.single('avatar'), 
   async (req, res) => {
      const buffer = await sharp(req.file.buffer)
         .resize({width: 250, height: 250}) 
         .png()
         .toBuffer();
      req.user.avatar = buffer; 
      await req.user.save();
      res.send();
   },
   (error, req, res, next) => {
      res.status(400).send({
         error: error.message,
      }); 
   }
);

router.get(
   '/users/:id/avatar',
   async (req, res) => {
      try {
         const user = await User.findById(
            req.params.id
         );
         if (!user || !user.avatar)
            throw new Error();

         res.set('Content-Type', 'image/jpg');

         res.send(user.avatar);
      } catch (e) {
         res.status(404).send();
      }
   }
);

router.delete(
   '/users/me/avatar',
   auth,
   async (req, res) => {
      req.user.avatar = undefined;
      await req.user.save();
      res.send();
   }
);

module.exports = router;
