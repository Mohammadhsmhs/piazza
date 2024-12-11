const express = require('express')
const router = express.Router()
const verifyToken = require('../middleware/verifyToken')

const Post = require('../models/Post')
const User = require('../models/User')
const Topic = require('../models/Topic')
const Comment = require('../models/Comment')
const checkPostStatus = require('../middleware/checkPostStatus')
const { postValidation, commentValidation } = require('../validations/validations');

// Helper function to add time left information to post(s)
const addTimeLeftToPost = (post) => {
    const timeLeft = post.expiresAt - new Date();
    return {
        ...post.toObject(),
        timeLeftMs: Math.max(0, timeLeft),
        timeLeftHuman: timeLeft > 0 ? 
            Math.floor(timeLeft / (1000 * 60)) + ' minutes' : 
            'Expired'
    };
};

// Retrieve all posts with populated references


router.get('/', verifyToken, async (req, res) => {
    try {
        const posts = await Post.find().limit(20)
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
        const postsWithTimeLeft = posts.map(post => addTimeLeftToPost(post));
        res.json(postsWithTimeLeft);
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
        res.json(addTimeLeftToPost(post));
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new post
router.post('/', verifyToken, async (req, res) => {
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
        res.status(201).json(addTimeLeftToPost(savedPost));
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

        const updatedPost = await Post.findById(post._id)
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
        res.json(addTimeLeftToPost(updatedPost));
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Like a post
router.patch('/:postId/like', [verifyToken, checkPostStatus], async (req, res) => {
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
        const populatedPost = await Post.findById(updatedPost._id)
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
        res.json(addTimeLeftToPost(populatedPost));
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Dislike a post
router.patch('/:postId/dislike', [verifyToken, checkPostStatus], async (req, res) => {
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
        const populatedPost = await Post.findById(updatedPost._id)
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
        res.json(addTimeLeftToPost(populatedPost));
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Get posts by topic ID (can be filtered by status)
router.get('/topics/:topicId', verifyToken, async (req, res) => {
    try {
        const { status } = req.query; // Optional query parameter for filtering by status
        const query = { topics: req.params.topicId };
        
        if (status && ['live', 'expired'].includes(status)) {
            query.status = status;
        }

        const posts = await Post.find(query)
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

        // Add time left for each post
        const postsWithTimeLeft = posts.map(post => {
            const timeLeft = post.expiresAt - new Date();
            return {
                ...post.toObject(),
                timeLeftMs: Math.max(0, timeLeft),
                timeLeftHuman: timeLeft > 0 ? 
                    Math.floor(timeLeft / (1000 * 60)) + ' minutes' : 
                    'Expired'
            };
        });

        res.json(postsWithTimeLeft);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get most active post by topic (highest engagement)
router.get('/topics/:topicId/active', verifyToken, async (req, res) => {
    try {
        const posts = await Post.find({
            topics: req.params.topicId,
            // status: 'live'
        })
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

        if (posts.length === 0) {
            return res.status(404).json({ message: 'No active posts found for this topic' });
        }

        // Calculate engagement score and add time left info for each post
        const postsWithEngagement = posts.map(post => ({
            ...post.toObject(),
            engagementScore: post.likes.length + post.dislikes.length + post.comments.length,
            timeLeftMs: Math.max(0, post.expiresAt - new Date()),
            timeLeftHuman: Math.max(0, Math.floor((post.expiresAt - new Date()) / (1000 * 60))) + ' minutes'
        }));

        // Get the post with highest engagement score
        const mostActivePost = postsWithEngagement.reduce((prev, current) => 
            (prev.engagementScore > current.engagementScore) ? prev : current
        );

        res.json(mostActivePost);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get history of expired posts by topic
router.get('/topics/:topicId/history', verifyToken, async (req, res) => {
    try {
        const expiredPosts = await Post.find({
            topics: req.params.topicId,
            status: 'expired'
        })
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
            })
            .sort({ expiresAt: -1 }); // Sort by expiration date, newest first

        const postsWithInteractions = expiredPosts.map(post => ({
            ...post.toObject(),
            interactions: {
                totalLikes: post.likes.length,
                totalDislikes: post.dislikes.length,
                totalComments: post.comments.length,
                details: {
                    likes: post.likes.map(user => ({
                        user: user.username,
                        timestamp: post.createdAt
                    })),
                    dislikes: post.dislikes.map(user => ({
                        user: user.username,
                        timestamp: post.createdAt
                    })),
                    comments: post.comments.map(comment => ({
                        user: comment.author.username,
                        message: comment.message,
                        timestamp: comment.createdAt
                    }))
                }
            }
        }));

        res.json(postsWithInteractions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router