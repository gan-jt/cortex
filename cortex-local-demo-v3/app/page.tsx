"use client";
import {useState} from "react";
import {useRouter} from "next/navigation";
import Sidebar from "@/components/Sidebar";
import {Pet,PetKind} from "@/components/Pet";
import PetPicker from "@/components/PetPicker";

export default function Home(){
  const router=useRouter();
  const [task,setTask]=useState("");
  const [pet,setPet]=useState<PetKind>("sprout");
  const [loading,setLoading]=useState(false);

  function build(){
    if(!task.trim()) return;
    setLoading(true);
    setTimeout(()=>router.push("/focus/plan"),500);
  }

  return <div className="shell">
    <Sidebar/>
    <main className="dashboard">
      <header className="topbar">
        <div className="greeting"><span className="sun">☼</span><div><h1>Good afternoon, Feiyang</h1><p>Same effort. A clearer path.</p></div></div>
        <div className="top-actions"><div className="search">⌕ <span>Search anything...</span><kbd>⌘ K</kbd></div><button>♢</button><div className="avatar">F</div></div>
      </header>

      <div className="dashboard-grid">
        <section className="main-col">
          <div className="card ask-card">
            <div className="card-title-row">
              <div><p className="eyebrow">ASK CORTEX</p><h2>What do you need to get done?</h2></div>
              <span className="ai-chip">✦ CORTEX AI</span>
            </div>
            <textarea value={task} onChange={e=>setTask(e.target.value)} placeholder="Describe your task, deadline, or what you're stuck on..."/>
            <div className="ask-actions">
              <div><button>⌕ File</button><button>♩ Voice</button><button>✦ Examples</button></div>
              <button className="gold-button" disabled={!task.trim()||loading} onClick={build}>{loading?"Breaking it down...":"Build focus plan →"}</button>
            </div>
            <div className="quick-prompts">
              <button onClick={()=>setTask("I need to understand a difficult research paper before my research meeting tomorrow, but I don't know the terminology or where to start.")}>Understand a difficult research paper</button>
              <button onClick={()=>setTask("Help me prepare for my PHYS 201 problem set")}>Prepare for PHYS 201</button>
              <button onClick={()=>setTask("Plan my week")}>Plan my week</button>
            </div>
          </div>

          <div className="card today-card">
            <div className="simple-head"><h2>▣ Today <small>Sep 12, 2026</small></h2><button>View calendar →</button></div>
            {[
              ["9:25 AM","MATH 220","Honors ODE","cyan"],
              ["11:00 AM","PHYS 201","Problem set block","purple"],
              ["2:00 PM","RCELL 100","Engineering leadership","gold"],
              ["4:00 PM","Gym","Reset","green"]
            ].map(([t,a,b,c])=><div className="schedule-row" key={t}><span>{t}</span><i className={`dot ${c}`}/><div><strong>{a}</strong><p>{b}</p></div></div>)}
            <div className="quote-line"><span>“Progress is a series of small steps.”</span><span>— Cortex</span></div>
          </div>
        </section>

        <aside className="right-col">
          <div className="card momentum-card">
            <div className="simple-head"><div><p className="eyebrow gold">▥ MOMENTUM</p><h3>This week</h3></div><span className="level-chip">Level 3</span></div>
            <div className="momentum-main"><div className="speech">You&apos;re doing great!<br/>One step at a time. ✦</div><Pet kind={pet}/></div>
            <div className="xp-label"><span>320 XP</span><span>500 XP</span></div><div className="xp-bar"><span/></div>
            <div className="picker-title">Choose your companion <span>See all →</span></div>
            <PetPicker selected={pet} onSelect={setPet}/>
          </div>

          <div className="card files-card">
            <div className="simple-head"><h3>▱ Recent Files</h3><button>View all →</button></div>
            {[
              ["PDF","Acosta_LHC_slides.pdf","Today, 10:24 AM"],
              ["DOC","ODE_notes.docx","Yesterday, 8:17 PM"],
              ["PDF","Neuro_2026_paper.pdf","Sep 9, 2026"]
            ].map(([t,n,d])=><div className="file-row" key={n}><span className={`file-icon ${t.toLowerCase()}`}>{t}</span><div><strong>{n}</strong><small>{d}</small></div><span>⋮</span></div>)}
          </div>

          <div className="card quote-card"><b>“</b><p>You don&apos;t need more willpower.<br/>You need fewer decisions.</p><small>— Cortex</small></div>
        </aside>
      </div>
    </main>
  </div>
}
