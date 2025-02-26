"use client";

import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  collection,
  serverTimestamp,
  addDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import db from "../firebase/configuration";
import { hash } from "@/utils/hash";
import UserContext from "@/components/UserContext";
import internal from "stream";

//TODO: replace j < 3 and k < 100 with values from dataset
const initCardStatus = () => {
  type unit = Map<number, boolean>;

  type lesson = Array<unit>;

  let lessons: lesson[] = new Array(23).fill(null).map(() => []);

  for (let i = 0; i < 24; i++) {
    let currentLesson: lesson = [];

    for (let j = 0; j < 3; j++) {
      let currentUnit: unit = new Map();
      for (let k = 0; k < 100; k++) {
        currentUnit.set(k, false);
      }
      currentLesson.push(currentUnit);
    }

    lessons[i] = currentLesson;
  }
  console.log("test");
  console.log(lessons);

} 

const CreateAccount = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [errors, setErrors] = useState<{
    username?: string;
    email?: string;
    password?: string;
    confirm?: string;
    submit?: string;
  }>({});
  const [isValidating, setIsValidating] = useState(false);

  const router = useRouter();
  const auth = useContext(UserContext);

  const handleSubmit = async (data: typeof formData) => {
    try {
      // Attempt create account
      setIsValidating(true);
      setErrors({});

      // Check if passwords match
      if (data.password != data.confirm) {
        throw new Error("Password does not match", { cause: "confirm" });
      }

      // Check Firestore to check if email is already in use
      const usersRef = collection(db, "users");
      const usernameQuery = query(
        usersRef,
        where("username", "==", data.username)
      );
      const emailQuery = query(usersRef, where("email", "==", data.email));
      const usernameSnapshot = await getDocs(usernameQuery);
      const emailSnapshot = await getDocs(emailQuery);

      if (!usernameSnapshot.empty) {
        throw new Error("Username already in use", { cause: "username" });
      }

      if (!emailSnapshot.empty) {
        throw new Error("Email already in use", { cause: "email" });
      }

      // Hash the password before storing it
      const hashedPassword = await hash(data.password);

      await addDoc(collection(db, "users"), {
        email: data.email,
        username: data.username,
        password: hashedPassword,
        createdAt: serverTimestamp(),
      });

      console.log("Account created successfully!");
      console.log("Username:", data.username);
      console.log("Email:", data.email);
      console.log("Password:", hashedPassword);

      // Log in the new user
      auth.setUser(data.username);

      // Navigate to home page
      router.push("/");

      // Handle errors with appropriate error messages
    } catch (error) {
      if (typeof error === "string") {
        setErrors({ submit: error });
      } else if (error instanceof Error) {
        if (error.cause) {
          switch (error.cause) {
            case "username":
              setErrors((prev) => ({
                ...prev,
                username: error.message,
              }));
              break;
            case "email":
              setErrors((prev) => ({
                ...prev,
                email: error.message,
              }));
              break;
            case "password":
              setErrors((prev) => ({
                ...prev,
                password: error.message,
              }));
              break;
            case "confirm":
              setErrors((prev) => ({
                ...prev,
                confirm: error.message,
              }));
              break;
            default:
              setErrors({ submit: error.message });
              break;
          }
        } else {
          setErrors({ submit: error.message });
        }
      } else {
        setErrors({ submit: "Failed to create account. Please try again." });
      }
    } finally {
      setIsValidating(false);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error message for input field on change
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleInvalidInput = (e: React.FormEvent<HTMLInputElement>) => {
    const { name, value, validationMessage } = e.currentTarget;

    if (value) {
      setErrors((prev) => ({
        ...prev,
        [name]: `Invalid ${name} has been entered.`,
      }));
    } else {
      setErrors((prev) => ({
        ...prev,
        [name]: validationMessage,
      }));
    }
  };

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit(formData);
        }}
        className="flex flex-col items-center justify-center space-y-2"
      >
        <div className="text-right space-y-2">
          <div className="space-x-2">
            <label htmlFor="username">Username:</label>
            <input
              id="username"
              name="username"
              type="text"
              onChange={handleInput}
              onInvalidCapture={(e) => {
                e.preventDefault();
                handleInvalidInput(e);
              }}
              onErrorCapture={(e) => {
                e.preventDefault();
                handleInvalidInput(e);
              }}
              required
              placeholder="Enter your username"
              className="text-black"
            />
          </div>
          {/* Display error message for username */}
          {errors.username && (
            <p className="text-sm text-red-500">{errors.username}</p>
          )}

          <div className="space-x-2">
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              name="email"
              type="email"
              onChange={handleInput}
              onInvalidCapture={(e) => {
                e.preventDefault();
                handleInvalidInput(e);
              }}
              onErrorCapture={(e) => {
                e.preventDefault();
                handleInvalidInput(e);
              }}
              required
              placeholder="Enter your email"
              className="text-black"
            />
          </div>
          {/* Display error message for email */}
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email}</p>
          )}

          <div className="space-x-2">
            <label htmlFor="password">Password:</label>
            <input
              id="password"
              name="password"
              type="password"
              onChange={handleInput}
              onInvalidCapture={(e) => {
                e.preventDefault();
                handleInvalidInput(e);
              }}
              onErrorCapture={(e) => {
                e.preventDefault();
                handleInvalidInput(e);
              }}
              required
              placeholder="Enter your password"
              className="text-black"
            />
          </div>
          {/* Display error message for password */}
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password}</p>
          )}

          <div className="space-x-2">
            <label htmlFor="password2">Confirm Password:</label>
            <input
              id="password2"
              name="confirm"
              type="password"
              onChange={handleInput}
              onInvalidCapture={(e) => {
                e.preventDefault();
                handleInvalidInput(e);
              }}
              onErrorCapture={(e) => {
                e.preventDefault();
                handleInvalidInput(e);
              }}
              required
              placeholder="Confirm your password"
              className="text-black"
            />
          </div>
          {/* Display error message for password */}
          {errors.confirm && (
            <p className="text-sm text-red-500">{errors.confirm}</p>
          )}
        </div>

        {/* Display error message for completing login */}
        {errors.submit && (
          <p className="text-center text-sm text-red-500">{errors.submit}</p>
        )}

        <Button variant="default" type="submit" disabled={isValidating}>
          {isValidating ? "Signing In..." : "Submit"}
        </Button>

        <p className="text-center text-sm">
          Have an account?{" "}
          <Link
            href="/login"
            className="gap-2 hover:opacity-60 custom-transition"
          >
            Login here.
          </Link>
        </p>
      </form>
    </div>
  );
};

export default CreateAccount;
