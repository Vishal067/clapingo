//import mongodb
const { MongoClient, ServerApiVersion } = require("mongodb");

const uri = " ";

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverApi: ServerApiVersion.v1,
});
client
  .connect()
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.log("Error connecting to MongoDB", err);
  });

const collection = client.db("db name").collection("collections name");
//register a new user in the mongo database
const register = async (data) => {
  console.log("registering");
  const user = await collection.insertOne(data);
  return user;
};

//check if user already exists in mongo database
const checkExistingUser = async (email) => {
  console.log("checking existing user");
  const user = await collection.find({ email: email }).toArray();
  console.log("query executed");
  return user;
};

//login a user
const login = async (email) => {
  const user = await collection.find({ email: email });
  return user;
};

const addFavoriteTeacher = async (teacher, email) => {
  return await collection.updateOne(
    { email: email },
    { $push: { favoriteTeachers: teacher } }
  );
};

const removeFavoriteTeacher = async (teacher, email) => {
  return await collection.updateOne(
    { email: email },
    { $pull: { favoriteTeachers: teacher } }
  );
};

const mostFavoriteTeacher = async () => {
  const teachers = await collection
    .aggregate([
      { $unwind: "$favoriteTeachers" },
      { $group: { _id: "$favoriteTeachers" } },
      { $sort: { count: -1 } },
      { $limit: 1 },
    ])
    .toArray();
  return teachers;
};
//get favorite teachers of a student
const getFavoriteTeacher = async (email) => {
  const teachers = await collection.find({ email: email }).toArray();
  return teachers;
};

const checkTeacher = async (teacher, email) => {
  const teachers = await collection
    .find({ email: email, favoriteTeachers: teacher })
    .toArray();
  return teachers;
};

module.exports = {
  register,
  checkExistingUser,
  login,
  addFavoriteTeacher,
  removeFavoriteTeacher,
  getFavoriteTeacher,
  mostFavoriteTeacher,
  checkTeacher,
};
