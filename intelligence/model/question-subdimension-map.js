// Canonical primary subdimension for each Question & Signal Matrix signal.
// Questions inherit this mapping through primary_signal. Driver/action/spillover
// options may later add explicit secondary subdimension effects.
export const SIGNAL_SUBDIMENSION={
 P01:'Physical.Sleep',P02:'Physical.Sleep',P03:'Physical.Energy',P04:'Physical.Movement',P05:'Physical.Nutrition',P06:'Physical.MedicalHealth',P07:'Physical.Energy',
 E01:'Emotional.Mood',E02:'Emotional.Stress',E03:'Emotional.Stress',E04:'Emotional.Resilience',E05:'Emotional.Manageability',E06:'Emotional.Mood',
 S01:'Social.Connection',S02:'Social.Connection',S03:'Social.Support',S04:'Social.RelationshipQuality',S05:'Social.Belonging',
 SP01:'Spiritual.Meaning',SP02:'Spiritual.Purpose',SP03:'Spiritual.ValuesAlignment',SP04:'Spiritual.InnerPeace',SP05:'Spiritual.Practice',
 I01:'Intellectual.Curiosity',I02:'Intellectual.Learning',I03:'Intellectual.CognitiveLoad',I04:'Intellectual.Focus',I05:'Intellectual.Curiosity',
 O01:'Occupational.Direction',O02:'Occupational.Workload',O03:'Occupational.Workload',O04:'Occupational.EmploymentStability',O05:'Occupational.Satisfaction',O06:'Occupational.Satisfaction',
 F01:'Financial.ExpenseLoad',F02:'Financial.DebtBurden',F03:'Financial.Security',F04:'Financial.FinancialControl',F05:'Financial.FinancialControl',F06:'Financial.Liquidity',
 V01:'Environmental.Safety',V02:'Environmental.Comfort',V03:'Environmental.EnvironmentalStress',V04:'Environmental.Access',V05:'Environmental.Comfort',V06:'Environmental.Stability'
};
export function primarySubdimensionForQuestion(q={}){return SIGNAL_SUBDIMENSION[q.primary_signal||q.signal]||null}
