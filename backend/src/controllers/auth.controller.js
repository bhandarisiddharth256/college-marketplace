import User from "../models/User.model.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import generateToken from "../utils/generateToken.js";
import asyncHandler from "../utils/asyncHandler.js";

const isCollegeEmail = (email) => {
  return email.endsWith(".edu") || email.includes("college");
};

export const registerUser = asyncHandler(async (req, res) => {
  const { name, email, password, college } = req.body;

  if (!isCollegeEmail(email)) {
    throw new ApiError(400, "Only college email allowed");
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "User already exists");
  }

  const user = await User.create({
    name,
    email,
    password,
    college,
  });

  const token = generateToken(user._id);

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          college: user.college,
        },
        token,
      },
      "User registered successfully"
    )
  );
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(401, "Invalid credentials");
  }

  const isMatch = await user.isPasswordCorrect(password);
  if (!isMatch) {
    throw new ApiError(401, "Invalid credentials");
  }

  const token = generateToken(user._id);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          college: user.college,
        },
        token,
      },
      "Login successful"
    )
  );
});
