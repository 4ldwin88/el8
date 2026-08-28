// Single browser-edge translation from Discovery concern vocabulary to durable Member State problem IDs.
// Planning owns the P01–P08 registry translation separately; do not put intervention IDs here.
export const PROBLEM_BY_CONCERN=Object.freeze({
 physical_condition:'problem:low_activity',low_activity:'problem:low_activity',low_energy:'problem:low_activity',
 poor_sleep:'problem:poor_sleep',
 money:'problem:financial_strain',money_pressure:'problem:financial_strain',
 work_pressure:'problem:income_gap',work_instability:'problem:income_gap',
 low_direction:'problem:execution_gap',lack_direction:'problem:execution_gap',low_focus:'problem:execution_gap',schedule_disruption:'problem:execution_gap',
 stress:'problem:stress',
 relationship_strain:'problem:social_disconnection',low_support:'problem:social_disconnection',
 home_instability:'problem:environment_friction'
});
export const MEMBER_PROBLEM_IDS=Object.freeze([...new Set(Object.values(PROBLEM_BY_CONCERN))]);
const MEMBER_PROBLEM_ID_SET=new Set(MEMBER_PROBLEM_IDS);
export function canonicalMemberProblemId(id){
 if(!id)return null;
 const value=String(id);
 if(MEMBER_PROBLEM_ID_SET.has(value))return value;
 return PROBLEM_BY_CONCERN[value]||null;
}
