import { useRef } from "react";
import { apiClient } from "../../lib/api";
import { useAppStore } from "../../store/appStore";

export function ProfilePage() {
  const inputRef = useRef<HTMLInputElement | null>(null);
  const profile = useAppStore((state) => state.profile);
  const setProfile = useAppStore((state) => state.setProfile);
  const setError = useAppStore((state) => state.setError);

  return (
    <div className="grid gap-4 xl:grid-cols-[0.7fr_1.3fr]">
      <div className="rounded-[22px] bg-white p-5 shadow-card">
        <div className="flex items-center gap-4">
          {profile?.avatarUrl ? (
            <img alt="Avatar" className="h-20 w-20 rounded-[20px] object-cover" src={profile.avatarUrl} />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-[20px] bg-ink text-2xl font-semibold text-white">
              {(profile?.displayName?.slice(0, 1) ?? profile?.email?.slice(0, 1) ?? "F").toUpperCase()}
            </div>
          )}
          <div>
            <div className="font-display text-2xl font-semibold text-ink">Profile</div>
            <div className="text-sm text-slate-500">{profile?.email}</div>
          </div>
        </div>
        <div className="mt-4 flex gap-3">
          <button className="rounded-xl bg-ink px-4 py-2 text-sm text-white" onClick={() => inputRef.current?.click()}>
            Upload avatar
          </button>
          {profile?.avatarUrl ? (
            <button
              className="rounded-xl border border-stone-200 px-4 py-2 text-sm"
              onClick={() => {
                void apiClient
                  .request("/profile", { method: "PUT", body: JSON.stringify({ avatarUrl: undefined }) })
                  .then(() => setProfile(profile ? { ...profile, avatarUrl: undefined } : null))
                  .catch((error) => setError(error instanceof Error ? error.message : "Failed to update profile"));
              }}
            >
              Remove
            </button>
          ) : null}
        </div>
        <input
          ref={inputRef}
          accept="image/*"
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (!file) {
              return;
            }

            const reader = new FileReader();
            reader.onload = () => {
              const avatarUrl = String(reader.result);
              void apiClient
                .request("/profile", {
                  method: "PUT",
                  body: JSON.stringify({ avatarUrl })
                })
                .then(() => setProfile(profile ? { ...profile, avatarUrl } : profile))
                .catch((error) => setError(error instanceof Error ? error.message : "Failed to update profile"));
            };
            reader.readAsDataURL(file);
          }}
          type="file"
        />
      </div>
      <div className="rounded-[22px] bg-white p-5 shadow-card">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-[18px] border border-stone-200 px-4 py-3">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Email</div>
            <div className="mt-2 text-sm text-ink">{profile?.email}</div>
          </div>
          <div className="rounded-[18px] border border-stone-200 px-4 py-3">
            <div className="text-xs uppercase tracking-[0.18em] text-slate-500">Timezone</div>
            <div className="mt-2 text-sm text-ink">{profile?.timezone}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
