// Governed cross-dimensional bridge candidates. Source: Drive 02.04.01 — Cross-dimensional.
// Drive currently retains two answer candidates whose historical XDM001 parent is not retained as a governed question.
// They are deliberately non-runnable until a governed parent/trigger is approved; this prevents orphan options entering Discovery.
export const QUESTIONS=Object.freeze([]);
export const ANSWERS=Object.freeze([
Object.freeze({id:'XDM001.02',parentId:'XDM001',text:'Money or income pressure seems connected to the work choices available to me',status:'targeted-bridge-candidate',runnable:false,effect:Object.freeze({kind:'relationship_hypothesis',key:'money_work_choice',noDirectSeverity:true})}),
Object.freeze({id:'XDM001.04',parentId:'XDM001',text:'My work is stable enough, but it is not a good fit',status:'targeted-fit-candidate',runnable:false,effect:Object.freeze({kind:'context',key:'work_fit',value:'stable_but_poor_fit',noDirectSeverity:true})})]);
export default Object.freeze({questions:QUESTIONS,answers:ANSWERS});