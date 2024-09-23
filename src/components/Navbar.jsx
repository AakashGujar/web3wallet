import { useState, useEffect } from "react";
import { Sparkle, Sun, Moon } from "lucide-react";
import { Switch } from "../components/ui/switch"
import { useTheme } from "next-themes";

const Navbar = () => {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const toggleDarkMode = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <nav className="flex justify-between items-center py-4 w-full">
      <div className="flex items-center gap-2">
        <Sparkle size={28} strokeWidth={3} absoluteStrokeWidth className="size-8" />
        <div className="flex flex-col gap-4">
          <span className="tracking-tighter text-3xl font-bold text-primary flex gap-2 items-center">
            Orion{" "}
            <span className="rounded-full text-base bg-primary/10 border border-primary/50 px-2">
              v1.1
            </span>
          </span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Sun size={20} className={`${theme === 'dark' ? 'text-gray-400' : 'text-black'}`} />
        <Switch checked={theme === "dark"}
          onCheckedChange={toggleDarkMode}/>
       <Moon size={20} className={`${theme === 'dark' ? 'text-hite' : 'text-gray-400'}`} />
      </div>
    </nav>
  );  
};

export default Navbar;