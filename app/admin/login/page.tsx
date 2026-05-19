import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { ADMIN_COOKIE, verifySession } from "@/lib/admin/auth";
import { loginAction } from "./actions";

export const metadata = {
  title: "Admin · FRANJA 2026",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const { next, error } = await searchParams;

  // Already signed in → straight to admin (or wherever ?next= points).
  const token = (await cookies()).get(ADMIN_COOKIE)?.value;
  if (await verifySession(token)) {
    redirect(next && next.startsWith("/") ? next : "/admin");
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-franja-bg">
      <form
        action={loginAction}
        className="w-full max-w-sm rounded-2xl border border-franja-border bg-franja-bg-elevated/80 p-8 backdrop-blur-md space-y-6"
      >
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.2em] text-franja-text-muted">
            FRANJA 2026
          </p>
          <h1 className="text-2xl font-medium text-franja-text-primary">
            Panel Admin
          </h1>
          <p className="text-sm text-franja-text-muted">
            Ingresa la contraseña compartida del equipo.
          </p>
        </div>

        <input type="hidden" name="next" value={next ?? "/admin"} />

        <div className="space-y-2">
          <label
            htmlFor="password"
            className="block text-xs font-medium uppercase tracking-widest text-franja-text-muted"
          >
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoFocus
            autoComplete="current-password"
            className="w-full rounded-lg border border-franja-border bg-franja-bg/60 px-3 py-2 text-sm text-franja-text-primary outline-none transition focus:border-franja-turquoise"
          />
          {error && (
            <p
              role="alert"
              className="text-xs text-franja-pink"
            >
              Contraseña incorrecta. Probá de nuevo.
            </p>
          )}
        </div>

        <button
          type="submit"
          className="w-full rounded-lg bg-franja-turquoise px-4 py-2.5 text-sm font-semibold text-franja-bg transition hover:bg-franja-turquoise-dark focus:outline-none focus:ring-2 focus:ring-franja-turquoise/50"
        >
          Entrar
        </button>
      </form>
    </div>
  );
}
