const puppteer = require("puppeteer");
const pdf = require("pdfjs");
const fs = require("fs");
const path = require("path");

const tempPath = "./temp";

const generatePDF = async (options, pages) => {
  try {
    if (!fs.existsSync(tempPath)) {
      fs.mkdirSync(tempPath, { recursive: true });
    }
    const browser = await puppteer.launch({});
    const browserPage = await browser.newPage();

    const exportPages = pages
      .sort((a, b) => {
        return a.title - b.title;
      })
      .map((page) => {
        // console.log(page.path);
        return {
          url: page.path,
          title: page.title,
          location: `http://localhost:${options.port}${page.path}`,
          path: `${tempPath}/${page.key}.pdf`,
        };
      });

    console.log(exportPages);
    // console.log(exportPages.length);
    for (let i = 0; i < exportPages.length; i++) {
      const { location, path: pagePath, url, title } = exportPages[i];
      console.log(pagePath);

      await browserPage.setDefaultNavigationTimeout(0);

      await browserPage.goto(location, { waitUntil: "networkidle2" });
      // await browserPage.addStyleTag({ content: '.navbar{display: none}' });

      await browserPage.pdf({
        path: pagePath,
        format: "A4",
        margin: {
          top: 30,
          bottom: 30,
          left: 30,
          right: 30,
        },
      });
    }

    await new Promise((resolve) => {
      const mergedPdf = new pdf.Document();

      exportPages
        .map(({ path }) => fs.readFileSync(path))
        .forEach((file) => {
          const page = new pdf.ExternalDocument(file);
          mergedPdf.addPagesOf(page);
        });

      mergedPdf.asBuffer((err, data) => {
        if (err) {
          throw err;
        } else {
          console.log("merged pdf");
          fs.writeFileSync("X-VIEW-MODEL-DOCS.pdf", data, {
            encoding: "binary",
          });
          resolve();
        }
      });
    });
    console.log("complate");
    await browser.close();
    fs.rmSync(tempPath, { recursive: true, force: true });
  } catch (error) {}
};

const main = async () => {
  const json = JSON.parse(
    fs.readFileSync(
      path.resolve(__dirname, "./plugins/generate-pdf/route_en.json"),
      "utf8"
    )
  );
  console.log(json);
  await generatePDF(
    { port: 3000 },
    json.map((d, i) => {
      return {
        key: i,
        title: i,
        path: d,
      };
    })
  );
};

main();
