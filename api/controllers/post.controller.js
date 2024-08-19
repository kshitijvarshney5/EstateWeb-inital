import prisma from "../lib/prisma.js";
import jwt from "jsonwebtoken";

export const getPosts = async (req, res) => {
  const query = req.query;
  console.log(query);

  // Parsing and validating query parameters
  const city = query.city || undefined;
  const type = query.type || undefined;
  const property = query.property || undefined;
  const bedroom = query.bedroom ? parseInt(query.bedroom) : undefined;
  const minPrice = query.minPrice ? parseInt(query.minPrice) : undefined;
  const maxPrice = query.maxPrice ? parseInt(query.maxPrice) : undefined;

  try {
    const posts = await prisma.post.findMany({
      where: {
        ...(city && { city }),
        ...(type && { type }),
        ...(property && { property }),
        ...(bedroom && { bedroom }),
        price: {
          ...(minPrice && { gte: minPrice }),
          ...(maxPrice && { lte: maxPrice }),
        },
      },
    });

    return res.status(200).json(posts);
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "failed to get posts" });
  }
};

export const getPost = async (req, res) => {
  const id = req.params.id;

  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        PostDetail: true,
        user: {
          select: {
            username: true,
            avatar: true,
          },
        },
      },
    });

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const token = req.cookies?.token;

    if (token) {
      jwt.verify(token, process.env.JWT_SECRET_KEY, async (err, payload) => {
        if (err) {
          return res.status(401).json({ message: "Invalid token" });
        }

        try {
          const saved = await prisma.savedPost.findUnique({
            where: {
              userId_postId: {
                postId: id,
                userId: payload.id,
              },
            },
          });
          return res.status(200).json({ ...post, isSaved: !!saved });
        } catch (err) {
          console.log(err);
          return res
            .status(500)
            .json({ message: "Failed to get saved post status" });
        }
      });
    } else {
      return res.status(200).json({ ...post, isSaved: false });
    }
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ message: "Failed to get post" });
  }
};

export const addPost = async (req, res) => {
  const body = req.body;
  const tokenUserId = req.userId;
  try {
    const newPost = await prisma.post.create({
      data: {
        ...body.postData,
        userId: tokenUserId,
        PostDetail: {
          create: body.postDetail,
        },
      },
    });

    return res.status(200).json(newPost);
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "failed to create post" });
  }
};

export const updatePost = async (req, res) => {
  try {
    res.status(200).json();
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "failed to update post" });
  }
};

export const deletePost = async (req, res) => {
  const id = req.params.id;
  const tokenUserId = req.userId;
  try {
    const post = await prisma.post.findUnique({ where: { id } });

    if (post.userId !== tokenUserId) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    await prisma.post.delete({ where: { id } });
    return res.status(200).json({ message: "post deleted successfully" });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "failed to delete post" });
  }
};
