import {
  ArrowIcon,
  CalendarIcon,
  FileIcon,
} from "@/components/icons";

const SCHEDULE_ITEMS = [
  {
    time: "9:25 AM",
    title: "MATH 220",
    detail: "Honors ODE",
    color: "cyan",
  },
  {
    time: "11:00 AM",
    title: "PHYS 201",
    detail: "Problem set focus block",
    color: "purple",
  },
  {
    time: "2:00 PM",
    title: "RCELL 100",
    detail: "Engineering leadership",
    color: "gold",
  },
  {
    time: "4:00 PM",
    title: "Gym",
    detail: "Reset",
    color: "green",
  },
] as const;

const RECENT_FILES = [
  {
    type: "PDF",
    name: "Acosta_LHC_slides.pdf",
    detail: "Today, 10:24 AM",
    color: "red",
  },
  {
    type: "DOC",
    name: "ODE_notes.docx",
    detail: "Yesterday, 8:17 PM",
    color: "purple",
  },
  {
    type: "PDF",
    name: "Neuro_2026_paper.pdf",
    detail: "Sep 9, 2026",
    color: "red",
  },
] as const;

export function DashboardOverview() {
  return (
    <section className="overview-grid">
      <section
        className="calendar-card panel"
        id="calendar"
      >
        <div className="overview-heading">
          <div className="overview-title">
            <span className="overview-icon cyan">
              <CalendarIcon />
            </span>

            <div>
              <h2>Today</h2>
              <p>Sep 13, 2026</p>
            </div>
          </div>

          <span className="demo-data-pill">
            Demo schedule
          </span>
        </div>

        <div className="schedule-list">
          {SCHEDULE_ITEMS.map((item) => (
            <article
              className="schedule-item"
              key={`${item.time}-${item.title}`}
            >
              <time>{item.time}</time>

              <span
                aria-hidden="true"
                className={`schedule-dot ${item.color}`}
              />

              <div>
                <strong>{item.title}</strong>
                <p>{item.detail}</p>
              </div>
            </article>
          ))}
        </div>

        <div className="calendar-footer">
          <p>
            “Progress is a series of small
            steps.”
          </p>

          <span>— Cortex</span>
        </div>
      </section>

      <aside className="overview-side">
        <section
          className="recent-files-card panel"
          id="files"
        >
          <div className="overview-heading">
            <div className="overview-title">
              <span className="overview-icon cyan">
                <FileIcon />
              </span>

              <div>
                <h2>Recent Files</h2>
                <p>Demo content</p>
              </div>
            </div>

            <span className="overview-link">
              View all
              <ArrowIcon />
            </span>
          </div>

          <div className="recent-file-list">
            {RECENT_FILES.map((file) => (
              <article
                className="recent-file"
                key={file.name}
              >
                <span
                  className={`file-type ${file.color}`}
                >
                  {file.type}
                </span>

                <div>
                  <strong>{file.name}</strong>
                  <p>{file.detail}</p>
                </div>

                <span
                  aria-hidden="true"
                  className="file-menu"
                >
                  ⋮
                </span>
              </article>
            ))}
          </div>
        </section>

        <section className="quote-card panel">
          <span
            aria-hidden="true"
            className="quote-mark"
          >
            “
          </span>

          <blockquote>
            You don&apos;t need more willpower.
            You need a clearer path.
          </blockquote>

          <p>— Cortex</p>
        </section>
      </aside>
    </section>
  );
}