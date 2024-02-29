import { ModeToggle } from "./ModeToggle";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/components/AuthProvider";

export const Navbar = () => {
  const user = useAuth();

  const logout = async () => {
    await auth.signOut();
  };
  return (
    <div className="border-b p-2 flex items-center gap-2">
      <div className="grow font-medium">{user?.email}</div>
      <ModeToggle />
      <Button onClick={logout}>logout</Button>
    </div>
  );
};
