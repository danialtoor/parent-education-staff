'use client';
import {useEffect,useRef,useState} from 'react';
import {locate,TOTAL,stepStart,type JourneyLanguage} from '@/lib/journey-content';

export function useJourneyPlayback(){
  const [elapsed,setElapsed]=useState(0),[playing,setPlaying]=useState(false),[hasStarted,setHasStarted]=useState(false);
  const [language,setLanguage]=useState<JourneyLanguage>('en'),[reduced,setReduced]=useState(false);
  const machine=useRef({position:0,playing:false});

  function updatePosition(position:number){machine.current.position=position;setElapsed(position);}
  function pause(){machine.current.playing=false;setPlaying(false);}
  function seek(time:number){setHasStarted(true);pause();updatePosition(Math.max(0,Math.min(TOTAL,time)));}
  function start(restart=false){
    const m=machine.current;setHasStarted(true);
    if(restart||m.position>=TOTAL)updatePosition(0);
    m.playing=true;setPlaying(true);
  }

  useEffect(()=>{
    const m=machine.current;
    const preference=matchMedia('(prefers-reduced-motion: reduce)');
    const syncPreference=()=>{
      setReduced(preference.matches);
      if(preference.matches){m.playing=false;setPlaying(false);}
    };
    syncPreference();preference.addEventListener('change',syncPreference);
    let frame=0,previous=0,lastPaint=0;
    function tick(now:number){
      const delta=previous?Math.min((now-previous)/1000,.1):0;previous=now;
      if(m.playing&&!document.hidden){
        m.position=Math.min(TOTAL,m.position+delta);
        if(m.position>=TOTAL){m.playing=false;setPlaying(false);}
        if(now-lastPaint>=1000/30||!m.playing){setElapsed(m.position);lastPaint=now;}
      }
      frame=requestAnimationFrame(tick);
    }
    const visibility=()=>{previous=0;};
    document.addEventListener('visibilitychange',visibility);frame=requestAnimationFrame(tick);
    return ()=>{cancelAnimationFrame(frame);preference.removeEventListener('change',syncPreference);document.removeEventListener('visibilitychange',visibility);};
  },[]);
  return {elapsed,playing,hasStarted,language,reduced,pause,seek,start,
    togglePlay:()=>machine.current.playing?pause():start(),
    setLanguage:(lang:JourneyLanguage)=>{pause();updatePosition(stepStart(locate(machine.current.position).index));setLanguage(lang);},
  };
}
