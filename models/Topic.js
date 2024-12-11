const mongoose = require("mongoose")

const topicSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
}, {
    versionKey: false

})

module.exports = mongoose.model('Topic', topicSchema)