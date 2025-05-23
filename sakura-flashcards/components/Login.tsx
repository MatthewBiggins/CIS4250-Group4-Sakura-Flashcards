"use client";

import { useContext, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { collection, query, where, getDocs } from "firebase/firestore";
import db from "@/firebase/configuration";
import { hash } from "@/utils/hash";
import UserContext from "@/components/context/UserContext";
import { TCardProgress, TLessonProgress, TStudySetProgress, TUnitProgress } from "@/constants";

// Used to retrieve the progress subcollections genkiSetI and genkiSetII from the firebase 
// and load the data into the custom types genkiSet, lesson, and unit
const getProgressFromFirebase = async (querySnapshot: any) => {

  // get set 1
  const setIRef = collection(querySnapshot.docs[0].ref, "studySetI");
  const setISnapshot = await getDocs(setIRef);

  // get set 2
  const setIIRef = collection(querySnapshot.docs[0].ref, "studySetII");
  const setIISnapshot = await getDocs(setIIRef);

  let sets: TStudySetProgress[] = [];

  // Process study set I
  let lessonsI: TLessonProgress[] = [];
  for (const doc of setISnapshot.docs) {
    const data = doc.data().units;
    const unitMaps: TUnitProgress[] = data.map((unitData: { cards: TCardProgress[] }) => 
      new Map<number, TCardProgress>(
        unitData.cards.map((cardProgress, index) => [index, cardProgress])
      )
    );
    lessonsI.push(unitMaps);
  }

  // Process study set II
  let lessonsII: TLessonProgress[] = [];
  for (const doc of setIISnapshot.docs) {
    const data = doc.data().units;
    const unitMaps: TUnitProgress[] = data.map((unitData: { cards: TCardProgress[] }) => 
      new Map<number, TCardProgress>(
        unitData.cards.map((cardProgress, index) => [index, cardProgress])
      )
    );
    lessonsII.push(unitMaps);
  }

  sets.push(lessonsI);
  sets.push(lessonsII);
  return sets;
}

const Login = () => {
  // State to store form data and validation errors
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    submit?: string;
  }>({});

  const [isValidating, setIsValidating] = useState(false);
  const router = useRouter();
  const auth = useContext(UserContext);

  const handleSubmit = async (data: typeof formData) => {
    try {
      setIsValidating(true);
      setErrors({});

      // Check Firestore for the entered email
      const usersRef = collection(db, "users");
      const emailQuery = query(usersRef, where("email", "==", data.email));
      const querySnapshot = await getDocs(emailQuery);

      if (querySnapshot.empty) {
        throw new Error("User not found");
      }

      // Retrieve user data from Firestore
      const userDoc = querySnapshot.docs[0].data();
      const hashedPassword = await hash(data.password);

      //get progress data
      const progress = await getProgressFromFirebase(querySnapshot);

      console.log("Entered hashed password:", hashedPassword);

      // Compare the hashed input password with the stored hashed password
      if (hashedPassword !== userDoc.password) {
        throw new Error("Incorrect password");
      }

      console.log(userDoc);

      auth.setUser(userDoc.username);
      auth.setProgress(progress);
      auth.setUserId(querySnapshot.docs[0].id);

      // Navigate to home page
      router.push("/dashboard");
    } catch (error) {
      setErrors({ submit: (error as Error).message });
    } finally {
      setIsValidating(false);
    }
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
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
            <label htmlFor="email">Email:</label>
            <input
              id="email"
              name="email"
              type="email"
              onChange={handleInput}
              required
              placeholder="Enter your email"
              className="text-black"
            />
          </div>
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
              required
              placeholder="Enter your password"
              className="text-black"
            />
          </div>
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password}</p>
          )}
        </div>

        {errors.submit && (
          <p className="text-center text-sm text-red-500">{errors.submit}</p>
        )}

        <Button variant="default" type="submit" disabled={isValidating}>
          {isValidating ? "Signing In..." : "Submit"}
        </Button>

        <p className="text-center text-sm">
          Don't have an account?{" "}
          <Link
            href="/sign-up"
            className="gap-2 hover:opacity-60 custom-transition"
          >
            Create an account here.
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
