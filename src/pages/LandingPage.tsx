import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Hero from "@/components/Hero";
import { Button } from "@/components/ui/button";

export default function LandingPage() {
    return (
        <div className="min-h-screen bg-background">
            <nav className="flex items-center justify-between p-6 max-w-7xl mx-auto">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 border border-primary flex items-center justify-center">
                        <span className="text-primary font-mono text-sm font-bold">SB</span>
                    </div>
                    <span className="font-serif text-xl italic text-foreground">SeatBook</span>
                </div>
                <div className="flex items-center gap-4">
                    <Link to="/auth">
                        <Button variant="ghost" className="text-sm">Log in</Button>
                    </Link>
                    <Link to="/auth">
                        <Button className="text-sm">Sign up</Button>
                    </Link>
                </div>
            </nav>

            <main>
                <Hero />
            </main>

            <footer className="py-12 border-t border-border mt-20">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="text-sm text-muted-foreground">© 2024 SeatBook. All rights reserved.</p>
                    <div className="flex gap-8">
                        <a href="#" className="text-xs text-muted-foreground hover:text-foreground">Privacy</a>
                        <a href="#" className="text-xs text-muted-foreground hover:text-foreground">Terms</a>
                        <a href="#" className="text-xs text-muted-foreground hover:text-foreground">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
