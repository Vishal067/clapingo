const express = require("express");
const router = express.Router();
const authService = require("../services/authService");

// add a new student
router.post("/register", authService.register);

// login
router.post("/login", authService.login);

// add a favorite teacher to a student profile
router.post("/favorite", authService.addFavoriteTeacher);

// remove a favorite teacher from a student profile
router.post("/unfavorite", authService.removeFavoriteTeacher);

// get all favorite teachers for a student profile
router.get("/favorites", authService.getFavoriteTeacher);

//most favorite teachers
router.get("/most-favorites", authService.mostFavoriteTeacher);

module.exports = router;
