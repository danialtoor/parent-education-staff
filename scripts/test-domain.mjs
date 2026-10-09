import ts from 'typescript';
import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
fs.mkdirSync('.sites-runtime/checks',{recursive:true});
fs.writeFileSync('.sites-runtime/checks/package.json',JSON.stringify({type:'commonjs'}));
for(const name of ['domain','certificates']){const input=fs.readFileSync(`lib/${name}.ts`,'utf8');const result=ts.transpileModule(input,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}});fs.writeFileSync(`.sites-runtime/checks/${name}.js`,result.outputText)}
const result=spawnSync(process.execPath,['--test','tests/domain.test.cjs'],{stdio:'inherit'});process.exit(result.status??1);
