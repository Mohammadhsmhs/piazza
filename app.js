const express = require('express')
const app = express()

const mongoose = require('mongoose')
const bodyParser = require('body-parser')
require('dotenv/config')

//this is for the post expiration
const Post = require('./models/Post')

const authRoute = require('./routes/auth')
const postRoute = require('./routes/posts')
const topicRoute = require('./routes/topic')

app.use(bodyParser.json())
app.use('/api/v1/users', authRoute)
app.use('/api/v1/posts', postRoute)
app.use('/api/v1/topics', topicRoute)
mongoose.connect(process.env.DB_CONNECTOR).then(()=>{
    console.log("DB is connected!!")
})

// Update expired posts every minute
setInterval(async () => {
    try {
        await Post.updateExpiredPosts();
        console.log('Updated expired posts');
    } catch (error) {
        console.error('Error updating expired posts:', error);
    }
}, 60000); // Run every minute

app.listen(3000,()=>{
    console.log("server is running !!!")
})