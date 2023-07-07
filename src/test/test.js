const fs = require('fs')

const jsdom = require('jsdom')
const JSDOM = jsdom.JSDOM

const html = fs.readFileSync('./src/test/test.html')
const document = new JSDOM(html).window.document


let fileBufferHeaders = []

function main() {
    getTablesuffix()

    // let file = fs.readFileSync('./src/test/fileBufferHeaders.json')
    // fileBufferHeaders = JSON.parse(file)

    getLeftPsuffix()
    
    fs.writeFileSync('./src/test/fileBufferHeaders.json', JSON.stringify(fileBufferHeaders, null, 2), 'utf8')
}

function getTablesuffix() {
    let tbody = document.querySelector('tbody')
    let trs = tbody.querySelectorAll('tr')

    for (let i = 1; i < trs.length; i++) {
        const element = trs[i];
        let tds = element.querySelectorAll('p')
        let headBuffer = {
            suffix: (() => {
                let arr = tds[0].innerHTML.replace(/\s/g, "").split(';')
                arr.forEach((e, i, a) => {
                    a[i] = "." + e
                })
                return arr
            })(),
            bufBegin: (() => {
                let arr = tds[1].innerHTML.split(" ")
                arr.forEach((e, i, a) => {
                    a[i] = "0x" + e
                })
                return arr
            })(),
            desc: tds[2] ? tds[2].innerHTML : ""
        }
        fileBufferHeaders.push(headBuffer)
    }
    console.log(fileBufferHeaders)
}

function getLeftPsuffix() {
    let left_p = document.querySelector('.left_p')
    let p_arr = left_p.querySelectorAll('p')

    for (let i = 4; i < p_arr.length; i++) {
        const p = p_arr[i].innerHTML;
        let ps = p.split(',')

        let headBuffer = {
            bufBegin: (() => {
                let str = ps[0].toLowerCase()
                let arr = []
                for (let k = 0; k < str.length - 2; k += 2) {
                    arr.push("0x" + str.slice(k, k + 2))
                }
                return arr
            })(),
            suffix: ps[1].toLowerCase().split(";"),
            desc: ps[2].replaceAll("&nbsp;", " ").replaceAll("\"","")
        }
        console.log(headBuffer);
        fileBufferHeaders.push(headBuffer)
    }

}

// main()
// test()
async function testfn(){
    
    return new Promise((resolve, reject) => {
        let res = "123"
        res = function(){
            return "testfn"
        }()
        setTimeout(() => {
            resolve(res)
        }, 2000);
    })

    // let res = "123"
    // res = await function(){
    //     return "testfn"
    // }()
    // return res
}
async function test() {
    let str = "ffd8fffe00"
    for (let i = 0; i < 5; i += 2) {
        const element = str[i];
        // console.log(element);
        if(i==4){
            str = await testfn()
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve(str)
                }, 5000);
            })
            return str
        }
        console.log("for")
    }
    console.log("out for");
    return str
}
async function t() {
    let r = await test()
    console.log(r)

}
t()
console.log('finish')