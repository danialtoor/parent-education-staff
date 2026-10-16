'use client';

import {useEffect, useRef, useState} from 'react';
import type {CSSProperties, ReactNode} from 'react';
import {
  CalendarCheck, Check, CornerDownLeft, ExternalLink, Landmark, LockKeyhole,
  LockKeyholeOpen, Mail, MessagesSquare, Monitor, Pause, PencilLine, Play,
  Pointer, ReceiptText, RotateCcw, Scale,
} from 'lucide-react';

const STEPS = [
  {duration:8, label:'Your account', title:'Register, then sign in', copy:'Register with your case number and last name. Then sign in with your email and password.'},
  {duration:7, label:'UpToParents', title:'Complete the self-paced activities', copy:'KiDs1st sends you to UpToParents for videos, reflection activities, and writing exercises.'},
  {duration:6.5, label:'Your completion code', title:'Keep the code from UpToParents', copy:'Find it on their website or on the certificate they email you. You’ll use it back at KiDs1st.'},
  {duration:8, label:'Back at KiDs1st', title:'Enter your code to unlock the test', copy:'Return to KiDs1st and enter your completion code. The test stays locked until you do.'},
  {duration:6, label:'The test', title:'Take and pass the knowledge check', copy:'Passing the test lets you sign up for your required seminar.'},
  {duration:6, label:'Seminar booking', title:'Reserve your place in a seminar', copy:'Choose an available session. This scheduled seminar is separate from your UpToParents activities.'},
  {duration:6, label:'Program fee', title:'Remember the $90 program fee', copy:'Pay the program fee unless the judge has waived it for you.'},
  {duration:6.5, label:'Your scheduled session', title:'Attend the seminar you booked', copy:'Follow your booking details to join your session. Booking a place and attending are separate steps.'},
  {duration:6, label:'Program completion', title:'Your program requirements, completed', copy:'Your account guides you along the way, so you can focus on one step at a time.'},
] as const;
const TOTAL = STEPS.reduce((sum, step) => sum + step.duration, 0);
const SAMPLE_CODE = 'SAMPLE-1234';
const clock = (time:number) => `${Math.floor(time / 60)}:${String(Math.floor(time % 60)).padStart(2, '0')}`;

function locate(time:number) {
  let start = 0;
  for (let index = 0; index < STEPS.length; index++) {
    if (time < start + STEPS[index].duration || index === STEPS.length - 1) return {index, local:time - start};
    start += STEPS[index].duration;
  }
  return {index:0, local:0};
}

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

