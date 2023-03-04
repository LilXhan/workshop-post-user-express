import { PrismaClient } from '@prisma/client';
import {Request, Response} from 'express';

const prisma = new PrismaClient();

export const updatePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    await prisma.post.update({
      where: {id: Number(id)},
      data: {
        title: title,
        content: content
      }
    });
    res.status(200).json({
      ok: true, 
      msg: 'post updated'
    });
  } catch (error) {
    res.status(500).json({
      ok: false, 
      error: error
    })
  };
};

export const deletePost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.post.delete({
      where: {id: Number(id)}
    });
    res.status(200).json({
      ok: true, 
      msg: 'post deleted'
    })
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error
    });
  };
};

export const findPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const post = prisma.post.findUnique({
      where: {id: Number(id)}
    });
    res.status(200).json({
      ok: true, 
      data: post
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error
    });
  };
};

export const findAllPost = async (_req: Request, res: Response): Promise<void> => {
  try {
    const posts = await prisma.post.findMany({
      include: {author: true}
    });
    res.status(200).json({
      ok: true, 
      data: posts
    });
  } catch (error) {
    res.send(500).json({
      ok: false,
      error: error
    });
  };
};

export const createPost = async (req: Request, res: Response): Promise<void> => {
  try {
    if (req.body instanceof Array) {
      const posts = req.body;
      await prisma.post.createMany({
        data: posts
      });
      res.status(201).json({
        ok: true,
        msg: 'posts created'
      });
    } else {
      const { title, content, author } =  req.body;
      await prisma.post.create({
        data: {
          title: title,
          content: content,
          author: {connect: {id: author}}
        }
      });
      res.status(201).json({
        ok: true,
        msg: 'post created'
      })
    }
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error
    });
  };
};
