import Link from "next/link";
import { Compass } from "lucide-react";
export default function NotFound() {
  return (
    <div className="page not-found">
      <Compass size={48} />
      <span>404</span>
      <h1>这页还没被写下</h1>
      <p>链接可能已变更，回到首页继续探索吧。</p>
      <Link href="/">回到总览</Link>
    </div>
  );
}
