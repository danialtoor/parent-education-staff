import type {CaseRecord,Data,DemoCredential} from './domain';

export const PARENT_SESSION='county-parent-session-v1';
export const PENDING_ACTIVATION='county-parent-activation-v1';
export const SAMPLE_PASSWORD='sample-pass';
const cleanName=(value:string)=>value.trim().normalize('NFKC').toLocaleLowerCase('en-US').replace(/[’‘]/g,"'").replace(/\s+/g,' ');
// Accept compact court numbers (26D1328) and the prototype's formatted equivalent.
export function caseSearchKey(value:string){
  const raw=value.toUpperCase().replace(/[^A-Z0-9]/g,'');
  const m=raw.match(/^(\d{4}|\d{2})([A-Z]{1,3})(\d+)$/);
  return m?`${m[1].length===2?'20'+m[1]:m[1]}${m[2]}${Number(m[3])}`:raw;
}
export function findRegistrationCases(data:Data,number:string,lastName:string):CaseRecord[]{
  if(!number.trim()||!lastName.trim())return [];
  return data.cases.filter(c=>c.active&&caseSearchKey(c.number)===caseSearchKey(number)&&cleanName(c.lastName||c.name.trim().split(/\s+/).at(-1)||'')===cleanName(lastName));
}
export function passwordRules(password:string){return [password.length>=8&&password.length<=128,/[A-Z]/.test(password)&&/[a-z]/.test(password),/\d/.test(password)];}
export function accountErrors(email:string,confirmEmail:string,password:string,confirmPassword:string){
  const errors:Record<string,string>={};
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))errors.email='Enter a valid email address.';
  if(email.trim().toLowerCase()!==confirmEmail.trim().toLowerCase())errors.confirmEmail='The email addresses do not match.';
  if(!passwordRules(password).every(Boolean))errors.password='Use 8–128 characters, including uppercase and lowercase letters and a number.';
  if(password!==confirmPassword)errors.confirmPassword='The passwords do not match.';
  return errors;
}
const hex=(bytes:Uint8Array)=>Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');
async function digestPassword(password:string,salt:string){
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),'PBKDF2',false,['deriveBits']);
  const result=await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:120000,hash:'SHA-256'},key,256);
  return hex(new Uint8Array(result));
}
// Demo only: raw passwords never enter shared records or browser storage.
// Production authentication and activation must be provided by the county server.
export async function createDemoCredential(password:string):Promise<DemoCredential>{
  if(!passwordRules(password).every(Boolean))throw Error('Choose a password that meets all three requirements.');
  const salt=hex(crypto.getRandomValues(new Uint8Array(16)));
  return {salt,digest:await digestPassword(password,salt)};
}
export async function verifyDemoPassword(person:CaseRecord,password:string){
  if(!person.registered)return false;
  if(!person.demoCredential)return password===SAMPLE_PASSWORD;
  return (await digestPassword(password,person.demoCredential.salt))===person.demoCredential.digest;
}
