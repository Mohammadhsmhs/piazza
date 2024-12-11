const Post = require('../models/Post');

const checkPostStatus = async (req, res, next) => {
    try {

        //check if the post exists
        const post = await Post.findById(req.params.postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        //update the post status since the last update
        await Post.updateExpiredPost(req.params.postId);

        //check if the post is expired
        if (post.status === 'expired') {
            return res.status(403).json({ message: 'This post has expired' });
        }
        //if the post is not expired, continue to the next middleware
        next();
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = checkPostStatus; 