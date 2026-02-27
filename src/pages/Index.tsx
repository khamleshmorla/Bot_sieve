import { motion, AnimatePresence } from "framer-motion";
import {
  Activity, AlertTriangle, Bot, Brain,
  Network, Search, Shield, TrendingUp,
  Loader2, WifiOff, BarChart3, Users,
} from "lucide-react";
import { DashboardHeader } from "@/components/DashboardHeader";
import { DashboardCard } from "@/components/DashboardCard";
import { AttackScoreGauge } from "@/components/AttackScoreGauge";
import { SentimentChart } from "@/components/SentimentChart";
import { AlertFeed } from "@/components/AlertFeed";
import { SuspiciousAccounts } from "@/components/SuspiciousAccounts";
import { ExplainabilityPanel } from "@/components/ExplainabilityPanel";
import { FakeOrganicMeter } from "@/components/FakeOrganicMeter";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { useAnalysis } from "@/hooks/useAnalysis";
import { checkHealth } from "@/services/api";
import { useState, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

/* ─── Skeleton ─────────────────────────────────────────── */
const SkeletonBlock = ({ h = "h-8" }: { h?: string }) => (
  <div className={`rounded-lg animate-shimmer ${h}`} />
);

const SkeletonCard = ({ bodyH = "h-40" }: { bodyH?: string }) => (
  <div className="rounded-xl border border-border bg-card overflow-hidden">
    <div className="px-4 py-3 border-b border-border/60">
      <SkeletonBlock h="h-3 w-28" />
    </div>
    <div className="p-4">
      <SkeletonBlock h={bodyH} />
    </div>
  </div>
);

/* ─── Stat row ──────────────────────────────────────────── */
const StatRow = ({
  label,
  value,
  accent = false,
  warning = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
  warning?: boolean;
}) => (
  <div className="flex items-center justify-between py-2 border-b border-border/40 last:border-0">
    <span className="text-xs text-muted-foreground">{label}</span>
    <span
      className={`text-xs font-mono font-semibold ${accent ? "text-destructive" : warning ? "text-warning" : "text-foreground"
        }`}
    >
      {value}
    </span>
  </div>
);

/* ─── Example chips ─────────────────────────────────────── */
const EXAMPLE_TAGS = ["#BoycottBrandX", "OpenAI", "Tesla", "#Python"];

/* ─── Page ──────────────────────────────────────────────── */
const Index = () => {
  const [inputValue, setInputValue] = useState("#BoycottBrandX");
  const [activeHashtag, setActiveHashtag] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data, isLoading, isError, error } = useAnalysis(activeHashtag);

  /* Poll backend health */
  useEffect(() => {
    checkHealth().then(setIsOnline);
    const id = setInterval(() => checkHealth().then(setIsOnline), 15_000);
    return () => clearInterval(id);
  }, []);

  const handleAnalyze = () => {
    const v = inputValue.trim();
    if (v) setActiveHashtag(v);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleAnalyze();
  };

  const isFake = data?.verdict === "fake";
  const showDashboard = !!data && !isLoading;

  return (
    <div className="min-h-screen gradient-radial-primary">
      <DashboardHeader
        isOnline={isOnline}
        postsPerMin={data ? Math.round(data.total_posts / 24) : 1247}
      />

      <main className="max-w-[1560px] mx-auto px-4 sm:px-6 py-6 space-y-5">

        {/* ── Search ───────────────────────────────────────── */}
        <motion.section
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card border border-border rounded-xl p-4 sm:p-5"
        >
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={e => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter a keyword, company, or hashtag (e.g. OpenAI or #Python)"
                className="w-full pl-9 pr-4 py-2.5 rounded-lg bg-secondary border border-border text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/50 transition-colors"
              />
            </div>
            <button
              onClick={handleAnalyze}
              disabled={isLoading || !inputValue.trim()}
              className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/85 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed sm:min-w-[140px]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing…
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Analyze
                </>
              )}
            </button>
          </div>

          {/* Example chips */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">Try:</span>
            {EXAMPLE_TAGS.map(tag => (
              <button
                key={tag}
                onClick={() => { setInputValue(tag); setActiveHashtag(tag); }}
                className="text-[11px] px-2.5 py-1 rounded-full border border-border bg-secondary text-muted-foreground hover:text-foreground hover:border-primary/40 transition-colors font-mono"
              >
                {tag}
              </button>
            ))}
          </div>
        </motion.section>

        {/* ── API offline notice ────────────────────────────── */}
        <AnimatePresence>
          {!isOnline && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-start gap-3 p-3.5 rounded-lg border border-warning/25 bg-warning/5 text-xs"
            >
              <WifiOff className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold text-warning">Backend offline — </span>
                <span className="text-muted-foreground">start it with: </span>
                <code className="font-mono text-foreground/80 bg-secondary px-1.5 py-0.5 rounded text-[10px]">
                  cd backend && uvicorn main:app --reload --port 8000
                </code>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── API error ─────────────────────────────────────── */}
        <AnimatePresence>
          {isError && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center gap-3 p-3.5 rounded-lg border border-destructive/25 bg-destructive/5 text-xs"
            >
              <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
              <span>
                <span className="font-semibold text-destructive">Analysis failed: </span>
                <span className="text-muted-foreground">{error?.message}</span>
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── Verdict banner ────────────────────────────────── */}
        <AnimatePresence>
          {showDashboard && (
            <motion.div
              key={data.hashtag}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className={`relative overflow-hidden rounded-xl border p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4 ${isFake
                ? "border-destructive/25 bg-destructive/5 glow-danger"
                : "border-success/25 bg-success/5 glow-primary"
                }`}
            >
              {/* Left icon */}
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border ${isFake ? "bg-destructive/12 border-destructive/25" : "bg-success/12 border-success/25"
                }`}>
                {isFake
                  ? <AlertTriangle className="w-5 h-5 text-destructive" />
                  : <Shield className="w-5 h-5 text-success" />
                }
              </div>


              {/* Text */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <span className={`text-sm font-bold ${isFake ? "text-destructive" : "text-success"}`}>
                    {isFake ? "Coordinated Bot Activity Detected" : "Trend Appears Organic"}
                  </span>
                  <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${isFake
                    ? "bg-destructive/12 border-destructive/25 text-destructive"
                    : "bg-success/12 border-success/25 text-success"
                    }`}>
                    {data.fakeness_score}% Fakeness
                  </span>
                  {/* Data source badge */}
                  <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border flex items-center gap-1 ${data.data_source === 'live'
                    ? "bg-primary/10 border-primary/25 text-primary"
                    : "bg-secondary border-border text-muted-foreground"
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full inline-block ${data.data_source === 'live' ? 'bg-primary' : 'bg-muted-foreground'}`} />
                    {data.data_source === 'live' ? '🐦 Live Twitter' : 'Demo Data'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  <span className="font-mono text-foreground">{data.hashtag}</span>
                  {isFake
                    ? ` — ${data.suspicious_posts.toLocaleString()} suspicious posts from ${data.fake_accounts.toLocaleString()} likely-bot accounts identified across ${data.clusters.length} coordinated clusters.`
                    : ` — No significant bot signals found. Posting patterns, account age distribution, and content similarity appear within normal ranges.`
                  }
                </p>
                {/* Show API fallback reason if using synthetic */}
                {data.data_source === 'synthetic' && data.api_status && (
                  <p className="text-[10px] text-muted-foreground/60 mt-1 font-mono">
                    Twitter API: {data.api_status === 'access_forbidden'
                      ? 'Free-tier — recent search requires Basic access ($100/mo). Using demo data.'
                      : data.api_status === 'rate_limited'
                        ? 'Rate limited (15-min window). Using demo data.'
                        : data.api_status}
                  </p>
                )}
              </div>

              {/* Score pill */}
              <div className={`flex-shrink-0 text-3xl font-mono font-bold ${isFake ? "text-destructive" : "text-success"}`}>
                {isFake ? "🚨" : "✅"}
              </div>
            </motion.div>
          )}

        </AnimatePresence>

        {/* ── Welcome state (no analysis yet) ──────────────── */}
        {!data && !isLoading && !isError && !activeHashtag && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center gap-5 py-20 text-center"
          >
            <div className="w-14 h-14 rounded-2xl border border-primary/25 bg-primary/8 flex items-center justify-center">
              <Bot className="w-7 h-7 text-primary" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-lg font-bold text-foreground">Ready to Detect Bots</h2>
              <p className="text-sm text-muted-foreground max-w-sm">
                Enter any company, topic, or hashtag above to analyze it for bot activity, fake virality, and coordinated manipulation.
              </p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-2">
              {[
                { icon: <Shield className="w-4 h-4" />, label: "Bot Detection" },
                { icon: <TrendingUp className="w-4 h-4" />, label: "Sentiment Analysis" },
                { icon: <Network className="w-4 h-4" />, label: "Cluster Detection" },
                { icon: <Brain className="w-4 h-4" />, label: "Explainability" },
              ].map(f => (
                <div key={f.label} className="flex flex-col items-center gap-2 p-3.5 rounded-xl border border-border bg-card">
                  <span className="text-primary">{f.icon}</span>
                  <span className="text-[11px] text-muted-foreground font-medium">{f.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Loading skeleton ──────────────────────────────── */}
        {isLoading && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <div className="lg:col-span-2">
                <SkeletonCard bodyH="h-56" />
              </div>
              <SkeletonCard bodyH="h-56" />
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => <SkeletonCard key={i} bodyH="h-56" />)}
            </div>
          </div>
        )}

        {/* ── Dashboard ─────────────────────────────────────── */}
        {showDashboard && (
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="bg-secondary/50 border border-border/50 p-1">
              <TabsTrigger value="overview" className="text-xs sm:text-sm">Overview</TabsTrigger>
              <TabsTrigger value="intelligence" className="text-xs sm:text-sm">Intelligence</TabsTrigger>
              <TabsTrigger value="network" className="text-xs sm:text-sm">Network</TabsTrigger>
            </TabsList>

            {/* Tab 1: Overview */}
            <TabsContent value="overview" className="space-y-4 outline-none">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <DashboardCard
                  title="Fakeness Score"
                  icon={<Shield className="w-3.5 h-3.5" />}
                  glowVariant={data.fakeness_score >= 60 ? "danger" : "none"}
                  badge={`${data.fakeness_score}%`}
                >
                  <AttackScoreGauge score={data.fakeness_score} label="Fakeness Level" />
                </DashboardCard>

                <DashboardCard
                  title="Bot Activity"
                  icon={<Bot className="w-3.5 h-3.5" />}
                  glowVariant={data.bot_score >= 60 ? "danger" : "none"}
                  badge={`${data.bot_score}%`}
                >
                  <AttackScoreGauge score={data.bot_score} label="Bot Probability" />
                </DashboardCard>

                <DashboardCard
                  title="Real vs Fake"
                  icon={<BarChart3 className="w-3.5 h-3.5" />}
                  glowVariant="none"
                >
                  <FakeOrganicMeter fakePercent={data.fake_percent} />
                </DashboardCard>

                <DashboardCard
                  title="Summary"
                  icon={<Activity className="w-3.5 h-3.5" />}
                >
                  <div>
                    <StatRow label="Total Posts" value={data.total_posts.toLocaleString()} />
                    <StatRow label="Suspicious Posts" value={data.suspicious_posts.toLocaleString()} accent />
                    <StatRow label="Accounts" value={data.total_accounts.toLocaleString()} />
                    <StatRow label="Fake Accounts" value={data.fake_accounts.toLocaleString()} accent />
                    <StatRow
                      label="Copy-paste Score"
                      value={`${data.copy_paste_score}%`}
                      warning={data.copy_paste_score >= 40 && data.copy_paste_score < 70}
                      accent={data.copy_paste_score >= 70}
                    />
                  </div>
                </DashboardCard>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <DashboardCard
                  title="Sentiment & Bot Activity Over Time"
                  icon={<TrendingUp className="w-3.5 h-3.5" />}
                >
                  <SentimentChart data={data.sentiment_timeline} />
                </DashboardCard>
              </div>
            </TabsContent>

            {/* Tab 2: Intelligence */}
            <TabsContent value="intelligence" className="space-y-4 outline-none">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <DashboardCard
                  title="Recent Alerts"
                  icon={<AlertTriangle className="w-3.5 h-3.5" />}
                  glowVariant={data.alerts.some(a => a.severity === "critical") ? "danger" : "none"}
                  badge={`${data.alerts.length}`}
                >
                  <AlertFeed alerts={data.alerts} />
                </DashboardCard>

                <DashboardCard
                  title="Detection Signals"
                  icon={<Brain className="w-3.5 h-3.5" />}
                  glowVariant="primary"
                >
                  <ExplainabilityPanel factors={data.explainability} />
                </DashboardCard>
              </div>
            </TabsContent>

            {/* Tab 3: Network */}
            <TabsContent value="network" className="space-y-4 outline-none">
              <div className="grid grid-cols-1 gap-4">
                <DashboardCard
                  title="Analyzed Accounts"
                  icon={<Users className="w-3.5 h-3.5" />}
                  badge={`${data.suspicious_accounts.length}`}
                >
                  <SuspiciousAccounts accounts={data.suspicious_accounts} />
                </DashboardCard>
              </div>
            </TabsContent>
          </Tabs>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default Index;
