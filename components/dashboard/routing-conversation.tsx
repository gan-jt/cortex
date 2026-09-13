import { SparklesIcon } from "@/components/icons";

type CortexMode =
  | "AUTO"
  | "APPROVAL"
  | "FOCUS";

interface RoutingConversationProps {
  taskDescription: string;
  isSubmitting: boolean;
  mode?: CortexMode;
  status?: string;
  reason?: string;
}

function getResultMessage(
  mode: CortexMode,
  status: string,
) {
  if (status === "NEEDS_CLARIFICATION") {
    return "I need a little more context before choosing the safest path.";
  }

  if (mode === "AUTO") {
    return "I can handle this automatically and return a verifiable result.";
  }

  if (mode === "APPROVAL") {
    return "This action could affect an external person or system, so I’m stopping for your approval.";
  }

  return "This task deserves focused attention. I’m preparing a guided Focus Session.";
}

export function RoutingConversation({
  taskDescription,
  isSubmitting,
  mode,
  status,
  reason,
}: RoutingConversationProps) {
  if (!taskDescription.trim()) {
    return null;
  }

  return (
    <div
      aria-live="polite"
      className={`routing-conversation ${
        isSubmitting
          ? "conversation-thinking"
          : "conversation-complete"
      }`}
    >
      <div className="conversation-row user-row">
        <div className="conversation-bubble user-bubble">
          <span className="conversation-name">
            You
          </span>

          <p>{taskDescription}</p>
        </div>

        <span className="conversation-avatar user-avatar">
          L
        </span>
      </div>

      {isSubmitting ? (
        <div className="conversation-row cortex-row">
          <span className="conversation-avatar cortex-avatar">
            <SparklesIcon />
          </span>

          <div className="conversation-bubble cortex-bubble">
            <div className="conversation-cortex-heading">
              <span className="conversation-name">
                Cortex
              </span>

              <span className="typing-dots">
                <i />
                <i />
                <i />
              </span>
            </div>

            <div className="routing-stages">
              <span>
                Understanding your task...
              </span>

              <span>
                Checking risk and required
                context...
              </span>

              <span>
                Choosing the right work
                mode...
              </span>
            </div>
          </div>
        </div>
      ) : (
        mode &&
        status && (
          <div className="conversation-row cortex-row">
            <span className="conversation-avatar cortex-avatar">
              <SparklesIcon />
            </span>

            <div className="conversation-bubble cortex-bubble result-bubble">
              <div className="conversation-cortex-heading">
                <span className="conversation-name">
                  Cortex
                </span>

                <span
                  className={`conversation-mode ${mode.toLowerCase()}`}
                >
                  {mode}
                </span>
              </div>

              <p>
                {getResultMessage(mode, status)}
              </p>

              {reason && (
                <small>{reason}</small>
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
}