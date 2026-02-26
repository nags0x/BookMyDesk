import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function Hero() {
    const navigate = useNavigate();

    return (
        <div className="relative overflow-hidden pt-20 pb-12 lg:pt-32 lg:pb-24">
            <div className="max-w-7xl mx-auto px-6 relative z-10">
                <div className="max-w-3xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                    >
                        <p className="label-caps text-primary mb-4">Workspace Evolution</p>
                        <h1 className="text-5xl lg:text-7xl font-serif italic text-foreground leading-[1.1] mb-8">
                            Seamlessly bridge the gap between <span className="text-primary">home</span> and <span className="text-primary">office</span>.
                        </h1>
                        <p className="text-lg text-muted-foreground mb-10 leading-relaxed max-w-xl">
                            SeatBook is the premium desk booking solution for modern teams.
                            Intelligent scheduling, real-time availability, and detailed analytics
                            all in one elegant interface.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <Button size="lg" className="h-14 px-8 text-base" onClick={() => navigate("/auth")}>
                                Get Started
                            </Button>
                            <Button size="lg" variant="outline" className="h-14 px-8 text-base">
                                View Demo
                            </Button>
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute top-0 right-0 -z-10 w-1/2 h-full opacity-10 pointer-events-none">
                <svg viewBox="0 0 400 400" className="w-full h-full text-primary">
                    <circle cx="200" cy="200" r="150" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    <circle cx="200" cy="200" r="100" fill="none" stroke="currentColor" strokeWidth="0.5" />
                    <path d="M50,200 L350,200" stroke="currentColor" strokeWidth="0.5" />
                    <path d="M200,50 L200,350" stroke="currentColor" strokeWidth="0.5" />
                </svg>
            </div>

            <div className="mt-20 lg:mt-32 max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                    {[
                        { label: "Bookings", value: "1.2k+" },
                        { label: "Active Users", value: "450+" },
                        { label: "Efficiency", value: "98%" },
                        { label: "Happiness", value: "4.9/5" },
                    ].map((stat, i) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 * i + 0.5 }}
                            className="border-l border-border pl-6"
                        >
                            <p className="text-2xl font-serif italic mb-1">{stat.value}</p>
                            <p className="label-caps text-xs text-muted-foreground">{stat.label}</p>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
