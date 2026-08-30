// Current Drive Question Bank — Emotional domain. No superseded IDs or aliases.
const option=(id,label,semantics)=>Object.freeze({id,label,semantics});
const question=(id,role,prompt,responseType,construct,options,{runtimeStatus='Conditional / adaptive',stage='Adaptive',burden=0}={})=>Object.freeze({id,role,prompt,responseType,construct,options:Object.freeze(options),runtimeStatus,stage,burden});

export const EMOTIONAL_QUESTIONS=Object.freeze([
  question('EMT001','state-probe','In the past 7 days, how often did you feel stressed or overwhelmed?','Single','PRESSURE_PATTERN',[
    option('EMT001.01','Never','PRESSURE_PATTERN state: never; direct ordinal state evidence only'),
    option('EMT001.02','Rarely','PRESSURE_PATTERN state: rarely; direct ordinal state evidence only'),
    option('EMT001.03','Sometimes','PRESSURE_PATTERN state: sometimes; direct ordinal state evidence only'),
    option('EMT001.04','Often','PRESSURE_PATTERN state: often; direct ordinal state evidence only'),
    option('EMT001.05','Almost always','PRESSURE_PATTERN state: almost always; direct ordinal state evidence only'),
    option('EMT001.06','Not sure','No direct evidence effect'),
  ],{stage:'Adaptive state evidence — may itself satisfy focused Stress evidence',burden:0.16}),
  question('EMT002','discriminator','In the past 7 days, when you felt stressed or overwhelmed, what was happening around those times? Select any that fit.','Multi','PRESSURE_PATTERN_CONTEXT',[
    option('EMT002.01','Work or school demands','Occupational stress context relationship hypothesis only; no direct JOB_SECURITY severity'),
    option('EMT002.02','Money or financial pressure','Financial stress context relationship hypothesis only; no additional FINANCIAL_STRAIN severity'),
    option('EMT002.03','Conflict or difficulty with other people','Relationship stress context only; no direct RELATIONSHIP_STRAIN severity'),
    option('EMT002.04','Feeling alone or unsupported','Social support context only; no direct SUPPORT_AVAILABILITY or LONELINESS severity'),
    option('EMT002.05','Problems at home or in my surroundings','Home/surroundings stress context only; no direct Environmental severity'),
    option('EMT002.06','Health, pain, sleep, or low energy','Physical-cluster context only; clarify a direct Physical construct only when decision-relevant'),
    option('EMT002.07','No specific situation consistently stood out','No direct evidence effect'),
    option('EMT002.08','Something else','No direct evidence effect; open clarification only when decision-relevant'),
    option('EMT002.09','Not sure','No direct evidence effect'),
  ],{runtimeStatus:'Conditional / context discrimination only',stage:'Adaptive discrimination — Stress context only when decision-relevant',burden:0.2}),
  question('EMT003','deepening','About how long have stress or difficult emotions been noticeably affecting your daily life?','Single','PRESSURE_PATTERN_DURATION',[
    option('EMT003.01','Less than 2 weeks','Stress duration <2 weeks; duration facet only'),
    option('EMT003.02','2–4 weeks','Stress duration 2–4 weeks; duration facet only'),
    option('EMT003.03','1–3 months','Stress duration 1–3 months; duration facet only'),
    option('EMT003.04','More than 3 months','Stress duration >3 months; duration facet only'),
    option('EMT003.05','They are not noticeably affecting daily life','No noticeable functional impact; facet-specific negative evidence only'),
    option('EMT003.06','Not sure','No direct evidence effect'),
  ],{runtimeStatus:'Conditional / duration deepening only',stage:'Adaptive deepening — duration only when decision-relevant',burden:0.12}),
  question('EMT004','impact-probe','In the past 7 days, how much did stress or difficult emotions interfere with your usual daily activities?','Single','PRESSURE_PATTERN_IMPACT',[
    option('EMT004.01','Not at all','Stress impact none; facet-specific negative evidence only'),
    option('EMT004.02','A little','Stress impact little; impact facet only'),
    option('EMT004.03','Somewhat','Stress impact some; impact facet only'),
    option('EMT004.04','Quite a bit','Stress impact substantial; impact facet only'),
    option('EMT004.05','Very much','Stress impact very high; impact facet only'),
    option('EMT004.06','Not sure','No direct evidence effect'),
  ],{runtimeStatus:'Conditional / impact deepening only',stage:'Adaptive deepening — impact only when decision-relevant',burden:0.14}),
  question('EMT005','support-probe','In the past 7 days, what, if anything, seemed to make stressful periods easier to handle? Select any that fit.','Multi','PRESSURE_PATTERN_FIT',[
    option('EMT005.01','Rest or recovery time','Planning-fit information only'),
    option('EMT005.02','Movement or time outside','Planning-fit information only'),
    option('EMT005.03','Talking with someone I trust','Trusted-person resource context only; no direct SUPPORT_AVAILABILITY severity'),
    option('EMT005.04','More structure or fewer demands','Coping resource context only; no direct SCHEDULE_DISRUPTION severity'),
    option('EMT005.05','Quiet time, reflection, or a calming practice','Planning-fit information only'),
    option('EMT005.06','Something else','No direct evidence effect'),
    option('EMT005.07','Nothing clearly helped','Planning-fit information; no direct wellness severity effect'),
    option('EMT005.08','Not sure','No direct evidence effect'),
  ],{runtimeStatus:'Conditional / fit-resource only',stage:'Adaptive Fit — coping/resources only when Planning changes',burden:0.12}),
]);
