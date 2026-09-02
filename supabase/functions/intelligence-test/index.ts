import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const allowed=(o:string)=>o==="https://4ldwin88.github.io"||/^https:\/\/deploy-preview-\d+--el8\.netlify\.app$/.test(o)||o==="";
const cors=(o:string)=>({"Access-Control-Allow-Origin":allowed(o)&&o?o:"https://4ldwin88.github.io","Vary":"Origin","Access-Control-Allow-Headers":"content-type","Access-Control-Allow-Methods":"POST, OPTIONS","Content-Type":"application/json"});
const clean=(v:unknown,n:number)=>typeof v==='string'?v.slice(0,n):null;

Deno.serve(async(req:Request)=>{
  const origin=req.headers.get("origin")||"",h=cors(origin);
  if(req.method==="OPTIONS")return new Response(allowed(origin)?"ok":"Forbidden",{status:allowed(origin)?200:403,headers:h});
  if(req.method!=="POST"||!allowed(origin))return new Response(JSON.stringify({ok:false}),{status:403,headers:h});
  try{
    const url=new URL(req.url),action=url.pathname.split('/').filter(Boolean).pop(),raw=await req.json();
    const b=raw?.telemetry_schema_version&&raw?.data?raw.data:raw;
    const envelope=raw?.telemetry_schema_version?raw:null;
    const sb=createClient(Deno.env.get("SUPABASE_URL")!,Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    if(!b?.session_id)throw new Error('session_id required');
    if(action==="event"){
      if(b.event_type==="test_started"){
        const meta=envelope?.version_meta||{};
        const session={id:b.session_id,test_version:meta.test_version||'unknown',build_version:meta.harness_version||meta.build_version||'',engine_version:meta.components||{},tester_mode:b.payload?.tester_mode||"prefer_not_to_say",status:"started",last_stage:b.stage||'introduction',elapsed_ms:b.elapsed_ms||0,client_meta:{origin,version_meta:meta},qa_environment:envelope?.qa_environment||'internal_human_qa',simulation:envelope?.simulation!==false,telemetry_schema_version:envelope?.telemetry_schema_version||'1.0.0',engine_candidate_sha:clean(meta.engine_candidate_sha||meta.candidate_sha,64),deployment_id:clean(meta.deployment_id,128)};
        const{error}=await sb.rpc('el8_intelligence_test_start',{p_session:session});if(error)throw error;
      }
      const evt={...b,payload:{...(b.payload||{}),qa_envelope:envelope?{telemetry_schema_version:envelope.telemetry_schema_version,qa_environment:envelope.qa_environment,simulation:envelope.simulation,version_meta:envelope.version_meta}:undefined}};
      const{error}=await sb.rpc('el8_intelligence_test_event',{p_event:evt});if(error)throw error;
      return new Response(JSON.stringify({ok:true}),{status:201,headers:h});
    }
    if(action==="note"){
      const n={session_id:b.session_id,stage:b.stage,screen_id:b.screen_id,question_id:b.question_id??null,elapsed_ms:b.elapsed_ms||0,note_text:b.text||b.note_text,version_meta:envelope?.version_meta||b.version_meta||{}};
      const{error}=await sb.rpc('el8_intelligence_test_note',{p_note:n});if(error)throw error;
      return new Response(JSON.stringify({ok:true}),{status:201,headers:h});
    }
    if(action==="complete"){
      const result={...b,simulation:envelope?.simulation!==false,qa_environment:envelope?.qa_environment||b.qa_environment||'internal_human_qa',version_meta:envelope?.version_meta||b.version_meta||{}};
      const{error}=await sb.rpc('el8_intelligence_test_complete',{p_result:result});if(error)throw error;
      return new Response(JSON.stringify({ok:true}),{status:201,headers:h});
    }
    return new Response(JSON.stringify({ok:false,error:"unknown action"}),{status:404,headers:h});
  }catch(e){console.error(e);return new Response(JSON.stringify({ok:false,error:String((e as Error)?.message||e)}),{status:500,headers:h})}
});
