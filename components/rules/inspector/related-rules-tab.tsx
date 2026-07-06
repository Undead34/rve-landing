import { useRouter } from "next/navigation";
import { ModeBadge, ActionBadge } from "@/components/ui/badge";
import type { FraudRule } from "@/lib/domain/types";

export function RelatedRulesTab({
  relatedRules,
}: {
  relatedRules: FraudRule[];
}) {
  const router = useRouter();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {relatedRules.map((r) => (
        <button
          key={r.id}
          type="button"
          onClick={() => router.push(`/rules/inspector?id=${r.id}`)}
          className="w-full text-left bg-(--bg-elev) border border-(--border) rounded-(--radius-lg) p-5 cursor-pointer hover:bg-(--bg-hover)"
        >
          <div className="flex justify-between items-start gap-2 mb-2">
            <div className="flex gap-1">
              <ModeBadge mode={r.state.mode} />
              <ActionBadge action={r.enforcement.action} />
            </div>
          </div>
          <div className="font-medium text-[14px]">{r.meta.name}</div>
          <div className="font-mono text-[11px] text-(--fg-muted) mt-1 mb-2">
            {r.meta.code || r.id}
          </div>
          <div className="text-[12px] text-(--fg-muted) line-clamp-2">
            {r.meta.description}
          </div>
        </button>
      ))}
      {relatedRules.length === 0 && (
        <div className="col-span-2 text-center text-(--fg-muted) p-8">
          No related rules found (sharing tags or channels).
        </div>
      )}
    </div>
  );
}
