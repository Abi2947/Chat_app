//backend/controllers/userController.js

const asyncHandler = require("express-async-handler");
const User = require("../models/User");
const Chat = require("../models/Chat");

const getDashboard = asyncHandler(async (req, res)=>{
  const totalUsers = await User.countDocuments();
  const totalChats = await Chat.countDocuments();

  res.json({totalUsers, totalChats});
});

const getAll = asyncHandler(async(req, res)=>{
  const users = await User.find().select("-password")
  res.json(users);
});

const getOne = asyncHandler(async(req, res)=>{
  const user = await User.findById(req.params.id).select("-password");
  if (!user){
    return res.status(404).json({message: "User not found"});
  };
  res.json(user);
});

const updateOne = asyncHandler(async(req, res)=>{
  const allowed =["username", "password","phone", "address"];
  const updates = Object.keys(req.body).filter((k)=> allowed.includes(k));
  if (!updates.length){
    return res.status(400).json({message: "Nothing to update"});
  };

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { $set: req.body},
    {new: true, runValidators: true}
  ).select("-password");

  if(!user){
    return res.status(400).json({message: "User not found"});
  }
  res.json(user);
});

const deleteOne = asyncHandler(async(req, res)=>{
  await User.findByIdAndDelete(req.params.id);
  res.json({message: "User deleted successfully"});
});


module.exports ={getDashboard, getAll, getOne, updateOne, deleteOne};
