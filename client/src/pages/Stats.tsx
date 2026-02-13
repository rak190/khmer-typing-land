import React, { useMemo, useEffect, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, TrendingUp, Target, AlertTriangle, Activity } from "lucide-react";

import { HUD } from "@/components/HUD";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import { useGameStore } from "@/lib/store";
import { buildWorlds } from "@/lib/curriculum";

const WORLDS = buildWorlds();

type SessionStat = {
  id: string;
  label: string;
  wpm: number;
  accuracy: number;
  errors: number;
};

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function computeSessionSeries(starsByStage: Record<string, number>): SessionStat[] {
  // Frontend-only mock: we don’t have per-run telemetry stored yet.
  // Build a deterministic “history” from stars per stage so the dashboard feels real.
  const entries = Object.entries(starsByStage)
    .map(([stageKey, stars]) => {
      const w = stageKey.match(/^w(\d+)/)?.[1] || "1";
      const s = stageKey.match(/s(\d+)$/)?.[1] || "1";
      const order = parseInt(w) * 100 + parseInt(s);
      return { stageKey, stars, order };
    })
    .sort((a, b) => a.order - b.order);

  const baseWpm = 18;
  const baseAcc = 78;

  return entries.slice(-12).map((e, idx) => {
    const stars = clamp(e.stars, 0, 3);
    const wpm = Math.round(baseWpm + idx * 2 + stars * 4);
    const accuracy = Math.round(clamp(baseAcc + stars * 6 + idx, 60, 99));
    const errors = Math.max(0, Math.round(22 - idx * 2 - stars * 3));

    return {
      id: e.stageKey,
      label: `${idx + 1}`,
      wpm,
      accuracy,
      errors,
    };
  });
}

interface SessionData {
  id: string;
  mode: string;
  wpm: number;
  accuracy: number;
  errors: number;
  stars: number;
  completedAt: string;
}

