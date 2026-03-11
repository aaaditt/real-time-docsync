import { LoginForm } from "@/components/auth/LoginForm";
import { FileText } from "lucide-react";

export default function LoginPage() {
    return (
        <main className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-accent p-4">
            {/* Subtle decorative grid */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03]"
                style={{
                    backgroundImage: `radial-gradient(circle, oklch(0.45 0.18 260) 1px, transparent 1px)`,
                    backgroundSize: '32px 32px',
                }} />

            <div className="relative w-full max-w-md">
                {/* Logo / brand */}
                <div className="flex items-center justify-center gap-3 mb-8">
                    <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground shadow-md">
                        <FileText className="w-5 h-5" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        DocSync
                    </h1>
                </div>

                <LoginForm />

                <p className="text-center text-xs text-muted-foreground mt-6">
                    Real-time collaborative document editing.
                </p>
            </div>
        </main>
    );
}
