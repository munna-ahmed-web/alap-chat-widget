import React, { useState, useRef, useCallback } from "react";
import type { ConnectionStatus } from "../hooks/useWebSocket";

interface MessageInputProps {
  onSend: (text: string, images?: string[]) => void;
  status: ConnectionStatus;
}

const MAX_IMAGES = 5;

// Reads a File and returns a base64 data URL string
const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

export const MessageInput: React.FC<MessageInputProps> = ({
  onSend,
  status,
}) => {
  const [text, setText] = useState("");
  const [imagePreviews, setImagePreviews] = useState<
    { name: string; dataUrl: string }[]
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isConnected = status === "connected";
  const canSend =
    isConnected && (text.trim().length > 0 || imagePreviews.length > 0);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length === 0) return;

    const remaining = MAX_IMAGES - imagePreviews.length;
    const toProcess = files.slice(0, remaining);

    const results = await Promise.all(
      toProcess.map(async (file) => ({
        name: file.name,
        dataUrl: await fileToDataUrl(file),
      })),
    );

    setImagePreviews((prev) => [...prev, ...results]);

    // Reset file input so the same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveImage = (index: number) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Auto-grow: expand to scrollHeight, capped by CSS max-height.
  // Scrollbar appears only when content exceeds the cap (user can't see all text).
  const MAX_TEXTAREA_HEIGHT = 120;
  const handleInput = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setText(e.target.value);
      const el = e.target;
      el.style.height = "auto"; // collapse first
      el.style.height = `${el.scrollHeight}px`; // expand to content
      // Show scrollbar only when we've hit the ceiling
      el.style.overflowY =
        el.scrollHeight > MAX_TEXTAREA_HEIGHT ? "auto" : "hidden";
    },
    [],
  );

  // Enter = send, Shift+Enter = newline
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSend) return;

    const imageDataUrls = imagePreviews.map((p) => p.dataUrl);
    onSend(text.trim(), imageDataUrls.length > 0 ? imageDataUrls : undefined);

    setText("");
    setImagePreviews([]);

    // Reset textarea height back to single-line default
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const placeholder = isConnected
    ? "Type a message…"
    : status === "connecting"
      ? "Connecting…"
      : "Connection lost";

  return (
    <div className="alapai-input-area">
      {/* Image previews */}
      {imagePreviews.length > 0 && (
        <div className="alapai-attachments">
          {imagePreviews.map((img, i) => (
            <div key={i} className="alapai-attachment-preview">
              <img
                src={img.dataUrl}
                alt={img.name}
                className="alapai-attachment-thumb"
              />
              <button
                type="button"
                className="alapai-attachment-remove"
                onClick={() => handleRemoveImage(i)}
                aria-label={`Remove ${img.name}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <form className="alapai-message-input" onSubmit={handleSubmit}>
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          style={{ display: "none" }}
          onChange={handleFileChange}
          aria-label="Attach images"
        />

        {/* Paperclip button opens file picker */}
        <button
          type="button"
          className="alapai-attach-btn"
          onClick={() => fileInputRef.current?.click()}
          aria-label="Attach images"
          title={
            imagePreviews.length >= MAX_IMAGES
              ? "Max 5 images"
              : "Attach images"
          }
          disabled={!isConnected || imagePreviews.length >= MAX_IMAGES}
        >
          <svg viewBox="0 0 24 24">
            <path d="M16.5 6v11.5c0 2.21-1.79 4-4 4s-4-1.79-4-4V5c0-1.38 1.12-2.5 2.5-2.5s2.5 1.12 2.5 2.5v10.5c0 .55-.45 1-1 1s-1-.45-1-1V6H10v9.5c0 1.38 1.12 2.5 2.5 2.5s2.5-1.12 2.5-2.5V5c0-2.21-1.79-4-4-4S7 2.79 7 5v12.5c0 3.04 2.46 5.5 5.5 5.5s5.5-2.46 5.5-5.5V6h-1.5z" />
          </svg>
        </button>

        <textarea
          ref={textareaRef}
          value={text}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={!isConnected}
          aria-label="Message Input"
          rows={1}
        />

        <button type="submit" disabled={!canSend} aria-label="Send message">
          <svg viewBox="0 0 24 24">
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </form>
    </div>
  );
};
