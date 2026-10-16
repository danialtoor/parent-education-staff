'use client';
import {useEffect,useRef,useState} from 'react';
import {DeviceNarrator} from '@/lib/journey-narrator';
import {locate,narrationText,STEPS,TOTAL,stepStart,type JourneyLanguage} from '@/lib/journey-content';

export function useJourneyPlayback(){
  const [elapsed,setElapsed]=useState(0),[playing,setPlaying]=useState(false),[narrated,setNarrated]=useState(false);
  const [language,setLanguage]=useState<JourneyLanguage>('en'),[voiceURI,setVoiceURI]=useState(''),[rate,setRate]=useState(1);
  const [voices,setVoices]=useState<SpeechSynthesisVoice[]>([]),[supported,setSupported]=useState(true),[reduced,setReduced]=useState(false);
  const [status,setStatus]=useState('');
  const stageRef=useRef<HTMLDivElement>(null),narrator=useRef<DeviceNarrator|null>(null);
  const machine=useRef({position:0,playing:false,narrated:false,started:false,visible:false,voiceDone:true,pendingSpeech:true,language:'en' as JourneyLanguage,voiceURI:'',rate:1});
  const availableVoices=voices.filter(v=>v.lang.toLowerCase().startsWith(language));
  const selectedVoice=availableVoices.find(v=>v.voiceURI===voiceURI)??availableVoices.find(v=>v.lang.toLowerCase()===(language==='en'?'en-us':'es-mx')&&v.localService)??availableVoices.find(v=>v.default)??availableVoices[0];
  const selectedVoiceRef=useRef<SpeechSynthesisVoice|undefined>(undefined);
  useEffect(()=>{selectedVoiceRef.current=selectedVoice;},[selectedVoice]);

  function updatePosition(position:number){machine.current.position=position;setElapsed(position);}
  function updatePlaying(value:boolean){machine.current.playing=value;setPlaying(value);}
  function speakStep(index:number){
    const m=machine.current,voice=selectedVoiceRef.current;
    if(!narrator.current||!voice){updatePlaying(false);setStatus('No voice is available for this language on this device. You can still read the steps.');return;}
    m.voiceDone=false;m.pendingSpeech=false;setStatus('Starting narration…');
    narrator.current.speak({text:narrationText(index,m.language),language:voice.lang,voiceURI:voice.voiceURI,rate:m.rate,
      onStart:()=>setStatus(m.playing?'Reading this step':'Narration paused'),
      onEnd:()=>{m.voiceDone=true;setStatus('');},
      onError:()=>{m.pendingSpeech=true;m.narrated=false;setNarrated(false);updatePlaying(false);setStatus('Narration could not play. Try Listen again, or use the written steps.');}
    });
  }
  function pause(){
    machine.current.started=true;updatePlaying(false);
    if(machine.current.narrated){narrator.current?.pause();setStatus('Narration paused');}
  }
  function seek(time:number){
    pause();narrator.current?.stop();machine.current.pendingSpeech=true;updatePosition(Math.max(0,Math.min(TOTAL,time)));
  }
  function start(restart=false){
    const m=machine.current;m.started=true;
    if(restart||m.position>=TOTAL){narrator.current?.stop();m.pendingSpeech=true;updatePosition(0);}
    updatePlaying(true);
    if(m.narrated){
      if(m.pendingSpeech){const index=locate(m.position).index;updatePosition(stepStart(index));speakStep(index);}
      else {narrator.current?.resume();setStatus(m.voiceDone?'':'Reading this step');}
    }
  }
  function toggleNarration(){
    const m=machine.current;
    if(m.narrated){narrator.current?.stop();m.narrated=false;setNarrated(false);setStatus('');return;}
    m.narrated=true;m.pendingSpeech=true;setNarrated(true);start();
  }
  function configure(nextLanguage:JourneyLanguage,nextVoice:string,nextRate:number){
    seek(stepStart(locate(machine.current.position).index));
    const m=machine.current;m.language=nextLanguage;m.voiceURI=nextVoice;m.rate=nextRate;
    setLanguage(nextLanguage);setVoiceURI(nextVoice);setRate(nextRate);setStatus(m.narrated?'Narration paused':'');
  }
  // Browser events and the clock call the current controls without recreating the clock.
  const actions=useRef({pause,speakStep});
  useEffect(()=>{actions.current={pause,speakStep};});
  useEffect(()=>{
    const m=machine.current;
    if('speechSynthesis' in window && 'SpeechSynthesisUtterance' in window){
      narrator.current=new DeviceNarrator(window.speechSynthesis);
    }else setSupported(false);
    const refreshVoices=()=>setVoices(window.speechSynthesis?.getVoices()??[]);
    refreshVoices();window.speechSynthesis?.addEventListener('voiceschanged',refreshVoices);
    const preference=matchMedia('(prefers-reduced-motion: reduce)');
    const syncPreference=()=>{setReduced(preference.matches);if(preference.matches)actions.current.pause();};
    syncPreference();preference.addEventListener('change',syncPreference);
    const observer=new IntersectionObserver(([entry])=>{
      m.visible=entry.isIntersecting&&entry.intersectionRatio>=.2;
      if(m.visible&&!m.started&&!preference.matches){m.started=true;m.playing=true;setPlaying(true);}
    },{threshold:[0,.2]});
    if(stageRef.current)observer.observe(stageRef.current);
    let frame=0,previous=0,lastPaint=0;
    function tick(now:number){
      const delta=previous?Math.min((now-previous)/1000,.1):0;previous=now;
      if(m.playing&&!document.hidden&&(m.narrated||m.visible)){
        if(m.narrated){
          const {index}=locate(m.position),end=stepStart(index)+STEPS[index].duration;
          m.position=Math.min(end-.01,m.position+delta);
          if(m.position>=end-.01&&m.voiceDone){
            if(index===STEPS.length-1){m.position=TOTAL;m.playing=false;setPlaying(false);setStatus('Tour finished');}
            else {m.position=end;actions.current.speakStep(index+1);}
          }
        }else{
          m.position=Math.min(TOTAL,m.position+delta);
          if(m.position>=TOTAL){m.playing=false;setPlaying(false);setStatus('Tour finished');}
        }
        if(now-lastPaint>=1000/30||!m.playing){setElapsed(m.position);lastPaint=now;}
      }
      frame=requestAnimationFrame(tick);
    }
    const visibility=()=>{previous=0;if(document.hidden&&m.narrated&&m.playing)actions.current.pause();};
    document.addEventListener('visibilitychange',visibility);frame=requestAnimationFrame(tick);
    return ()=>{cancelAnimationFrame(frame);observer.disconnect();narrator.current?.stop();window.speechSynthesis?.removeEventListener('voiceschanged',refreshVoices);preference.removeEventListener('change',syncPreference);document.removeEventListener('visibilitychange',visibility);};
  },[]);
  return {elapsed,playing,narrated,language,rate,voices:availableVoices,selectedVoice,supported,reduced,status,stageRef,pause,seek,start,toggleNarration,
    togglePlay:()=>machine.current.playing?pause():start(),
    setLanguage:(lang:JourneyLanguage)=>configure(lang,'',rate),setVoice:(id:string)=>configure(language,id,rate),setRate:(speed:number)=>configure(language,voiceURI,speed),
  };
}
