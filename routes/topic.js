const express = require('express')
const router = express.Router()

const Topic = require('../models/Topic')
const verifyToken = require('../middleware/verifyToken')

//get all topics
router.get('/', verifyToken, async (req, res)=>{
    const topics = await Topic.find()
    res.json(topics)
})

//create a new topic    
router.post('/', verifyToken, async (req, res)=>{
    const topic = new Topic({
        name: req.body.name,
    })
    try {
        const savedTopic = await topic.save()
        res.json(savedTopic)
    } catch (error) {
        res.status(400).json({ message: error.message })
    }
})


module.exports = router