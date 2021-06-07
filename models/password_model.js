const mongoose = require('mongoose');


//Schema

const passwordSchema = new mongoose.Schema({
    title:{
        type:String,
        required:true,
        min:2,
        max:255
    },
    username:{
        title:String,
        min:5,
        max:255
    },
    password:{
        type:String,
        required:true,
        min:8
    },
    emailId:{
        type:String,
        required:true,
        min:5
    },
    category:{
        type:String,
        required:true,
        min:3
    },
    isImportant:{
        type:Boolean,
        default:false
    },
    note:{
        type:String,
        default:""
    },
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        require:true
    },
    date:{
        type:Date,
        default:Date.now()
    }
});


//Creating virtual id
passwordSchema.virtual('id').get(() =>{
    return this._id.toHexString();
});

//Creating virtual userId
passwordSchema.virtual('userId').get(()=>{
    return this.userId.toHexString();
});

passwordSchema.set('toJSON',{
    virtuals:true,
});

module.exports = mongoose.model('Password',passwordSchema);