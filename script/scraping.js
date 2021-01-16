const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

class Scraping {

    constructor() {

        //USTAWIENIA DOMYŚLNE
        this.setRoutes('szczecin', '53.4481359:14.4900333', '53.4318138:14.5547711', '30.12.20', '08:00');

    }

    /**
     * USTAWIANIE INFORMACJO O REGIONIE PKT POŁOŻENIA I PKT 
     * 
     * 
     * @param {string} city region
     * @param {string} tc Pkt docelowy
     * @param {string} fc Pkt położenia
     * @param {string} d Dzień 
     * @param {string} h Godzina
     */
    setRoutes(city, tc, fc, d, h) {

        /**
         * DANE
         */
        this.data = {
            city: city,
            tc: tc,
            fc: fc,
            d: d,
            h: h,
        };

        /**
         * URL
         */
        this.url = `https://jakdojade.pl/${this.data.city}/trasa/z--undefined--do--undefined?tc=${this.data.tc}&fc=${this.data.fc}&ft=LOCATION_TYPE_COORDINATE&tt=LOCATION_TYPE_USER_POINT&d=${this.data.d}&h=${this.data.h}&ia=true&aro=1&t=1&rc=3&ri=2&r=0&stopsLayer=true`

        return this;
    }

    _result = [null, null, null, null, null];

    async _transform(html) {
        return new Promise(resolve => {

            const route = [];
            const $ = cheerio.load(html);

            $(".nano-content").each((i, el1) => {
                const stage = [];
                $(el1).find(".main-route-content-table").each((i, el2) => {
                    const line = []
                    $(el2).find(".public-transport")
                        .children('td')
                        .each((i, v) => {
                            line.push($(v).find("span").text());
                        });
                    if (line.length != 0) {
                        stage.push(line);
                    }
                });
                if (stage.length != 0) {
                    route.push(stage);
                }
            })

            resolve(route);
        });
    }

    async deley(time) {
        return new Promise(resolve => {
            setTimeout(() => {
                resolve(1);
            }, time);
        });
    }

    async findHtml() {

        const returnPage = async () => {
            return new Promise(async resolve => {
                        
                await page.goto(this.url);

                //WCIŚNIĘCIE PRZYCISKU AKCEPTACJI
                await page.click('button[class="cmp-button_button cmp-intro_acceptAll "]')
                    .then(async () => {
                        
                        //WCIŚNIĘCIĘ PRZYCISKU WSTECZ 
                        await page.click('div[class="cn-before-after cn-before"]')
                            .then(async () => {
                                resolve(page);
                            })
                            .catch(async () => {
                                resolve('brak');
                            });
                    })
                    .catch(async () => {
                        
                        //WCIŚNIĘCIĘ PRZYCISKU WSTECZ 
                        await page.click('div[class="cn-before-after cn-before"]')
                            .then(async () => {
                                resolve(page);
                            })
                            .catch(async () => {
                                resolve('brak');
                            });
                    });
            })
        }

        //WYSZUKANIE STRONY
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
            ],
        });
        const page = await browser.newPage();
        await returnPage();

        const returnHtml = async (index) => {
            return new Promise(async resolve => {
                if(await this.deley(500)) {
                                    
                    //KLIKANIE NA ELEMENT LISTY
                    const example = await page.$$('div[class="cn-route-header ng-isolate-scope"]');
                    await this.deley(500)
                    try {
                        await example[index].click()
                        .then(async () => {
    
                            if (await this.deley(500)) {
                                
                                //WRZUCANIE NA ZMIENNĄ HTML
                                const html = await page.content();
                                const result = await this._transform(html);
                                await page.click('div[class="cn-back-button"]')
                                .then(async () => {
                                    resolve(result);
                                });
                            }
                        });
                    } catch(er) {
                        resolve('brak');
                    }
                }
            });
        }

        this._result[0] = await returnHtml(1);
        this._result[1] = await returnHtml(2);
        this._result[2] = await returnHtml(3);
        this._result[3] = await returnHtml(4);
        this._result[4] = await returnHtml(5);

        Promise.all(this._result).then(async () => {
            await browser.close();
            return this;
        });
    }

    returnRoutes() {
        return this._result
            .filter(f => {
                return f != 'brak'
            })
            .map(el => {
                return el[0]
            });
    }
}

module.exports = Scraping;