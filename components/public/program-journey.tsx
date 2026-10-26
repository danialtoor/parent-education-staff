'use client';

import {useEffect,useRef,useState} from 'react';
import type {CSSProperties, ReactNode} from 'react';
import {
  CalendarCheck, Check, CornerDownLeft, ExternalLink, Landmark, LockKeyhole,
  LockKeyholeOpen, Mail, MessagesSquare, Monitor, Pause, PencilLine, Play,
  Pointer, ReceiptText, RotateCcw, Scale, ListVideo, Maximize, Minimize, X,
} from 'lucide-react';

import {STEPS, TOTAL, locate, stepsFor, stepStart, translate, type JourneyLanguage} from '@/lib/journey-content';
import {useJourneyPlayback} from './use-journey-playback';
const SAMPLE_CODE = 'SAMPLE-1234';
/** Decorative pointer motion is time-based so scrubbing works in either direction. */
function gestureStyle(local:number, kind:'entry'|'booking', reduced:boolean):CSSProperties {
  const start = kind === 'entry' ? .3 : 1.1;
  const enter = kind === 'entry' ? .4 : .45;
  const tap = kind === 'entry' ? .8 : 1.7;
  const exit = kind === 'entry' ? 1.1 : 2.2;
  if (reduced || local < start || local >= exit + .35) return {opacity:0};
  if (local < start + enter) {
    const p = 1 - Math.pow(1 - (local - start) / enter, 3);
    return {opacity:p, transform:`translate(${20 * (1-p)}px,${18 * (1-p)}px)`};
  }
  if (local >= exit) {
    const p = Math.pow((local - exit) / .35, 2);
    return {opacity:1-p, transform:`translate(${16*p}px,${3+17*p}px)`};
  }
  const y = local < tap ? 0 : 3 * Math.min(1, (local-tap)/.14);
  return {opacity:1, transform:`translate(0,${y}px)`};
}

function Location({children}:{children:ReactNode}) { return <div className="location">{children}</div>; }

