"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { collection, query, where, getDocs } from "firebase/firestore";
import db from "../configuration"; 

async function hash(string: string) {
  const utf8 = new TextEncoder().encode(string);
  const hashBuffer = await crypto.subtle.digest("SHA-256", utf8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((bytes) => bytes.toString(16).padStart(2, "0"))
    .join("");
  return hashHex;
}

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({
    email: "",
    password: "",
    submit: "",
  });
  const [isValidating, setIsValidating] = useState(false);
  const router = useRouter();

  const handleSubmit = async (data) => {
    try {
      setIsValidating(true);
      setErrors({});

      const usersRef = collection(db, "users");
      const emailQuery = query(usersRef, where("email", "==", data.email));
      const querySnapshot = await getDocs(emailQuery);

      if (querySnapshot.empty) {
        throw new Error("User not found");
      }

      const userDoc = querySnapshot.docs[0].data();
      const hashedPassword = await hash(data.password);

      console.log("Entered hashed password:", hashedPassword); // DEBUGGING LINE


      if (hashedPassword !== userDoc.password) {
        throw new Error("Incorrect password");
      }

      // Navigate to home page
      router.push("/");
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsValidating(false);
    }
  };

  const handleInput = (e) => {
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
          {errors.email && <p className="text-sm text-red-500">{errors.email}</p>}

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
          {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
        </div>

        {errors.submit && <p className="text-center text-sm text-red-500">{errors.submit}</p>}

        <Button variant="default" type="submit" disabled={isValidating}>
          {isValidating ? "Signing In..." : "Submit"}
        </Button>

        <p className="text-center text-sm">
          Don't have an account?{" "}
          <Link href="/sign-up" className="gap-2 hover:opacity-60 custom-transition">
            Create an account here.
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
