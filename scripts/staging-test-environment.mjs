import {readFileSync} from 'node:fs';
const target=JSON.parse(readFileSync(new URL('../supabase/environments/staging.json',import.meta.url),'utf8'));
export function requireStagingTestEnvironment(env=process.env){
 const url=`https://${target.projectRef}.supabase.co`;
 if(target.environment!=='staging'||target.dataClass!=='synthetic-only'||env.EL8_TEST_MUTATIONS!=='allow-synthetic'||env.EL8_SUPABASE_URL!==url)throw new Error('Explicit approved synthetic staging target required');
 if(!env.EL8_SUPABASE_PUBLISHABLE_KEY?.startsWith('sb_publishable_'))throw new Error('Staging publishable key required; privileged keys forbidden');
 const accounts=['A','B'].map(suffix=>({email:env[`EL8_QA_EMAIL_${suffix}`],password:env[`EL8_QA_PASSWORD_${suffix}`]}));
 for(const account of accounts)if(!account.email?.endsWith('@example.invalid')||!account.password)throw new Error('Two synthetic fixture credentials required');
 if(accounts[0].email===accounts[1].email)throw new Error('Distinct members required');
 return {url,key:env.EL8_SUPABASE_PUBLISHABLE_KEY,accounts};
}
