import sys, asyncio
from playwright.async_api import async_playwright
async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(args=["--use-gl=angle","--use-angle=swiftshader","--enable-unsafe-swiftshader","--ignore-gpu-blocklist"])
        shots = [a.split('|') for a in sys.argv[1:]]
        for q, out, size in shots:
            w,h = map(int,size.split('x'))
            pg = await b.new_page(viewport={'width':w,'height':h}, device_scale_factor=1)
            logs=[]
            pg.on('console', lambda m: logs.append(m.type+': '+m.text))
            pg.on('pageerror', lambda e: logs.append('PAGEERR '+str(e)))
            await pg.goto('http://localhost:4173/'+q)
            await pg.wait_for_timeout(5000)
            await pg.screenshot(path=out)
            print(out, logs[:10])
            await pg.close()
        await b.close()
asyncio.run(main())
