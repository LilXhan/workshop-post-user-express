import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    await prisma.user.delete({
      where: {id: Number(id)}
    });
    res.status(200).json({
      ok: true, 
      msg: 'user deleted'
    });
  } catch (error) {
    res.status(500).json({
      ok: false, 
      error: error
    });
  };
};

export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { email, name } = req.body;
    await prisma.user.update({
      where: {id: Number(id)},
      data: {
        email: email,
        name: name
      }
    });
    res.status(200).json({
      ok: true,
      msg: 'user updated' 
    });
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error
    })
  }
};

export const findUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = prisma.user.findUnique({
      where: {id: Number(id)}
    });
    res.status(200).json({
      ok: true,
      data: user
    });
  } catch (error) {
    res.status(500).json({
      res: false,
      error: error
    });
  };
};

export const findAllUser = async (_req: Request, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany();
    res.status(200).json({
      ok: true, 
      data: users
    });
  } catch (error) {
    res.status(500).json({
      ok: false, 
      error: error
    });
  };
};

export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, name } = req.body;
    await prisma.user.create({
      data: {
        name: name,
        email: email
      }
    });
    res.status(201).json({
      ok: true, 
      msg: 'user created'
    })
  } catch (error) {
    res.status(500).json({
      ok: false,
      error: error
    })
  }
};

export const createUserWithPost = async (req: Request, res: Response): Promise<void> => {
  try {
    const {email, name, posts} = req.body;
    const user = await prisma.user.create({
      data: {
        email: email,
        name: name,
        posts: {
          createMany: {
              data: posts.map((post: any) => {
                return {
                  title: post.title,
                  content: post.content
                }
            })
          }
        }
      },
      include: {posts: true}
    });

    res.status(201).json({
      ok: true,
      data: user
    })

  } catch (error) {
    res.status(200).json({
      ok: false,
      error: error
    });
  };
};
