import { Link } from "react-router-dom";
import { Shield, Twitter, Github, Linkedin, Mail } from "lucide-react";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="w-full border-t border-border/40 bg-card py-12 text-sm">
            <div className="mx-auto max-w-[1560px] px-4 sm:px-6">
                <div className="grid grid-cols-1 gap-12 md:grid-cols-4 lg:gap-8">

                    {/* Brand & Mission */}
                    <div className="col-span-1 md:col-span-1">
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 border border-primary/50">
                                <Shield className="h-4 w-4 text-primary" />
                            </div>
                            <span className="font-bold tracking-tight text-foreground text-lg">BotSieve</span>
                        </Link>
                        <p className="text-muted-foreground leading-relaxed mb-6">
                            AI-driven intelligence for public digital spaces. Exposing astroturfing, fake virality, and coordinated semantic spam networks using state-of-the-art NLP.
                        </p>
                        <div className="flex items-center gap-4 text-muted-foreground">
                            <a href="#" className="hover:text-primary transition-colors"><Twitter className="h-5 w-5" /></a>
                            <a href="https://github.com/khamleshmorla/Bot_sieve" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors"><Github className="h-5 w-5" /></a>
                            <a href="#" className="hover:text-primary transition-colors"><Linkedin className="h-5 w-5" /></a>
                            <a href="mailto:contact@botsieve.com" className="hover:text-primary transition-colors"><Mail className="h-5 w-5" /></a>
                        </div>
                    </div>

                    {/* Product Links */}
                    <div className="col-span-1 text-left sm:text-left">
                        <h3 className="font-semibold text-foreground mb-4">Product</h3>
                        <ul className="space-y-3 text-muted-foreground">
                            <li><Link to="/dashboard" className="hover:text-primary transition-colors">Analyzer Dashboard</Link></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Enterprise API</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                        </ul>
                    </div>

                    {/* Resource Links */}
                    <div className="col-span-1">
                        <h3 className="font-semibold text-foreground mb-4">Resources</h3>
                        <ul className="space-y-3 text-muted-foreground">
                            <li><Link to="/about" className="hover:text-primary transition-colors">About Us</Link></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Documentation</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Whitepaper</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                        </ul>
                    </div>

                    {/* Legal Links */}
                    <div className="col-span-1">
                        <h3 className="font-semibold text-foreground mb-4">Legal</h3>
                        <ul className="space-y-3 text-muted-foreground">
                            <li><a href="#" className="hover:text-primary transition-colors">Privacy Policy</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Terms of Service</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Acceptable Use</a></li>
                            <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
                        </ul>
                    </div>

                </div>

                {/* Bottom Copyright */}
                <div className="mt-12 pt-8 border-t border-border/40 flex flex-col md:flex-row items-center justify-between gap-4 text-muted-foreground">
                    <p>© {currentYear} BotSieve Intelligence. All rights reserved.</p>
                    <div className="flex items-center gap-2 text-xs">
                        <span className="flex h-2 w-2 rounded-full bg-success animate-pulse" />
                        System Operational
                    </div>
                </div>
            </div>
        </footer>
    );
}
