import { Q } from './core.js';

// Canonical General runtime bank reconciled to Drive 02.04.01.
// Legacy IDs are intentionally absent from runtime identity. Effects below are semantic evidence/control facts,
// not legacy concern scores. Deferred/future and retired rows are intentionally excluded.
export const GENERAL_QUESTIONS = Object.freeze([
  Q('GEN001','general','Thinking about your life lately, what has been bothering you or making things harder? Select any that fit.',[],[
    ['money','Money or financial pressure',{routing_prior:'FINANCIAL'}],
    ['work','Work, school, or responsibilities',{routing_prior:'OCCUPATIONAL'}],
    ['health','Health or physical condition',{routing_prior:'PHYSICAL_CONDITION'}],
    ['energy','Low energy or tiredness',{routing_prior:'ENERGY_FUNCTION'}],
    ['sleep','Sleep',{routing_prior:'SLEEP_QUALITY'}],
    ['stress','Stress or difficult emotions',{routing_prior:'PRESSURE_PATTERN'}],
    ['relationships','Relationships',{routing_prior:'RELATIONSHIP_STRAIN'}],
    ['support','Feeling lonely or unsupported',{routing_prior:'SOCIAL_SUPPORT_LONELINESS'}],
    ['home','Home or surroundings',{routing_prior:'ENVIRONMENTAL'}],
    ['focus','Focus or getting started',{routing_prior:'FOCUS_ACTIVATION'}],
    ['direction','Direction, purpose, or knowing what to do next',{routing_prior:'DIRECTION_MEANING_NEXT_STEP'}],
    ['other','Something else',{routing_prior:'UNCLASSIFIED'}],
    ['well','I’m generally doing well',{route:'POSITIVE_DISCOVERY'}],
    ['unsure','I’m not sure',{route:'UNCERTAIN_START'}],
  ],.3,'multi',{stage:'orient',runtimeStatus:'Active'}),

  Q('GEN012','orientation','When life has been going well, what has most helped you keep going?',[],[
    ['people','People I care about',{protective_resource:'PEOPLE'}],
    ['progress','Making progress toward something',{protective_resource:'PROGRESS'}],
    ['enjoyment','Fun, hobbies or things I enjoy',{protective_resource:'ENJOYMENT'}],
    ['responsibility','Responsibilities or people depending on me',{protective_resource:'RESPONSIBILITY'}],
    ['meaning','Purpose, values or something bigger than me',{protective_resource:'MEANING_VALUES'}],
    ['unsure','I’m not sure right now',{}],
  ],.12,'single',{stage:'orient',runtimeStatus:'Conditional / positive-path strength fallback'}),

  Q('GEN100','goal-probe','It sounds like things are generally going okay. What would make EL8 most useful to you right now?',[],[
    ['maintain','Help me keep what is working',{positive_goal:'MAINTAIN'}],
    ['improve','Help me improve something that is already okay',{positive_goal:'IMPROVE'}],
    ['goal','Help me make progress toward a goal',{positive_goal:'GOAL_PROGRESS'}],
    ['understand','Help me understand my patterns over time',{positive_goal:'UNDERSTAND_PATTERNS'}],
    ['explore','Help me explore what I might want to work on',{positive_goal:'EXPLORE'}],
    ['nothing','I do not need EL8 to work on anything right now',{positive_goal:'NO_ACTIVE_FOCUS'}],
    ['unsure','Not sure yet',{}],
  ],.1,'single',{stage:'narrow',runtimeStatus:'Conditional / positive path'}),

  Q('GEN101','strength-probe','What is working well that you would most want to protect or build on?',[],[
    ['health','My health, energy, or routines',{positive_strength_area:'HEALTH_ENERGY_ROUTINES'}],
    ['people','Relationships or support',{positive_strength_area:'RELATIONSHIPS_SUPPORT'}],
    ['work','Work, school, or responsibilities',{positive_strength_area:'WORK_SCHOOL_RESPONSIBILITIES'}],
    ['money','Money or financial stability',{positive_strength_area:'MONEY_STABILITY'}],
    ['home','Home or daily environment',{positive_strength_area:'HOME_ENVIRONMENT'}],
    ['growth','Learning, growth, direction, or purpose',{positive_strength_area:'GROWTH_DIRECTION_PURPOSE'}],
    ['other','Something else',{positive_strength_area:'OTHER'}],
    ['unsure','Not sure',{}],
  ],.1,'single',{stage:'deepen-fit',runtimeStatus:'Conditional / optional positive-path strength'}),

  Q('GEN200','discriminator','If one thing improved over the next 7 days, which change would help your daily life most?',[],[
    ['money','Less money pressure',{priority_salience:'FINANCIAL'}],['work','Work or school feeling steadier',{priority_salience:'OCCUPATIONAL'}],
    ['sleep','Sleeping better',{priority_salience:'SLEEP_QUALITY'}],['energy','Having more energy',{priority_salience:'ENERGY_FUNCTION'}],
    ['people','Relationships or support improving',{priority_salience:'SOCIAL'}],['stress','Feeling less stressed',{priority_salience:'PRESSURE_PATTERN'}],
    ['home','Home or surroundings feeling easier',{priority_salience:'ENVIRONMENTAL'}],['direction','Feeling clearer about what to do next',{priority_salience:'DIRECTION_NEXT_STEP'}],['unsure','Not sure',{}],
  ],.3,'single',{stage:'narrow',runtimeStatus:'Conditional / priority tie-break only'}),

  Q('GEN201','discriminator','Which best describes what seems connected to daily life feeling harder right now?',[],[
    ['outside','Mostly circumstances or events in my life',{context_hypothesis:'CIRCUMSTANCES_EVENTS'}],
    ['inside','Mostly how I have been feeling or functioning',{context_hypothesis:'FEELING_FUNCTIONING'}],['both','A mix of both',{}],['unsure','Not sure',{}],
  ],.2,'single',{stage:'narrow',runtimeStatus:'Conditional / routing ambiguity only'}),

  Q('GEN202','discriminator','When this issue affects you, which area do you usually notice changing first?',[],[
    ['sleep','Sleep',{interaction_hypothesis:'SLEEP'}],['energy','Energy',{interaction_hypothesis:'ENERGY'}],['mood','Mood or stress',{interaction_hypothesis:'MOOD_STRESS'}],
    ['focus','Focus',{interaction_hypothesis:'FOCUS'}],['motivation','Getting started',{interaction_hypothesis:'ACTIVATION'}],['money','Money decisions',{interaction_hypothesis:'MONEY_DECISIONS'}],
    ['people','Relationships',{interaction_hypothesis:'RELATIONSHIPS'}],['routine','Daily routine',{interaction_hypothesis:'DAILY_ROUTINE'}],['unsure','Not sure',{}],
  ],.25,'single',{stage:'deepen-fit',runtimeStatus:'Conditional / relationship ambiguity only'}),

  Q('GEN204','discriminator','Thinking about the past 7 days, which area have you spent the most time worrying about or trying to deal with?',[],[
    ['money','Money',{recent_salience:'FINANCIAL'}],['work','Work or school',{recent_salience:'OCCUPATIONAL'}],['people','Relationships or support',{recent_salience:'SOCIAL'}],
    ['health','Health, sleep, or energy',{recent_salience:'PHYSICAL_CLUSTER'}],['home','Home or surroundings',{recent_salience:'ENVIRONMENTAL'}],['future','Future plans or direction',{recent_salience:'DIRECTION'}],
    ['nothing','Nothing in particular',{}],['unsure','Not sure',{}],
  ],.25,'single',{stage:'narrow',runtimeStatus:'Conditional / priority tie-break alternative'}),

  Q('GEN300','contradiction','Your answers point in different directions. Which option best describes what you mean?',[],[
    ['earlier','My earlier answer was closer',{correction:'EARLIER'}],['new','My newer answer is closer',{correction:'NEWER'}],
    ['both','Both are accurate in different situations',{correction:'CONTEXT_DEPENDENT'}],['unsure','I’m not sure',{}],
  ],.18,'single',{stage:'correction',runtimeStatus:'Conditional / correction'}),

  Q('GEN301','correction','Did EL8 misunderstand which area is making daily life harder?',[],[
    ['no','No',{}],['work','Yes — it is not mainly work',{priority_correction:'OCCUPATIONAL'}],['money','Yes — it is not mainly money',{priority_correction:'FINANCIAL'}],
    ['relationships','Yes — it is not mainly relationships',{priority_correction:'RELATIONSHIPS'}],['support','Yes — it is not mainly support',{priority_correction:'SUPPORT'}],
    ['home','Yes — it is not mainly home',{priority_correction:'ENVIRONMENTAL'}],['direction','Yes — it is not mainly direction',{priority_correction:'DIRECTION'}],['unsure','Not sure',{}],
  ],.18,'single',{stage:'correction',runtimeStatus:'Conditional / correction'}),

  Q('GEN400','healthy-verification','Thinking about the past 7 days, has anything made it meaningfully harder to do your usual daily activities?',[],[
    ['no','No',{functional_impact_verification:'NONE'}],['minor','Yes, but only a little',{functional_impact_verification:'MINOR'}],
    ['yes','Yes, clearly',{functional_impact_verification:'CLEAR'}],['unsure','Not sure',{}],
  ],.14,'single',{stage:'sufficiency',runtimeStatus:'Conditional / positive-path impact ambiguity only'}),

  Q('GEN401','healthy-verification','Do the issues you selected feel manageable without additional help right now?',[],[
    ['yes','Yes',{manageability_context:'MANAGEABLE_WITHOUT_ADDITIONAL_HELP'}],['mixed','Some do and some do not',{manageability_context:'MIXED'}],
    ['no','No',{manageability_context:'ADDITIONAL_HELP_MAY_BE_USEFUL'}],['unsure','Not sure',{}],
  ],.14,'single',{stage:'deepen-fit',runtimeStatus:'Conditional / support-intensity fit only'}),

  Q('GEN900','handoff-validation','Before we move on, does this feel like an accurate enough picture of what you want EL8 to work from?',[],[
    ['yes','Yes, this is accurate enough',{handoff_confirmation:'ACCEPTED'}],['change','Not quite — I need to change something',{handoff_confirmation:'CHANGE_REQUESTED'}],
    ['unsure','I’m not sure yet',{handoff_confirmation:'UNCERTAIN'}],
  ],.08,'single',{stage:'sufficient-handoff',runtimeStatus:'Conditional / final synthesis confirmation'}),

  Q('GEN901','opt-out','Do you want to answer more questions about this right now?',[],[
    ['yes','Yes',{continuation_preference:'CONTINUE'}],['later','Not right now',{opt_out:true}],
  ],.08,'single',{stage:'member-control',runtimeStatus:'Available / member-controlled system action'}),
]);
