import { Router } from "express";
import { findAllUser, createUser, deleteUser, updateUser, findUser, createUserWithPost } from "./controller";

const userRouter: Router = Router();

userRouter.get('', findAllUser);
userRouter.post('', createUser);
userRouter.get('/:id', findUser);
userRouter.put('/:id', updateUser);
userRouter.delete('/:id', deleteUser);  
userRouter.post('/userpost', createUserWithPost);

export default userRouter;