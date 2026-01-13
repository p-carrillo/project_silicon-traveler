import { StatusMessage } from '@/app/components/status-message';
import { adminRequest, PromptTemplateListResponse } from '@/lib/admin-api';
import { PromptCreateForm, PromptUpdateForm } from './prompt-forms';

export default async function AdminPromptsPage() {
  const result = await adminRequest<PromptTemplateListResponse>(
    '/prompt-templates',
  );

  if (result.error) {
    return (
      <StatusMessage
        tone="error"
        title="Unable to load prompt templates"
        description="Please try again later."
      />
    );
  }

  const templates = result.data?.templates ?? [];

  return (
    <div className="admin-stack">
      <section>
        <h2 className="admin-section-title">Create a new template</h2>
        <PromptCreateForm onSuccessMessage="Template created." />
      </section>
      <section>
        <h2 className="admin-section-title">Existing templates</h2>
        {templates.length === 0 ? (
          <StatusMessage
            tone="empty"
            title="No prompt templates yet"
            description="Create your first template to start generating entries."
          />
        ) : (
          <div className="admin-list">
            {templates.map((template) => (
              <PromptUpdateForm key={template.id} template={template} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
