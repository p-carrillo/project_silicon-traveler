import { StatusMessage } from "@/app/components/status-message";

export default function NotFound() {
  return (
    <div className="page">
      <StatusMessage
        tone="empty"
        title="Page not found"
        description="The route you requested does not exist in this journey."
      />
    </div>
  );
}
