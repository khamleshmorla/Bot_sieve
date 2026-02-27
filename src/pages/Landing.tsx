import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Shield, Brain, Activity, Zap, ArrowRight, Twitter } from "lucide-react";
import { Footer } from "@/components/Footer";

export default function Landing() {
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
            <main className="flex-1 relative overflow-hidden">
                {/* Background Gradients */}
                <div className="absolute top-0 inset-x-0 h-[40rem] bg-gradient-to-b from-primary/10 to-transparent opacity-50 pointer-events-none" />
                <div className="absolute top-1/4 -right-1/4 w-[50rem] h-[50rem] bg-success/10 rounded-full blur-3xl pointer-events-none" />
                <div className="absolute top-1/2 -left-1/4 w-[40rem] h-[40rem] bg-primary/10 rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-[1280px] mx-auto px-4 sm:px-6 relative z-10 w-full pt-20 pb-20">

                    {/* Hero Section */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={containerVariants}
                        className="flex flex-col items-center text-center max-w-3xl mx-auto space-y-8"
                    >
                        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-4">
                            <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                            Powered by Hugging Face Models
                        </motion.div>

                        <motion.h1 variants={itemVariants} className="text-5xl sm:text-7xl font-extrabold tracking-tight leading-[1.1] text-balance">
                            Expose Coordinated <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">
                                Bot Campaigns
                            </span>
                        </motion.h1>

                        <motion.p variants={itemVariants} className="text-lg sm:text-xl text-muted-foreground leading-relaxed text-balance">
                            BotSieve ingests live Twitter data to instantly identify astroturfing, fake Virality, and coordinated semantic spam networks using state-of-the-art NLP.
                        </motion.p>

                        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                            <Link
                                to="/dashboard"
                                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg bg-primary text-primary-foreground font-semibold text-base hover:bg-primary/90 transition-all active:scale-[0.98] w-full sm:w-auto shadow-lg shadow-primary/20"
                            >
                                Launch Dashboard
                                <ArrowRight className="w-4 h-4" />
                            </Link>
                            <Link
                                to="/about"
                                className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-lg bg-secondary text-foreground font-semibold text-base border border-border hover:border-border/80 transition-all w-full sm:w-auto"
                            >
                                Read the Whitepaper
                            </Link>
                        </motion.div>
                    </motion.div>

                    {/* Features Grid */}
                    <motion.div
                        initial="hidden"
                        animate="visible"
                        variants={containerVariants}
                        className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-32"
                    >
                        {[
                            {
                                icon: <Brain className="w-6 h-6 text-primary" />,
                                title: "Semantic Analysis",
                                desc: "Sentence-Transformer embeddings identify bots slightly mutating text to avoid basic exact-match word filters."
                            },
                            {
                                icon: <Zap className="w-6 h-6 text-warning" />,
                                title: "Live Twitter API",
                                desc: "No synthetic data. Analyze breaking trends globally with latency under a second flat via direct ingestion."
                            },
                            {
                                icon: <Shield className="w-6 h-6 text-success" />,
                                title: "Actionable Intel",
                                desc: "Identify the top malicious payload vectors and directly access their profiles for manual platform reporting."
                            }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                variants={itemVariants}
                                className="flex flex-col items-start p-6 rounded-2xl bg-card border border-border shadow-sm hover:border-primary/50 transition-colors"
                            >
                                <div className="p-3 bg-secondary rounded-xl mb-4 border border-border/50">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-2 text-foreground">{feature.title}</h3>
                                <p className="text-muted-foreground text-sm leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </motion.div>

                </div>
            </main>

            <Footer />
        </div>
    );
}
