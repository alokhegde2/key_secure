const mongoose = require("mongoose");

//Category schema
const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    min:3
  },
  icon: {
    type: String,
    default: "",
  },
  color: {
    type: String,
    default: "",
  },
  user_id: {
    type: mongoose.Schema.Types.ObjectId, //foreign key
    ref: "User", //referencing User table
    required: true,
  },
  isDefault:{
      type:Boolean,
      default:false
  }
});

//Creating virtual id
categorySchema.virtual("id").get(function () {
  return this._id.toHexString();
});

categorySchema.set("toJSON", {
  virtuals: true,
});

//Exporting module
module.exports = mongoose.model("Category", categorySchema);
