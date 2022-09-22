const axios = require("axios");
const jwt = require("jsonwebtoken");
const jwt_decode = require("jwt-decode");
const bcrypt = require("bcrypt");
const authModel = require("../models/authModel");
const { successResponse, errorResponse } = require("../utils/reponseUtil");
require("dotenv").config();

//add a new student
const register = async (req, res) => {
  const { name, email, password, number } = req.body;
  const hashedPassword = bcrypt.hashSync(password, 15);
  try {
    // console.log("checking existing user");
    const checkExistingUser = await authModel.checkExistingUser(email);
    const data = {
      name: name,
      email: email,
      password: hashedPassword,
      number: number,
      created_at: new Date(),
    };

    if (checkExistingUser.length > 0) {
      console.log("Student exists");
      return res.status(400).send(errorResponse("Student already exists"));
    }
    const registerUser = await authModel.register(data);
    if (registerUser) {
      return res.send(successResponse("Student registered successfully"));
    }
  } catch (error) {
    return res.status(500).send(errorResponse("Internal server error"));
  }
};

//login a student
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const checkExistingUser = await authModel.checkExistingUser(email);
    if (checkExistingUser.length == 0) {
      return res.status(400).send(errorResponse("Student does not exist"));
    }
    const user = checkExistingUser[0];
    console.log("user", user);
    const checkPassword = bcrypt.compareSync(password, user.password);
    if (!checkPassword) {
      return res.status(400).send(errorResponse("Invalid password"));
    }
    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "5h" }
    );
    console.log(token);
    return res.send(
      successResponse("Student logged in successfully", {
        name: user.name,
        email: user.email,
        token: token,
      })
    );
  } catch (error) {
    return res.status(500).send(errorResponse("Internal server error"));
  }
};

// add a favorite teacher to a student profile
const addFavoriteTeacher = async (req, res) => {
  const { teacherName } = req.body;
  const token = req.headers.authorization.split(" ")[1];
  try {
    const decoded = jwt_decode(token);
    const studentEmail = decoded.email;
    const checkToken = jwt.verify(token, process.env.JWT_SECRET);
    if (checkToken) {
      //check if teacher already exists in a student profile
      const checkTeacher = await authModel.checkTeacher(
        teacherName,
        studentEmail
      );

      if (checkTeacher.length == 0) {
        const addTeacher = await authModel.addFavoriteTeacher(
          teacherName,
          studentEmail
        );
        if (addTeacher) {
          return res.send(successResponse("Teacher added successfully"));
        }
      } else {
        return res.status(400).send(errorResponse("Teacher already exists"));
      }
    }
  } catch (error) {
    if (error.message == "jwt expired") {
      return res.status(400).send(errorResponse("Token expired"));
    } else if (error.message == "invalid token") {
      return res.status(400).send(errorResponse("Invalid token"));
    }
    return res.status(500).send(errorResponse("Internal server error"));
  }
};
//remove a favorite teacher from a student profile
const removeFavoriteTeacher = async (req, res) => {
  const { teacherName } = req.body;
  const token = req.headers.authorization.split(" ")[1];
  try {
    const decoded = jwt_decode(token);
    const studentEmail = decoded.email;
    const checkToken = jwt.verify(token, process.env.JWT_SECRET);
    //check that teacher is in the favorite teacher list of the student
    if (checkToken) {
      const checkTeacher = await authModel.checkTeacher(
        teacherName,
        studentEmail
      );
      if (checkTeacher.length == 0) {
        return res.status(400).send(errorResponse("Teacher does not exist"));
      }
      const removeTeacher = await authModel.removeFavoriteTeacher(
        teacherName,
        studentEmail
      );
      if (removeTeacher) {
        return res.send(successResponse("Teacher removed successfully"));
      }
    }
  } catch (error) {
    if (error.message == "jwt expired") {
      return res.status(400).send(errorResponse("Token expired"));
    } else if (error.message == "invalid token") {
      return res.status(400).send(errorResponse("Invalid token"));
    }
    return res.status(500).send(errorResponse("Internal server error"));
  }
};

//most favorite teacher in the school
const mostFavoriteTeacher = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  try {
    const decoded = jwt_decode(token);
    const checkToken = jwt.verify(token, process.env.JWT_SECRET);
    if (checkToken) {
      const mostFavoriteTeacher = await authModel.mostFavoriteTeacher();
      if (mostFavoriteTeacher.length == 0) {
        return res.status(400).send(errorResponse("No favorite teacher"));
      }
      return res.send(
        successResponse("Most favorite teacher", mostFavoriteTeacher)
      );
    }
  } catch (error) {
    if (error.message == "jwt expired") {
      return res.status(400).send(errorResponse("Token expired"));
    } else if (error.message == "invalid token") {
      return res.status(400).send(errorResponse("Invalid token"));
    }
    return res.status(500).send(errorResponse("Internal server error"));
  }
};

//get favorite teachers of a student
const getFavoriteTeacher = async (req, res) => {
  const token = req.headers.authorization.split(" ")[1];
  try {
    const decoded = jwt_decode(token);
    const studentEmail = decoded.email;
    const checkToken = jwt.verify(token, process.env.JWT_SECRET);
    if (checkToken) {
      const getFavoriteTeachers = await authModel.getFavoriteTeacher(
        studentEmail
      );
      const Favorite_teachers = getFavoriteTeachers[0];
      if (Favorite_teachers.favoriteTeachers.length == 0) {
        return res.send(successResponse("No favorite teacher is Added"));
      }
      console.log(Favorite_teachers);
      return res.send(
        successResponse("Favorite_teachers", Favorite_teachers.favoriteTeachers)
      );
    }
  } catch (error) {
    if (error.message == "jwt expired") {
      return res.status(400).send(errorResponse("Token expired"));
    } else if (error.message == "invalid token") {
      return res.status(400).send(errorResponse("Invalid token"));
    }
    return res.status(500).send(errorResponse("Internal server error"));
  }
};

module.exports = {
  register,
  login,
  addFavoriteTeacher,
  removeFavoriteTeacher,
  mostFavoriteTeacher,
  getFavoriteTeacher,
};
