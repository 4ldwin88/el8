// EL8 Adaptive Discovery v1 — branching question bank
// Positive evidence has magnitude; question roles support actual route changes.
export const DISCOVERY_ANSWERS = [
  {id:'very_well',label:'Very well',direction:-1,strength:1,uncertaintyReduction:.8},
  {id:'okay',label:'Okay',direction:-1,strength:.4,uncertaintyReduction:.45},
  {id:'some_strain',label:'Some strain',direction:1,strength:.45,uncertaintyReduction:.5},
  {id:'significant_strain',label:'Significant strain',direction:1,strength:1,uncertaintyReduction:.8},
  {id:'unsure',label:'Unsure',direction:0,strength:0,uncertaintyReduction:.05}
];

const q=(id,role,prompt,signals,extra={})=>({id,role,prompt,signals,burden:1,...extra});
export const DISCOVERY_QUESTION_BANK=[
 q('D_SYSTEM_WEIGHT','discriminator','When life feels harder lately, where does the weight seem to come from most?',['employment_stability','financial_security','social_connection','sleep','stress','purpose','environmental_stability','cognitive_load'],{format:'driver_choice'}),
 q('D_PRACTICAL_INTERNAL','contrast','Is the pressure mostly practical and external, mostly internal, or genuinely mixed?',['employment_stability','financial_security','environmental_stability','stress','purpose','cognitive_load'],{format:'contrast'}),
 q('D_ENERGY_SOURCE','bridge','If your energy is lower, does it feel more tied to sleep/body, mental load, responsibilities, or carrying things alone?',['sleep','cognitive_load','employment_stability','social_connection'],{format:'driver_choice'}),
 q('D_BACKGROUND_WEIGHT','discriminator','Is there a recurring background weight even when nothing specific is happening?',['stress','financial_security','employment_stability','social_connection','purpose'],{format:'weighted'}),
 q('F_MONEY_SECURITY','state','How secure and manageable do money and essential expenses feel right now?',['financial_security'],{format:'weighted'}),
 q('F_MONEY_DRIVER','driver','What is putting the most pressure on your finances?',['financial_security','employment_stability'],{format:'driver_choice'}),
 q('O_WORK_STABILITY','state','How stable and manageable do your work, school, or daytime responsibilities feel?',['employment_stability'],{format:'weighted'}),
 q('O_WORK_EFFECT','bridge','When work or responsibilities are difficult, what do they affect most: money, stress, energy, or sense of direction?',['employment_stability','financial_security','stress','sleep','purpose'],{format:'driver_choice'}),
 q('S_CONNECTION','state','How supported and genuinely connected to other people do you feel?',['social_connection'],{format:'weighted'}),
 q('S_CARRY_ALONE','driver','When something is difficult, how often do you feel you are carrying it mostly alone?',['social_connection','stress'],{format:'weighted'}),
 q('P_SLEEP','state','How restorative and reliable has your sleep been?',['sleep'],{format:'weighted'}),
 q('P_SLEEP_EFFECT','bridge','When sleep is off, what seems most connected to it: stress, schedule/responsibilities, environment, or no clear cause?',['sleep','stress','employment_stability','environmental_stability'],{format:'driver_choice'}),
 q('E_STRESS','state','How manageable has your stress level felt recently?',['stress'],{format:'weighted'}),
 q('E_STRESS_DRIVER','driver','What seems to drive your stress most when it shows up?',['stress','financial_security','employment_stability','social_connection','environmental_stability','cognitive_load'],{format:'driver_choice'}),
 q('I_LOAD','state','How manageable has your mental load and ability to focus been?',['cognitive_load'],{format:'weighted'}),
 q('SP_DIRECTION','state','How clear and satisfying does your sense of direction or purpose feel?',['purpose'],{format:'weighted'}),
 q('ENV_SUPPORT','state','How supportive and stable does your everyday environment feel?',['environmental_stability'],{format:'weighted'}),
 q('C_CONTRADICTION','contradiction','Something does not quite line up yet. Which statement feels closer to what is actually happening?',['sleep','stress','social_connection','employment_stability','financial_security','environmental_stability','purpose','cognitive_load'],{format:'contrast'})
];
