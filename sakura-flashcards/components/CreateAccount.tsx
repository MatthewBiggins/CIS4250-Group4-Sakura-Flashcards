"use client";

import { useRouter } from "next/navigation";
import { useContext, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  collection,
  doc,
  serverTimestamp,
  addDoc,
  setDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import db from "../firebase/configuration";
import { hash } from "@/utils/hash";
import UserContext from "@/components/UserContext";
import internal from "stream";
import { genkiData } from '@/data';


// create custom data types for card data
type unit = Map<number, boolean>;

type lesson = Array<unit>;

type genkiSet = Array<lesson>;

// Used to create a datatype to store each flashcard as a key value pair,
// where the key is the flashcard index, and the value is the staus of
// whether the flashcard has been viewed. Each flashcard value is initialized
// as false.
const initCardStatus = () => {

  let sets: genkiSet[] = [];

  // fill sets array with lessons, units, and cards, and initialize each card to false
  // genkiData - studySet data from @/data
  for (let studySet of genkiData) {
    let currentSet: genkiSet = [];

    // iterate through each lesson in the studySet
    for (let lessonIndex = 0; lessonIndex < studySet.data.length; lessonIndex++) {
      let currentLesson: lesson = [];

      // iterate though each unit in the lesson
      let lessonData = studySet.data[lessonIndex];
      let units = lessonData.units;
      let numUnits = units.length;
      for (let unitIndex = 0; unitIndex < numUnits; unitIndex++) {
        let currentUnit: unit = new Map();
        
        // iterate through each card in the unit
        let numCards = units[unitIndex].items.length;
        for (let cardIndex = 0; cardIndex < numCards; cardIndex++) {
          // init each card to false
          currentUnit.set(cardIndex, false);

        }
        currentLesson.push(currentUnit);

      }
      currentSet.push(currentLesson);

    }
    sets.push(currentSet);

  }

  return sets;
} 


// Used to add user progress data to user doc in firebase
const addUserProgressToFirebase = (progress: genkiSet[], userId: string) => {

  // add progress for Genki I
  progress[0].forEach(async (lesson, index) => {
    const unitObject = lesson.map(unit => Object.fromEntries(unit));
    await setDoc(doc(db, "users", userId, "studySetI", `Lesson-${index}`), {
      units: unitObject,
    });
  });

  // add progress for Genki II
  progress[1].forEach(async (lesson, index) => {
    const unitObject = lesson.map(unit => Object.fromEntries(unit));
    await setDoc(doc(db, "users", userId, "studySetII", `Lesson-${progress[0].length + index}`), {
      units: unitObject,
    });
  });
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

      // init user progress data
      let progress = initCardStatus()

      //add user to database
      await addDoc(collection(db, "users"), {
        email: data.email,
        username: data.username,
        password: hashedPassword,
        createdAt: serverTimestamp(),
      });

      // used to retreive the user id of the recently created user
      const userQuery = query(usersRef, where("email", "==", data.email));
      const userSnapshot = await getDocs(userQuery);

      // add initial user progress data to firebase
      addUserProgressToFirebase(progress, userSnapshot.docs[0].id);

      console.log("Account created successfully!");
      console.log("Username:", data.username);
      console.log("Email:", data.email);
      console.log("Password:", hashedPassword);
      
      // Log in the new user
      auth.setUser(data.username);
      auth.setProgress(progress);

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
