const puppeteer = require("puppeteer");
const fs = require("fs");
let block = false;

async function pegarReceita(num) {
  try {
    const URL_BASE = `https://www.tudogostoso.com.br/receita/${num}`;
    console.log(URL_BASE);
    const browser = await puppeteer.launch({ slowMo: 300 });
    const page = await browser.newPage();
    await page.goto(URL_BASE);

    // titulo -> recipe-title h1
    // preparo -> .recipe-data clock .preptime time
    // Rendimento -> .recipe-data .serve data
    // ingredientes -> #info-user > ul li span
    // instrucoes -> .instructions ol li

    const titulo = await page.$eval(
      ".recipe-title h1",
      (titulo) => titulo.innerText,
    );

    const preparo = await page.$eval(
      ".recipe-data .clock .preptime time",
      (el) => el.innerText,
    );

    const rendimento = await page.$eval(
      ".recipe-data .serve data",
      (el) => el.innerText,
    );

    const ingredientes = await page.$$eval(
      "#info-user > ul li span",
      (ingredientes) => ingredientes.map((el) => el.innerText),
    );

    const instrucoes = await page.$$eval(
      ".instructions ol li span",
      (instrucoes) => instrucoes.map((el) => el.innerText),
    );

    await browser.close();

    const body = JSON.stringify({
      titulo,
      preparo,
      rendimento,
      ingredientes,
      instrucoes,
    });

    salvarJson(body);
  } catch (err) {
    console.log("Erro na receita " + num_receita);

    if (block) {
      return;
    }

    num_receita = num_receita + 1;
    pegarReceita(num_receita);
  }
}

let num_receita = 74;

function salvarJson(data) {
  fs.appendFile("receitas.json", "," + data, (err) => {
    if (err) console.log(err);

    console.log("salvo!");

    if (num_receita < 100) {
      num_receita = num_receita + 1;
      pegarReceita(num_receita);
    }
  });
}

pegarReceita(num_receita);
