// components/dashboard/Header.tsx
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();

  const handleLogout = () => {
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    router.push("/auth/login");
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex justify-between items-center mb-8"
    >
      <h1 className="text-4xl font-bold text-green-100 tracking-tight">
        Dashboard
      </h1>
      <div className="mt-8">
        <a
          href="/groups/accept-invitation"
          className="text-green-300 hover:underline font-semibold"
        >
          Have an invitation token? Join a group here
        </a>
      </div>
      <Button
        onClick={handleLogout}
        className="bg-red-500/80 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-md backdrop-blur-sm"
      >
        Log Out
      </Button>
    </motion.div>
  );
}
