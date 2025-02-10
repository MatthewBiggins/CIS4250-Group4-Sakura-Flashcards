"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import UserData from "@/components/UserData"
const bcrypt = require('bcrypt');
const saltRounds = 10;

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    submit?: string;
  }>({});
  const [isValidating, setIsValidating] = useState(false);

  const router = useRouter();

  const handleSubmit = (data: typeof formData) => {
    try {
      // TODO: Attempt sign in
      setIsValidating(true);
      setErrors({});
      UserData.login(data.email, bcrypt.hashSync(data.password, saltRounds))

      // Navigate to home page
      router.push("/");
    } catch (error) {
      setErrors({ submit: "Failed to sign in. Please try again." });
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
            {/* Display error message for email */}
            {errors.email && (
              <p className="text-sm text-red-500">{errors.email}</p>
            )}
          </div>

          <div className="space-x-2">
            <label htmlFor="password">Password:</label>
            <input
              id="password"
              type="password"
              onChange={handleInput}
              required
              placeholder="Enter your password"
              className="text-black"
            />
            {/* Display error message for password */}
            {errors.password && (
              <p className="text-sm text-red-500">{errors.password}</p>
            )}
          </div>
        </div>

        {/* Display error message for completing login */}
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
