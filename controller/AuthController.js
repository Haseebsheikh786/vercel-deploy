const { sendMail } = require("../constants");
const bcrypt = require("bcrypt");
const RefreshToken = require("../models/Token");
const jwt = require("jsonwebtoken");
const asyncHandler = require("express-async-handler");
const { User } = require("../models/UserModel");

const Register = asyncHandler(async (req, res) => {
  const { email, password, userName } = req.body;

  if (!email || !password || !userName) {
    res.status(400).json({ error: "All fields are mandatory" });
    throw new Error("All fields are mandatory");
  }

  const userAvailable = await User.findOne({ email });
  if (userAvailable) {
    res.status(400).json({ error: "User already registered" });
    throw new Error("User already registered");
  }

  const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
  const verificationTimestamp = new Date();
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    email,
    password: hashedPassword,
    verificationTimestamp: verificationTimestamp,
    verificationCode,
    userName,
  });

  if (user) {
    await user.save();
    const subject = "Verify Email";
    const html = `<p>Your verification code is ${verificationCode}</p>`;
    const response = await sendMail({ to: email, subject, html });
    res.status(201).json({
      _id: user.id,
      email: user.email,
      userName: user.userName,
      verificationCode: verificationCode,
      verificationTimestamp: verificationTimestamp,
    });
  } else {
    res.status(400).json({ error: "User data is not valid" });
    throw new Error("User data is not valid");
  }
});

const VerifyEmail = asyncHandler(async (req, res) => {
  const { email, verificationCode } = req.body;

  const userAvailable = await User.findOne({ email, verificationCode });

  if (!userAvailable) {
    res.status(400).json({ error: "Invalid verification code" });
    throw new Error("Invalid verification code");
  }

  const expirationTime = new Date(userAvailable.verificationTimestamp);
  expirationTime.setMinutes(expirationTime.getMinutes() + 30);
  const currentTime = new Date();
  if (currentTime > expirationTime) {
    res.status(400).json({ error: "Verification code has expired" });
    throw new Error("Verification code has expired");
  }
  const subject = "Verify Email";
  const html = `<p>Your account has been successfully verified. </p>`;
  const response = await sendMail({ to: email, subject, html });

  userAvailable.Isverified = true;
  await userAvailable.save();

  const token = jwt.sign(
    { _id: userAvailable._id },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: "1m",
    }
  );
  const refreshToken = jwt.sign(
    { _id: userAvailable._id },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "7d",
    }
  );
  try {
    await RefreshToken.updateOne(
      {
        _id: userAvailable._id,
      },
      { token: refreshToken },
      { upsert: true }
    );
  } catch (error) {
    return next(error);
  }
  const cookieOptions = {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true,
    sameSite: "Strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };

  res.cookie("token", token, cookieOptions);
  res.cookie("refreshToken", refreshToken, cookieOptions);
  res.status(200).json({
    message: "User verified successfully",
    _id: userAvailable._id,
    email: userAvailable.email,
    Isverified: userAvailable.Isverified,
    userName: userAvailable.userName,
    addresses: userAvailable.addresses,
    role: userAvailable.role,
  });
});

const ResendVerificationCode = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });

  if (!user) {
    res.status(400).json({ error: "User not found" });
    throw new Error("User not found");
  }

  const newVerificationCode = Math.floor(
    1000 + Math.random() * 9000
  ).toString();
  user.verificationCode = newVerificationCode;
  user.verificationTimestamp = new Date();
  await user.save();

  // Send email with new verification code
  const subject = "Verify Email";
  const html = `<p>Your new verification code is ${newVerificationCode}</p>`;
  const response = await sendMail({ to: email, subject, html });

  res.status(200).json({
    message: "New verification code sent successfully",
    newVerificationCode,
  });
});

const login = asyncHandler(async (req, res) => {
  let auth = false;
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ error: "All fields are mandatory", auth });
    throw new Error("All fields are mandatory");
  }
  0;
  const user = await User.findOne({ email });
  console.log(user, "user");
  if (!user) {
    res.status(400).json({ error: "User not found", auth });
    throw new Error("User not found");
  }

  if (!(await bcrypt.compare(password, user.password))) {
    auth = false;
    res.status(400).json({ error: "Email or password is not valid", auth });
    throw new Error("Email or password is not valid");
  }

  if (!user.Isverified) {
    const verificationCode = Math.floor(1000 + Math.random() * 9000).toString();
    const verificationTimestamp = new Date();
    user.verificationCode = verificationCode;
    user.verificationTimestamp = verificationTimestamp;
    await user.save();

    const subject = "Verify Email";
    const html = `<p>Your verification code is ${verificationCode}</p>`;
    await sendMail({ to: email, subject, html });

    res.status(400).json({ error: "User is not verified", auth });
    throw new Error("User is not verified");
  }

  auth = true;
  const token = jwt.sign({ _id: user._id }, process.env.ACCESS_TOKEN_SECRET, {
    expiresIn: "1m",
  });
  const refreshToken = jwt.sign(
    { _id: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: "7d",
    }
  );

  try {
    await RefreshToken.updateOne(
      {
        _id: user._id,
      },
      { token: refreshToken },
      { upsert: true }
    );
  } catch (error) {
    return next(error);
  }

  const cookieOptions = {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true,
    sameSite: "Strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };

  res.cookie("token", token, cookieOptions);
  res.cookie("refreshToken", refreshToken, cookieOptions);
  res.status(200).json({
    email,
    _id: user._id,
    Isverified: user.Isverified,
    userName: user.userName,
    addresses: user.addresses,
    role: user.role,
  });
});

