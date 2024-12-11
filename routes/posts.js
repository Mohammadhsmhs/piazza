const express = require('express')
const router = express.Router()
const verifyToken = require('../middleware/verifyToken')

const Post = require('../models/Post')
const User = require('../models/User')
const Topic = require('../models/Topic')
const Comment = require('../models/Comment')
const checkPostStatus = require('../middleware/checkPostStatus')
const { postValidation, commentValidation } = require('../validations/validations');


// Retrieve all posts with populated references
router.get('/', verifyToken, async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('author', '_id username')  // Populate author details (only _id and username)
            .populate('topics', 'name')          // Populate topic names
            .populate('likes', '_id username')   // Populate likes with user details
            .populate('dislikes', '_id username')// Populate dislikes with user details
            .populate({
                path: 'comments',                // Populate comments
                populate: {
                    path: 'author',              // Nested populate for comment authors
                    select: '_id username'       // Only select _id and username fields
                }
            });
        res.json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Retrieve a specific post by ID
router.get('/:postId', verifyToken, async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId)
            .populate('author', '_id username')
            .populate('topics', 'name')
            .populate('likes', '_id username')
            .populate('dislikes', '_id username')
            .populate({
                path: 'comments',
                populate: {
                    path: 'author',
                    select: '_id username'
                }
            });
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }
        res.json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new post
router.post('/create', verifyToken, async (req, res) => {
    try {

        // Validate the post data
        const { error } = postValidation(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        // Check if topics are valid
        const validTopics = await Topic.find({ _id: { $in: req.body.topics } });
        if (validTopics.length !== req.body.topics.length) {
            return res.status(400).json({ error: 'One or more topics are invalid' });
        }

        // Create new post with user-provided data
        const post = new Post({
            
            title: req.body.title,
            topics: req.body.topics,    // Ensure topics is an array
            message: req.body.message,
            author: req.user._id,            // Use the ID from the token
        });

        const savedPost = await post.save();
        res.status(201).json(savedPost);
    } catch (error) {
        console.error('Post creation error:', error);
        res.status(400).json({ message: error.message });
    }
});

// Add comment to a post
router.post('/:postId/comment', [verifyToken, checkPostStatus], async (req, res) => {
    try {
        const { error } = commentValidation(req.body);
        if (error) return res.status(400).json({ error: error.details[0].message });

        const user = await User.findById(req.user._id);
        const post = await Post.findById(req.params.postId);

        const comment = new Comment({
            message: req.body.message,
            author: user._id
        });

        const savedComment = await comment.save();
        post.comments.push(savedComment._id);
        await post.save();

        res.json(savedComment);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Like a post
router.post('/:postId/like', [verifyToken, checkPostStatus], async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        const userId = req.user._id;

        // Remove from dislikes if present
        if (post.dislikes.includes(userId)) {
            post.dislikes = post.dislikes.filter(id => id.toString() !== userId.toString());
        }

        // Toggle like
        if (post.likes.includes(userId)) {
            post.likes = post.likes.filter(id => id.toString() !== userId.toString());
        } else {
            post.likes.push(userId);
        }

        const updatedPost = await post.save();
        res.json(updatedPost);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Dislike a post
router.post('/:postId/dislike', [verifyToken, checkPostStatus], async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        const userId = req.user._id;

        // Remove from likes if present
        if (post.likes.includes(userId)) {
            post.likes = post.likes.filter(id => id.toString() !== userId.toString());
        }

        // Toggle dislike
        if (post.dislikes.includes(userId)) {
            post.dislikes = post.dislikes.filter(id => id.toString() !== userId.toString());
        } else {
            post.dislikes.push(userId);
        }

        const updatedPost = await post.save();
        res.json(updatedPost);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router