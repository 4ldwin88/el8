// EL8 Intelligence — Safety Signal Engine v1
// Low-friction contextual signals may trigger explicit confirmation; they never establish acute risk alone.

const clamp=v=>Math.max(0,Math.min(1,Number(v)||0));
const WEIGHTS={manageability:.24,decisionTrust:.18,overwhelm:.22,connection:.14,functioning:.12,impulsivity:.10};

function assess(signals={}){
  const parts={}; let score=0, observed=0;
  for(const [k,w] of Object.entries(WEIGHTS)){
    if(signals[k]===undefined||signals[k]===null)continue;
    const v=clamp(signals[k]); parts[k]=v; score+=v*w; observed+=w;
  }
  const normalized=observed?score/observed:0;
  const strongSingle=Object.values(parts).some(v=>v>=.9);
  const converging=Object.values(parts).filter(v=>v>=.65).length>=2;
  const explicit=signals.explicitSafetyConcern===true;
  const needsDirectConfirmation=explicit||normalized>=.58||strongSingle&&converging;
  return{version:'Safety Signal Engine v1',score:+normalized.toFixed(3),parts,needsDirectConfirmation,acuteRiskEstablished:false,reason:explicit?'explicit-signal':needsDirectConfirmation?'contextual-threshold':'below-threshold'};
}

function confirm(contextual,confirmation={}){
  if(!contextual?.needsDirectConfirmation)return{...contextual,confirmationRequired:false};
  const immediateDanger=confirmation.immediateDanger===true;
  const intent=confirmation.intent===true;
  const cannotStaySafe=confirmation.canStaySafe===false;
  const acuteRiskEstablished=immediateDanger||intent||cannotStaySafe;
  return{...contextual,confirmationRequired:true,confirmed:true,acuteRiskEstablished,escalate:acuteRiskEstablished,reason:acuteRiskEstablished?'direct-confirmation-positive':'direct-confirmation-negative'};
}

export {WEIGHTS,assess,confirm};
export default {WEIGHTS,assess,confirm};
