import { FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { auth } from "@/lib/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";

export const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (email.trim() === "" || password.trim() === "") {
      return;
    }
    await signInWithEmailAndPassword(auth, email, password);
  };
  return (
    <div className="h-svh w-screen flex">
      <form className="m-auto border rounded p-4" onSubmit={handleSubmit}>
        <div className="text-3xl">Login</div>
        <Input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-4"
        />
        <Input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-4"
        />
        <Button type="submit" className="mt-4">
          Login
        </Button>
      </form>
    </div>
  );
};
