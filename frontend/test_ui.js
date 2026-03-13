import puppeteer from 'puppeteer';

(async () => {
    try {
        console.log("Launching browser...");
        const browser = await puppeteer.launch({ headless: "new" });
        const page = await browser.newPage();

        page.on('console', msg => console.log('BROWSER LOG:', msg.text()));
        page.on('pageerror', error => console.log('BROWSER ERROR:', error.message));
        page.on('requestfailed', request => {
            console.log('REQUEST FAILED:', request.url(), request.failure().errorText);
        });

        console.log("Navigating to http://localhost:5173/lorries ...");
        await page.goto('http://localhost:5173/lorries', { waitUntil: 'networkidle0' });

        console.log("Clicking 'Add New Own Lorry' button...");
        await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button'));
            const addBtn = btns.find(b => b.textContent.includes('Add New Own Lorry'));
            if (addBtn) addBtn.click();
        });

        await new Promise(r => setTimeout(r, 1000));

        console.log("Filling form...");
        await page.type('input[placeholder="e.g. AP 39 TE 1234"]', 'AP 01 TEST 123');

        console.log("Clicking 'Save Own Lorry' submit button within form...");
        await page.evaluate(() => {
            const btns = Array.from(document.querySelectorAll('button[type="submit"]'));
            const saveBtn = btns.find(b => b.textContent.includes('Save Own Lorry'));
            if (saveBtn) saveBtn.click();
        });

        console.log("Waiting 3 seconds to capture network responses or errors...");
        await new Promise(r => setTimeout(r, 3000));

        await browser.close();
        console.log("Done.");
    } catch (err) {
        console.error("Puppeteer Script Error:", err);
    }
})();
