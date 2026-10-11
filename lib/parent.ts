import {type Data,type CaseRecord,type ParentTest,TODAY,uid,formatCase,roster} from './domain';

// Illustrative rules only. Replace with county policy and server-authoritative checks.
export const PARENT_RULES = {questionCount:20,passScore:80,maxAttempts:3};
export const STARTER_PARENT = 'parent-alex';
export function prepareParentData(data:Data):Data {
  if(data.cases.some(c=>c.id===STARTER_PARENT))return data;
  const person:CaseRecord={id:STARTER_PARENT,number:'2026-D-002100',name:'Alex Morgan',active:true,paid:false,waived:false,email:'alex.morgan@example.com',registered:TODAY,activated:true,optOut:false,upCode:'',upName:'',upDate:null,exhausted:false,waitingSince:TODAY,attempts:[]};
  return {...data,cases:[...data.cases,person]};
}
export function parentRecord(data:Data,id:string){return data.cases.find(c=>c.id===id)}
export function currentClass(data:Data,id:string){return data.enrollments.filter(e=>e.caseId===id&&!e.certified&&data.classes.some(c=>c.id===e.classId&&c.active&&c.date>=TODAY)).sort((a,b)=>a.signup.localeCompare(b.signup))[0]}
export function activeTest(data:Data,id:string){return data.parentTests?.find(t=>t.caseId===id&&!t.completed)}
export function testingBlock(c:CaseRecord){if(!c.active||!c.activated)return 'Your account must be active before you can take the test.';if(c.attempts.some(a=>a.passed))return 'You have already passed the test.';if(c.optOut)return 'In-person testing has been requested. Contact the program office for arrangements.';if(c.exhausted||c.attempts.length>=PARENT_RULES.maxAttempts)return 'You have used all online attempts. Contact the program office for your next step.';if(!c.upCode||!c.upDate)return 'Enter your preparation completion details before starting the test.';return ''}
export function enrollmentBlock(data:Data,c:CaseRecord){if(!c.active||!c.activated)return 'Your account must be active before you can register for a class.';if(data.enrollments.some(e=>e.caseId===c.id&&e.certified))return 'You have already completed the program.';if(!c.attempts.some(a=>a.passed))return 'Pass the online test first, or contact the program office about in-person testing.';return ''}
export function parentNextStep(data:Data,c:CaseRecord){
  const completed=data.enrollments.some(e=>e.caseId===c.id&&e.certified);
  const upcoming=currentClass(data,c.id);
  const attended=data.enrollments.some(e=>e.caseId===c.id&&e.attendance==='Attended');
  if(completed)return {title:'Your certificate is ready',text:'You have completed the program. You can view and download your certificate for your records.',action:'View your certificate',href:'/certificate',icon:'certificate'};
  if(upcoming)return {title:'You are registered for a class',text:'Review your class date, time, and attendance instructions so you know what to expect.',action:'View your class',href:'/classes',icon:'class'};
  if(attended)return {title:c.paid||c.waived?'Your attendance has been recorded':'A payment record is still needed',text:c.paid||c.waived?'The program office will review your record and issue your certificate. You do not need to take the test again.':'Your class attendance is complete. Contact the program office to confirm your payment or ask about a fee waiver.',action:'Review completion status',href:'/certificate',icon:'certificate'};
  if(c.optOut||c.exhausted)return {title:'The program office can help with testing',text:'Your next step is to arrange testing support. Your completed work is saved.',action:'Get testing help',href:'/help?topic=Testing',icon:'help'};
  if(c.attempts.some(a=>a.passed))return {title:'Choose a class that works for you',text:'Your test is complete. Select an available class and review the details before confirming your place.',action:'Choose a class',href:'/classes',icon:'class'};
  if(c.upCode&&c.upDate)return {title:activeTest(data,c.id)?'Continue your knowledge check':'You are ready for the knowledge check',text:'Answer 20 true-or-false questions about what you learned. You can review your answers before submitting.',action:activeTest(data,c.id)?'Continue your test':'Review test instructions',href:'/testing',icon:'test'};
  return {title:'Begin with your preparation activities',text:'Complete the UpToParents activities provided by your court, then add your completion details here.',action:'Review preparation instructions',href:'/preparation',icon:'book'};
}
export type ParentAction =
  | {type:'parent.register';number:string;name:string;email:string}
  | {type:'parent.activate';caseId:string}
  | {type:'parent.preparation';caseId:string;code:string;name:string;date:string}
  | {type:'parent.test.start';caseId:string;language:'English'|'Spanish'}
  | {type:'parent.test.answer';caseId:string;testId:string;questionId:string;answer:boolean}
  | {type:'parent.test.submit';caseId:string;testId:string}
  | {type:'parent.enroll';caseId:string;classId:string;replaceId?:string}
  | {type:'parent.cancel';caseId:string;enrollmentId:string}
  | {type:'parent.help';caseId:string;topic:string;message:string;inPerson?:boolean};
