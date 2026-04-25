export function formatNumber(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return "Not available";
  }

  return new Intl.NumberFormat("en-US").format(value);
}

export function formatDateTime(value: string | Date | null | undefined) {
  if (!value) {
    return "Not available";
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatDate(value: string | Date | null | undefined) {
  if (!value) {
    return "Not available";
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "2-digit",
  }).format(date);
}

export function formatChartDateLabel(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return value;
  }

  return formatDate(value);
}

export function formatActionLabel(value: string | null | undefined) {
  if (!value || value.trim().length === 0) {
    return "Not available";
  }

  const tokenLabels: Record<string, string> = {
    ai: "AI",
    audio: "Audio",
    clip: "Clip",
    download: "Download",
    facebook: "Facebook",
    file: "File",
    help: "Help",
    instagram: "Instagram",
    message: "Message",
    post: "Post",
    reel: "Reel",
    shorts: "Shorts",
    soundcloud: "SoundCloud",
    start: "Start",
    story: "Story",
    text: "Text",
    tiktok: "TikTok",
    video: "Video",
    youtube: "YouTube",
  };

  return value
    .split(/[_\-\s]+/)
    .filter(Boolean)
    .map((token) => {
      const normalized = token.toLowerCase();
      return tokenLabels[normalized] ?? `${normalized.charAt(0).toUpperCase()}${normalized.slice(1)}`;
    })
    .join(" ");
}

export function truncateMiddle(value: string, maxLength = 68) {
  if (value.length <= maxLength) {
    return value;
  }

  const keep = Math.floor((maxLength - 3) / 2);
  return `${value.slice(0, keep)}...${value.slice(-keep)}`;
}

export function nullLabel(value: string | null | undefined) {
  if (!value || value.trim().length === 0) {
    return "Not available";
  }

  return value;
}