function JourneyScene({index, local, reduced}:{index:number; local:number; reduced:boolean}) {
  const eased = reduced ? 1 : 1 - Math.pow(1 - Math.min(1,local/.5), 3);
  const entrance:CSSProperties = {transform:`translateY(${(1-eased)*18}px)`, opacity:.45+.55*eased};
  switch (index) {
    case 0: {
      const signedIn = local >= 4;
      return <><Location><Landmark/>KiDs1st</Location>
        <div className="account-paper paper object" style={entrance}>
          <div className="paper-label">Your account</div><div className="paper-title">{signedIn?'Then sign in':'Find your case'}</div>
          <div className="account-fields">
            <div className="account-field"><span>{signedIn?'Email':'Case number'}</span><strong>{signedIn?'alex@example.com':'2026-D-0123'}</strong></div>
            <div className="account-field"><span>{signedIn?'Password':'Last name'}</span><strong>{signedIn?'••••••••':'Rivera'}</strong></div>
          </div>
          <div className="confirmation"><Check/>{signedIn?'You’re signed in':'Create your account'}</div>
        </div></>;
    }
    case 1:
      return <><Location><ExternalLink/>UpToParents</Location>
        <div className="activity-row object" style={entrance}>
          {['Watch','Reflect','Write'].map((label,i)=><div key={label} className={`activity-sheet paper${local>(i+1)*1.8?' done':''}${local>=i*1.8&&local<(i+1)*1.8?' current':''}`}>
            <div className="activity-stamp"><Check/></div>
            <div className="activity-art">{i===0?<div className="video-art"><Play/></div>:i===1?<MessagesSquare/>:<div className="writing-art"><PencilLine/></div>}</div>
            <div className="activity-name">{label}</div>
          </div>)}
        </div><div className="stage-note">Complete the activities at your own pace.</div></>;
    case 2:
      return <><Location><ExternalLink/>UpToParents</Location>
        <div className="certificate paper object" style={entrance}><div className="paper-label">UpToParents</div><div className="paper-title">Activities completed</div><div className="code-label">Completion code</div><div className="sample-code">{SAMPLE_CODE}</div><div className="sample-caption">Example code</div></div>
        <div className="code-sources"><span><Monitor/>Shown on UpToParents</span><span><Mail/>Also on your emailed certificate</span></div></>;
    case 3: {
      const unlocked = local >= 5.5;
      const typed = Math.max(0, Math.min(SAMPLE_CODE.length, Math.floor((local-1.3)*2.8)));
      return <><Location><CornerDownLeft/>Back at KiDs1st</Location>
        <div className="return-layout object" style={entrance}>
          <div className="saved-code paper"><div><div className="source-name">Your UpToParents code</div><div className="code-label">Keep it beside you</div></div><div className="sample-code">{SAMPLE_CODE}</div></div>
          <div className="entry-paper paper"><div className="paper-label">KiDs1st</div><div className="paper-title">Enter your code</div>
            <div className={`code-field${unlocked?' is-accepted':local>=.8?' is-focused':''}`}><span className="typed">{SAMPLE_CODE.slice(0,typed)}</span>{!unlocked&&<span className="caret" style={{opacity:reduced?1:Math.floor(local*2)%2}}/>}</div>
            <div className={`lock-state${unlocked?' accepted':''}`}>{unlocked?<LockKeyholeOpen/>:<LockKeyhole/>}<span>{unlocked?'Code accepted · test unlocked':'Test locked'}</span></div>
            <div className="gesture entry-gesture" style={gestureStyle(local,'entry',reduced)}><Pointer/></div>
          </div>
        </div></>;
    }
    case 4:
      return <><Location><Landmark/>KiDs1st</Location><div className="test-paper paper object" style={entrance}>
        {local>=3.7?<div className="pass-result"><div className="seal"><Check/></div><div className="paper-title">Test passed</div><div className="result-note">Seminar signup is now available.</div></div>:<>
          <div className="paper-label">Knowledge check</div><div className="paper-title">True or false?</div><div className="question-hint">Choose one answer for each question.</div>
          <div className="answer-options"><div className={`answer${local>=1.4?' selected':''}`}><span className="answer-dot"/>True</div><div className="answer"><span className="answer-dot"/>False</div></div>
          <div className="format-note">Illustration of the test format</div>
        </>}
      </div></>;
    case 5:
      return <><Location><Landmark/>KiDs1st</Location><div className="booking-layout object" style={entrance}>
        <div className="calendar paper"><div className="calendar-head">Example calendar</div><div className="weekdays">{['M','T','W','T','F','S','S'].map((day,i)=><span key={i}>{day}</span>)}</div>
          <div className="dates">{Array.from({length:28},(_,i)=><span key={i} className={i===13?`chosen${local>=2.3?' is-selected':''}`:undefined}>{i+1}</span>)}</div>
          <div className="gesture booking-gesture" style={gestureStyle(local,'booking',reduced)}><Pointer/></div>
        </div>
        <div className="reservation"><div className="reservation-icon"><CalendarCheck/></div><div className="reservation-title">Your seminar</div><div className="reservation-copy">Choose an available session.</div><div className="reservation-confirmation" hidden={local<2.3}><Check/>Place reserved</div></div>
      </div></>;
    case 6:
      return <><Location>A program requirement</Location><div className="fee-paper paper object" style={entrance}>
        <div className="fee-top"><div><div className="paper-label">Fee reminder</div><div className="paper-title">Program fee</div></div><ReceiptText/></div><div className="fee-amount">$90</div><div className="waiver"><Scale/><span>Not required if waived by the judge.</span></div>
      </div></>;
    case 7:
      return <><Location>Your scheduled seminar</Location><div className="attendance-paper paper object" style={entrance}>
        <div className="attendance-objects"><div className="session-icon"><CalendarCheck/></div><div className="object-connector"/><div className="discussion-icon"><MessagesSquare/></div></div><div className="paper-title">Learn and reflect together</div><div className={`attendance-status${local>=3.1?' attended':''}`}>{local>=3.1?'Seminar attended':'Place reserved · attendance still required'}</div>
      </div></>;
    default:
      return <><Location><Landmark/>KiDs1st</Location><div className="completion-paper paper object" style={entrance}>
        <div className="completion-heading"><div className="seal"><Check/></div><div className="paper-title">Program requirements<br/>completed</div></div>
        <div className="requirements">{['UpToParents activities','Test passed','Seminar attended','Fee paid or judge’s waiver'].map(label=><div className="requirement" key={label}><Check/>{label}</div>)}</div>
      </div></>;
  }
}

