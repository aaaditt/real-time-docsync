"use client";
import { useState } from "react";
import { createBrowserClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, Loader2 } from "lucide-react";

export function LoginForm() {
    const supabase = createBrowserClient();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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

        window.location.href = "/dashboard";
    };

    return (
        <div className="bg-card border border-border rounded-2xl shadow-lg shadow-black/[0.03] p-8">
            <div className="mb-6">
                <h2 className="text-xl font-semibold text-foreground">
                    Welcome back
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                    Sign in to your account or create a new one
                </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground" htmlFor="login-email">
                        Email
                    </label>
                    <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            id="login-email"
                            type="email"
                            placeholder="you@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="pl-10 h-11"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-sm font-medium text-foreground" htmlFor="login-password">
                        Password
                    </label>
                    <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <Input
                            id="login-password"
                            type="password"
                            placeholder="••••••••"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="pl-10 h-11"
                        />
                    </div>
                </div>

                {error && (
                    <div className="text-sm text-destructive bg-destructive/10 px-3 py-2 rounded-lg">
                        {error}
                    </div>
                )}

                <Button
                    type="submit"
                    className="w-full h-11 font-medium cursor-pointer"
                    disabled={loading}
                >
                    {loading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Signing in…
                        </>
                    ) : (
                        "Sign In"
                    )}
                </Button>
            </form>

            <p className="text-xs text-center text-muted-foreground mt-5">
                Don&apos;t have an account? Just sign in — we&apos;ll create one for you.
            </p>
        </div>
    );
}
