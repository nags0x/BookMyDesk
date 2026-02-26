import { motion } from "framer-motion";
import AuthForm from "@/components/AuthForm";
import { Link } from "react-router-dom";

export default function AuthPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
            <div className="w-full max-w-md space-y-8">
                <div className="text-center">
                    <Link to="/" className="inline-flex items-center gap-2 mb-8">
                        <div className="w-8 h-8 border border-primary flex items-center justify-center">
                            <span className="text-primary font-mono text-sm font-bold">SB</span>
                        </div>
                        <span className="font-serif text-xl italic text-foreground">SeatBook</span>
                    </Link>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h2 className="text-3xl font-serif italic text-foreground">Welcome back</h2>
                        <p className="text-muted-foreground mt-2">Enter your credentials to access your workspace.</p>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="border border-border p-8 bg-card shadow-sm"
                >
                    <AuthForm />
                </motion.div>

                <p className="text-center text-xs text-muted-foreground">
                    By signing in, you agree to our <a href="#" className="underline hover:text-foreground">Terms of Service</a> and <a href="#" className="underline hover:text-foreground">Privacy Policy</a>.
                </p>
            </div>
        </div>
    );
}
