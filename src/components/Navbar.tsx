import { ModeToggle } from "./ModeToggle";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/firebase";
import { useAuth } from "@/components/provider/AuthProvider";

export const Navbar = () => {
  const user = useAuth();

  const logout = async () => {
    await auth.signOut();
  };
  return (
    <div className="border-b p-2 px-4 text-foreground/80 flex items-center gap-2">
      <div className="grow text-sm">{user?.email}</div>
      <ModeToggle />
      <Button onClick={logout} variant={"ghost"}>
        Logout
      </Button>
    </div>
  );
};
