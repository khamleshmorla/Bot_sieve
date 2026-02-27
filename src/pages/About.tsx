import { motion } from "framer-motion";
import { Shield, Brain, ShieldAlert } from "lucide-react";
import { Footer } from "@/components/Footer";

export default function About() {
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
            <main className="flex-1 max-w-[1024px] mx-auto px-4 sm:px-6 py-20">
                <motion.div
                    initial="hidden"
                    animate="visible"
                    variants={containerVariants}
                    className="space-y-16"
                >
                    {/* Header */}
                    <div className="text-center space-y-4">
                        <motion.h1 variants={itemVariants} className="text-4xl sm:text-5xl font-extrabold tracking-tight text-foreground">
                            About <span className="text-primary">BotSieve</span>
                        </motion.h1>
                        <motion.p variants={itemVariants} className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                            BotSieve was built to restore integrity to public digital spaces by exposing astroturfing, fake virality, and coordinated manipulation campaigns.
                        </motion.p>
                    </div>

                    {/* Core Tech Stack */}
                    <motion.div variants={itemVariants} className="space-y-6">
                        <h2 className="text-2xl font-bold flex items-center gap-2 border-b border-border/50 pb-4">
                            <Brain className="w-5 h-5 text-primary" />
                            Intelligence Stack
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="p-6 rounded-xl bg-card border border-border shadow-sm">
                                <h3 className="font-bold flex items-center gap-2 mb-2">
                                    <span className="text-primary text-xl">1.</span> Semantic NLP Embeddings
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    We use <code className="text-xs bg-secondary px-1 py-0.5 rounded text-foreground">sentence-transformers/all-MiniLM-L6-v2</code> to map the mathematical meaning of tweets. This exposes advanced bots that slightly reword their spam to evade traditional 1:1 text filters.
                                </p>
                            </div>

                            <div className="p-6 rounded-xl bg-card border border-border shadow-sm">
                                <h3 className="font-bold flex items-center gap-2 mb-2">
                                    <span className="text-primary text-xl">2.</span> Contextual Sentiment Analysis
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    Most simple bot detectors fail to understand sarcasm or context. We utilize Hugging Face's <code className="text-xs bg-secondary px-1 py-0.5 rounded text-foreground">distilbert-base-uncased-finetuned-sst-2-english</code> pipeline to accurately gauge emotional polarity.
                                </p>
                            </div>

                            <div className="p-6 rounded-xl bg-card border border-border shadow-sm md:col-span-2">
                                <h3 className="font-bold flex items-center gap-2 mb-2">
                                    <span className="text-primary text-xl">3.</span> Real-Time API Ingestion
                                </h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">
                                    The dashboard is completely unhooked from synthetic data. Every query made routes directly through <strong>Official Twitter / RapidAPI pipelines</strong> to guarantee the dashboard reflects the live pulse of the internet with sub-second latency.
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Mission */}
                    <motion.div variants={itemVariants} className="p-8 rounded-2xl bg-secondary/30 border border-primary/20 text-center space-y-4">
                        <ShieldAlert className="w-10 h-10 text-primary mx-auto mb-2" />
                        <h2 className="text-2xl font-bold">The Threat of Deep Networks</h2>
                        <p className="text-muted-foreground leading-relaxed max-w-2xl mx-auto">
                            Bot networks manipulate public perception by dominating trending topics, harassing activists, masking algorithmic consent, and driving pump-and-dump financial schemes. BotSieve exists to give researchers the power to instantly peel back that curtain.
                        </p>
                    </motion.div>

                </motion.div>
            </main>

            <Footer />
        </div>
    );
}
