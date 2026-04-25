import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { SendMessageForm } from "@/components/admin/SendMessageForm";
import { LineMetricChart } from "@/components/dashboard/Charts";
import { ChartCard } from "@/components/ui/ChartCard";
import { DataTable } from "@/components/ui/DataTable";
import { MetricCard } from "@/components/ui/MetricCard";
import { hasAdminSession } from "@/lib/auth";
import { formatDateTime, formatNumber, nullLabel } from "@/lib/format";
import { getUserDetail } from "@/lib/queries/users";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ userId: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { userId } = await params;

  return {
    title: `User ${userId}`,
    description: `Private MaxLoad detail view for user ${userId}.`,
  };
}

export default async function AdminUserDetailPage({ params }: PageProps) {
  if (!(await hasAdminSession())) {
    redirect("/admin/login");
  }

  const { userId: rawUserId } = await params;
  const userId = Number(rawUserId);
  if (!Number.isSafeInteger(userId) || userId <= 0) {
    notFound();
  }

  let detail;
  let error: string | null = null;

  try {
    detail = await getUserDetail(userId);
  } catch (caught) {
    error = caught instanceof Error ? caught.message : "User detail is unavailable.";
  }

  if (!detail && !error) {
    notFound();
  }

  return (
    <AdminShell>
      <div className="mb-6">
        <div className="font-mono text-xs uppercase tracking-[0.2em] text-zinc-500">
          user detail
        </div>
        <h1 className="mt-2 text-3xl font-semibold text-white">User {userId}</h1>
      </div>

      {error ? (
        <div className="mb-6 border border-white/10 bg-black p-4 text-sm text-zinc-400">
          {error}
        </div>
      ) : null}

      {detail ? (
        <>
          <section className="mb-6 grid gap-4 md:grid-cols-3">
            <MetricCard label="Username" value={nullLabel(detail.user.username ? `@${detail.user.username}` : null)} detail={nullLabel(detail.user.name)} />
            <MetricCard label="Events" value={formatNumber(detail.user.eventCount)} detail={`Last: ${formatDateTime(detail.user.lastActivity)}`} />
            <MetricCard label="Chat" value={nullLabel(detail.user.chatType)} detail={`Language: ${nullLabel(detail.user.language)}`} />
          </section>

          <section className="mb-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <ChartCard title="User activity" eyebrow="30 days">
              <LineMetricChart data={detail.activity} />
            </ChartCard>
            <ChartCard title="Message user" eyebrow="Telegram">
              <SendMessageForm userId={detail.user.userId} />
            </ChartCard>
          </section>

          <div className="mb-6 border border-white/10 bg-black p-4 text-sm text-zinc-500">
            Downloaded-file activity is not available from the current schema because
            <span className="font-mono text-zinc-300"> downloaded_files </span>
            has no user reference.
          </div>

          <section className="mb-6 grid gap-4 lg:grid-cols-2">
            <ChartCard title="Profile">
              <DataTable
                columns={["Field", "Value"]}
                rows={[
                  ["user_id", detail.user.userId],
                  ["user_name", nullLabel(detail.user.name)],
                  ["user_username", nullLabel(detail.user.username)],
                  ["chat_type", nullLabel(detail.user.chatType)],
                  ["language", nullLabel(detail.user.language)],
                  ["status", nullLabel(detail.user.status)],
                ]}
              />
            </ChartCard>
            <ChartCard title="Settings">
              <DataTable
                columns={["Setting", "Value"]}
                rows={[
                  ["captions", nullLabel(detail.user.settings.captions)],
                  ["delete_message", nullLabel(detail.user.settings.deleteMessage)],
                  ["info_buttons", nullLabel(detail.user.settings.infoButtons)],
                  ["url_button", nullLabel(detail.user.settings.urlButton)],
                  ["audio_button", nullLabel(detail.user.settings.audioButton)],
                ]}
              />
            </ChartCard>
          </section>

          <ChartCard title="Event history">
            <DataTable
              columns={["ID", "Action", "Chat", "Created"]}
              rows={detail.events.map((event) => [
                <span className="font-mono text-white" key="id">{event.id}</span>,
                <span className="font-mono text-xs" key="action">{event.actionName}</span>,
                nullLabel(event.chatType),
                formatDateTime(event.createdAt),
              ])}
            />
          </ChartCard>
        </>
      ) : null}
    </AdminShell>
  );
}
