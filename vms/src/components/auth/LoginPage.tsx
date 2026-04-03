"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { Monitor, Eye, EyeOff, Loader2 } from "lucide-react";
import { OceanNoirLogo } from "@/components/shared/OceanNoirLogo";
import { createClient } from "@/lib/supabase/client";
import { getDefaultRoute } from "@/lib/auth/permissions";
import type { Role } from "@/types";
import { toast } from "sonner";

const schema = z.object({
  username: z.string().min(1, "请输入账号"),
  password: z.string().min(1, "请输入密码"),
});

type FormData = z.infer<typeof schema>;

// Mock traffic data for display — will be real data from API
const MOCK_TRAFFIC = [
  { day: "Mon", orders: 18, revenue: 82 },
  { day: "Tue", orders: 22, revenue: 96 },
  { day: "Wed", orders: 15, revenue: 68 },
  { day: "Thu", orders: 28, revenue: 124 },
  { day: "Fri", orders: 35, revenue: 158 },
  { day: "Sat", orders: 42, revenue: 189 },
  { day: "Sun", orders: 38, revenue: 172 },
];

export function LoginPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const supabase = createClient();

      // Look up email from username
      const res = await fetch("/api/auth/username-to-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: data.username }),
      });

      if (!res.ok) {
        toast.error("账号不存在或密码错误");
        return;
      }

      const { email } = await res.json();

      const { data: authData, error } = await supabase.auth.signInWithPassword({
        email,
        password: data.password,
      });

      if (error) {
        toast.error("账号或密码错误");
        return;
      }

      // Get role and redirect
      const { data: profile } = await supabase
        .from("profiles")
        .select("role, is_active")
        .eq("id", authData.user.id)
        .single();

      if (!profile || !profile.is_active) {
        await supabase.auth.signOut();
        toast.error("账号已被停用，请联系管理员");
        return;
      }

      toast.success("登录成功");
      router.push(getDefaultRoute(profile.role as Role));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-noir-900 flex">
      {/* Left Panel — Brand + KPI */}
      <div className="hidden lg:flex lg:w-[55%] flex-col relative overflow-hidden bg-noir-950 border-r border-brand-red/20">
        {/* Ambient glow */}
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-brand-red/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-brand-red/3 rounded-full blur-3xl" />

        <div className="relative flex-1 flex flex-col p-10">
          {/* Logo */}
          <OceanNoirLogo size="lg" />

          {/* KPI Cards */}
          <div className="mt-10 grid grid-cols-2 gap-4">
            <KpiCard
              label="技师总数"
              labelEn="Total Technicians"
              value="20"
              color="silver"
            />
            <KpiCard
              label="今日可接待"
              labelEn="Available Now"
              value="—"
              color="green"
            />
            <KpiCard
              label="本月订单"
              labelEn="Monthly Orders"
              value="—"
              color="red"
            />
            <KpiCard
              label="本月营业额"
              labelEn="Monthly Revenue"
              value="—"
              color="silver"
            />
          </div>

          {/* Traffic chart */}
          <div className="mt-8 brand-card p-4 flex-1">
            <div className="mb-3">
              <p className="text-brand-silver text-sm font-medium">近期每日客流量</p>
              <p className="text-brand-silver-dim/50 text-xs">
                Daily Traffic — Past 7 Days
              </p>
            </div>
            <div className="h-32">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={MOCK_TRAFFIC} barSize={16}>
                  <XAxis
                    dataKey="day"
                    tick={{ fill: "#8A8A96", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fill: "#8A8A96", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    width={25}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "#120E10",
                      border: "1px solid rgba(200,24,42,0.3)",
                      borderRadius: 8,
                      color: "#F0EEE9",
                      fontSize: 12,
                    }}
                    cursor={{ fill: "rgba(200,24,42,0.1)" }}
                  />
                  <Bar
                    dataKey="orders"
                    fill="#C8182A"
                    radius={[3, 3, 0, 0]}
                    name="订单数"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Display screen link */}
          <a
            href="/display"
            target="_blank"
            className="mt-4 flex items-center gap-2 text-brand-silver-dim/50 hover:text-brand-silver-dim text-sm transition-colors group"
          >
            <Monitor className="h-4 w-4 group-hover:text-brand-red transition-colors" />
            <span>技师展示屏 — 无需登录</span>
          </a>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8">
          <OceanNoirLogo size="md" />
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="font-cinzel text-2xl font-bold silver-text">
              欢迎登录
            </h2>
            <p className="text-brand-silver-dim/60 text-sm mt-1">
              员工管理系统 · Staff Management System
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm text-brand-silver-dim mb-1.5">
                账号
              </label>
              <input
                {...register("username")}
                type="text"
                placeholder="请输入您的账号"
                autoComplete="username"
                className="w-full px-4 py-3 rounded-lg bg-noir-700 border border-brand-silver-dim/20 text-foreground placeholder:text-brand-silver-dim/40 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-all"
              />
              {errors.username && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.username.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm text-brand-silver-dim mb-1.5">
                密码
              </label>
              <div className="relative">
                <input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="请输入密码"
                  autoComplete="current-password"
                  className="w-full px-4 py-3 pr-11 rounded-lg bg-noir-700 border border-brand-silver-dim/20 text-foreground placeholder:text-brand-silver-dim/40 focus:outline-none focus:border-brand-red focus:ring-1 focus:ring-brand-red transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-silver-dim/50 hover:text-brand-silver-dim transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-red-400 text-xs mt-1">
                  {errors.password.message}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-brand w-full py-3 flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  登录中...
                </>
              ) : (
                "登录"
              )}
            </button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-brand-silver-dim/40 text-xs">
              Ocean Noir VMS · staff.oceannoir.au
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  labelEn,
  value,
  color,
}: {
  label: string;
  labelEn: string;
  value: string;
  color: "red" | "green" | "silver";
}) {
  const colors = {
    red: "text-brand-red",
    green: "text-green-400",
    silver: "text-brand-silver",
  };

  return (
    <div className="brand-card p-3">
      <p className={`text-2xl font-bold font-cinzel ${colors[color]}`}>
        {value}
      </p>
      <p className="text-brand-silver text-sm mt-0.5">{label}</p>
      <p className="text-brand-silver-dim/40 text-xs">{labelEn}</p>
    </div>
  );
}
