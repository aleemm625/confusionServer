const express = require("express");
const bodyParser = require("body-parser");
const User = require("../models/user");
const passport = require("passport");

const authenticate = require("../authenticate");
const cors = require("./cors");
const router = express.Router();

router.use(bodyParser.json());

router.options("*", cors.corsWithOptions, (req, res) => {
  res.sendStatus(200);
});

router
  .route("/")
  .get(
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
      User.find({})
        .then(
          (users) => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(users);
          },
          (err) => next(err)
        )
        .catch((err) => next(err));
    }
  );

router.post("/signup", cors.corsWithOptions, (req, res, next) => {
  User.register(
    new User({ username: req.body.username }),
    req.body.password,
    (err, user) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.json({ err: err });
      } else {
        if (req.body.firstname) {
          user.firstname = req.body.firstname;
        }
        if (req.body.lastname) {
          user.lastname = req.body.lastname;
        }
        user.save((err, user) => {
          if (err) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.json({ err: err });
            return;
          }
          passport.authenticate("local")(req, res, () => {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json({
              sucess: true,
              status: "Registration Successfull",
              user: user,
            });
          });
        });
      }
    }
  );
});

router.post(
  "/login",
  cors.corsWithOptions,
  passport.authenticate("local"),
  (req, res, next) => {
    const token = authenticate.getToken({ _id: req.user._id });

    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.json({
      sucess: true,
      status: "You are successfully logged in",
      token: token,
    });
  }
);

router.get("/logout", (req, res, next) => {
  if (req.session) {
    req.session.destroy();
    res.clearCookie("session-id");
    res.redirect("/");
  } else {
    const err = new Error("You are not logged in");
    err.status = 403;
    next(err);
  }
});

router.get(
  "/facebook/token",
  passport.authenticate("facebook-token"),
  (req, res) => {
    if (req.user) {
      const token = authenticate.getToken({ _id: req.user._id });
      res.setHeader("Content-Type", "application/json");
      res.json({
        sucess: true,
        status: "You are successfully logged in",
        token: token,
      });
    }
  }
);

module.exports = router;
