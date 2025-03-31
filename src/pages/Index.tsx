
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/Logo";
import { ArrowRight, Users, CreditCard, Receipt, PieChart, ArrowLeftRight, Globe } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col">
      {/* Hero Section */}
      <header className="bg-gradient-to-b from-primary/10 to-background pt-6 pb-16">
        <div className="container mx-auto px-4 py-6 flex justify-between items-center">
          <div className="flex items-center">
            <Logo />
          </div>
          <div className="space-x-2">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/auth/login")}
              className="hidden md:inline-flex"
            >
              Sign in
            </Button>
            <Button onClick={() => navigate("/auth/signup")}>
              Get Started
            </Button>
          </div>
        </div>
        
        <div className="container mx-auto px-4 mt-16 md:mt-24 text-center">
          <motion.h1 
            className="text-4xl md:text-6xl font-bold tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Manage expenses with <br className="hidden md:block" />
            <span className="text-primary">roommates made easy</span>
          </motion.h1>
          <motion.p 
            className="mt-6 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Track shared expenses, split bills, and settle debts with your roommates without the awkward money talks.
          </motion.p>
          <motion.div 
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button size="lg" onClick={() => navigate("/auth/signup")} className="w-full sm:w-auto">
              Sign up for free
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/auth/login")} className="w-full sm:w-auto">
              Log in to your account
            </Button>
          </motion.div>
        </div>
      </header>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Everything you need to manage expenses</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Users className="h-10 w-10 text-primary" />,
                title: "Group Expense Tracking",
                description: "Create groups for roommates and track shared expenses together."
              },
              {
                icon: <ArrowLeftRight className="h-10 w-10 text-primary" />,
                title: "Split Bills Equally",
                description: "Split expenses equally, by percentage, or fixed amounts with ease."
              },
              {
                icon: <Receipt className="h-10 w-10 text-primary" />,
                title: "Track What You Owe",
                description: "See exactly who owes what and settle up with a tap."
              },
              {
                icon: <CreditCard className="h-10 w-10 text-primary" />,
                title: "Easy Settling Up",
                description: "Record payments and keep track of settled debts."
              },
              {
                icon: <PieChart className="h-10 w-10 text-primary" />,
                title: "Visual Reports",
                description: "See spending patterns and track your budget with visual reports."
              },
              {
                icon: <Globe className="h-10 w-10 text-primary" />,
                title: "Multi-Currency Support",
                description: "Track expenses in different currencies for international roommates."
              }
            ].map((feature, index) => (
              <motion.div 
                key={index}
                className="bg-background rounded-xl p-6 shadow-sm border"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-primary/5">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to simplify roommate finances?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
            Join thousands of roommates who have simplified their shared expenses and eliminated financial tension.
          </p>
          <Button 
            size="lg" 
            onClick={() => navigate("/auth/signup")}
            className="animate-pulse"
          >
            Get Started for Free
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background py-12 border-t">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-6 md:mb-0">
              <Logo />
              <p className="text-muted-foreground mt-2">Simplifying roommate finances</p>
            </div>
            <div className="flex flex-col md:flex-row gap-6 md:gap-12">
              <div>
                <h3 className="font-semibold mb-2">Product</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-muted-foreground hover:text-foreground">Features</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-foreground">Pricing</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-foreground">FAQ</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Company</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-muted-foreground hover:text-foreground">About Us</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-foreground">Contact</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-foreground">Privacy</a></li>
                </ul>
              </div>
              <div>
                <h3 className="font-semibold mb-2">Resources</h3>
                <ul className="space-y-2">
                  <li><a href="#" className="text-muted-foreground hover:text-foreground">Blog</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-foreground">Support</a></li>
                  <li><a href="#" className="text-muted-foreground hover:text-foreground">Community</a></li>
                </ul>
              </div>
            </div>
          </div>
          <div className="mt-12 pt-6 border-t text-center text-muted-foreground text-sm">
            <p>© {new Date().getFullYear()} BudgetBuddy. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
