const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
  username:{
    type: String,
    minlength: 3,
    maxlength: 256,
    required: true,
    unique: true,
  },
  email:{
    type: String,
    required: true,
    minlength: 6,
    maxlength: 256,
    unique: true,
  },
  password:{
    type: String,
    required: true,
    minlength: 6,
    maxlength: 1024,
  },
  date:{
    type: Date,
    default: Date.now,
    required: true,
  },
},{
  versionKey: false 
})

module.exports = mongoose.model('User', userSchema)