function JourneyScene({index, local, reduced, language}:{index:number; local:number; reduced:boolean; language:JourneyLanguage}) {
  const t=(text:string)=>translate(language,text);
  const eased = reduced ? 1 : 1 - Math.pow(1 - Math.min(1,local/.5), 3);
  const entrance:CSSProperties = {transform:`translateY(${(1-eased)*18}px)`, opacity:.45+.55*eased};
  switch (index) {
    case 0: {
      const signedIn = local >= 4;
      return <><Location><Landmark/>KiDs1st</Location>
        <div className="account-paper paper object" style={entrance}>
          <div className="paper-label">{t('Your account')}</div><div className="paper-title">{signedIn?t('Then sign in'):t('Find your case')}</div>
          <div className="account-fields">
            <div className="account-field"><span>{signedIn?t('Email'):t('Case number')}</span><strong>{signedIn?'alex@example.com':'2026-D-0123'}</strong></div>
            <div className="account-field"><span>{signedIn?t('Password'):t('Last name')}</span><strong>{signedIn?'••••••••':'Rivera'}</strong></div>
          </div>
          <div className="confirmation"><Check/>{signedIn?t('You’re signed in'):t('Create your account')}</div>
        </div></>;
    }
    case 1:
      return <><Location><ExternalLink/>UpToParents</Location>
        <div className="activity-row object" style={entrance}>
          {[t('Watch'),t('Reflect'),t('Write')].map((label,i)=><div key={label} className={`activity-sheet paper${local>(i+1)*1.8?' done':''}${local>=i*1.8&&local<(i+1)*1.8?' current':''}`}>
            <div className="activity-stamp"><Check/></div>
            <div className="activity-art">{i===0?<div className="video-art"><Play/></div>:i===1?<MessagesSquare/>:<div className="writing-art"><PencilLine/></div>}</div>
            <div className="activity-name">{t(label)}</div>
          </div>)}
        </div><div className="stage-note">{t('Complete the activities at your own pace.')}</div></>;
    case 2:
      return <><Location><ExternalLink/>UpToParents</Location>
        <div className="certificate paper object" style={entrance}><div className="paper-label">UpToParents</div><div className="paper-title">{t('Activities completed')}</div><div className="code-label">{t('Completion code')}</div><div className="sample-code">{SAMPLE_CODE}</div><div className="sample-caption">{t('Example code')}</div></div>
        <div className="code-sources"><span><Monitor/>{t('Shown on UpToParents')}</span><span><Mail/>{t('Also on your emailed certificate')}</span></div></>;
    case 3: {
      const unlocked = local >= 5.5;
      const typed = Math.max(0, Math.min(SAMPLE_CODE.length, Math.floor((local-1.3)*2.8)));
      return <><Location><CornerDownLeft/>{t('Back at KiDs1st')}</Location>
        <div className="return-layout object" style={entrance}>
          <div className="saved-code paper"><div><div className="source-name">{t('Your UpToParents code')}</div><div className="code-label">{t('Keep it beside you')}</div></div><div className="sample-code">{SAMPLE_CODE}</div></div>
          <div className="entry-paper paper"><div className="paper-label">KiDs1st</div><div className="paper-title">{t('Enter your code')}</div>
            <div className={`code-field${unlocked?' is-accepted':local>=.8?' is-focused':''}`}><span className="typed">{SAMPLE_CODE.slice(0,typed)}</span>{!unlocked&&<span className="caret" style={{opacity:reduced?1:Math.floor(local*2)%2}}/>}</div>
            <div className={`lock-state${unlocked?' accepted':''}`}>{unlocked?<LockKeyholeOpen/>:<LockKeyhole/>}<span>{unlocked?t('Code accepted · test unlocked'):t('Test locked')}</span></div>
            <div className="gesture entry-gesture" style={gestureStyle(local,'entry',reduced)}><Pointer/></div>
          </div>
        </div></>;
    }
    case 4:
      return <><Location><Landmark/>KiDs1st</Location><div className="test-paper paper object" style={entrance}>
        {local>=3.7?<div className="pass-result"><div className="seal"><Check/></div><div className="paper-title">{t('Test passed')}</div><div className="result-note">{t('Seminar signup is now available.')}</div></div>:<>
          <div className="paper-label">{t('Knowledge check')}</div><div className="paper-title">{t('True or false?')}</div><div className="question-hint">{t('Choose one answer for each question.')}</div>
          <div className="answer-options"><div className={`answer${local>=1.4?' selected':''}`}><span className="answer-dot"/>{t('True')}</div><div className="answer"><span className="answer-dot"/>{t('False')}</div></div>
          <div className="format-note">{t('Illustration of the test format')}</div>
        </>}
      </div></>;
    case 5:
      return <><Location><Landmark/>KiDs1st</Location><div className="booking-layout object" style={entrance}>
        <div className="calendar paper"><div className="calendar-head">{t('Example calendar')}</div><div className="weekdays">{(language==='es'?['L','M','X','J','V','S','D']:['M','T','W','T','F','S','S']).map((day,i)=><span key={i}>{day}</span>)}</div>
          <div className="dates">{Array.from({length:28},(_,i)=><span key={i} className={i===13?`chosen${local>=2.3?' is-selected':''}`:undefined}>{i+1}</span>)}</div>
          <div className="gesture booking-gesture" style={gestureStyle(local,'booking',reduced)}><Pointer/></div>
        </div>
        <div className="reservation"><div className="reservation-icon"><CalendarCheck/></div><div className="reservation-title">{t('Your seminar')}</div><div className="reservation-copy">{t('Choose an available session.')}</div><div className="reservation-confirmation" hidden={local<2.3}><Check/>{t('Place reserved')}</div></div>
      </div></>;
    case 6:
      return <><Location>{t('A program requirement')}</Location><div className="fee-paper paper object" style={entrance}>
        <div className="fee-top"><div><div className="paper-label">{t('Fee reminder')}</div><div className="paper-title">{t('Program fee')}</div></div><ReceiptText/></div><div className="fee-amount">$90</div><div className="waiver"><Scale/><span>{t('Not required if waived by the judge.')}</span></div>
      </div></>;
    case 7:
      return <><Location>{t('Your scheduled seminar')}</Location><div className="attendance-paper paper object" style={entrance}>
        <div className="attendance-objects"><div className="session-icon"><CalendarCheck/></div><div className="object-connector"/><div className="discussion-icon"><MessagesSquare/></div></div><div className="paper-title">{t('Learn and reflect together')}</div><div className={`attendance-status${local>=3.1?' attended':''}`}>{local>=3.1?t('Seminar attended'):t('Place reserved · attendance still required')}</div>
      </div></>;
    default:
      return <><Location><Landmark/>KiDs1st</Location><div className="completion-paper paper object" style={entrance}>
        <div className="completion-heading"><div className="seal"><Check/></div><div className="paper-title">{t('Program requirements completed')}</div></div>
        <div className="requirements">{[t('UpToParents activities'),t('Test passed'),t('Seminar attended'),t('Fee paid or judge’s waiver')].map(label=><div className="requirement" key={label}><Check/>{t(label)}</div>)}</div>
      </div></>;
  }
}

