// pages/Auth.tsx
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const Auth = () => {
  // State to track which form is active (login or register)
  const [activeForm, setActiveForm] = useState("login");
  const [localError, setLocalError] = useState("");
  
  // Login form state
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  
  // Register form state
  const [registerData, setRegisterData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  
  const { login, register, error, clearError, isLoading } = useAuth();
  const navigate = useNavigate();

  // Handle login form changes
  const handleLoginChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setLoginData({
      ...loginData,
      [id]: value,
    });
  };

  // Handle register form changes
  const handleRegisterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setRegisterData({
      ...registerData,
      [name]: value,
    });
  };

  // Handle login submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    clearError();

    if (!loginData.email || !loginData.password) {
      setLocalError("Please enter both email and password");
      return;
    }

    try {
      await login({ email: loginData.email, password: loginData.password });
      navigate('/');
    } catch (err) {
      // Error is handled in the auth context
    }
  };

  // Handle register submission
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError("");
    clearError();

    const { name, email, password, confirmPassword } = registerData;

    if (!name || !email || !password) {
      setLocalError("Please fill in all required fields");
      return;
    }

    if (password !== confirmPassword) {
      setLocalError("Passwords do not match");
      return;
    }

    try {
      await register({ name, email, password });
      navigate("/profile");
    } catch (err) {
      // Error is handled in the auth context
    }
  };

  // Toggle between login and register
  const toggleForm = () => {
    setActiveForm(activeForm === "login" ? "register" : "login");
    setLocalError("");
    clearError();
  };

  return (
    <div className="flex justify-center items-center min-h-[90vh] overflow-hidden pb-[40rem]">
      <div className="relative w-full max-w-md h-full">
        {/* Login Form */}
        <motion.div
          className="absolute w-full"
          initial={false}
          animate={{
            top: activeForm === "login" ? 0 : "70%",
            right: activeForm === "login" ? 0 : "70%",
            opacity: activeForm === "login" ? 1 : 0.6,
            scale: activeForm === "login" ? 1 : 0.9,
            zIndex: activeForm === "login" ? 2 : 1,
            rotateX: activeForm === "login" ? 0 : 45,
            rotateY: activeForm === "login" ? 0 : -15,
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25,
            mass: 1,
          }}
        >
          <Card className="w-full shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Login</CardTitle>
              <CardDescription>Enter your credentials to access your account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLoginSubmit}>
                {(activeForm === "login" && (error || localError)) && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {localError || error}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@example.com"
                      value={loginData.email}
                      onChange={handleLoginChange}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <a
                        className="p-0 h-auto text-sm text-blue-500 cursor-pointer hover:text-blue-600"
                        type="button"
                      >
                        Forgot password?
                      </a>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={handleLoginChange}
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading || activeForm !== "login"}
                  >
                    {isLoading ? "Logging in..." : "Sign In"}
                  </Button>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center">
              <div className="text-sm text-gray-500">
                Don't have an account?{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto text-sm text-blue-500 hover:text-blue-600"
                  onClick={toggleForm}
                  type="button"
                >
                  Sign up
                </Button>
              </div>
            </CardFooter>
          </Card>
        </motion.div>

        {/* Register Form */}
        <motion.div
          className="absolute w-full"
          initial={false}
          animate={{
            top: activeForm === "register" ? 0 : "70%",
            left: activeForm === "register" ? 0 : "70%",
            opacity: activeForm === "register" ? 1 : 0.6,
            scale: activeForm === "register" ? 1 : 0.9,
            zIndex: activeForm === "register" ? 2 : 1,
            rotateX: activeForm === "register" ? 0 : 45,
            rotateY: activeForm === "register" ? 0 : 15,
          }}
          transition={{
            type: "spring",
            stiffness: 300,
            damping: 25,
            mass: 1,
          }}
        >
          <Card className="w-full shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold">Create an Account</CardTitle>
              <CardDescription>Enter your details to create your account</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRegisterSubmit}>
                {(activeForm === "register" && (error || localError)) && (
                  <Alert variant="destructive" className="mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      {localError || error}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      name="name"
                      placeholder="John Doe"
                      value={registerData.name}
                      onChange={handleRegisterChange}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="name@example.com"
                      value={registerData.email}
                      onChange={handleRegisterChange}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      value={registerData.password}
                      onChange={handleRegisterChange}
                      required
                    />
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={registerData.confirmPassword}
                      onChange={handleRegisterChange}
                      required
                    />
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading || activeForm !== "register"}
                  >
                    {isLoading ? "Creating account..." : "Sign Up"}
                  </Button>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center">
              <div className="text-sm text-gray-500">
                Already have an account?{" "}
                <Button
                  variant="link"
                  className="p-0 h-auto text-sm text-blue-500 hover:text-blue-600"
                  onClick={toggleForm}
                  type="button"
                >
                  Sign in
                </Button>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Auth;