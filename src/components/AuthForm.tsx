import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

export default function AuthForm() {
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [role, setRole] = useState<"USER" | "ADMIN">("USER");
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        toast.loading("Authenticating...");

        // Simulate auth
        setTimeout(() => {
            setLoading(false);
            toast.dismiss();
            toast.success(`Welcome back as ${role === "ADMIN" ? "Admin" : "User"}!`);

            if (role === "ADMIN") {
                navigate("/admin");
            } else {
                navigate("/dashboard");
            }
        }, 1500);
    };

    return (
        <div className="space-y-6">
            <div className="flex gap-px bg-border p-0.5">
                <button
                    onClick={() => setIsLogin(true)}
                    className={`flex-1 py-2 text-xs label-caps transition-colors ${isLogin ? 'bg-background text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    Login
                </button>
                <button
                    onClick={() => setIsLogin(false)}
                    className={`flex-1 py-2 text-xs label-caps transition-colors ${!isLogin ? 'bg-background text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    Sign Up
                </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <AnimatePresence mode="wait">
                    {!isLogin && (
                        <motion.div
                            key="name"
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            className="space-y-2"
                        >
                            <Label htmlFor="name">Full Name</Label>
                            <Input id="name" placeholder="Alex Chen" required={!isLogin} className="rounded-none border-border focus:border-primary/40 focus:ring-0 transition-colors" />
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="space-y-2">
                    <Label htmlFor="email">Email address</Label>
                    <Input id="email" name="email" type="email" placeholder="name@company.com" required className="rounded-none border-border focus:border-primary/40 focus:ring-0 transition-colors" />
                </div>

                <div className="space-y-2">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        {isLogin && (
                            <a href="#" className="text-xs text-muted-foreground hover:text-primary transition-colors">Forgot password?</a>
                        )}
                    </div>
                    <Input id="password" type="password" required className="rounded-none border-border focus:border-primary/40 focus:ring-0 transition-colors" />
                </div>

                {/* Role Selector */}
                <div className="space-y-2 pt-2">
                    <Label>Access Role</Label>
                    <div className="grid grid-cols-2 gap-px bg-border border border-border p-0.5 mt-1">
                        <button
                            type="button"
                            onClick={() => setRole("USER")}
                            className={`py-2 text-[10px] label-caps transition-colors ${role === "USER" ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:text-foreground'}`}
                        >
                            Standard User
                        </button>
                        <button
                            type="button"
                            onClick={() => setRole("ADMIN")}
                            className={`py-2 text-[10px] label-caps transition-colors ${role === "ADMIN" ? 'bg-primary text-primary-foreground' : 'bg-card text-muted-foreground hover:text-foreground'}`}
                        >
                            Administrator
                        </button>
                    </div>
                </div>

                <Button type="submit" className="w-full h-12 rounded-none mt-4" disabled={loading}>
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <span className="w-4 h-4 border-2 border-background/20 border-t-background animate-spin rounded-full" />
                            Processing...
                        </span>
                    ) : (
                        isLogin ? "Sign In" : "Create Account"
                    )}
                </Button>
            </form>

        </div>
    );
}
