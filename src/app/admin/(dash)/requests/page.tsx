import { repo } from "@/lib/db";
import { formatBakeDate } from "@/lib/schedule";
import type { RequestStatus } from "@/lib/types";
import { setRequestStatus } from "../../actions";

export const metadata = { title: "Requests" };

const STATUS: Record<RequestStatus, { label: string; cls: string }> = {
  new: { label: "New", cls: "bg-terracotta text-white" },
  quoted: { label: "Quoted", cls: "bg-marigold text-cocoa" },
  done: { label: "Done", cls: "bg-leaf/15 text-leaf" },
  declined: { label: "Declined", cls: "bg-cocoa/10 text-cocoa-soft" },
};

export default async function RequestsPage() {
  const [requests, subscribers] = await Promise.all([repo.listRequests(), repo.listSubscribers()]);
  return (
    <div>
      <h1 className="text-4xl">Party & custom requests</h1>
      {requests.length === 0 ? (
        <p className="mt-6 rounded-[1.5rem] border-2 border-dashed border-line p-8 text-center text-cocoa-soft">No requests yet.</p>
      ) : (
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {requests.map((r) => {
            const digits = r.phone.replace(/[^\d+]/g, "");
            return (
              <article key={r.id} className={`rounded-[1.5rem] bg-paper p-5 shadow-card ${r.status === "new" ? "ring-2 ring-terracotta" : ""}`}>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xl font-bold">{r.name}</p>
                    <p className="text-sm text-cocoa-soft">
                      Sent {new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      {r.event_date && ` · Event ${formatBakeDate(r.event_date, "en")}`}
                    </p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-extrabold uppercase ${STATUS[r.status].cls}`}>{STATUS[r.status].label}</span>
                </div>
                {r.quantity && <p className="mt-3 text-sm font-semibold">Size: {r.quantity}</p>}
                <p className="mt-2 whitespace-pre-wrap">{r.details}</p>
                <p className="mt-3 text-sm text-cocoa-soft">
                  <a href={`tel:${digits}`} className="font-bold text-cobalt">
                    {r.phone}
                  </a>
                  {r.email && (
                    <>
                      {" · "}
                      <a href={`mailto:${r.email}`} className="font-bold text-cobalt">
                        {r.email}
                      </a>
                    </>
                  )}
                </p>
                <form action={setRequestStatus} className="mt-4 flex flex-wrap gap-2">
                  <input type="hidden" name="id" value={r.id} />
                  {(["quoted", "done", "declined"] as const)
                    .filter((s) => s !== r.status)
                    .map((s) => (
                      <button key={s} name="status" value={s} className="rounded-full bg-cream-deep px-3.5 py-2 text-sm font-bold hover:bg-line">
                        Mark {STATUS[s].label.toLowerCase()}
                      </button>
                    ))}
                </form>
              </article>
            );
          })}
        </div>
      )}

      <h2 className="mt-12 text-3xl">Bake day list ({subscribers.length})</h2>
      <p className="mt-1 text-cocoa-soft">People who asked to hear about new bake days.</p>
      {subscribers.length > 0 && (
        <ul className="mt-4 divide-y divide-line rounded-[1.5rem] bg-paper px-5 shadow-card">
          {subscribers.map((s) => (
            <li key={s.id} className="flex justify-between gap-3 py-3">
              <span className="font-medium">{s.contact}</span>
              <span className="text-sm text-cocoa-soft">
                {s.lang.toUpperCase()} · {new Date(s.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
