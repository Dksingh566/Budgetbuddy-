
import { Link, useLocation } from "react-router-dom";
import { 
  BarChart4, 
  CreditCard, 
  Home, 
  PiggyBank, 
  Settings, 
  LineChart, 
  History,
  User
} from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const navItems = [
  {
    title: "Dashboard",
    href: "/",
    icon: Home,
  },
  {
    title: "Expenses",
    href: "/expenses",
    icon: CreditCard,
  },
  {
    title: "Income",
    href: "/income",
    icon: PiggyBank,
  },
  {
    title: "Budgets",
    href: "/budgets",
    icon: BarChart4,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: LineChart,
  },
  {
    title: "History",
    href: "/history",
    icon: History,
  },
  {
    title: "Account",
    href: "/account",
    icon: User,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: Settings,
  },
];

type SidebarProps = {
  onNavClick?: () => void;
};

export function Sidebar({ onNavClick }: SidebarProps) {
  const location = useLocation();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    show: { opacity: 1, x: 0 }
  };

  return (
    <motion.nav 
      className="flex flex-col gap-1 flex-1 py-4"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {navItems.map((navItem) => {
        const isActive = location.pathname === navItem.href;
        
        return (
          <motion.div
            key={navItem.href}
            variants={itemVariants}
            whileHover={{ x: 5 }}
            whileTap={{ scale: 0.95 }}
          >
            <Link
              to={navItem.href}
              onClick={onNavClick}
              className={cn(
                "flex items-center gap-2 px-3 py-2 rounded-md text-sm",
                "transition-colors duration-200",
                isActive
                  ? "bg-primary text-primary-foreground font-medium"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              )}
            >
              <navItem.icon className="h-4 w-4" />
              <span>{navItem.title}</span>
              
              {isActive && (
                <motion.div
                  className="absolute inset-y-0 left-0 w-1 bg-primary rounded-r-full"
                  layoutId="activeIndicator"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                />
              )}
            </Link>
          </motion.div>
        );
      })}
    </motion.nav>
  );
}
