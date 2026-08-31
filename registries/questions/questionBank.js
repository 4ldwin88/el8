// Governed Discovery Question Bank.
// Source authority: Drive 02.04.01 EL8 Question & Signal Matrix Workbook.
//
// IMPORTANT: this registry is being reconciled from Drive before runtime cutover.
// `reconciled:false` entries are intentionally not permitted as runtime authority.
// The current runtime remains isolated until the complete bank + answer semantics are migrated.

const q=(id,{text,responseType,role,dimension,construct,stage,burden,status='conditional'})=>Object.freeze({
  id,text,responseType,role,dimension,construct,stage,burden,status,reconciled:true,
});

export const QUESTION_BANK_VERSION='0.1.0-reconciliation';

export const QUESTION_BANK=Object.freeze([
  // General — canonical orientation, discrimination, correction and handoff controls.
  q('GEN001',{text:'Thinking about your life lately, what has been bothering you or making things harder? Select any that fit.',responseType:'multi',role:'general',dimension:'General',construct:'General concern routing',stage:'Orient — entry only; transition as soon as routing evidence is sufficient',burden:0.3,status:'active'}),
  q('GEN010',{text:'Thinking about recent difficult days, what has most often made the day harder?',responseType:'single',role:'orientation',dimension:'General',construct:'Difficult-day orientation',stage:'Deferred fallback — outside canonical adaptive flow',burden:0.14,status:'deferred'}),
  q('GEN011',{text:'Thinking about the past 7 days, which best describes your day-to-day routine?',responseType:'single',role:'orientation',dimension:'General',construct:'Routine structure',stage:'Deferred Planning context — outside canonical Discovery flow',burden:0.12,status:'deferred'}),
  q('GEN012',{text:'When life has been going well, what has most helped you keep going?',responseType:'single',role:'orientation',dimension:'General',construct:'Protective strengths',stage:'Adaptive Orient/positive context — optional fallback only',burden:0.12}),
  q('GEN100',{text:'It sounds like things are generally going okay. What would make EL8 most useful to you right now?',responseType:'single',role:'goal-probe',dimension:'General',construct:'Positive-path goal',stage:'Adaptive Narrow/goal definition — may directly support positive handoff',burden:0.1}),
  q('GEN101',{text:'What is working well that you would most want to protect or build on?',responseType:'single',role:'strength-probe',dimension:'General',construct:'Positive-path strength',stage:'Adaptive Deepen/Fit — optional positive-path strength only',burden:0.1}),
  q('GEN200',{text:'If one thing improved over the next 7 days, which change would help your daily life most?',responseType:'single',role:'discriminator',dimension:'General',construct:'Near-term decision value',stage:'Adaptive Narrow — priority tie-break only',burden:0.3}),
  q('GEN201',{text:'Which best describes what seems connected to daily life feeling harder right now?',responseType:'single',role:'discriminator',dimension:'General',construct:'Circumstance / functioning distinction',stage:'Adaptive Narrow — routing ambiguity only',burden:0.2}),
  q('GEN202',{text:'When this issue affects you, which area do you usually notice changing first?',responseType:'single',role:'discriminator',dimension:'General',construct:'First-noticed interaction',stage:'Adaptive Deepen — relationship ambiguity only',burden:0.25}),
  q('GEN204',{text:'Thinking about the past 7 days, which area have you spent the most time worrying about or trying to deal with?',responseType:'single',role:'discriminator',dimension:'General',construct:'Recent concern salience',stage:'Adaptive Narrow — alternative priority tie-break only',burden:0.25}),
  q('GEN300',{text:'Your answers point in different directions. Which option best describes what you mean?',responseType:'single',role:'contradiction',dimension:'General',construct:'Contradiction resolution',stage:'Adaptive correction — only material contradiction',burden:0.18}),
  q('GEN301',{text:'Did EL8 misunderstand which area is making daily life harder?',responseType:'single',role:'correction',dimension:'General',construct:'Concern correction',stage:'Adaptive correction — only suspected scope misclassification',burden:0.18}),
  q('GEN400',{text:'Thinking about the past 7 days, has anything made it meaningfully harder to do your usual daily activities?',responseType:'single',role:'healthy-verification',dimension:'General',construct:'Functional impact verification',stage:'Adaptive sufficiency check — positive/weak-path impact ambiguity only',burden:0.14}),
  q('GEN401',{text:'Do the issues you selected feel manageable without additional help right now?',responseType:'single',role:'healthy-verification',dimension:'General',construct:'Manageability verification',stage:'Adaptive Fit/handoff — support intensity only when unresolved',burden:0.14}),
  q('GEN900',{text:'Before we move on, does this feel like an accurate enough picture of what you want EL8 to work from?',responseType:'single',role:'handoff-validation',dimension:'General',construct:'Member-confirmed understanding',stage:'Sufficient/Handoff — final synthesis confirmation only when substantive',burden:0.08}),
  q('GEN901',{text:'Do you want to answer more questions about this right now?',responseType:'single',role:'opt-out',dimension:'General',construct:'Member burden / opt-out',stage:'Any point in adaptive Discovery — member-controlled continuation/opt-out',burden:0.08,status:'member-controlled'}),

  // Physical — constructs remain separated; contributor/fit questions do not manufacture parallel severity.
  q('PHY001',{text:'Which physical-health areas, if any, would you like EL8 to understand better?',responseType:'multi',role:'concern-scope',dimension:'Physical',construct:'Physical-health scope discrimination',stage:'Adaptive Narrow — only when Physical scope remains ambiguous',burden:0.28}),
  q('PHY100',{text:'In the past 7 days, how much have concerns specifically about your weight or body bothered you?',responseType:'single',role:'state-probe',dimension:'Physical',construct:'Body / weight concern',stage:'Adaptive state evidence — may itself satisfy body/weight concern evidence',burden:0.17}),
  q('PHY101',{text:'If EL8 suggested a physical-health action, what would it need to account for? Select any that fit.',responseType:'multi',role:'feasibility-probe',dimension:'Physical',construct:'Physical action feasibility',stage:'Adaptive Fit — non-activity/cross-cutting Physical constraints only',burden:0.1}),
  q('PHY200',{text:'In the past 7 days, how would you rate your sleep overall?',responseType:'single',role:'state-probe',dimension:'Physical',construct:'Sleep state',stage:'Adaptive state evidence — may itself satisfy focused Sleep evidence',burden:0.16}),
  q('PHY201',{text:'In the past 7 days, what seemed connected with times it was harder to sleep well? Select any that fit.',responseType:'multi',role:'discriminator',dimension:'Physical',construct:'Sleep contributors',stage:'Adaptive discrimination — Sleep contributor relationship only when decision-relevant',burden:0.2}),
  q('PHY202',{text:'When you sleep better than usual, what—if anything—do you tend to notice the next day?',responseType:'single',role:'confirmation',dimension:'Physical',construct:'Sleep relationship confirmation',stage:'Adaptive relationship confirmation — only when leverage/focus could change',burden:0.18}),
  q('PHY300',{text:'In the past 7 days, how would you rate your energy during the day?',responseType:'single',role:'state-probe',dimension:'Physical',construct:'Energy state',stage:'Adaptive state evidence — may itself satisfy focused Energy evidence',burden:0.16}),
  q('PHY301',{text:'In the past 7 days, what seemed most connected with times you had low energy? Select any that fit.',responseType:'multi',role:'discriminator',dimension:'Physical',construct:'Energy contributors',stage:'Adaptive discrimination — Energy contributor relationship only when decision-relevant',burden:0.2}),
  q('PHY400',{text:'In the past 7 days, on how many days were you physically active for at least a short period?',responseType:'single',role:'state-probe',dimension:'Physical',construct:'Activity frequency',stage:'Adaptive state evidence — may itself satisfy Activity evidence',burden:0.16}),
  q('PHY401',{text:'Which kinds of activity are practical for you right now? Select any that fit.',responseType:'multi',role:'feasibility-probe',dimension:'Physical',construct:'Activity feasibility',stage:'Adaptive Fit — activity-type choice only',burden:0.12}),
  q('PHY402',{text:'What could make physical activity harder for you right now? Select any that fit.',responseType:'multi',role:'feasibility-probe',dimension:'Physical',construct:'Activity barriers',stage:'Adaptive Fit — activity barriers/constraints only',burden:0.12}),
  q('PHY500',{text:'In the past 7 days, how often was it hard to start something you intended to do?',responseType:'single',role:'state-probe',dimension:'Cross-dimensional',construct:'Activation',stage:'Adaptive clarification/state evidence — only when Activation is independently decision-relevant',burden:0.17}),

  // Emotional — stress state plus optional decision-relevant context/deepening/fit.
  q('EMT001',{text:'In the past 7 days, how often did you feel stressed or overwhelmed?',responseType:'single',role:'state-probe',dimension:'Emotional',construct:'Stress state',stage:'Adaptive state evidence — may itself satisfy focused Stress evidence',burden:0.16}),
  q('EMT002',{text:'In the past 7 days, when you felt stressed or overwhelmed, what was happening around those times? Select any that fit.',responseType:'multi',role:'discriminator',dimension:'Emotional',construct:'Stress context',stage:'Adaptive discrimination — Stress context only when decision-relevant',burden:0.2}),
  q('EMT003',{text:'About how long have stress or difficult emotions been noticeably affecting your daily life?',responseType:'single',role:'deepening',dimension:'Emotional',construct:'Duration',stage:'Adaptive deepening — duration only when decision-relevant',burden:0.12}),
  q('EMT004',{text:'In the past 7 days, how much did stress or difficult emotions interfere with your usual daily activities?',responseType:'single',role:'impact-probe',dimension:'Emotional',construct:'Stress impact',stage:'Adaptive deepening — impact only when decision-relevant',burden:0.14}),
  q('EMT005',{text:'In the past 7 days, what, if anything, seemed to make stressful periods easier to handle? Select any that fit.',responseType:'multi',role:'support-probe',dimension:'Emotional',construct:'Existing supports',stage:'Adaptive Fit — coping/resources only when Planning changes',burden:0.12}),
]);

export const QUESTION_BY_ID=Object.freeze(Object.fromEntries(QUESTION_BANK.map(question=>[question.id,question])));

export function assertUniqueQuestionIds(){
  if(Object.keys(QUESTION_BY_ID).length!==QUESTION_BANK.length) throw new Error('Duplicate governed Discovery question ID');
  return true;
}

export default QUESTION_BANK;
