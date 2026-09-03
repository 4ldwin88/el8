import{writeFileSync}from'node:fs';
const commit=String(process.env.COMMIT_REF||process.env.GITHUB_SHA||'local-unresolved').trim();
const context=String(process.env.CONTEXT||'local').trim();
const deployId=String(process.env.DEPLOY_ID||process.env.DEPLOY_PRIME_URL||'local-unresolved').trim();
const js=`// Generated at deploy/build time. Do not hand-edit deployed values.\nexport const INTELLIGENCE_TEST_DEPLOYED_COMMIT=${JSON.stringify(commit)};\nexport const INTELLIGENCE_TEST_DEPLOY_CONTEXT=${JSON.stringify(context)};\nexport const INTELLIGENCE_TEST_DEPLOY_BUILD_ID=${JSON.stringify(deployId)};\n`;
writeFileSync(new URL('../app/research/intelligence-test-build.js',import.meta.url),js);
console.log(`Human-QA build provenance: ${commit} (${context})`);