export const Stats: React.FC = () => {
  const { progress, getTotalStars, profile } = useGameStore();
  const totalStars = getTotalStars();
  const [sessions, setSessions] = useState<SessionData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchSessions() {
      try {
        const response = await fetch(`/api/sessions/player/${profile.name}?limit=30`);
        if (response.ok) {
          const data = await response.json();
          setSessions(data);
        } else {
          // Fall back to mock data
          setSessions([]);
        }
      } catch (error) {
        console.error("Error fetching sessions:", error);
        setSessions([]);
      } finally {
        setLoading(false);
      }
    }
    fetchSessions();
  }, [profile.name]);

  const series = useMemo(() => {
    if (sessions.length > 0) {
      return sessions.slice(0, 12).reverse().map((s, idx) => ({
        id: s.id,
        label: `${idx + 1}`,
        wpm: s.wpm,
        accuracy: s.accuracy,
        errors: s.errors,
      }));
    }
    return computeSessionSeries(progress?.starsByStage || {});
  }, [sessions, progress]);

  const latest = series.length > 0 ? series[series.length - 1] : null;
  const bestWpm = sessions.length > 0 
    ? Math.max(...sessions.map((s) => s.wpm || 0))
    : series.length > 0 ? Math.max(...series.map((d) => d.wpm || 0)) : 0;
  const bestAcc = sessions.length > 0
    ? Math.max(...sessions.map((s) => s.accuracy || 0))
    : series.length > 0 ? Math.max(...series.map((d) => d.accuracy || 0)) : 0;
  const totalErrors = sessions.length > 0
    ? sessions.reduce((acc, s) => acc + (s.errors || 0), 0)
    : series.length > 0 ? series.reduce((acc, d) => acc + (d.errors || 0), 0) : 0;

  const unlockedWorlds = useMemo(() => {
    const stars = totalStars;
    return WORLDS.filter((w) => stars >= w.unlockStars).length;
  }, [totalStars]);

  const chartConfig = {
    wpm: { label: "WPM", color: "hsl(var(--primary))" },
    accuracy: { label: "Accuracy", color: "hsl(var(--chart-2))" },
    errors: { label: "Errors", color: "hsl(var(--destructive))" },
  } as const;

  return (
    <div className="min-h-screen bg-background pb-20 pt-20">
      <HUD />

      <div className="container mx-auto px-4 mt-8 max-w-5xl">
        <div className="flex items-center gap-4 mb-8">
          <Link href="/home">
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full"
              data-testid="button-back-home"
            >
              <ArrowLeft size={18} />
            </Button>
          </Link>
          <div className="flex-1">
            <h1
              className="text-3xl font-black text-foreground font-display"
              data-testid="text-stats-title"
            >
              ស្ថិតិការសរសេរ / Typing Stats
            </h1>
            <p
              className="text-muted-foreground font-body"
              data-testid="text-stats-subtitle"
            >
              Track your speed, accuracy, and mistakes over time.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 rounded-3xl border-border bg-card/80 backdrop-blur">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Latest WPM
                </div>
                <div
                  className="text-4xl font-black text-foreground mt-2"
                  data-testid="text-latest-wpm"
                >
                  {latest ? latest.wpm : "—"}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                <TrendingUp />
              </div>
            </div>
            <div className="text-sm text-muted-foreground mt-4 font-body">
              Best: <span className="font-bold text-foreground">{bestWpm}</span>
            </div>
          </Card>

          <Card className="p-6 rounded-3xl border-border bg-card/80 backdrop-blur">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Latest Accuracy
                </div>
                <div
                  className="text-4xl font-black text-foreground mt-2"
                  data-testid="text-latest-accuracy"
                >
                  {latest ? `${latest.accuracy}%` : "—"}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-600">
                <Target />
              </div>
            </div>
            <div className="text-sm text-muted-foreground mt-4 font-body">
              Best: <span className="font-bold text-foreground">{bestAcc}%</span>
            </div>
          </Card>

          <Card className="p-6 rounded-3xl border-border bg-card/80 backdrop-blur">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  Total Errors (recent)
                </div>
                <div
                  className="text-4xl font-black text-foreground mt-2"
                  data-testid="text-total-errors"
                >
                  {series.length ? totalErrors : "—"}
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-destructive/10 text-destructive">
                <AlertTriangle />
              </div>
            </div>
            <div className="text-sm text-muted-foreground mt-4 font-body">
              Worlds unlocked: <span className="font-bold text-foreground">{unlockedWorlds}</span>
            </div>
          </Card>
        </div>

        <Card className="p-6 md:p-8 rounded-[2.5rem] border-border bg-card/80 backdrop-blur">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2
                className="text-xl font-black text-foreground font-display"
                data-testid="text-performance-trend"
              >
                Performance Trend
              </h2>
              <p className="text-sm text-muted-foreground font-body">
                Based on your most recent stages (mock trend from your stars).
              </p>
            </div>
          </div>

          <div className="w-full" data-testid="chart-typing-trend">
            <ChartContainer
              className="h-[320px] w-full"
              config={chartConfig}
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={series} margin={{ left: 8, right: 8, top: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="4 8" opacity={0.25} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis tickLine={false} axisLine={false} width={36} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="wpm"
                    stroke="var(--color-wpm)"
                    strokeWidth={3}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="accuracy"
                    stroke="var(--color-accuracy)"
                    strokeWidth={3}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="errors"
                    stroke="var(--color-errors)"
                    strokeWidth={2}
                    dot={false}
                    strokeDasharray="6 6"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>

          {loading && (
            <div className="mt-6 text-sm text-muted-foreground flex items-center gap-2">
              <Activity className="animate-spin" size={16} />
              Loading your stats...
            </div>
          )}
          
          {!loading && !series.length && (
            <div
              className="mt-6 text-sm text-muted-foreground"
              data-testid="text-no-stats"
            >
              Play a few stages to populate your stats.
            </div>
          )}

          {!loading && sessions.length > 0 && (
            <div className="mt-6 text-sm text-emerald-600 font-bold" data-testid="text-real-data">
              ✓ Showing your real typing session data ({sessions.length} sessions tracked)
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
