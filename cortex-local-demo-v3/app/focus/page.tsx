"use client";
import {useEffect,useState} from "react";
import Sidebar from "@/components/Sidebar";
import {Pet,PetKind} from "@/components/Pet";
import PetPicker from "@/components/PetPicker";

export default function Focus(){
  const [seconds,setSeconds]=useState(3*60);
  const [running,setRunning]=useState(false);
  const [pet,setPet]=useState<PetKind>("sprout");
  useEffect(()=>{
    if(!running) return;
    const id=setInterval(()=>setSeconds(s=>{if(s<=1){setRunning(false);return 0} return s-1}),1000);
    return ()=>clearInterval(id);
  },[running]);
  const mm=String(Math.floor(seconds/60)).padStart(2,"0");
  const ss=String(seconds%60).padStart(2,"0");

  return <div className="shell focus-shell">
    <Sidebar/>
    <main className="focus-page">
      <header className="focus-topbar">
        <div className="focus-quote-top">“A calmer mind<br/><b>builds a brighter you.</b>”<small>— Cortex</small></div>
        <div className="focus-top-actions"><span>🌿 Focus better together.</span><button>♫</button><button>≋</button><button>⚙</button><div className="avatar">F</div></div>
      </header>

      <div className="focus-layout">
        <section className="focus-stage">
          <p className="focus-mode-label">FOCUS MODE</p>
          <h1>One tiny step. Nothing else.</h1>
          <p className="focus-sub">Read only the abstract. Don&apos;t take notes yet.</p>

          <div className="current-micro-step">
            <span>STEP 1.1</span>
            <strong>Open the paper and read only the abstract.</strong>
            <small>Everything else is locked until this is complete.</small>
          </div>

          <div className="timer-ring">
            <div className="timer-inner">
              <span>🌿</span><small>Deep Focus</small><strong>{mm}:{ss}</strong>
              <button className="gold-button" onClick={()=>setRunning(!running)}>{running?"Ⅱ Pause":"▶ Start"}</button>
            </div>
          </div>

          <div className="focus-buttons">
            <button className="complete-button" onClick={()=>alert("Step complete — next micro-step unlocked.")}>✓ I finished this step</button>
            <button className="ghost-button" onClick={()=>alert("Smaller: read only the first two sentences of the abstract.")}>I&apos;m stuck</button>
          </div>

          <div className="desk-scene">
            <Pet kind={pet}/>
            <div className="books"><span>Better Focus</span><span>Brighter Ideas</span><span>A Calmer You</span></div>
            <div className="mug"><img src="/cortex-logo.png" alt=""/></div>
            <div className="notebook">Same effort.<br/>A clearer path.</div>
          </div>
        </section>

        <aside className="focus-side">
          <div className="card locked-plan">
            <div className="simple-head"><h3>Micro-plan</h3><span>1 / 16</span></div>
            {[
              ["1.1","Read only the abstract","NOW"],
              ["1.2","Highlight the problem statement","LOCKED"],
              ["1.3","Write the research question","LOCKED"],
              ["1.4","Find the claimed result","LOCKED"],
              ["2.1","List unfamiliar terms","LOCKED"]
            ].map(([n,t,s],i)=><div className={`locked-step ${i===0?"active":""}`} key={n}><span>{n}</span><div>{t}</div><small>{s}</small></div>)}
            <a href="/focus/plan" className="view-full-plan">View full breakdown →</a>
          </div>

          <div className="card companion-card">
            <div className="simple-head"><div><p className="eyebrow">COMPANION</p><h3>Sprout</h3></div><span className="level-chip">Level 3</span></div>
            <div className="companion-main"><Pet kind={pet}/><div><p>🌿 Focus streak<br/><strong>3 days</strong></p><p>You&apos;re doing great!<br/>One step at a time. ✦</p></div></div>
            <div className="xp-label"><span>320 XP</span><span>500 XP</span></div><div className="xp-bar"><span/></div>
            <PetPicker selected={pet} onSelect={setPet}/>
          </div>
        </aside>
      </div>
    </main>
  </div>
}
