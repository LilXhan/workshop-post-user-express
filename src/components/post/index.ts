import { Router } from "express";
import { findAllPost, createPost, findPost, updatePost, deletePost } from "./controller";

const postRouter: Router = Router();

postRouter.get('', findAllPost);
postRouter.post('', createPost);
postRouter.get('/:id', findPost);
postRouter.put('/:id', updatePost);
postRouter.delete('/:id', deletePost);

export default postRouter;