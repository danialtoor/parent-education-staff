'use client';

import {useEffect,useRef,useState} from 'react';

export function ProgramJourneyCue(){
  const svgRef=useRef<SVGSVGElement>(null);
  const [aim,setAim]=useState({tipX:195,x:0.15,y:0.989});

  useEffect(()=>{
    const svg=svgRef.current;
    const target=document.querySelector<HTMLElement>('#program-objects .center-play');
    const overview=document.getElementById('program-objects');
    const introduction=svg?.closest('.public-introduction');
    if(!svg||!target||!overview||!introduction)return;
    let frame=0;
    let stopped=false;
    function measure(){
      // Full-screen playback is temporary; keep the cue aimed at the inline player.
      if(stopped||document.fullscreenElement||target!.closest('.is-expanded'))return;
      const drawing=svg!.getBoundingClientRect();
      const play=target!.getBoundingClientRect();
      if(!drawing.width||!drawing.height||!play.width)return;
      const targetX=(play.left+play.width/2-drawing.left)*220/drawing.width;
      const targetY=(play.top+play.height/2-drawing.top)*140/drawing.height;
      const tipX=Math.max(60,Math.min(195,targetX));
      const dx=targetX-tipX;
      const dy=targetY-132;
      const length=Math.hypot(dx,dy);
      if(length<1)return;
      const next={tipX,x:dx/length,y:dy/length};
      setAim(previous=>Math.abs(previous.tipX-next.tipX)<0.05&&Math.abs(previous.x-next.x)<0.001&&Math.abs(previous.y-next.y)<0.001?previous:next);
    }
    function schedule(){if(stopped)return;cancelAnimationFrame(frame);frame=requestAnimationFrame(measure);}
    const observer=new ResizeObserver(schedule);
    observer.observe(svg);
    observer.observe(introduction);
    observer.observe(overview);
    window.addEventListener('resize',schedule);
    document.fonts.ready.then(schedule);
    measure();
    return ()=>{stopped=true;cancelAnimationFrame(frame);observer.disconnect();window.removeEventListener('resize',schedule);};
  },[]);

  const angle=Math.atan2(aim.y,aim.x)*180/Math.PI-90;
  return <div className="public-journey-cue">
    <span className="public-journey-note">Learn more!
      <svg viewBox="0 0 84 16" fill="none" aria-hidden="true" focusable="false">
        <defs><filter id="journey-crayon-grain" x="-10%" y="-40%" width="120%" height="180%" colorInterpolationFilters="sRGB">
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="3" seed="9" result="grain"/>
          <feColorMatrix in="grain" type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 4 0 0 0 -1.25" result="wax"/>
          <feComposite in="SourceGraphic" in2="wax" operator="in"/>
        </filter></defs>
        <g filter="url(#journey-crayon-grain)">
          <path d="M5 8 C21 12 43 3 78 6" strokeWidth="5.8"/>
          <path d="M8 10 C26 12 49 5 76 8" strokeWidth="2.8" opacity=".7"/>
        </g>
      </svg>
    </span>
    <svg ref={svgRef} className="public-journey-squiggle" viewBox="0 0 220 140" fill="none" aria-hidden="true" focusable="false">
      <path d={`M7 27 C58 7 172 1 192 39 C212 78 137 96 108 69 C82 45 108 19 138 38 C169 59 ${aim.tipX-aim.x*44} ${132-aim.y*44} ${aim.tipX} 132`} strokeDasharray="7 8 5 8 9 7"/>
      <path d="M-10 -19 Q-3 -9 0 0 Q5 -10 12 -17" transform={`translate(${aim.tipX} 132) rotate(${angle})`}/>
    </svg>
  </div>;
}
