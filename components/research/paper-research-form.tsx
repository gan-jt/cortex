"use client";

import {
  useRef,
  useState,
  type DragEvent,
  type FormEvent,
} from "react";

import {
  FileIcon,
  SparklesIcon,
} from "@/components/icons";

interface PaperResearchFormProps {
  error: string | null;
  isAnalyzing: boolean;
  onAnalyze: (
    file: File,
    question: string,
  ) => Promise<unknown>;
}

const DEFAULT_QUESTION =
  "What is the paper's main research question, methodology, key evidence, and most important limitation?";

const MAX_FILE_SIZE = 15 * 1024 * 1024;

function formatFileSize(bytes: number) {
  if (bytes < 1024 * 1024) {
    return `${Math.ceil(bytes / 1024)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function PaperResearchForm({
  error,
  isAnalyzing,
  onAnalyze,
}: PaperResearchFormProps) {
  const inputRef =
    useRef<HTMLInputElement | null>(null);

  const [file, setFile] =
    useState<File | null>(null);

  const [question, setQuestion] =
    useState(DEFAULT_QUESTION);

  const [formError, setFormError] =
    useState<string | null>(null);

  const [isDragging, setIsDragging] =
    useState(false);

  function selectFile(selectedFile: File | null) {
    setFormError(null);

    if (!selectedFile) {
      setFile(null);
      return;
    }

    const isPdf =
      selectedFile.type === "application/pdf" ||
      selectedFile.name.toLowerCase().endsWith(".pdf");

    if (!isPdf) {
      setFile(null);
      setFormError("Only PDF files are supported.");
      return;
    }

    if (selectedFile.size > MAX_FILE_SIZE) {
      setFile(null);
      setFormError(
        "The PDF must be smaller than 15 MB.",
      );
      return;
    }

    setFile(selectedFile);
  }

  function handleDrop(
    event: DragEvent<HTMLDivElement>,
  ) {
    event.preventDefault();
    setIsDragging(false);

    if (isAnalyzing) {
      return;
    }

    selectFile(event.dataTransfer.files?.[0] ?? null);
  }

  function removeFile() {
    setFile(null);
    setFormError(null);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    setFormError(null);

    if (!file) {
      setFormError("Select a PDF file.");
      return;
    }

    if (!question.trim()) {
      setFormError("Enter a research question.");
      return;
    }

    try {
      await onAnalyze(file, question);
    } catch {
      return;
    }
  }

  const displayedError = formError ?? error;

  return (
    <section className="research-card panel">
      <div
        aria-hidden="true"
        className="research-card-glow"
      />

      <div className="research-card-heading">
        <div>
          <p className="eyebrow research-eyebrow">
            Cortex Research
          </p>

          <h2>Analyze a Research Paper</h2>

          <p>
            Turn a PDF into structured findings,
            evidence, limitations, and an actionable
            Focus Session.
          </p>
        </div>

        <span className="research-ai-pill">
          <SparklesIcon />
          Research AI
        </span>
      </div>

      <form
        className="research-form"
        onSubmit={handleSubmit}
      >
        <div className="research-field">
          <div className="research-label-row">
            <label htmlFor="research-paper">
              Research paper
            </label>

            <span>PDF · Maximum 15 MB</span>
          </div>

          <div
            className={[
              "research-upload-zone",
              isDragging
                ? "research-upload-dragging"
                : "",
              file ? "research-upload-selected" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            onDragEnter={(event) => {
              event.preventDefault();

              if (!isAnalyzing) {
                setIsDragging(true);
              }
            }}
            onDragOver={(event) => {
              event.preventDefault();
            }}
            onDragLeave={() => {
              setIsDragging(false);
            }}
            onDrop={handleDrop}
          >
            <input
              ref={inputRef}
              accept=".pdf,application/pdf"
              className="research-file-input"
              disabled={isAnalyzing}
              id="research-paper"
              type="file"
              onChange={(event) => {
                selectFile(
                  event.target.files?.[0] ?? null,
                );
              }}
            />

            {file ? (
              <div className="research-selected-file">
                <span className="research-file-icon">
                  <FileIcon />
                </span>

                <div>
                  <strong>{file.name}</strong>
                  <span>
                    PDF document ·{" "}
                    {formatFileSize(file.size)}
                  </span>
                </div>

                <div className="research-file-actions">
                  <label htmlFor="research-paper">
                    Replace
                  </label>

                  <button
                    disabled={isAnalyzing}
                    type="button"
                    onClick={removeFile}
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <label
                className="research-upload-prompt"
                htmlFor="research-paper"
              >
                <span className="research-file-icon">
                  <FileIcon />
                </span>

                <div>
                  <strong>
                    Drop your research paper here
                  </strong>

                  <span>
                    or choose a PDF from your computer
                  </span>
                </div>

                <span className="research-choose-button">
                  Choose PDF
                </span>
              </label>
            )}
          </div>
        </div>

        <div className="research-field">
          <div className="research-label-row">
            <label htmlFor="research-question">
              Research question
            </label>

            <span>{question.length}/2000</span>
          </div>

          <textarea
            className="research-question-input"
            disabled={isAnalyzing}
            id="research-question"
            maxLength={2000}
            value={question}
            onChange={(event) => {
              setQuestion(event.target.value);
              setFormError(null);
            }}
          />
        </div>

        {displayedError && (
          <p
            aria-live="polite"
            className="research-error"
          >
            {displayedError}
          </p>
        )}

        <div className="research-submit-row">
          <p>
            Cortex will cite relevant pages and separate
            evidence from interpretation.
          </p>

          <button
            className="research-submit"
            disabled={isAnalyzing}
            type="submit"
          >
            {isAnalyzing ? (
              <>
                <span className="spinner" />
                Analyzing paper...
              </>
            ) : (
              <>
                <SparklesIcon />
                Analyze paper
              </>
            )}
          </button>
        </div>
      </form>
    </section>
  );
}