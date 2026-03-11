"use client";
import { useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export function LoginForm() {
    const supabase = createBrowserClient();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        // Try sign in first
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (signInError) {
            // If no account, auto-register
            if (
                signInError.message.toLowerCase().includes("invalid") ||
                signInError.message.toLowerCase().includes("not found")
            ) {
                const { error: signUpError } = await supabase.auth.signUp({
                    email,
                    password,
                });
                if (signUpError) {
                    setError(signUpError.message);
                    setLoading(false);
                    return;
                }
            } else {
                setError(signInError.message);
                setLoading(false);
                return;
            }
        }

        // Force hard navigation to dashboard
        window.location.href = "/dashboard";
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="w-full max-w-sm mx-auto p-6 bg-white rounded-xl shadow-md border border-slate-100">
                <h2 className="text-2xl font-semibold mb-6 text-center text-slate-800">
                    DocSync Login
                </h2>
                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Email
                        </label>
                        <Input
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                            Password
                        </label>
                        <Input
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full"
                        />
                    </div>
                    {error && (
                        <div className="text-sm text-red-500 bg-red-50 p-2 rounded-md">
                            {error}
                        </div>
                    )}
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Signing in..." : "Sign In / Register"}
                    </Button>
                </form>
            </div>
        </div>
    );
}