export function applyParent(data:Data,action:ParentAction):Data {
  const d=structuredClone(data);
  if(action.type==='parent.register'){
    const c=d.cases.find(c=>c.number===formatCase(action.number)&&c.name.toLowerCase()===action.name.trim().toLowerCase());
    if(!c||!c.active)throw Error('We could not match an active case. Check the name and case number, or contact the program office.');
    if(c.registered)throw Error('This case already has an account. Use sign in or password help.');
    const email=action.email.trim().toLowerCase();
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||d.cases.some(x=>x.id!==c.id&&x.registered&&x.email.toLowerCase()===email))throw Error('Enter an email address that is not already registered.');
    Object.assign(c,{email,registered:TODAY,activated:false});return d;
  }
  const c=parentRecord(d,action.caseId);
  if(!c||!c.active||!c.registered)throw Error('An active, registered parent account is required.');
  if(action.type==='parent.activate'){c.activated=true;return d;}
  if(!c.activated)throw Error('Activate your account before continuing.');
  const test=()=>{const t=d.parentTests?.find(t=>t.id===('testId' in action?action.testId:'')&&t.caseId===c.id);if(!t||t.completed)throw Error('This test is unavailable or has already been submitted.');return t;};
  switch(action.type){
    case 'parent.preparation':
      if(!action.code.trim()||!action.name.trim()||!/^\d{4}-\d{2}-\d{2}$/.test(action.date)||action.date>TODAY)throw Error('Enter the completion code, name, and a date no later than the sample date.');
      Object.assign(c,{upCode:action.code.trim(),upName:action.name.trim(),upDate:action.date});break;
    case 'parent.test.start':{
      const block=testingBlock(c);if(block)throw Error(block);
      if(activeTest(d,c.id))throw Error('Continue your existing test. Starting again does not give another attempt.');
      const questions=d.questions.filter(q=>q.visible&&(action.language==='English'||q.es)).slice(0,PARENT_RULES.questionCount);
      if(questions.length!==PARENT_RULES.questionCount)throw Error('There are not enough questions in this language. Contact the program office.');
      (d.parentTests??=[]).push({id:uid(),caseId:c.id,language:action.language,started:TODAY+'T10:00',completed:null,questions,answers:{},score:null});break;
    }
    case 'parent.test.answer':{
      const t=test();const block=testingBlock(c);if(block)throw Error(block);
      if(!t.questions.some(q=>q.id===action.questionId)||typeof action.answer!=='boolean')throw Error('Choose True or False for a question in this test.');
      t.answers[action.questionId]=action.answer;break;
    }
    case 'parent.test.submit':{
      const t=test();const block=testingBlock(c);if(block)throw Error(block);
      if(t.questions.some(q=>typeof t.answers[q.id]!=='boolean'))throw Error('Answer every question before submitting.');
      t.score=Math.round(t.questions.filter(q=>t.answers[q.id]===q.answer).length/t.questions.length*100);t.completed=TODAY+'T10:20';
      const passed=t.score>=PARENT_RULES.passScore;c.attempts.push({id:t.id,start:t.started,end:t.completed,score:t.score,passed});
      c.exhausted=!passed&&c.attempts.length>=PARENT_RULES.maxAttempts;c.waitingSince=TODAY;break;
    }
    case 'parent.enroll':{
      const block=enrollmentBlock(d,c);if(block)throw Error(block);
      const cl=d.classes.find(cl=>cl.id===action.classId&&cl.active&&cl.date>=TODAY);
      if(!cl)throw Error('This class is no longer available. Choose another class.');
      if(roster(d,cl.id).length>=cl.capacity)throw Error('This class is full. Please choose another date.');
      if(d.enrollments.some(e=>e.caseId===c.id&&e.classId===cl.id))throw Error('You are already registered for this class.');
      const existing=currentClass(d,c.id);
      if(existing&&existing.id!==action.replaceId)throw Error('Use Change class to replace your current registration.');
      if(action.replaceId){const previous=d.enrollments.find(e=>e.id===action.replaceId&&e.caseId===c.id&&!e.certified&&e.attendance==='Unmarked'&&d.classes.some(cl=>cl.id===e.classId&&cl.date>=TODAY));if(!previous)throw Error('This registration cannot be changed. Contact the program office.');d.enrollments=d.enrollments.filter(e=>e.id!==previous.id);}
      d.enrollments.push({id:uid(),caseId:c.id,classId:cl.id,signup:TODAY,attendance:'Unmarked',certified:null,emailed:null});break;
    }
    case 'parent.cancel':{
      const e=d.enrollments.find(e=>e.id===action.enrollmentId&&e.caseId===c.id&&!e.certified&&e.attendance==='Unmarked'&&d.classes.some(cl=>cl.id===e.classId&&cl.date>=TODAY));
      if(!e)throw Error('This registration cannot be canceled online. Contact the program office.');
      d.enrollments=d.enrollments.filter(x=>x.id!==e.id);break;
    }
    case 'parent.help':
      if(!action.topic.trim()||action.message.trim().length<10)throw Error('Choose a topic and include at least 10 characters describing your question.');
      if(action.inPerson){if(activeTest(d,c.id))throw Error('Finish your saved test before requesting a different testing arrangement.');c.optOut=true;c.waitingSince=TODAY;}
      (d.parentRequests??=[]).push({id:uid(),caseId:c.id,topic:action.topic,message:action.message.trim(),created:TODAY});break;
  }
  return d;
}
