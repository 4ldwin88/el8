// Canonical post-selection activation evidence.
// These requirements may tailor or gate an already-selected intervention; they must not
// re-establish the problem, re-rank priorities, or repeat pre-selection evidence.
const requirement=x=>Object.freeze({requiredBeforeActivation:true,...x});

const REQUIREMENTS=Object.freeze({
  I05_INCOME_EXPERIMENT:Object.freeze([
    requirement({
      id:'income-experiment-definition',
      evidenceKey:'activation.income_experiment',
      purpose:'personalization',
      decisionImpact:'Defines the bounded income experiment that will actually be activated.',
      prompt:'What specific offer, product, service, or income idea will you test first?'
    })
  ])
});

export function activationRequirementsForIntervention(interventionId){
  return (REQUIREMENTS[interventionId]||[]).map(x=>({...x}));
}
