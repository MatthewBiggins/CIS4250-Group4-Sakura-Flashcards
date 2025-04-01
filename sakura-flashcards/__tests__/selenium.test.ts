import { Builder, By, Locator, until, WebDriver } from 'selenium-webdriver';
import * as chrome from 'selenium-webdriver/chrome';
import 'chromedriver';
import { exec, spawn } from 'child_process';
import axios from 'axios';
import { doc, getDoc, deleteDoc, collection, query, where, getDocs, and, addDoc, serverTimestamp } from 'firebase/firestore';
import db from "../firebase/configuration";
import { hash } from "../utils/hash";

const chromeOptions = new chrome.Options();
chromeOptions.addArguments('--no-sandbox');
// chromeOptions.addArguments('--headless');
chromeOptions.addArguments('--disable-dev-shm-usage');

// Utility to wait for the server to be ready
function waitForServer(url: string, retries = 20, delay = 1000): Promise<void> {
    return new Promise((resolve, reject) => {
        const check = async () => {
            for (let i = 0; i < retries; i++) {
                try {
                    const response = await axios.get(url);
                    if (response.status === 200) {
                        resolve(); // Server is up
                        return;
                    }
                } catch (error) {
                    console.log(`Waiting for server... Attempt ${i + 1}`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
            }
            reject(new Error('Server is not ready after multiple attempts'));
        };
        check();
    });
}

describe('Selenium test', () => {
    let driver: WebDriver;
    let serverProcess: any;
    const USERNAME = 'seleniumTest';
    const EMAIL = 'selenium@test.com';
    const PASSWORD = 'password'; 
    const usersRef = collection(db, "users");
    const usernameQuery = query(
        usersRef,
        and(where("username", "==", USERNAME), where("email", "==", EMAIL))
    );
    async function wait(timeout: number){
        try {
            await driver.wait(until.urlIs("http://localhost:3000/nonexistantpage"), timeout);
        } catch (e) {
            return;
        }
    }
    async function getElementExists(locator: Locator, timeout: number = -1) {

        if (timeout > 0){
            try {
                await driver.wait(until.elementLocated(locator), timeout);
                return true;
            } catch (e){
                return false;
            }
        } else {
            let elements = await driver.findElements(locator);
            return elements.length > 0;
        }
    }

    async function login(email: string = "test@gmail.com", pass: string = "test") {
        // Navigate to login page
        await driver.get('http://localhost:3000/login');
        
        // Find html element with id='email'
        let emailInput = await driver.findElement(By.id('email'));
        // Simulate typing email into input box
        await emailInput.sendKeys(email);
        
        let passwordInput = await driver.findElement(By.id('password'));
        await passwordInput.sendKeys(pass);
        
        // Find submit button, simulate click
        let submitButton = await driver.findElement(By.css('button[type="submit"]'));
        await submitButton.click();

        // Wait for the URL to be the expected dashboard URL
        await driver.wait(until.urlIs('http://localhost:3000/dashboard'), 5000);

        // Check the HTTP status code to verify it is 200
        const response = await axios.get('http://localhost:3000/dashboard');
        expect(response.status).toBe(200);
    }
    beforeAll(async () => {
        driver = await new Builder()
            .forBrowser('chrome')
            .setChromeOptions(chromeOptions)
            .build();
        // Start the server using `npm run dev`
        serverProcess = spawn('npm', ['run', 'dev'])
        serverProcess.on('error', (err: string) => console.error("Error starting server: " + err))
        
        // Wait for the server to be available
        await waitForServer('http://localhost:3000');

        //Delete test user in case it was not deleted
        const usernameSnapshot = await getDocs(usernameQuery);
        await Promise.all(usernameSnapshot.docs.map(doc => deleteDoc(doc.ref)));
        await driver.quit();

    }, 120000);

    describe('Account Tests', () => {
        beforeEach(async () => {
            driver = await new Builder()
                .forBrowser('chrome')
                .setChromeOptions(chromeOptions)
                .build();
        }, 120000);

        it('Load page', async () => {
            await driver.get('http://localhost:3000/');
            
            let loginFound = await getElementExists(By.id('login'), 5000);
            let signupFound = await getElementExists(By.id('signup'));
            expect(loginFound).toBe(true);
            expect(signupFound).toBe(true);
        }, 20000);

        it('Login and verify redirection status code 200', async () => {
            await login();

            let logOutFound = await getElementExists(By.id('logout'), 5000);
            let loginFound = await getElementExists(By.id('login'));
            let signupFound = await getElementExists(By.id('signup'));

            // Check that logout link exists, login and signup are gone
            expect(logOutFound).toBe(true);
            expect(loginFound).toEqual(false);
            expect(signupFound).toEqual(false);
        }, 20000);

        it('Logout and verify redirection status code 200', async () => {
            await login();
            
            await driver.get('http://localhost:3000/');
            
            await driver.wait(until.elementLocated(By.id('logout')), 5000);
            let logoutButton = await driver.findElement(By.id('logout'));
            await logoutButton.click();
            
            let loginFound = await getElementExists(By.id('login'), 5000);
            let signupFound = await getElementExists(By.id('signup'));
            let logoutFound = await getElementExists(By.id('logout'));
            
            expect(loginFound).toBe(true);
            expect(signupFound).toBe(true);
            expect(logoutFound).toBe(false);
        }, 20000);

        it('Create account', async () => {
            const testUserEmpty = (await getDocs(usernameQuery)).empty;

            expect(testUserEmpty).toBe(true);
        
            await driver.get('http://localhost:3000/sign-up');
            
            let signupButton = await driver.findElement(By.id('signup'));
            await signupButton.click();
            
            let userInput = await driver.findElement(By.id('username'));
            await userInput.sendKeys(USERNAME);
            let emailInput = await driver.findElement(By.id('email'));
            await emailInput.sendKeys(EMAIL);
            let passInput = await driver.findElement(By.id('password'));
            await passInput.sendKeys(PASSWORD);
            let pass2Input = await driver.findElement(By.id('password2'));
            await pass2Input.sendKeys(PASSWORD);

            let submitButton = await driver.findElement(By.css('button[type="submit"]'));
            await submitButton.click();
            
            await driver.wait(until.urlIs('http://localhost:3000/dashboard'), 5000);
        
            const usernameSnapshot = await getDocs(usernameQuery);

            expect(usernameSnapshot.empty).toBe(false);
        }, 20000);


        afterEach(async () => {
            await driver.quit();
            console.log('Browser closed');
        });
    });

    describe('Dashboard tests', () => {
        const DASHEMAIL = "dashtest@gmail.com";
        const DASHUSER = "DashTest";
        const DASHPASSWORD = 'test';
        const dashQuery = query(
            usersRef,
            and(where("username", "==", DASHUSER), where("email", "==", DASHEMAIL))
        );

        beforeEach(async () => {
            driver = await new Builder()
                .forBrowser('chrome')
                .setChromeOptions(chromeOptions)
                .build();
        }, 120000);

        beforeAll(async () => {
            const usernameSnapshot = await getDocs(dashQuery);
            await Promise.all(usernameSnapshot.docs.map(doc => deleteDoc(doc.ref)));
            driver = await new Builder()
                .forBrowser('chrome')
                .setChromeOptions(chromeOptions)
                .build();
            await driver.get('http://localhost:3000/sign-up');
            
            let signupButton = await driver.findElement(By.id('signup'));
            await signupButton.click();
            
            let userInput = await driver.findElement(By.id('username'));
            await userInput.sendKeys(DASHUSER);
            let emailInput = await driver.findElement(By.id('email'));
            await emailInput.sendKeys(DASHEMAIL);
            let passInput = await driver.findElement(By.id('password'));
            await passInput.sendKeys(DASHPASSWORD);
            let pass2Input = await driver.findElement(By.id('password2'));
            await pass2Input.sendKeys(DASHPASSWORD);
            let submitButton = await driver.findElement(By.css('button[type="submit"]'));
            await submitButton.click();
        
            
            await driver.wait(until.urlIs('http://localhost:3000/dashboard'), 5000);
            await getElementExists(By.id("Useful Expressions (In the Classroom)"), 5000);
            await driver.quit();
        })


        it('Dashboard cannot be accessed while logged out', async () => {
            await driver.get('http://localhost:3000/dashboard');
            await driver.wait(until.urlIs('http://localhost:3000/'), 5000);
        }, 15000);

        it('Dashboard has no progress when logged in with a new account', async () => {
            await login(DASHEMAIL, DASHPASSWORD);

            await driver.get('http://localhost:3000/dashboard');
            
            await getElementExists(By.id("Useful Expressions (In the Classroom)"), 10000);
            let progressBox = await driver.findElement(By.id("Useful Expressions (In the Classroom)"));
            let progressCount = await progressBox.findElement(By.id("count"));
            let progressPercent = await progressBox.findElement(By.id("percent"));
            expect(await progressCount.getText()).toEqual("0/19 cards");
            expect(await progressPercent.getText()).toEqual("0%");
            
        }, 15000);

        it('Dashboard has no progress when logged in with a new account', async () => {
            await login(DASHEMAIL, DASHPASSWORD);

            await driver.get('http://localhost:3000/studysets/genki-1/lesson-0/hiragana');
            await getElementExists(By.className("flip-card"), 10000);
            let flipCard = await driver.findElement(By.className("flip-card"));
            await flipCard.click();

            let correctButton = await driver.findElement(By.id("correct-button"));
            await correctButton.click();
            await wait(5000);
            

            await driver.get('http://localhost:3000/dashboard');
            
            await getElementExists(By.id("Greetings and Numbers"), 10000);
            let lessonBox = await driver.findElement(By.id("Greetings and Numbers"));
            let progressBox = await lessonBox.findElement(By.id("Hiragana"));
            let progressCount = await progressBox.findElement(By.id("count"));
            let progressPercent = await progressBox.findElement(By.id("percent"));
            expect(await progressCount.getText()).toEqual("1/104 cards");
            expect(await progressPercent.getText()).toEqual("1%");
            
        }, 120000);

        afterAll(async () => {
        const usernameSnapshot = await getDocs(dashQuery);
        await Promise.all(usernameSnapshot.docs.map(doc => deleteDoc(doc.ref)));
        })

        afterEach(async () => {
            await driver.quit();
            console.log('Browser closed');
        });
    });

    afterAll(async () => {
        // Delete any users created by tests
        const usernameSnapshot = await getDocs(usernameQuery);
        await Promise.all(usernameSnapshot.docs.map(doc => deleteDoc(doc.ref)));

        // Kill the server process after the tests are done
        await serverProcess.kill('SIGINT');
        console.log('Server stopped');
    });
});
