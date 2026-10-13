const {test}=require('node:test');
const assert=require('node:assert/strict');
const {seed,apply}=require('../.sites-runtime/checks/domain.js');
const {prepareParentData,applyParent}=require('../.sites-runtime/checks/parent.js');
const {caseSearchKey,findRegistrationCases,accountErrors,createDemoCredential,verifyDemoPassword}=require('../.sites-runtime/checks/parent-auth.js');
const fresh=()=>prepareParentData(seed());
test('registration requires both exact case and last name, and accepts court number punctuation',()=>{
 const d=fresh();assert.equal(caseSearchKey('26D1328'),caseSearchKey('2026-D-001328'));assert.notEqual(caseSearchKey('1926D1328'),caseSearchKey('26D1328'));
 for(const [number,name] of [['','Bennett'],['26D1328',''],['26D1328','Ben'],['26D1328','Olivia Bennett'],['26D9999','Bennett']])assert.equal(findRegistrationCases(d,number,name).length,0);
 assert.equal(findRegistrationCases(d,'26 D 1328',' bennett ')[0].id,'c23');
 d.cases[22].active=false;assert.equal(findRegistrationCases(d,'26D1328','Bennett').length,0);
 d.cases[22].active=true;d.cases[22].lastName='De La Cruz';assert.equal(findRegistrationCases(d,'26D1328','de la cruz')[0].id,'c23');
});
test('account validation explains email confirmation and password rules independently',()=>{
 assert.deepEqual(accountErrors('a@example.com','A@example.com','SamplePass9','SamplePass9'),{});
 assert.deepEqual(Object.keys(accountErrors('bad','other','short','different')).sort(),['confirmEmail','confirmPassword','email','password']);
 assert.ok(accountErrors('a@example.com','a@example.com','A'.repeat(129)+'a1','A'.repeat(129)+'a1').password);
});
test('new password survives data reload, does not accept the seed password, and detachment removes credentials',async()=>{
 const password='FictionalPass9';const credential=await createDemoCredential(password);const second=await createDemoCredential(password);assert.notEqual(credential.salt,second.salt);assert.notEqual(credential.digest,second.digest);
 let d=applyParent(fresh(),{type:'parent.register',caseId:'c23',number:'26D1328',lastName:'Bennett',email:'olivia.sample@example.com',credential});
 assert.equal(d.cases[22].activated,false);assert.equal(JSON.stringify(d).includes(password),false);
 d=JSON.parse(JSON.stringify(d));assert.equal(await verifyDemoPassword(d.cases[22],password),true);assert.equal(await verifyDemoPassword(d.cases[22],'sample-pass'),false);assert.equal(await verifyDemoPassword(d.cases[22],'wrong'),false);
 d=applyParent(d,{type:'parent.activate',caseId:'c23'});assert.equal(d.cases[22].activated,true);
 d=apply(d,{type:'case.detach',id:'c23'});assert.equal(d.cases[22].demoCredential,undefined);assert.equal(await verifyDemoPassword(d.cases[22],password),false);
});
test('registration refuses mismatched selected cases, reused email, and missing credentials',async()=>{
 const credential=await createDemoCredential('SamplePass9');const action={type:'parent.register',caseId:'c23',number:'26D1328',lastName:'Bennett',email:'new@example.com',credential};const d=fresh();
 assert.throws(()=>applyParent(d,{...action,caseId:'c24'}),/match/);
 assert.throws(()=>applyParent(d,{...action,email:d.cases[0].email}),/already/);
 assert.throws(()=>applyParent(d,{...action,credential:{salt:'',digest:''}}),/password/i);
 assert.equal(await verifyDemoPassword(d.cases[0],'sample-pass'),true);
});
