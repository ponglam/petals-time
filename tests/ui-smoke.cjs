/* Run with Playwright installed, or PLAYWRIGHT_MODULE=/absolute/path/to/playwright.
   Uses local Chrome. No web services, installs or renderer substitutions. */
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const assert=require('node:assert/strict');
const path=require('node:path');
const {pathToFileURL}=require('node:url');
const root=path.resolve(__dirname,'..');
const base=process.env.PETALS_BASE_URL||pathToFileURL(root+'/').href;
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true,args:['--enable-webgl','--ignore-gpu-blocklist']});
 try{
 const page=await browser.newPage({viewport:{width:1440,height:1000},acceptDownloads:true});
 const errors=[];page.on('pageerror',e=>errors.push(e.stack));
 const go=async url=>{await page.goto(url);await page.waitForFunction(()=>window.__petals&&document.querySelector('#loading')?.hidden);};
 await go(base+'index.html#seed=G3&family=2&age=7301');
 assert(page.url().includes('/studio/'));
 assert.equal(await page.locator('#track').getAttribute('aria-valuemin'),'5476');
 assert.equal(await page.locator('#track').getAttribute('aria-valuemax'),'9126');
 const image=()=>page.evaluate(()=>{window.__petals.render();return document.querySelector('#cv').toDataURL();});
 const original=await image();
 // UI migration must produce exactly the original renderer's pixels on this GPU.
 const old=await browser.newPage();
 await old.goto(base+'versions/0.6.0/index.html#seed=G3&family=2&age=7301&v=0.6.0');
 await old.waitForFunction(()=>window.__petals);
 assert.equal(await old.evaluate(()=>{window.__petals.render();return document.querySelector('#cv').toDataURL();}),original);
 await old.close();
 const track=page.locator('#track');await track.focus();await page.keyboard.press('Home');
 assert.equal(await page.evaluate(()=>window.__petals.state.age),5476);assert(await page.locator('#back').isDisabled());
 const past=await image();assert.notEqual(past,original);
 await page.keyboard.press('End');assert.equal(await page.evaluate(()=>window.__petals.state.age),9126);assert(await page.locator('#fwd').isDisabled());
 assert.notEqual(await image(),past);
 await page.locator('#nowBtn').click();assert.equal(await image(),original);
 await page.locator('#fwd').click();assert.equal(await page.evaluate(()=>window.__petals.state.age),7302);
 await page.locator('#back').click();assert.equal(await image(),original);
 await track.focus();await page.keyboard.press('Shift+ArrowRight');assert.equal(await page.evaluate(()=>window.__petals.state.age),7666);
 await page.locator('#nowBtn').click();
 const bounds=await track.boundingBox();await page.mouse.click(bounds.x,bounds.y+bounds.height/2);assert.equal(await page.evaluate(()=>window.__petals.state.age),5476);
 await page.locator('#nowBtn').click();
 await page.locator('#play').click();await page.waitForFunction(()=>window.__petals.state.age>7301);await page.locator('#play').click();assert.equal(await page.locator('#play').getAttribute('aria-pressed'),'false');
 await page.locator('#time-window').selectOption('20');await track.focus();await page.keyboard.press('End');assert.equal(await page.evaluate(()=>window.__petals.state.age),14601);
 await page.locator('#time-window').selectOption('5');assert.equal(await page.evaluate(()=>window.__petals.state.age),9126);
 await page.locator('#bd').fill('2000-01-01');await page.locator('#bt').fill('12:34');await page.locator('#birth-form button[type=submit]').click();
 const birthdaySeed=await page.evaluate(()=>window.__petals.state.seed);assert.equal(birthdaySeed,await page.evaluate(()=>window.__petals.birthToSeed('2000-01-01T12:34')));
 const birthImage=await image();
 for(const theme of ['tint','dark','system','paper']){await page.locator('#theme').selectOption(theme);assert.equal(await image(),birthImage);}
 await page.locator('#family').selectOption('4');assert.notEqual(await image(),birthImage);
 await page.locator('#family').focus();await page.keyboard.press('Space');assert.equal(await page.evaluate(()=>window.__petals.state.playing),false);await page.keyboard.press('Escape');
 await page.locator('#tuneBtn').click();assert.equal(await page.locator('#tuneBtn').getAttribute('aria-expanded'),'true');
 await page.locator('#seed').fill('TEST-01');await page.locator('#seed').press('Tab');assert.equal(await page.evaluate(()=>window.__petals.state.seed),'TEST-01');
 const beforeTune=await image();await page.locator('#tune input[type=range]').first().fill('0');assert.notEqual(await image(),beforeTune);
 await page.getByRole('button',{name:'Reset tuning',exact:true}).click();assert.equal(await image(),beforeTune);assert.equal(await page.locator('#seed').inputValue(),'TEST-01');
 const pngWait=page.waitForEvent('download');await page.locator('#savePng').click();const png=await pngWait;assert(png.suggestedFilename().endsWith('.png'));assert.equal(await png.failure(),null);
 const jsonWait=page.waitForEvent('download');await page.locator('#saveJson').click();const json=await jsonWait;const chunks=[];for await(const chunk of await json.createReadStream())chunks.push(chunk);const data=JSON.parse(Buffer.concat(chunks));assert.equal(data.seed,'TEST-01');assert.equal(data.rendererVersion,'0.6.0');
 await page.locator('#randBd').click();assert.match(await page.locator('#bd').inputValue(),/^\d{4}-\d\d-\d\d$/);assert.equal(await page.evaluate(()=>window.__petals.state.age),7301);
 for(const width of [1440,1024,768,640,390,320]){await page.setViewportSize({width,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,`overflow ${width}`);}
 await page.setViewportSize({width:1440,height:1000});await page.locator('#tuneBtn').click();await page.screenshot({path:process.env.PETALS_SCREENSHOT_DIR?process.env.PETALS_SCREENSHOT_DIR+'/desktop.png':'/private/tmp/petals-desktop.png',fullPage:true});
 await page.setViewportSize({width:390,height:844});await page.screenshot({path:process.env.PETALS_SCREENSHOT_DIR?process.env.PETALS_SCREENSHOT_DIR+'/mobile.png':'/private/tmp/petals-mobile.png',fullPage:true});
 await go(base+'studio/index.html#seed=G3&age=1&v=0.6.0');assert.equal(await page.locator('#time-window').inputValue(),'20');assert.equal(await page.evaluate(()=>window.__petals.state.age),1);
 await page.goto(base+'index.html#seed=G3&age=7301&v=0.6.0');assert(page.url().includes('/versions/0.6.0/'));
 assert.deepEqual(errors,[]);
 console.log('PASS: unchanged renderer pixels; reverse scrubbing; ±5/±20 bounds; pointer/keyboard; day stepping/playback; birthday seed; theme isolation; family/tuning; PNG/JSON; legacy links; layouts 320–1440px.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
