/** Local-only static preview, not a production application server. */
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
const root = path.resolve("out");
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const mime = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".woff2": "font/woff2",
  ".mp4": "video/mp4",
  ".webm": "video/webm",
  ".vtt": "text/vtt; charset=utf-8",
  ".pdf": "application/pdf",
  ".ico": "image/x-icon",
};
const server = createServer(async (req, res) => {
  try {
    if (!["GET", "HEAD"].includes(req.method ?? "")) {
      res.writeHead(405, { Allow: "GET, HEAD" });
      res.end();
      return;
    }
    let pathname = decodeURIComponent(
      new URL(req.url ?? "/", "http://localhost").pathname,
    );
    if (basePath) {
      if (pathname === basePath) {
        res.writeHead(308, { Location: `${basePath}/` }); res.end(); return;
      }
      if (!pathname.startsWith(`${basePath}/`)) {
        res.writeHead(404); res.end("Not found"); return;
      }
      pathname = pathname.slice(basePath.length);
    }
    let target = path.resolve(root, `.${pathname}`);
    const relative = path.relative(root, target);
    if (
      relative.startsWith("..") ||
      path.isAbsolute(relative) ||
      pathname.includes("\\") ||
      pathname.includes("\0")
    ) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }
    try {
      if ((await stat(target)).isDirectory())
        target = path.join(target, "index.html");
    } catch {
      target = path.join(root, "404.html");
      res.statusCode = 404;
    }
    const data = await readFile(target);
    const type = mime[path.extname(target)] ?? "application/octet-stream";
    res.setHeader("Content-Type", type);
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
    // Range requests let the native HTML video control seek in the sample MP4.
    const range = req.headers.range;
    if (range && /^(video\/)/.test(type)) {
      const match = /^bytes=(\d+)-(\d*)$/.exec(range);
      const start = match ? Number(match[1]) : NaN;
      const end =
        match && match[2]
          ? Math.min(Number(match[2]), data.length - 1)
          : data.length - 1;
      if (
        !Number.isSafeInteger(start) ||
        start < 0 ||
        start >= data.length ||
        end < start
      ) {
        res.writeHead(416, { "Content-Range": `bytes */${data.length}` });
        res.end();
        return;
      }
      res.writeHead(206, {
        "Accept-Ranges": "bytes",
        "Content-Range": `bytes ${start}-${end}/${data.length}`,
        "Content-Length": end - start + 1,
      });
      res.end(
        req.method === "HEAD" ? undefined : data.subarray(start, end + 1),
      );
      return;
    }
    res.setHeader("Content-Length", data.length);
    res.end(req.method === "HEAD" ? undefined : data);
  } catch {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    res.end("Not found. Run npm run build first.");
  }
});
const port = Number(process.env.PORT ?? 3000);
server.listen(port, "127.0.0.1", () =>
  console.log(`qcm.dev local preview: http://127.0.0.1:${port}`),
);
