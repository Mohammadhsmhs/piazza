# Piazza - A Social Media Platform

## Overview

Piazza is a social media platform designed for users to create posts, comment, like, and dislike content. The application allows users to interact with posts and topics, providing a simple yet effective way to share and discuss ideas.

## Features

- User registration and login with JWT authentication
- Create, read, posts
- Comment on posts
- Like and dislike posts
- Topic management
- Post expiration management
- Middleware for token verification and post status checking

## Technologies Used

- **Node.js**: JavaScript runtime for building server-side applications
- **Express**: Web framework for Node.js
- **MongoDB**: NoSQL database for storing user and post data
- **Mongoose**: ODM (Object Data Modeling) library for MongoDB and Node.js
- **Joi**: Validation library for JavaScript objects
- **JWT (JSON Web Tokens)**: For secure user authentication
- **Bcrypt**: For hashing passwords

## Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/piazza.git
   cd piazza
   ```

2. Install the dependencies:
   ```
   npm install  nodemon express body-parser mongoose dot-env joi bcrypt jsonwebtoken
   ```

3. Create a `.env` file in the root directory and add your MongoDB connection string and JWT secret:
   ```
   DB_CONNECTOR=your_mongodb_connection_string
   TOKEN_SECRET=your_jwt_secret
   ```

4. Start the application:
   ```
   npm start
   ```

5. The server will run on `http://localhost:3000`.

## API Endpoints

### User Authentication

- **POST /api/v1/user/register**: Register a new user
- **POST /api/v1/user/login**: Log in an existing user

### Posts

- **GET /api/v1/posts**: Retrieve all posts
- **GET /api/v1/posts/:postId**: Retrieve a specific post by ID
- **POST /api/v1/posts**: Create a new post
- **POST /api/v1/posts/:postId/comment**: Add a comment to a post
- **POST /api/v1/posts/:postId/like**: Like a post
- **POST /api/v1/posts/:postId/dislike**: Dislike a post

### Topics

- **GET /api/v1/topics**: Retrieve all topics
- **POST /api/v1/topics**: Create a new topic

## Middleware

- **verifyToken**: Middleware to verify JWT tokens for protected routes.
- **checkPostStatus**: Middleware to check if a post is expired before allowing interactions.

## Contributing

Contributions are welcome! If you have suggestions for improvements or features, feel free to open an issue or submit a pull request.

