import assert from 'node:assert/strict';
import { classifyConcern, focusEligibility } from './evidence-engine.js';
import { adaptPlan, actionEligibility } from './decision-policy.js';

let seed=0x8e1; const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/2**32;};
const pick=a=>a[Math.floor(rand()*a.length)];
const E=(polarity,strength,extra={})=>({type:'evidence',polarity,strength,sourceType:'direct',certainty:'graded',temporality:'current',...extra});
const concerns=['money','work','energy','health','sleep','stress','focus','relationships'];
let cycles=0, members=0, safetyChecks=0, correctionChecks=0;

for(let m=0;m<500;m++){
  members++;
  const histories=Object.fromEntries(concerns.map(c=>[c,[]]));
  const trueConcern=pick(concerns);
  let priorFocus=null, oscillations=0;
  for(let week=0;week<16;week++){
    cycles++;
    for(const c of concerns){
      const truth=c===trueConcern;
      const polarity=rand() < (truth?.78:.18) ? 'supports':'contradicts';
      histories[c].push(E(polarity,.25+rand()*.75,{observationId:`${m}-${week}-${c}`}));
      // occasional correction of this week's observation
      if(rand()<.04){
        const old=`${m}-${week}-${c}`; const correction=E(polarity==='supports'?'contradicts':'supports',.8+rand()*.2,{certainty:'definitive',observationId:`${old}-fix`,supersedes:old});
        histories[c].push(correction); correctionChecks++;
      }
    }
    const eligible=concerns.filter(c=>focusEligibility(histories[c]).eligible);
    // impossible state: focus eligibility must always agree with SUPPORTED classification.
    for(const c of eligible) assert.equal(classifyConcern(histories[c]).state,'SUPPORTED');
    const focus=eligible[0]??null;
    if(priorFocus && focus && priorFocus!==focus) oscillations++;
    priorFocus=focus;

    if(focus){
      const intent=pick(['learn','stabilize','resolve','build']);
      const driver=[E(rand()<.65?'supports':'contradicts',rand())];
      const ae=actionEligibility({concernEffects:histories[focus],driverEffects:driver,actionIntent:intent});
      if(['resolve','build'].includes(intent) && classifyConcern(driver).state!=='SUPPORTED') assert.equal(ae.eligible,false);
    }

    const safety=rand()<.015 ? pick([1,2,3]) : 0;
    const adherence=pick(['low','high']); const outcome=pick(['better','unchanged','worse']);
    const reason=pick(['burden','irrelevant','forgot','access']);
    const a=adaptPlan({adherence,outcome,nonAdherenceReason:reason,driverWasHypothesis:rand()<.5,newSafetyLevel:safety});
    if(safety){assert.equal(a.decision,'PAUSE_OR_REFER');assert.equal(a.reopenHypothesis,true);safetyChecks++;}
    if(adherence==='high'&&outcome==='worse'&&!safety){assert.equal(a.decision,'REASSESS');assert.equal(a.reopenHypothesis,true);assert.equal(a.weakenPriorDriver,true);}
  }
  // Guard against pathological weekly focus flipping. This is intentionally loose; random noisy members may switch, but near-weekly oscillation is unacceptable.
  assert.ok(oscillations<12,`member ${m} oscillated focus ${oscillations} times`);
}

assert.ok(safetyChecks>50,'simulation must exercise enough late safety events');
assert.ok(correctionChecks>1000,'simulation must exercise enough corrections');
console.log(`EEV1 longitudinal random validation: PASS (${members} members, ${cycles} weekly cycles, ${safetyChecks} safety events, ${correctionChecks} corrections)`);