const clockTime=(seconds:number)=>`${Math.floor(seconds/60)}:${Math.floor(seconds%60).toString().padStart(2,'0')}`;

export function ProgramJourney() {
  const player=useJourneyPlayback();
  const [transcriptOpen,setTranscriptOpen]=useState(false),[chaptersOpen,setChaptersOpen]=useState(false);
  const [fullscreen,setFullscreen]=useState(false),[expanded,setExpanded]=useState(false);
  const frameRef=useRef<HTMLDivElement>(null),chapterRef=useRef<HTMLDivElement>(null),chapterButtonRef=useRef<HTMLButtonElement>(null);
  const resumeAfterScrub=useRef(false);
  const {elapsed,playing,hasStarted,language,reduced}=player;
  const {index,local}=locate(elapsed),steps=stepsFor(language),ended=elapsed>=TOTAL;
  const t=(text:string)=>translate(language,text);
  const isFullscreen=fullscreen||expanded;

  useEffect(()=>{
    const changed=()=>setFullscreen(document.fullscreenElement===frameRef.current);
    document.addEventListener('fullscreenchange',changed);
    return ()=>document.removeEventListener('fullscreenchange',changed);
  },[]);
  useEffect(()=>{
    if(!expanded)return;
    const previous=document.body.style.overflow,previousFocus=document.activeElement as HTMLElement|null;document.body.style.overflow='hidden';
    const controls=()=>Array.from(frameRef.current?.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled)')??[]).filter(element=>element.getClientRects().length);
    frameRef.current?.querySelector<HTMLElement>('.fullscreen-button')?.focus();
    const escape=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){setExpanded(false);return;}
      if(event.key==='Tab'){const items=controls(),first=items[0],last=items.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last?.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first?.focus();}}
    };
    document.addEventListener('keydown',escape);
    return ()=>{document.body.style.overflow=previous;document.removeEventListener('keydown',escape);previousFocus?.focus();};
  },[expanded]);
  useEffect(()=>{
    if(!chaptersOpen)return;
    chapterRef.current?.querySelector<HTMLElement>('[aria-current=step]')?.focus();
    const outside=(event:PointerEvent)=>{if(!chapterRef.current?.contains(event.target as Node)&&!chapterButtonRef.current?.contains(event.target as Node))setChaptersOpen(false);};
    const escape=(event:KeyboardEvent)=>{if(event.key==='Escape'){setChaptersOpen(false);chapterButtonRef.current?.focus();}};
    document.addEventListener('pointerdown',outside);document.addEventListener('keydown',escape);
    return ()=>{document.removeEventListener('pointerdown',outside);document.removeEventListener('keydown',escape);};
  },[chaptersOpen]);
  async function toggleFullscreen(){
    if(expanded){setExpanded(false);return;}
    if(document.fullscreenElement===frameRef.current){await document.exitFullscreen();return;}
    try{if(!frameRef.current?.requestFullscreen)throw new Error('unsupported');await frameRef.current.requestFullscreen();}
    catch{setExpanded(true);}
  }
  function chooseChapter(chapter:number){player.seek(stepStart(chapter));player.start();setChaptersOpen(false);chapterButtonRef.current?.focus();}
  function playOrPause(){setChaptersOpen(false);player.togglePlay();}

  return <section id="program-objects" lang={language} aria-labelledby="program-overview" data-playing={playing}>
    <header className="intro"><div className="intro-topline"><p className="eyebrow">{t('What to expect')}</p><label className="language-choice"><span>{t('Language')}</span><select aria-label="Overview language / Idioma del recorrido" value={language} onChange={e=>player.setLanguage(e.target.value as JourneyLanguage)}><option value="en">English</option><option value="es">Español</option></select></label></div><h2 id="program-overview">{t('Your path through the program')}</h2><p>{t('Once you register, we’ll guide you through each step.')}</p></header>
    <div className={`video-player${expanded?' is-expanded':''}`} ref={frameRef} role={expanded?'dialog':undefined} aria-modal={expanded?true:undefined} aria-label={expanded?t('Program overview'):undefined}>
      <div className="video-screen">
        <div className="video-visual">
          <div className={`stage${!hasStarted?' is-poster':''}`} aria-hidden="true"><div className="scene active" data-scene={hasStarted?index:1}><JourneyScene index={hasStarted?index:1} local={hasStarted?local:1} reduced={reduced||!playing} language={language}/></div></div>
          <button className={`screen-toggle${!hasStarted||ended?' is-visible':''}${!hasStarted?' is-poster':''}`} type="button" aria-label={t(!hasStarted?'Watch overview':ended?'Watch again':playing?'Pause':'Play')} onClick={playOrPause}>
            <span className="center-play">{ended?<RotateCcw aria-hidden="true"/>:playing?<Pause aria-hidden="true"/>:<Play aria-hidden="true"/>}</span>
            {!hasStarted&&<span className="poster-label">{t('Watch the overview')}<small>{t('1 minute · 9 steps')}</small></span>}
          </button>
        </div>
        <div className="caption">
          {!hasStarted?<div><div className="counter">KiDs1st · {t('Program overview')}</div><h3>{t('Your program, step by step')}</h3><p>{t('See what to expect, from registration to program completion.')}</p></div>:steps.map((item,i)=><div className={`caption-panel${i===index?' active':''}`} aria-hidden={i!==index} key={i}><div className="counter">{i+1} {t('of')} {STEPS.length} · {item.label}</div><h3>{item.title}</h3><p>{item.copy}</p></div>)}
        </div>
      </div>
      <div className="video-controls" role="group" aria-label={t('Video controls')}>
        <div className="video-timeline">
          <div className="chapter-track" aria-hidden="true">{STEPS.map((step,i)=><span className="chapter-segment" key={i} style={{flex:step.duration}}><span style={{width:`${Math.max(0,Math.min(1,(elapsed-stepStart(i))/step.duration))*100}%`}}/></span>)}</div>
          <label className="sr" htmlFor="po-seek">{t('Tour position')}</label><input id="po-seek" type="range" min={0} max={TOTAL} step={.1} value={elapsed} aria-valuetext={`${clockTime(elapsed)} / ${clockTime(TOTAL)} · ${index+1} ${t('of')} ${STEPS.length}: ${steps[index].title}`} onPointerDown={event=>{resumeAfterScrub.current=playing;player.pause();event.currentTarget.setPointerCapture(event.pointerId);}} onPointerUp={()=>{if(resumeAfterScrub.current)player.start();resumeAfterScrub.current=false;}} onPointerCancel={()=>{resumeAfterScrub.current=false;}} onKeyDown={player.pause} onChange={event=>player.seek(Number(event.currentTarget.value))}/>
        </div>
        <div className="video-toolbar">
          <button className="video-icon-button" type="button" aria-label={t(ended?'Replay':playing?'Pause':'Play')} title={t(ended?'Replay':playing?'Pause':'Play')} onClick={playOrPause}>{ended?<RotateCcw aria-hidden="true"/>:playing?<Pause aria-hidden="true"/>:<Play aria-hidden="true"/>}</button>
          <span className="video-time" aria-hidden="true">{clockTime(elapsed)} <span>/ {clockTime(TOTAL)}</span></span>
          <button className="chapter-trigger" type="button" ref={chapterButtonRef} aria-label={t('Chapters')} aria-expanded={chaptersOpen} aria-controls="journey-chapters" onClick={()=>{if(!chaptersOpen)player.pause();setChaptersOpen(!chaptersOpen);}}><ListVideo aria-hidden="true"/><span>{t('Chapters')}</span><span className="chapter-count">{index+1}/{STEPS.length}</span></button>
          <button className="video-icon-button fullscreen-button" type="button" aria-label={t(isFullscreen?'Exit full screen':'Full screen')} title={t(isFullscreen?'Exit full screen':'Full screen')} onClick={toggleFullscreen}>{isFullscreen?<Minimize aria-hidden="true"/>:<Maximize aria-hidden="true"/>}</button>
        </div>
        {chaptersOpen&&<div className="chapter-menu" ref={chapterRef} id="journey-chapters" role="region" aria-label={t('Video chapters')}><div className="chapter-menu-heading"><strong>{t('Jump to a step')}</strong><button type="button" aria-label={t('Close chapters')} onClick={()=>{setChaptersOpen(false);chapterButtonRef.current?.focus();}}><X aria-hidden="true"/></button></div><ol>{steps.map((step,i)=><li key={step.title}><button type="button" aria-current={i===index?'step':undefined} onClick={()=>chooseChapter(i)}><span className="chapter-number">{i+1}</span><span>{step.title}</span><time>{clockTime(stepStart(i))}</time></button></li>)}</ol></div>}
      </div>
      <span className="sr" role="status">{ended?t('Tour finished'):''}</span>
    </div>
    <details className="transcript" open={transcriptOpen||reduced} onToggle={event=>setTranscriptOpen(event.currentTarget.open)}><summary onClick={player.pause}>{t('Read the steps')}</summary><ol>{steps.map(step=><li key={step.title}><strong>{step.title}.</strong> {step.copy}</li>)}</ol><p>{t('If your case is not found when registering, email the program office for help.')}</p></details>
  </section>;
}
