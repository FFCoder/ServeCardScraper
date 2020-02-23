const puppeteer = require('puppeteer');
const urls = require('./urls');

const getBalance = async function(userName, passWord, securityAnswer) {
    try {
        // Catch missing fields
        if ((!userName) | (!passWord)) {
            throw "Username or Password not defined"
        }
        if(!securityAnswer) {
            throw "No Security Question Answer Given!";
        }
        // Setup Code
        if (process.env.RUNAS_FIREBASE) {
            const browser = await puppeteer.launch({args: ['--no-sandbox']});
        }
        else {
            const browser = await puppeteer.launch();
        }
        
        const page = await browser.newPage();
        await page.goto(urls.Login);
        console.log("Logging In");
        
        // Login
        await page.type('#UserName', userName);
        await page.type('#Password', passWord);

        const loginBtn = await page.waitForXPath("/html/body/div[1]/form/div[2]/div/div[2]/div[2]/div[1]/div/input");
        await loginBtn.click();
        console.log("Handling Security Question");
        
        const securityInput = await page.waitFor('#SecurityAnswer');
        await securityInput.type(securityAnswer);
        const securityBtn = await page.waitForXPath("//input[@value='Continue']")
        await securityBtn.click();

        // Get Balance
        console.log("Getting Balance");
        
        const balanceField = await page.waitForSelector('#availableBalanceAmount', {timeout: 10000});
        const balance = await page.evaluate(balanceField => balanceField.textContent, balanceField);
        await browser.close();
        return parseFloat(balance.replace("$",""));
    } catch (exc) {
        console.error(exc);
        await browser.close();
        return null;
    }
}

module.exports = getBalance;