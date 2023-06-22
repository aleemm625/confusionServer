const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const authenticate = require("../authenticate");

const cors = require("./cors");
const Favorites = require("../models/favorite");

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter
  .route("/")
  .get(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    Favorites.findOne({ user: req.user._id })
      .populate("user")
      .populate("dishes")
      .exec((err, favorite) => {
        if (err) {
          res.statusCode = 500;
          res.setHeader("Content-Type", "application/json");
          res.json(err);
        } else {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(favorite);
        }
      });
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id }, (err, favorite) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.json(err);
      }
      if (Array.isArray(req.body)) {
        const newFavoriteDishes = req.body.map((obj) => obj._id);
        if (favorite) {
          const favoriteDishes = favorite.dishes.map((dish) => dish.toString());
          const combinedFavoriteDishes = joinArraysUnique(
            newFavoriteDishes,
            favoriteDishes
          );
          favorite.dishes = combinedFavoriteDishes;
          favorite.save((err, updatedFavorites) => {
            if (err) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.json(err);
            } else {
              if (updatedFavorites) {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorite);
              }
            }
          });
        } else {
          Favorites.create(
            { user: req.user._id, dishes: newFavoriteDishes },
            (err, favorites) => {
              if (err) {
                res.statusCode = 500;
                res.setHeader("Content-Type", "application/json");
                res.json(err);
              } else {
                if (favorites) {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(favorites);
                }
              }
            }
          );
        }
      } else {
        res.statusCode = 404;
        throw new Error("Validation failed on request object");
      }
    });
  })
  //   .put((req, res) => {})
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    Favorites.findOneAndRemove({ user: req.user._id }, (err, favorite) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.json(err);
      } else {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(favorite);
      }
    });
  });

favoriteRouter
  .route("/:favoriteDishId")
  //   .get((req, res) => {})
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    Favorites.findOne({ user: req.user._id }, (err, favorite) => {
      if (err) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.json(err);
      }
      const newFavoriteDish = [req.params.favoriteDishId];
      if (favorite) {
        const favoriteDishes = favorite.dishes.map((dish) => dish.toString());
        const combinedFavoriteDishes = joinArraysUnique(
          newFavoriteDish,
          favoriteDishes
        );
        favorite.dishes = combinedFavoriteDishes;
        favorite.save((err, updatedFavorites) => {
          if (err) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.json(err);
          } else {
            if (updatedFavorites) {
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(favorite);
            }
          }
        });
      } else {
        Favorites.create(
          { user: req.user._id, dishes: [newFavoriteDish] },
          (err, favorites) => {
            if (err) {
              res.statusCode = 500;
              res.setHeader("Content-Type", "application/json");
              res.json(err);
            } else {
              if (favorites) {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorites);
              }
            }
          }
        );
      }
    });
  })
  //   .put((req, res) => {})
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res) => {
    Favorites.findOne({ user: req.user._id }, (err, favorite) => {
      console.log(1);
      if (err) {
        console.log(2);
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.json(err);
      } else {
        console.log(3);
        const filteredDishes = favorite.dishes.filter(
          (dish) => dish.toString() !== req.params.favoriteDishId
        );

        favorite.dishes = filteredDishes;
        favorite.save((err, updatedFavorite) => {
          if (err) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json");
            res.json(err);
          } else {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json(updatedFavorite);
          }
        });
      }
    });
  });

function joinArraysUnique(arr1, arr2) {
  const uniqueSet = new Set([...arr1, ...arr2]);
  const uniqueArray = Array.from(uniqueSet);

  return uniqueArray;
}

module.exports = favoriteRouter;
