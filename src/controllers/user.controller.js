import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponce } from "../utils/ApiResponce.js";
import jwt from "jsonwebtoken";

const generateAccessTokenAndRefreshToken = async (userId) => {
  try {
    const user = await User.findById(userId);
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    user.refreshToken = refreshToken;
    await user.save({ validateBeforeSave: false });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating refresh and access Token "
    );
  }
};

const registerUser = asyncHandler(async (req, res) => {
  // get user details  from frontend
  // validation - not empty
  // check if user already existes -- username / email
  // check or images, check for avtar
  // uoload them to cloudinary - check avtar
  // create user object - create entry in db
  // remove password and refresh token field from responce
  // check for user creation
  // return responce

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  // get user details  from frontend

  const { fullName, email, userName, password } = req.body;

  // validation - not empty

  if (
    [fullName, email, userName, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, "All Field are required");
  }

  // check if user already existes -- username / email

  const existedUser = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (existedUser) {
    throw new ApiError(409, "User with email and username already exists");
  }

  // check or images, check for avtar

  const avatarLocalPath = req.files?.avatar?.[0]?.path;

  const covorImageLocalPath = req.files?.covorImage?.[0]?.path;

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  }

  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const covorImage = await uploadOnCloudinary(covorImageLocalPath);

  if (!avatar) {
    throw new ApiError(400, "Error while uploading avatar");
  }

  // create user object - create entry in db

  const user = await User.create({
    fullName,
    userName: userName.toLowerCase(),
    avatar: avatar.url,
    covorImage: covorImage?.url || "",
    email,
    password,
  });

  // remove password and refresh token field from responce

  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // check for user creation

  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registringthe user");
  }

  // return responce

  return res
    .status(201)
    .json(new ApiResponce(200, createdUser, "User registered Successfully"));
});

const loginUser = asyncHandler(async (req, res) => {
  //  req body -> data
  //  username or email
  //  find the user
  // password check
  // access and refresh token
  // send cookie

  // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

  //  req body -> data

  const { email, userName, password } = req.body;

  if (!email && !userName) {
    throw new ApiError(400, "username or email must be required");
  }

  //  find the user

  const user = await User.findOne({
    $or: [{ userName }, { email }],
  });

  if (!user) {
    throw new ApiError(400, "User dose not exists");
  }

  // password check

  const isPasswordValid = await user.isPasswordCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "Invalid user credentials");
  }

  // access and refresh token

  const { accessToken, refreshToken } =
    await generateAccessTokenAndRefreshToken(user._id);

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // send cookie

  const Options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(201)
    .cookie("accessToken", accessToken, Options)
    .cookie("refreshToken", refreshToken, Options)
    .json(
      new ApiResponce(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "User loged in Successfully"
      )
    );
});

const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: undefined,
      },
    },
    { new: true }
  );

  const Options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("refreshToken", Options)
    .clearCookie("accessToken", Options)
    .json(new ApiResponce(201, {}, "User Logedout Successfully"));
});

const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingrRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingrRefreshToken) {
    throw new ApiError(401, "Anouthorized Request");
  }

  try {
    const decodedToken = await jwt.verify(
      incomingrRefreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "Invalid RefreshToken");
    }

    if (incomingrRefreshToken !== user.refreshToken) {
      throw new ApiError(401, "refreshToken is expired or used");
    }

    const Options = {
      httpOnly: true,
      secure: true,
    };

    const { accessToken, newRefreshToken } =
      await generateAccessTokenAndRefreshToken(user?._id);

    return res
      .status(200)
      .cookie("accessToken", accessToken, Options)
      .cookie("refreshToken", newRefreshToken, Options)
      .json(
        new ApiResponce(
          201,
          { accessToken, refreshToken: newRefreshToken },
          "Access token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "Invalid refreshToken");
  }
});

export { registerUser, loginUser, logoutUser, refreshAccessToken };