const Logout = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.cookies;

  try {
    await RefreshToken.deleteOne({ token: refreshToken });
  } catch (error) {
    return next(error);
  }

  const cookieOptions = {
    httpOnly: true,
    sameSite: "Strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
  };

  res.clearCookie("token", cookieOptions);
  res.clearCookie("refreshToken", cookieOptions);

  res.status(200).json({ user: null });
});

const loginUser = asyncHandler(async (req, res) => {
  try {
    const { id } = req.user;
    const userAvailable = await User.findOne({ _id: id });
    res.status(200).json({
      _id: userAvailable._id,
      email: userAvailable.email,
      Isverified: userAvailable.Isverified,
      userName: userAvailable.userName,
      addresses: userAvailable.addresses,
      role: userAvailable.role,
    });
  } catch (err) {
    res.status(404).json({ message: err.message });
    console.log(err, "err");
  }
});
const refresh = asyncHandler(async (req, res) => {
  const originalRefreshToken = req.cookies.refreshToken;

  let id;

  try {
    id = jwt.verify(originalRefreshToken, process.env.REFRESH_TOKEN_SECRET)._id;
  } catch (e) {
    res.status(401).json({ error: "Unauthorized" });
    throw new Error("Unauthorized");
  }

  try {
    const match = RefreshToken.findOne({
      _id: id,
      token: originalRefreshToken,
    });

    if (!match) {
      res.status(401).json({ error: "Unauthorized" });
      throw new Error("Unauthorized");
    }
  } catch (e) {
    console.log(e);
  }

  try {
    const token = jwt.sign({ _id: id }, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: "1m",
    });
    const refreshToken = jwt.sign(
      { _id: id },
      process.env.REFRESH_TOKEN_SECRET,
      {
        expiresIn: "7d",
      }
    );

    await RefreshToken.updateOne({ _id: id }, { token: refreshToken });
    const cookieOptions = {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
      sameSite: "Strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    };

    res.cookie("token", token, cookieOptions); 
    res.cookie("refreshToken", refreshToken, cookieOptions);
  } catch (e) {
    return next(e);
  }

  const user = await User.findOne({ _id: id });

  return res.status(200).json({ user: user });
});
const resetPasswordRequest = asyncHandler(async (req, res) => {
  try {
    const email = req.body.email;
    const user = await User.findOne({ email: email });
    if (user) {
      const verificationCode = Math.floor(
        1000 + Math.random() * 9000
      ).toString();
      user.ResetPasswordCode = verificationCode;
      await user.save();

      // Also set token in email
      const subject = "Password Reset Request";
      const html = `<p>Your password reset code is ${verificationCode}</p>`;

      if (email) {
        const response = await sendMail({ to: email, subject, html });
        res.status(200).json({ message: "Code sent successfully" });
      } else {
        res.status(400).json({ error: "Invalid email" });
      }
    } else {
      res.status(400).json({ error: "Invalid email" });
    }
  } catch (e) {
    console.log(e);
  }
});

const VerifyResetPasswordCode = asyncHandler(async (req, res) => {
  const { email, ResetPasswordCode } = req.body;
  const user = await User.findOne({ email });
  const verificationCode = await User.findOne({ ResetPasswordCode });
  if (!user) {
    res.status(400).json({ error: "Invalid email address" });
    throw new Error("Invalid verification code");
  }
  if (!verificationCode) {
    res.status(400).json({ error: "Invalid verification code" });
    throw new Error("Invalid verification code");
  } else {
    res.status(200).json({ message: "verify code successfully" });
  }
});
const resetPassword = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    res.status(400).json({ error: "Invalid email address" });
    throw new Error("Invalid verification code");
  }
  const hashedPassword = await bcrypt.hash(password, 10);
  if (user) {
    user.password = hashedPassword;
    await user.save();
    const subject = "Password Reset Request";
    const html = `<p>Your password has been successfully changed.</p>`;
    if (email) {
      const response = await sendMail({ to: email, subject, html });
      res.status(200).json({ message: "password change successfully" });
    } else {
      res.status(400).json({ error: "email not valid" });
    }
  } else {
    res.status(400).json({ error: "Verification code not valid" });
  }
});
const ProtectedRoute = asyncHandler(async (req, res) => {
  try {
    res.status(200).json({ error: "success" });
  } catch (e) {
    res.status(401).json({ error: "unauthorized" });
    console.log(e);
  }
});
const updateUser = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByIdAndUpdate(id, req.body, { new: true });
    res.status(200).json(user);
    console.log("user updated successfully");
  } catch (err) {
    res.status(400).json(err);
    console.log("user not updated error");
  }
});

module.exports = {
  Register,
  VerifyEmail,
  ResendVerificationCode,
  login,
  Logout,
  refresh,
  loginUser,
  resetPasswordRequest,
  VerifyResetPasswordCode,
  resetPassword,
  ProtectedRoute,
  updateUser,
};
