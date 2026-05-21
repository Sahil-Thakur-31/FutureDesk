import { useForm } from "react-hook-form";
import { useSessionStore } from "../../store/sessionStore";

type AuthFormValues = {
  email: string;
  password: string;
};

export function AuthScreen() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<AuthFormValues>();
  const login = useSessionStore((state) => state.login);
  const signUp = useSessionStore((state) => state.register);
  const isLoading = useSessionStore((state) => state.isLoading);
  const error = useSessionStore((state) => state.error);
  const clearError = useSessionStore((state) => state.clearError);

  const submit = handleSubmit(async (values) => {
    await login(values);
    if (!useSessionStore.getState().error) {
      reset();
    }
  });

  const submitRegistration = handleSubmit(async (values) => {
    await signUp(values);
    if (!useSessionStore.getState().error) {
      reset();
    }
  });

  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="rounded-[32px] bg-ink p-10 text-white shadow-card">
          <p className="text-sm uppercase tracking-[0.3em] text-white/60">FutureDesk</p>
          <h1 className="mt-6 max-w-xl font-display text-5xl font-semibold leading-tight">
            One operating system for exams, applications, documents, and execution.
          </h1>
          <p className="mt-6 max-w-lg text-base text-white/72">
            Built for serious career planning with secure storage, cross-device sync, and offline-first workflows.
          </p>
        </section>

        <section className="rounded-[32px] bg-white p-8 shadow-card">
          <h2 className="font-display text-2xl font-semibold text-ink">Sign in</h2>
          {error ? (
            <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}
          <form className="mt-6 space-y-4" onSubmit={submit}>
            <input
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /\S+@\S+\.\S+/,
                  message: "Enter a valid email address"
                }
              })}
              className="w-full rounded-2xl border border-stone-200 px-4 py-3"
              onChange={() => clearError()}
              placeholder="Email"
            />
            {errors.email ? <div className="text-sm text-red-700">{errors.email.message}</div> : null}
            <input
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 8,
                  message: "Password must be at least 8 characters"
                }
              })}
              type="password"
              className="w-full rounded-2xl border border-stone-200 px-4 py-3"
              onChange={() => clearError()}
              placeholder="Password"
            />
            {errors.password ? <div className="text-sm text-red-700">{errors.password.message}</div> : null}
            <button className="w-full rounded-2xl bg-ink px-4 py-3 text-white" disabled={isLoading} type="submit">
              Continue
            </button>
          </form>

          <button
            className="mt-4 w-full rounded-2xl border border-stone-300 px-4 py-3 text-ink"
            disabled={isLoading}
            onClick={() => void submitRegistration()}
            type="button"
          >
            Create account
          </button>
        </section>
      </div>
    </main>
  );
}
