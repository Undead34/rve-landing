export const engine = {
  status: "ready",
  rules_loaded: 47,
  rules_in_repo: 48,
  last_reload_at: "2026-05-19T08:13:42Z",
  last_reload_by: "scheduler",
  uptime_days: 41,
  decisions_per_min: 1240,
  p99_latency_ms: 22,
}

export const ruleCounts = {
  active: 28,
  staged: 6,
  suspended: 4,
  deactivated: 10,
}

export const dailyVolume = [
  { day: "May 6", allow: 18204, review: 412, block: 88, tag_only: 244 },
  { day: "May 7", allow: 19012, review: 388, block: 92, tag_only: 256 },
  { day: "May 8", allow: 17988, review: 422, block: 71, tag_only: 233 },
  { day: "May 9", allow: 16401, review: 360, block: 64, tag_only: 201 },
  { day: "May 10", allow: 15022, review: 312, block: 58, tag_only: 188 },
  { day: "May 11", allow: 19308, review: 401, block: 102, tag_only: 261 },
  { day: "May 12", allow: 20144, review: 433, block: 119, tag_only: 280 },
  { day: "May 13", allow: 21002, review: 458, block: 124, tag_only: 291 },
  { day: "May 14", allow: 20488, review: 442, block: 110, tag_only: 277 },
  { day: "May 15", allow: 19840, review: 419, block: 99, tag_only: 268 },
  { day: "May 16", allow: 17560, review: 381, block: 84, tag_only: 229 },
  { day: "May 17", allow: 16012, review: 332, block: 70, tag_only: 207 },
  { day: "May 18", allow: 20902, review: 461, block: 121, tag_only: 295 },
  { day: "May 19", allow: 14288, review: 318, block: 82, tag_only: 198 },
]

export const recentActivity = [
  { id: 1, kind: "updated", rule: "block_high_velocity_card_payments", version: "2.1.0", who: "r.tanaka", when: "2h ago", note: "Bumped threshold from 4 → 5" },
  { id: 2, kind: "staged", rule: "staged_bot_score_threshold", version: "0.1.0", who: "n.silva", when: "3h ago", note: "Initial shadow-eval rollout 10%" },
  { id: 3, kind: "created", rule: "block_proxy_signup_emerging_markets", version: "0.3.1", who: "n.silva", when: "1d ago", note: "First staged version" },
  { id: 4, kind: "activated", rule: "review_geo_distance_anomaly", version: "1.2.0", who: "m.alvarez", when: "3d ago", note: "Promoted from staged" },
  { id: 5, kind: "suspended", rule: "suspend_legacy_login_velocity", version: "2.5.0", who: "r.tanaka", when: "5d ago", note: "Replaced by v3" },
]

export const contract = {
  version: "v3",
  supported_assets: ["transaction", "login", "signup", "withdrawal", "password_reset", "kyc_event"],
}
