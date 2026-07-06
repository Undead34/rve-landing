import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardBody } from "@/components/ui/card";

const TEAM_MEMBERS = [
  {
    name: "Marisol Alvarez",
    handle: "m.alvarez",
    role: "Fraud Analyst",
    active: "12m ago",
  },
  {
    name: "Ren Tanaka",
    handle: "r.tanaka",
    role: "Safety Manager",
    active: "2h ago",
  },
  {
    name: "Nora Silva",
    handle: "n.silva",
    role: "Fraud Analyst",
    active: "1d ago",
  },
];

export function TeamTab() {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center w-full">
          <div>
            <CardTitle>Team members</CardTitle>
            <span className="text-[12px] text-(--fg-muted)">
              SSO authentication managed via Active Directory
            </span>
          </div>
          <Button icon="plus">Invite member</Button>
        </div>
      </CardHeader>
      <CardBody className="p-0 border-t border-(--border-faint)">
        <table className="w-full text-left border-collapse text-[13px]">
          <thead>
            <tr className="bg-(--bg-inset) border-b border-(--border) text-(--fg-muted) text-[12px] font-medium">
              <th className="p-3 pl-4">Member</th>
              <th className="p-3">Role</th>
              <th className="p-3">Last Active</th>
              <th className="p-3 w-12"></th>
            </tr>
          </thead>
          <tbody>
            {TEAM_MEMBERS.map((m) => (
              <tr
                key={m.handle}
                className="border-b border-(--border-faint) hover:bg-(--bg-hover)"
              >
                <td className="p-3 pl-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-(--bg-active) grid place-items-center font-semibold text-[11px] text-(--fg-muted)">
                      {m.name
                        .split(" ")
                        .map((w) => w[0])
                        .join("")}
                    </div>
                    <div>
                      <div className="font-semibold">{m.name}</div>
                      <div className="text-[11px] text-(--fg-subtle) font-mono">
                        {m.handle}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="p-3">
                  <Badge kind="neutral">{m.role}</Badge>
                </td>
                <td className="p-3 text-(--fg-subtle)">{m.active}</td>
                <td className="p-3 text-right">
                  <button type="button" className="icon-btn">
                    ⋯
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardBody>
    </Card>
  );
}
