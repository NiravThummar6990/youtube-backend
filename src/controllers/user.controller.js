import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponce } from "../utils/ApiResponce.js";

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
  console.log("REQ FILES => ", req.files);
  console.log("REQ BODY => ", req.body);

  const { fullName, email, userName, password } = req.body;
  // console.log(fullName, email, userName, password);

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

  // console.log(req.files);

  // remove password and refresh token field from responce

  const createdUser = await User.findById(user._id).select(
    "-password -refreshTokan"
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

export { registerUser };
