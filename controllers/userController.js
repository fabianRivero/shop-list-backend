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

export async function getUser(req, res){
  try {
    const user = await User.findOne({ id: req.params.id });
    res.status(200).json({ user: user });
  } catch (err) {
    res.status(500).send({ message: "Server Error" + err.message });
  }
}

export async function signup(req, res){
    let user = await User.findOne({ email: req.body.email });
    if (user) return res.status(400).send("User already registered.");

    user = new User({
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
    });

    try {
        await user.save();

        const token = jwt.sign(
        {
            id: user.id,
        },
        process.env.JWT_SECRET,
        );


        res
        .status(201)
        .header("Authorization", token)
        .json({
            user: {
            name: user.name,
            email: user.email,
            },
            token,
        });
    } catch (error) {
        res.status(500).send("Something went wrong." + error.message);
    }
}

export async function login(req, res){
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return res.status(400).json({ message: "Usuario no registrado." });
  }

  const validPassword = await bcrypt.compare(req.body.password, user.password);

  if (!validPassword) {
    return res.status(400).json({ message: "Contraseña incorrecta." });
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
      currency: user.currency,
      isConfigured: user.isConfigured,
    },
    process.env.JWT_SECRET,
  );

  res.status(200).header("Authorization", token).json({
    token,
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      currency: user.currency,
      isConfigured: user.isConfigured,
    },
  });
}

export async function deleteUser(req, res){
  try{
    const user = await User.findOneAndDelete({ email: req.body.email });
    if (!user) return res.status(400).send("email not found.");

    res.status(200).json({
      message: "User deleted",  
    })

  } catch(error) {
    console.error("Delete error", error);
    res.status(500).json({ message: "Error deleting user", error: error.message })
  }

}

export async function updateUser(req, res){
  try {
    const email = req.user.email;
    const { username, password, role, currency, isConfigured } = req.body;

    const user = await User.findOne({email: email});
    if(!user) return res.status(404).json({ message: "user not found" });

    if (password) user.password = password;
    if(username) user.username = username;
    if(role) user.role = role;
    if(currency) user.currency = currency;
    if(typeof isConfigured === "boolean") user.isConfigured = isConfigured;

    await user.save();

      const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        username: user.username,
        currency: user.currency,
        isConfigured: user.isConfigured,
      },
      process.env.JWT_SECRET,
    );

    res.status(200).json({
      token,
      user: {
        email: user.email,
        username: user.username,
        currency: user.currency,
        isConfigured: user.isConfigured
      }
    })
  } catch(error) {
    console.error("Error updating", error);
    res.status(500).json({ message: "Error updating user", error: error.message })
  }

}