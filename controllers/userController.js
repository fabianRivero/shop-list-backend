import User from "../models/User.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

export async function getUsers(req, res){
  try {
    const user = await User.find({});
    res.status(200).json({ users: user });
  } catch (err) {
    res.status(500).send({ message: "Server Error" + err.message });
  }
}

export async function signup(req, res){
    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send("User already registered.");

    console.log("request", req.body);

    user = new User({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        role: req.body.role,
    });

    try {
        await user.save();

        const token = jwt.sign(
        {
            id: user.id,
            role: user.role,
        },
        process.env.JWT_SECRET,
        {
            expiresIn: "6h",
        }
        );

        res
        .status(201)
        .header("Authorization", token)
        .json({
            user: {
            name: user.name,
            email: user.email,
            role: user.role,
            },
            token,
        });
    } catch (error) {
        res.status(500).send("Something went wrong." + error.message);
    }
}

export async function login(req, res){
  const user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("Invalid email or password.");

  const validPassword = await bcrypt.compare(req.body.password, user.password);
  if (!validPassword) return res.status(400).send("Invalid email or password.");

  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "6h",
    }
  );

  res.status(200).header("Authorization", token).json({ token: token });
}