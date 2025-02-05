"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";

const Login = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    submit?: string;
  }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const router = useRouter();

  const handleSubmit = (data: typeof formData) => {
    try {
      setIsSubmitting(true);
      setErrors({});

      // TODO: attempt sign in

      // TODO: navigate to dashboard page?
      router.push("/");
    } catch (error) {
      setErrors({ submit: "Failed to sign in. Please try again." });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error message for input field
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
      >
        <div>
          <label htmlFor="email">Email:</label>
          <input
            id="email"
            name="email"
            type="email"
            onChange={handleChange}
            required
            placeholder="Enter your email"
          />
          {errors.email && (
            <p className="text-sm text-red-500">{errors.email}</p>
          )}
        </div>
        <div>
          <label htmlFor="password">Password:</label>
          <input
            id="password"
            type="password"
            onChange={handleChange}
            required
            placeholder="Enter your password"
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password}</p>
          )}
        </div>
        {errors.submit && (
          <p className="text-center text-sm text-red-500">{errors.submit}</p>
        )}
        <Button variant="default" type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Signing In..." : "Submit"}
        </Button>
      </form>
    </div>
  );
};

export default Login;
