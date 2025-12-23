import mongoose from "mongoose";
import validator from "validator";

const userSchema = new mongoose.Schema(
  {
    avatar: { type: String },
    username: {
      type: String,
      unique: true,
      minLength: [3, "Username must be at least 3 characters"],
      maxLength: [30, "Username cannot be more than 30 characters"],
      required: true,
      index: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
      index: true,
      lowercase: true,
      minLength: [10, "Email must be at least 10 characters"],
      maxLength: [100, "Email cannot be more than 100 characters"],
      validate: {
        validator: function (v: string) {
          return validator.isEmail(v);
        },
        message: (props: any) => `${props.value} is not a valid email!`,
      },
    },
    bio: {
      type: String,
      minLength: [5, "Bio must be at least 5 characters"],
      maxLength: [500, "Bio cannot be more than 500 characters"],
    },
    age: { type: Number, min: 10, max: [100, "Age cannot be more than 100"] },
    location: {
      type: String,
      maxLength: [150, "Location cannot be more than 150 characters"],
    },
    connection: { type: Number, default: 0 },
    course: {
      type: String,
      maxLength: [200, "Course cannot be more than 200 characters"],
    },
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
