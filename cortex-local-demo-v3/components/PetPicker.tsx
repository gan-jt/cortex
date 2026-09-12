"use client";
import {Pet,PetKind,petData} from "./Pet";

export default function PetPicker({selected,onSelect}:{selected:PetKind,onSelect:(p:PetKind)=>void}){
  return <div className="pet-picker">
    {(Object.keys(petData) as PetKind[]).map(k=>
      <button key={k} className={selected===k?"selected":""} onClick={()=>onSelect(k)}>
        <Pet kind={k} small/>
        <strong>{petData[k].name}</strong>
        <span>{petData[k].mood}</span>
      </button>
    )}
  </div>
}
