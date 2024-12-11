const mongoose = require('mongoose')


const commentSchema = mongoose.Schema({
    message:{
        type: String,
        required: true,
    },
    author:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    createdAt:{
        type: Date,
        default: Date.now,
        required: true,
    },
},{
    versionKey: false 
})

module.exports = mongoose.model('Comment', commentSchema)