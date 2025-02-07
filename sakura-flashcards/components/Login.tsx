"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

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
      // signIn(data);

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
