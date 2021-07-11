const { string } = require("joi");
const mongoose = require("mongoose");

//Schema

const passwordSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    min: 2,
    max: 255
  },
  username: {
    type: String,
    max: 255,
    default: "",
  },
  password: {
    type: String,
    min: 8,
  },
  emailId: {
    type: String,
    min: 5,
  },
  category: {
    type: String,
    required: true,
  },
  image:{
    type:String,
    default:""
  },
  isImportant: {
    type: Boolean,
    default: false,
  },
  note: {
    type: String,
    default: "",
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});

//Creating virtual id
passwordSchema.virtual("id").get(function (){
  return this._id.toHexString();
});

//Creating virtual userId
passwordSchema.virtual("user_Id").get(function (){
  return this.userId.toHexString();
});

passwordSchema.set("toJSON", {
  virtuals: true,
});

module.exports = mongoose.model("Password", passwordSchema);
