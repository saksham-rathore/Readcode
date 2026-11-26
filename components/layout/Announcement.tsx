export interface AnnouncementProps {
  text?: string;
  actionText?: string;
  actionHref?: string;
}

export function Announcement({
  text = "Meet your codebase, all over again.",
  actionText = "See how it works",
  actionHref = "#how-it-works",
}: AnnouncementProps) {
  return (
    <div className="announcement">
      <span className="announcement-pulse" /> {text}{" "}
      <a href={actionHref}>
        {actionText} <span>→</span>
      </a>
    </div>
  );
}

export default Announcement;
