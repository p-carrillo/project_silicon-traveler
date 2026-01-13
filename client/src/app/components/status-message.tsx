type StatusMessageProps = {
  title: string;
  description?: string;
  tone?: "info" | "error" | "empty";
};

export function StatusMessage({
  title,
  description,
  tone = "info",
}: StatusMessageProps) {
  return (
    <section className={`status-panel ${tone}`}>
      <h2>{title}</h2>
      {description ? <p>{description}</p> : null}
    </section>
  );
}
