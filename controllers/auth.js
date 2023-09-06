import User from "../models/user.js";
import { HttpError, controllerWrapper } from "../helpers/index.js";
import bcryptjs from "bcrypt";
import jwt from "jsonwebtoken";
import path from "path";
import Jimp from "jimp";
import gravatar from "gravatar";
import dotenv from "dotenv";

dotenv.config();

const SECRET_KEY = process.env.SECRET_KEY;
const avatarsDir = path.join(
  new URL(import.meta.url).pathname,
    "../",
    "../",
    "public",
    "avatars"
);

const createUser = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (user) {
    throw new HttpError(409, "Email already in use");
  }

  const hashPassword = await bcryptjs.hash(password, 10);
  const avatarURL = gravatar.url(email);

  const newUser = await User.create({
    ...req.body,
    password: hashPassword,
    avatarURL: avatarURL,
  });
  res
    .status(201)
    .json({
      name: newUser.name,
      email: newUser.email,
      subscription: newUser.subscription,
    });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw new HttpError(401, "Email or password invalid");
  }
  const passwordCompare = await bcryptjs.compare(password, user.password);
  if (!passwordCompare) {
    throw new HttpError(401, "Email or password invalid");
  }

  const payload = {
    id: user.id,
  };

  const token = jwt.sign(payload, SECRET_KEY, { expiresIn: "23h" });
  await User.findByIdAndUpdate(user._id, { token });
  res.json({
    token,
  });
};

const getCurrent = async (req, res) => {
  const { email, name } = req.user;

  res.json({ email, name });
};

const logout = async (req, res) => {
  const { _id } = req.user;
  await User.findByIdAndUpdate(_id, { token: null });
  res.json({ message: "Logged out" });
};

const updAvatars = async (req, res) => {
  const { _id } = req.user;
  const { path: tempUpload, originalname } = req.file;
  console.log(req.file);
  const filename = `${_id}_${originalname}`;
  const resultUpload = path.join(avatarsDir, filename);

  try {
    const avatar = await Jimp.read(tempUpload);
    await avatar.resize(250, 250).writeAsync(resultUpload);

    const avatarURL = path.join("avatars", filename);
    await User.findByIdAndUpdate(_id, { avatarURL: avatarURL });
    res.json({ avatarURL });
  } catch (error) {
    res.status(500).json({ error: "Avatar processing failed" });
  }
};

export default {
  createUser: controllerWrapper(createUser),
  login: controllerWrapper(login),
  getCurrent: controllerWrapper(getCurrent),
  logout: controllerWrapper(logout),
  updAvatars: controllerWrapper(updAvatars),
};
