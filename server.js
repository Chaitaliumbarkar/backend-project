const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// MongoDB
mongoose.connect(
  "mongodb+srv://chaitaliumbarkar_db:chaitali1234@cluster0.qh0y5vw.mongodb.net/chaitaliumbarkar_db?retryWrites=true&w=majority&appName=Cluster0"
)
.then(() => console.log(" MongoDB Atlas Connected Successfully"))
.catch(err => console.log(" MongoDB Error:", err));


const userSchema = new mongoose.Schema({
  name:String,
  email:{type:String,unique:true},
  password:String,
  photo:{type:String,default:"https://cdn-icons-png.flaticon.com/512/149/149071.png"}
});
const User = mongoose.model("User",userSchema);

// Register
app.post("/register",async(req,res)=>{
  const {name,email,password}=req.body;
  const exists = await User.findOne({email});
  if(exists) return res.json({message:"User already exists"});
  const hashed = await bcrypt.hash(password,10);
  await User.create({name,email,password:hashed});
  res.json({message:"Registration Successful"});
});

// Login
app.post("/login",async(req,res)=>{
  const {email,password}=req.body;
  const user = await User.findOne({email});
  if(!user) return res.json({message:"User not found"});
  const valid = await bcrypt.compare(password,user.password);
  if(!valid) return res.json({message:"Incorrect password"});
  const token = jwt.sign({id:user._id},"secret123");
  res.json({message:"Login Successful",token});
});

// Profile
app.get("/me",async(req,res)=>{
  try{
    const token = req.headers.authorization?.split(" ")[1];
    if(!token) return res.json({success:false});
    const decoded = jwt.verify(token,"secret123");
    const user = await User.findById(decoded.id).select("name email photo");
    res.json({success:true,user});
  }catch(err){ res.json({success:false}); }
});

// Serve Pages
app.get("/",(req,res)=>res.sendFile(path.join(__dirname,"index.html")));
app.get("/home.html",(req,res)=>res.sendFile(path.join(__dirname,"home.html")));

app.listen(5000,()=>console.log("Server running on http://localhost:5000"));