export function ProgramJourney() {
  const [elapsed,setElapsed] = useState(0);
  const [playing,setPlaying] = useState(false);
  const [reduced,setReduced] = useState(false);
  const [transcriptOpen,setTranscriptOpen] = useState(false);
  const [announcement,setAnnouncement] = useState('');
  const stageRef = useRef<HTMLDivElement>(null);
  const positionRef = useRef(0);
  const visibleRef = useRef(false);
  const startedRef = useRef(false);
  const {index,local} = locate(elapsed);
  const step = STEPS[index];

  useEffect(()=>{
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncPreference = ()=>{
      setReduced(preference.matches);
      if(preference.matches) {setPlaying(false);setTranscriptOpen(true);}
    };
    syncPreference();
    preference.addEventListener('change',syncPreference);
    const observer = new IntersectionObserver(([entry])=>{
      visibleRef.current = entry.isIntersecting && entry.intersectionRatio >= .2;
      if(visibleRef.current && !startedRef.current && !preference.matches) {
        startedRef.current = true;
        setPlaying(true);
      }
    },{threshold:[0,.2]});
    if(stageRef.current) observer.observe(stageRef.current);
    return ()=>{observer.disconnect();preference.removeEventListener('change',syncPreference);};
  },[]);

  useEffect(()=>{
    if(!playing) return;
    let frame = 0, previous = 0, lastPaint = 0;
    const resetClock = ()=>{previous=0;};
    const tick = (now:number)=>{
      if(previous && visibleRef.current && !document.hidden) positionRef.current = Math.min(TOTAL,positionRef.current+Math.min((now-previous)/1000,.1));
      previous = now;
      // Keep this illustration local to the component, without rerendering the page.
      if(now-lastPaint>=1000/30 || positionRef.current>=TOTAL) {
        setElapsed(positionRef.current);
        lastPaint = now;
      }
      if(positionRef.current>=TOTAL) {
        setPlaying(false);
        setAnnouncement('Animation finished. All nine steps are available under Read the steps.');
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    document.addEventListener('visibilitychange',resetClock);
    frame = requestAnimationFrame(tick);
    return ()=>{cancelAnimationFrame(frame);document.removeEventListener('visibilitychange',resetClock);};
  },[playing]);

  function pause() {startedRef.current=true;setPlaying(false);}
  function seek(time:number) {
    pause();positionRef.current=time;setElapsed(time);
    const selected = locate(time).index;
    setAnnouncement(`Viewing step ${selected+1}: ${STEPS[selected].title}. Animation paused.`);
  }
  function play(restart=false) {
    startedRef.current=true;setAnnouncement('');
    if(restart || positionRef.current>=TOTAL) {positionRef.current=0;setElapsed(0);}
    setPlaying(restart || !playing);
  }

  return <section id="program-objects" aria-labelledby="program-overview" data-playing={playing}>
    <div className="film">
      <header className="intro"><p className="eyebrow">What to expect</p><h2 id="program-overview">Your path through the program</h2><p>Once you register, we’ll guide you through each step.</p></header>
      <div className="stage" aria-hidden="true" ref={stageRef}><div className="scene active" data-scene={index}><JourneyScene index={index} local={local} reduced={reduced}/></div></div>
      <div className="caption">
        {/* Overlapping panels reserve the longest caption's space at any zoom or width. */}
        {STEPS.map((item,i)=><div className={`caption-panel${i===index?' active':''}`} aria-hidden={i!==index} key={item.label}>
          <div className="counter">{i+1} of {STEPS.length} · {item.label}</div><h3>{item.title}</h3><p>{item.copy}</p>
        </div>)}
      </div>
      <div className="media" role="group" aria-label="Animation playback">
        <button className="play" type="button" aria-label={playing?'Pause animation':'Play animation'} onClick={()=>play()}>{playing?<Pause aria-hidden="true"/>:<Play aria-hidden="true"/>}{playing?'Pause':'Play'}</button>
        <div className="seek-wrap"><label className="sr" htmlFor="po-seek">Animation position in seconds</label><input id="po-seek" type="range" min={0} max={TOTAL} step={.1} value={elapsed} aria-valuetext={`${clock(elapsed)} of ${clock(TOTAL)}. Step ${index+1}: ${step.title}`} onPointerDown={pause} onKeyDown={pause} onChange={event=>seek(Number(event.currentTarget.value))}/><span className="time">{clock(elapsed)} / {clock(TOTAL)}</span></div>
        <button className="replay" type="button" aria-label="Replay animation from the beginning" onClick={()=>play(true)}><RotateCcw aria-hidden="true"/>Replay</button>
      </div>
      <details className="transcript" open={transcriptOpen} onToggle={event=>setTranscriptOpen(event.currentTarget.open)}>
        <summary onClick={pause}>Read the steps</summary>
        <ol>
          <li><strong>Register, then sign in.</strong> Register with your case number and last name. Sign in with your email and password.</li>
          <li><strong>Complete UpToParents.</strong> Follow the link from KiDs1st for videos, reflection activities, and writing exercises.</li>
          <li><strong>Keep your completion code.</strong> Find it on UpToParents or on the certificate they email you.</li>
          <li><strong>Return to KiDs1st and enter your code.</strong> The test stays locked until you enter it.</li>
          <li><strong>Take and pass the test.</strong> Passing makes seminar signup available.</li>
          <li><strong>Book your required seminar.</strong> Choose an available scheduled session.</li>
          <li><strong>Remember the $90 fee.</strong> Pay the program fee unless the judge has waived it for you.</li>
          <li><strong>Attend the seminar you booked.</strong> Follow your booking details to join the session.</li>
          <li><strong>Complete your program requirements.</strong> Your account guides you through the process.</li>
        </ol>
        <p>If your case is not found when registering, email the program office for help.</p>
      </details>
      <span className="sr" role="status" aria-live="polite">{announcement}</span>
    </div>
  </section>;
}
