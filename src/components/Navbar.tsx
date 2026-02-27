import { Link, useLocation } from "react-router-dom";
import { Shield } from "lucide-react";

export function Navbar() {
    const location = useLocation();

    const links = [
        { name: "Home", href: "/" },
        { name: "Analyze", href: "/dashboard" },
        { name: "About", href: "/about" },
    ];

    return (
        <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-background/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-[1560px] items-center justify-between px-4 sm:px-6">
                <Link to="/" className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/20 border border-primary/50">
                        <Shield className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-bold tracking-tight text-foreground">BotSieve</span>
                </Link>

                <div className="flex items-center gap-6">
                    {links.map((link) => {
                        const isActive = location.pathname === link.href;
                        return (
                            <Link
                                key={link.name}
                                to={link.href}
                                className={`text-sm font-medium transition-colors hover:text-primary ${isActive ? "text-primary" : "text-muted-foreground"
                                    }`}
                            >
                                {link.name}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
