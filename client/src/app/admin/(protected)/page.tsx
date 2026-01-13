import Link from 'next/link';
import { StatusMessage } from '@/app/components/status-message';
import {
  adminRequest,
  JourneyListResponse,
  PromptTemplateListResponse,
} from '@/lib/admin-api';

export default async function AdminDashboardPage() {
  const [journeysResult, promptsResult] = await Promise.all([
    adminRequest<JourneyListResponse>('/journeys'),
    adminRequest<PromptTemplateListResponse>('/prompt-templates'),
  ]);

  if (journeysResult.error || promptsResult.error) {
    return (
      <StatusMessage
        tone="error"
        title="Unable to load admin data"
        description="Please try again shortly."
      />
    );
  }

  const journeyCount = journeysResult.data?.journeys.length ?? 0;
  const promptCount = promptsResult.data?.templates.length ?? 0;

  return (
    <section className="admin-grid">
      <div className="admin-card">
        <h2 className="admin-card-title">Journeys</h2>
        <p className="admin-metric">{journeyCount}</p>
        <p className="admin-card-text">
          Manage active itineraries, update details, and organize stops.
        </p>
        <Link className="admin-link" href="/admin/journeys">
          Go to journeys
        </Link>
      </div>
      <div className="admin-card">
        <h2 className="admin-card-title">Prompt templates</h2>
        <p className="admin-metric">{promptCount}</p>
        <p className="admin-card-text">
          Update and activate text or image prompts for daily generation.
        </p>
        <Link className="admin-link" href="/admin/prompts">
          Go to prompts
        </Link>
      </div>
      <div className="admin-card">
        <h2 className="admin-card-title">Manual commands</h2>
        <p className="admin-card-text">
          Trigger a manual entry generation or test a specific travel date.
        </p>
        <Link className="admin-link" href="/admin/commands">
          Run a command
        </Link>
      </div>
    </section>
  );
}
