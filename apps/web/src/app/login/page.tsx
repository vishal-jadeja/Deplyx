import { signIn } from "@/auth";

/**
 * Intentionally unstyled — the real dashboard UI (and its design system)
 * lands in Phase 06. This exists so Phase 03's login flow has somewhere to
 * start from.
 */
export default function LoginPage() {
  return (
    <main>
      <h1>Sign in</h1>
      <form
        action={async () => {
          "use server";
          await signIn("github", { redirectTo: "/dashboard" });
        }}
      >
        <button type="submit">Sign in with GitHub</button>
      </form>
    </main>
  );
}
