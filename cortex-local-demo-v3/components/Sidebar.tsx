"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  ["Home","/","⌂"],
  ["Chat","#","◯"],
  ["Tasks","#","✓"],
  ["Calendar","#","□"],
  ["Files","#","▱"],
  ["Focus","/focus","◉"]
];

export default function Sidebar(){
  const pathname = usePathname();
  return (
    <aside className="sidebar">
      <div className="brand">
        <img src="/cortex-logo.png" alt="Cortex logo"/>
        <strong>CORTEX</strong>
        <small>AI DOES WHAT IT CAN.<br/>YOU FOCUS ON WHAT MATTERS.</small>
      </div>

      <nav>
        {nav.map(([label,href,icon])=>{
          const active = href !== "#" && (pathname === href || (href === "/focus" && pathname.startsWith("/focus")));
          return <Link key={label} href={href} className={`nav-item ${active?"active":""}`}>
            <span>{icon}</span>{label}
          </Link>
        })}
      </nav>

      <div className="sidebar-bottom">
        <div className="mini-pet">🌱</div>
        <em>A calmer,<br/>brighter you.</em>
        <p>Less overwhelm.<br/>More progress.<br/>You got this.</p>
      </div>
    </aside>
  );
}
