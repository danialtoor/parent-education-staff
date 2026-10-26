export const STEPS = [
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
export const TOTAL = STEPS.reduce((sum, step) => sum + step.duration, 0);

export function locate(time:number) {
  let start = 0;
  for (let index = 0; index < STEPS.length; index++) {
    if (time < start + STEPS[index].duration || index === STEPS.length - 1) return {index, local:time - start};
    start += STEPS[index].duration;
  }
  return {index:0, local:0};
}

export type JourneyLanguage = 'en'|'es';
const SPANISH = [
  {label:'Su cuenta',title:'Regístrese e inicie sesión',copy:'Regístrese con su número de caso y apellido. Después, inicie sesión con su correo electrónico y contraseña.'},
  {label:'UpToParents',title:'Complete las actividades a su ritmo',copy:'KiDs1st le dirige a UpToParents para ver videos, reflexionar y realizar ejercicios escritos.'},
  {label:'Su código',title:'Guarde el código de UpToParents',copy:'Encuéntrelo en su sitio web o en el certificado que le envían por correo electrónico. Lo usará al volver a KiDs1st.'},
  {label:'De vuelta en KiDs1st',title:'Ingrese su código para acceder al examen',copy:'Regrese a KiDs1st e ingrese su código de finalización. El examen permanece bloqueado hasta que lo haga.'},
  {label:'El examen',title:'Complete y apruebe el examen',copy:'Aprobar el examen le permite inscribirse en el seminario obligatorio.'},
  {label:'Inscripción al seminario',title:'Reserve su lugar en un seminario',copy:'Elija una sesión disponible. Este seminario tiene un horario fijo y es distinto de las actividades de UpToParents.'},
  {label:'Cuota del programa',title:'Recuerde la cuota de $90',copy:'Pague la cuota del programa, a menos que el juez le haya eximido de pagarla.'},
  {label:'Su sesión programada',title:'Asista al seminario que reservó',copy:'Siga las instrucciones de su reserva para participar. Reservar un lugar y asistir son pasos distintos.'},
  {label:'Finalización',title:'Los requisitos del programa, completados',copy:'Su cuenta le guía durante el proceso para que pueda concentrarse en un paso a la vez.'},
];
export const stepsFor=(language:JourneyLanguage)=>STEPS.map((step,i)=>({...step,...(language==='es'?SPANISH[i]:{})}));
export const stepStart=(index:number)=>STEPS.slice(0,index).reduce((n,s)=>n+s.duration,0);
const ES:Record<string,string>={
  'Your account':'Su cuenta','Then sign in':'Después, inicie sesión','Find your case':'Busque su caso','Email':'Correo electrónico','Case number':'Número de caso','Password':'Contraseña','Last name':'Apellido','You’re signed in':'Sesión iniciada','Create your account':'Cree su cuenta',
  'Watch':'Ver','Reflect':'Reflexionar','Write':'Escribir','Complete the activities at your own pace.':'Complete las actividades a su ritmo.',
  'Activities completed':'Actividades completadas','Completion code':'Código de finalización','Example code':'Código de ejemplo','Shown on UpToParents':'Disponible en UpToParents','Also on your emailed certificate':'También en su certificado por correo',
  'Back at KiDs1st':'De vuelta en KiDs1st','Your UpToParents code':'Su código de UpToParents','Keep it beside you':'Téngalo a mano','Enter your code':'Ingrese su código','Code accepted · test unlocked':'Código aceptado · examen disponible','Test locked':'Examen bloqueado',
  'Test passed':'Examen aprobado','Seminar signup is now available.':'Ya puede inscribirse en un seminario.','Knowledge check':'Examen','True or false?':'¿Verdadero o falso?','Choose one answer for each question.':'Elija una respuesta para cada pregunta.','True':'Verdadero','False':'Falso','Illustration of the test format':'Ejemplo del formato del examen',
  'Example calendar':'Calendario de ejemplo','Your seminar':'Su seminario','Choose an available session.':'Elija una sesión disponible.','Place reserved':'Lugar reservado','A program requirement':'Un requisito del programa','Fee reminder':'Recordatorio de la cuota','Program fee':'Cuota del programa','Not required if waived by the judge.':'No se requiere si el juez le ha eximido de pagarla.',
  'Your scheduled seminar':'Su seminario programado','Learn and reflect together':'Aprender y reflexionar juntos','Seminar attended':'Asistencia completada','Place reserved · attendance still required':'Lugar reservado · aún debe asistir','Program requirements completed':'Requisitos del programa completados',
  'UpToParents activities':'Actividades de UpToParents','Fee paid or judge’s waiver':'Cuota pagada o exención del juez',
  'What to expect':'Qué esperar','Your path through the program':'Su recorrido por el programa','Once you register, we’ll guide you through each step.':'Una vez que se registre, le guiaremos paso a paso.',
  'Language':'Idioma','Watch overview':'Ver el recorrido','Watch the overview':'Ver el recorrido','Watch again':'Ver de nuevo','1 minute · 9 steps':'1 minuto · 9 pasos','Program overview':'Resumen del programa','Your program, step by step':'Su programa, paso a paso','See what to expect, from registration to program completion.':'Conozca el proceso, desde la inscripción hasta completar el programa.','Video controls':'Controles del video','Tour position':'Posición del recorrido','Chapters':'Capítulos','Video chapters':'Capítulos del video','Jump to a step':'Ir a un paso','Close chapters':'Cerrar capítulos','Full screen':'Pantalla completa','Exit full screen':'Salir de pantalla completa',
  'Tour finished':'Recorrido terminado','Play':'Reproducir','Pause':'Pausar','Replay':'Repetir','Previous step':'Paso anterior','Next step':'Paso siguiente','Read the steps':'Leer los pasos','of':'de',
  'If your case is not found when registering, email the program office for help.':'Si no encuentra su caso al registrarse, envíe un correo electrónico a la oficina del programa para recibir ayuda.',
};
export const translate=(language:JourneyLanguage,text:string)=>language==='es'?(ES[text]??text):text;
