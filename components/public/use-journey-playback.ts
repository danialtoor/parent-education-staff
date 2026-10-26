'use client';
import {useEffect,useRef,useState} from 'react';
import {locate,TOTAL,stepStart,type JourneyLanguage} from '@/lib/journey-content';

export function useJourneyPlayback(){
  const [elapsed,setElapsed]=useState(0),[playing,setPlaying]=useState(false);
  const [language,setLanguage]=useState<JourneyLanguage>('en'),[reduced,setReduced]=useState(false);
  const stageRef=useRef<HTMLDivElement>(null);
  const machine=useRef({position:0,playing:false,started:false,visible:false});

  function updatePosition(position:number){machine.current.position=position;setElapsed(position);}
  function pause(){machine.current.started=true;machine.current.playing=false;setPlaying(false);}
  function seek(time:number){pause();updatePosition(Math.max(0,Math.min(TOTAL,time)));}
  function start(restart=false){
    const m=machine.current;m.started=true;
    if(restart||m.position>=TOTAL)updatePosition(0);
    m.playing=true;setPlaying(true);
  }

  useEffect(()=>{
    const m=machine.current;
    const preference=matchMedia('(prefers-reduced-motion: reduce)');
    const syncPreference=()=>{
      setReduced(preference.matches);
      if(preference.matches){m.started=true;m.playing=false;setPlaying(false);}
    };
    syncPreference();preference.addEventListener('change',syncPreference);
    const observer=new IntersectionObserver(([entry])=>{
      m.visible=entry.isIntersecting&&entry.intersectionRatio>=.2;
      if(m.visible&&!m.started&&!preference.matches){m.started=true;m.playing=true;setPlaying(true);}
    },{threshold:[0,.2]});
    if(stageRef.current)observer.observe(stageRef.current);
    let frame=0,previous=0,lastPaint=0;
    function tick(now:number){
      const delta=previous?Math.min((now-previous)/1000,.1):0;previous=now;
      if(m.playing&&!document.hidden&&m.visible){
        m.position=Math.min(TOTAL,m.position+delta);
        if(m.position>=TOTAL){m.playing=false;setPlaying(false);}
        if(now-lastPaint>=1000/30||!m.playing){setElapsed(m.position);lastPaint=now;}
      }
      frame=requestAnimationFrame(tick);
    }
    const visibility=()=>{previous=0;};
    document.addEventListener('visibilitychange',visibility);frame=requestAnimationFrame(tick);
    return ()=>{cancelAnimationFrame(frame);observer.disconnect();preference.removeEventListener('change',syncPreference);document.removeEventListener('visibilitychange',visibility);};
  },[]);
  return {elapsed,playing,language,reduced,stageRef,pause,seek,start,
    togglePlay:()=>machine.current.playing?pause():start(),
    setLanguage:(lang:JourneyLanguage)=>{seek(stepStart(locate(machine.current.position).index));setLanguage(lang);},
  };
}
