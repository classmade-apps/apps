import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {execFileSync} from 'node:child_process';
import vm from 'node:vm';
const file=new URL('../index.html',import.meta.url);
test('checked-in standalone app matches its build and has no runtime dependencies',async()=>{
 const before=await readFile(file,'utf8');
 execFileSync(process.execPath,[new URL('../build.mjs',import.meta.url).pathname]);
 const after=await readFile(file,'utf8');
 assert.equal(after,before,'Rebuild index.html before committing source changes.');
 assert.doesNotMatch(after,/<(?:script|link|img)[^>]+(?:src|href)=/i);
 const script=after.match(/<script>([\s\S]*?)<\/script>/)?.[1];
 assert.ok(script);assert.doesNotThrow(()=>new vm.Script(script));assert.doesNotMatch(script,/^\s*(import|export)\s/m);
 assert.match(after,/MIT License/);
});
