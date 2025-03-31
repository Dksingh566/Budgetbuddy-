
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { ThemeToggle } from "./ThemeToggle";
import { Logo } from "./Logo";
import { UserButton } from "./UserButton";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { motion, AnimatePresence } from "framer-motion";

export function Layout() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navigation Bar for Mobile */}
      <motion.header 
        className="border-b lg:hidden"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="container py-4 flex justify-between items-center">
          <Logo />
          <div className="flex items-center gap-4">
            <UserButton />
            <ThemeToggle />
            <motion.div whileTap={{ scale: 0.9 }}>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.header>
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar - Hidden on Mobile */}
        <motion.aside 
          className="hidden lg:block w-64 border-r bg-sidebar"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="h-full flex flex-col p-4">
            <div className="flex items-center gap-2 py-4">
              <Logo />
            </div>
            <Sidebar />
            <div className="mt-auto flex justify-between items-center pt-4">
              <UserButton />
              <ThemeToggle />
            </div>
          </div>
        </motion.aside>

        {/* Mobile Sidebar as Drawer */}
        <AnimatePresence>
          <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
            <SheetContent side="left" className="w-64 p-0">
              <div className="h-full flex flex-col p-4">
                <div className="flex items-center gap-2 py-4">
                  <Logo />
                </div>
                <Sidebar onNavClick={() => setIsMobileMenuOpen(false)} />
              </div>
            </SheetContent>
          </Sheet>
        </AnimatePresence>

        {/* Main Content */}
        <motion.main 
          className="flex-1 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div 
            className="container py-6"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </motion.main>
      </div>
    </div>
  );
}
