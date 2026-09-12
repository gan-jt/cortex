"use client";
import {useRouter} from "next/navigation";
import Sidebar from "@/components/Sidebar";

const phases = [
  {
    title:"Orient yourself",
    subtitle:"Understand only what the paper is trying to do.",
    time:"8 min",
    steps:[
      ["1.1","Open only the abstract","Do not read the introduction yet.","USER"],
      ["1.2","Highlight the problem statement","Find one sentence describing the problem.","USER"],
      ["1.3","Write the research question in your own words","One sentence only.","TOGETHER"],
      ["1.4","Find the paper's claimed result","Ignore technical details for now.","USER"]
    ]
  },
  {
    title:"Build the minimum vocabulary",
    subtitle:"Learn only terms that block the next step.",
    time:"12 min",
    steps:[
      ["2.1","List unfamiliar terms from the abstract","Maximum 5 terms.","USER"],
      ["2.2","Ask Cortex for one-line definitions","No deep dive yet.","CORTEX"],
      ["2.3","Mark the 2 terms that are truly essential","Everything else can wait.","TOGETHER"],
      ["2.4","Re-read the abstract once","Check whether it now makes more sense.","USER"]
    ]
  },
  {
    title:"Decode one figure",
    subtitle:"Use one visual to anchor your understanding.",
    time:"15 min",
    steps:[
      ["3.1","Open Figure 1 only","Ignore all other figures.","USER"],
      ["3.2","Read the caption without the main text","Identify input, output, and comparison.","USER"],
      ["3.3","Ask Cortex what each axis means","Keep the explanation concrete.","CORTEX"],
      ["3.4","Say the figure's message in one sentence","If you can't, shrink this step further.","TOGETHER"]
    ]
  },
  {
    title:"Connect the story",
    subtitle:"Now connect question → method → result.",
    time:"18 min",
    steps:[
      ["4.1","Read only the first paragraph of Introduction","Look for motivation, not details.","USER"],
      ["4.2","Skim the Methods section headings","Do not read every paragraph.","USER"],
      ["4.3","Write a 3-line paper map","Problem → Method → Main result.","TOGETHER"],
      ["4.4","Identify the one section you still don't understand","That becomes the next focus block.","USER"]
    ]
  }
];

export default function PlanPage(){
  const router=useRouter();
  return <div className="shell">
    <Sidebar/>
    <main className="plan-page">
      <header className="plan-header">
        <div><p className="eyebrow gold">CORTEX PLAN</p><h1>Let&apos;s make this paper feel small.</h1><p>Your task has been reduced to one tiny action at a time.</p></div>
        <button className="ghost-button" onClick={()=>router.push("/")}>← Back</button>
      </header>

      <section className="goal-card">
        <div><span className="goal-kicker">YOUR GOAL</span><h2>Understand a difficult research paper before tomorrow&apos;s meeting.</h2></div>
        <div className="goal-meta"><span>53 min total</span><span>16 micro-steps</span><span>No multitasking</span></div>
      </section>

      <div className="plan-grid">
        <section className="plan-main">
          <div className="first-action card">
            <div className="first-action-number">01</div>
            <div>
              <p className="eyebrow gold">START HERE · 3 MIN</p>
              <h2>Open the paper and read only the abstract.</h2>
              <p>Do not take notes yet. Your only job is to reach the end of the abstract.</p>
            </div>
            <button className="gold-button" onClick={()=>router.push("/focus")}>Start this step →</button>
          </div>

          <div className="micro-plan">
            {phases.map((phase,idx)=><section className="phase-card card" key={phase.title}>
              <div className="phase-head">
                <div className="phase-number">{String(idx+1).padStart(2,"0")}</div>
                <div><h3>{phase.title}</h3><p>{phase.subtitle}</p></div>
                <span>{phase.time}</span>
              </div>
              <div className="micro-steps">
                {phase.steps.map(([num,title,sub,owner],i)=><div className={`micro-step ${idx===0&&i===0?"current":""}`} key={num}>
                  <div className="micro-index">{num}</div>
                  <div className="micro-copy"><span className={`owner owner-${owner.toLowerCase()}`}>{owner}</span><strong>{title}</strong><small>{sub}</small></div>
                  <span className="lock">{idx===0&&i===0?"NOW":"LOCKED"}</span>
                </div>)}
              </div>
            </section>)}
          </div>
        </section>

        <aside className="plan-side">
          <div className="card plan-rule">
            <p className="eyebrow">CORTEX RULE</p>
            <h3>You never need to know the whole plan.</h3>
            <p>Only the current micro-step is actionable. Everything else stays visually quiet until you finish.</p>
          </div>

          <div className="card reduction-card">
            <p className="eyebrow gold">TASK REDUCTION</p>
            <div className="reduction-big">“Understand this paper”</div>
            <div className="arrow">↓</div>
            <div className="reduction-small">“Read 1 abstract.”</div>
            <div className="reduction-small">“Find 1 question.”</div>
            <div className="reduction-small">“Define 2 terms.”</div>
            <div className="reduction-small">“Decode 1 figure.”</div>
          </div>

          <div className="card stuck-card">
            <h3>I&apos;m stuck</h3>
            <p>Cortex will split the current step again instead of letting you skip it.</p>
            <button onClick={()=>alert("Example: 'Read the abstract' → 'Read only the first two sentences.'")}>Show me a smaller step</button>
          </div>
        </aside>
      </div>
    </main>
  </div>
}
