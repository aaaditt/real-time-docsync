import { Users } from "lucide-react";

interface User {
    name: string;
    color: string;
}

interface ActiveUsersProps {
    users: User[];
}

export function ActiveUsers({ users }: ActiveUsersProps) {
    if (!users || users.length === 0) return null;

    return (
        <div className="flex items-center gap-3 bg-white/50 backdrop-blur-sm border px-3 py-1.5 rounded-full shadow-sm">
            <Users className="w-4 h-4 text-slate-500" />
            <span className="text-sm font-medium text-slate-600 mr-2">
                {users.length} {users.length === 1 ? 'User' : 'Users'}
            </span>
            <div className="flex -space-x-2 overflow-hidden">
                {users.map((user, idx) => (
                    <div
                        key={idx}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-full border-2 border-white text-xs font-semibold text-white shadow-sm ring-1 ring-slate-900/5"
                        style={{ backgroundColor: user.color }}
                        title={user.name}
                    >
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                ))}
            </div>
        </div>
    );
}
