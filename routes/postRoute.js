const express = require("express");
const router = express.Router();
const Post = require("../models/post");

// create post
router.post("/create", async (req, res) => {
  const { post, postTitle, postBody, postTopic, status } = req.body;

  //   await Post.deleteMany({ postId: null });

  try {
    const newPost = new Post({
      post,
      postTitle,
      postBody,
      postTopic,
      status,
      postOwner: req.user.username,
    });

    await newPost.save();
    res.status(201).json({ message: "Post added successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
});

//update post
router.put("/update", async (req, res) => {
  const { postId } = req.query;
  const { post, postTitle, postBody } = req.body;
  const currentUser = req.user.username;

  try {
    const existingPost = await Post.findOne({ postId: postId });

    if (!existingPost) {
      return res.status(404).json({ error: "Post not found." });
    }

    if (existingPost.postOwner !== currentUser) {
      return res
        .status(403)
        .json({ error: "Unauthorized. You are not the owner of the post." });
    }

    if (existingPost.expiresAt < new Date()) {
      return res.status(403).json({ error: "Post expired. Cannot update." });
    }

    existingPost.post = post || existingPost.post;
    existingPost.postTitle = postTitle || existingPost.postTitle;
    existingPost.postBody = postBody || existingPost.postBody;

    await existingPost.save();

    res.status(200).json({ message: "Post updated successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
});

// delete post
router.delete("/delete", async (req, res) => {
  const { postId } = req.query;

  try {
    const post = await Post.findOne({ postId: postId });
    console.log("post " + JSON.stringify(post));

    if (!post) {
      return res.status(404).json({ error: "Post not found." });
    }
    console.log("owner " + post.postOwner + " " + req.user.username);
    if (!(post.postOwner == req.user.username)) {
      return res
        .status(403)
        .json({ error: "Unauthorized. You are not the owner of the post." });
    }

    await Post.findOneAndDelete({ postId: postId });
    res.status(200).json({ message: "Post deleted successfully." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
});

//get topic posts
router.get("/topic", async (req, res) => {
  const { topic } = req.query;

  try {
    let posts = await Post.find({ postTopic: topic });

    await Promise.all(
      posts.map(async (post) => {
        if (post.expiresAt && post.expiresAt < new Date()) {
          post.status = "Expired";
          await post.save();
        }
      })
    );

    posts = await Post.find({ postTopic: topic });

    res.status(200).json({ posts: posts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error." });
  }
});


//most active 
router.get("/most-active-posts", async (req, res) => {
    try {
      const { topic } = req.query;
  
      if (!topic) {
        return res.status(400).json({ error: "Topic parameter is required." });
      }
  
      const mostActivePosts = await Post.aggregate([

        { $match: {  postTopic: topic } },
        {
          $group: {
            _id: "$postTopic",
            mostLikedPost: { $max: { likes: "$numberOfLikes", post: "$$ROOT" } },
            mostDislikedPost: { $max: { dislikes: "$numberOfDislikes", post: "$$ROOT" } },
          },
        },

        {
          $project: {
            _id: 0,
            postTopic: "$_id",
            mostLikedPost: "$mostLikedPost.post",
            mostDislikedPost: "$mostDislikedPost.post",
          },
        },
      ]);
  
      res.status(200).json({ mostActivePosts: mostActivePosts });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error." });
    }
  });

module.exports = router;
