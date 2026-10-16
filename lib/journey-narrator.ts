/** Browser voice adapter. Replace this with a recorded-audio adapter when clips are ready. */
export type NarrationRequest = {
  text:string; language:string; voiceURI:string; rate:number;
  onStart:()=>void; onEnd:()=>void; onError:(reason:string)=>void;
};
export class DeviceNarrator {
  private utterance:SpeechSynthesisUtterance|null=null;
  private generation=0;
  private startTimeout:ReturnType<typeof setTimeout>|undefined;
  constructor(private synth:SpeechSynthesis, private makeUtterance=(text:string)=>new SpeechSynthesisUtterance(text)) {}
  speak(request:NarrationRequest) {
    this.stop();
    const generation=this.generation;
    const utterance=this.makeUtterance(request.text);
    this.utterance=utterance;
    utterance.lang=request.language;
    utterance.rate=request.rate;
    utterance.voice=this.synth.getVoices().find(v=>v.voiceURI===request.voiceURI)??null;
    const valid=()=>generation===this.generation;
    utterance.onstart=()=>{if(valid()){clearTimeout(this.startTimeout);request.onStart();}};
    utterance.onend=()=>{if(valid()){clearTimeout(this.startTimeout);this.utterance=null;request.onEnd();}};
    utterance.onerror=event=>{if(valid()){this.stop();request.onError(event.error);}};
    this.startTimeout=setTimeout(()=>{if(valid()){this.stop();request.onError('start-timeout');}},10000);
    // A cancelled utterance can leave some engines paused.
    this.synth.resume();
    try {this.synth.speak(utterance);} catch {this.stop();request.onError('synthesis-unavailable');}
  }
  pause(){this.synth.pause();clearTimeout(this.startTimeout);}
  resume(){this.synth.resume();}
  stop(){
    this.generation++;
    clearTimeout(this.startTimeout);
    if(this.utterance){
      this.utterance.onstart=null;this.utterance.onend=null;this.utterance.onerror=null;
      this.utterance=null;this.synth.cancel();
    }
  }
}
