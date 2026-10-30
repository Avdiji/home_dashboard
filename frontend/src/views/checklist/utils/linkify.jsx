// Splits plain text into strings + <a> elements for any http(s):// or www.
// URL, so item descriptions render clickable links. Trailing punctuation
// (".", ",", ")" …) is left out of the link so "see example.com." works.
const URL_RE = /\b(?:https?:\/\/|www\.)[^\s<]+/gi;
const TRAILING_RE = /[.,;:!?)\]}'"]+$/;

export default function linkify(text, className) {
  const out = [];
  let last = 0;
  for (const match of text.matchAll(URL_RE)) {
    const url = match[0].replace(TRAILING_RE, "");
    const start = match.index;
    if (start > last) out.push(text.slice(last, start));
    const href = url.startsWith("www.") ? `https://${url}` : url;
    out.push(
      <a
        key={start}
        className={className}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => e.stopPropagation()}
      >
        {url}
      </a>,
    );
    last = start + url.length;
  }
  if (last < text.length) out.push(text.slice(last));
  return out;
}
