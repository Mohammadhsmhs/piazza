const mongoose = require('mongoose')

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    topics: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Topic' }],
        required: true,
    },
    message: {
        type: String,
        required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    expiresAt: {
        type: Date,
        default: () => new Date(Date.now() + 5*60*1000)
        // 30 * 24 * 60 * 60 * 1000),
    },
    status: {
        type: String,
        enum: ['live', 'expired'],
        default: 'live',
    },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    comments: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }],
        default: [],
    },
    likes: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        default: [],
    },
    dislikes: {
        type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        default: [],
    },
}, {
    timestamps: true,
    versionKey: false
})

postSchema.methods.isExpired = function () {
    return new Date() > this.expiresAt;
};

postSchema.statics.updateExpiredPosts = async function () {
    const now = new Date();
    return this.updateMany(
        {
            status: 'live',
            expiresAt: { $lt: now }
        },
        {
            $set: { status: 'expired' }
        }
    );
};

postSchema.statics.updateExpiredPost = async function (postId) {
    const now = new Date();
    return this.updateOne(
        {
            _id: postId,
            status: 'live',
            expiresAt: { $lt: now }
        },
        {
            $set: { status: 'expired' }
        }
    );
};

module.exports = mongoose.model('Post', postSchema)