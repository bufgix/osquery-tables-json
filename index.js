const fs = require("fs");
const playwright = require("playwright");
const { chromium } = playwright;

const OS_QUERY_VERSION = "5.2.3";
const URL = `https://osquery.io/schema/${OS_QUERY_VERSION}`;

async function main() {
  const browser = await chromium.launch({ headless: false }); // Or 'firefox' or 'webkit'.
  const page = await browser.newPage();
  await page.goto(URL);
  await page.waitForTimeout(1000);

  const tables = await page.locator(".schema__table");
  const tableCounts = await tables.count();
  const tableNames = [];

  for (let i = 0; i < tableCounts; i++) {
    const title = await tables
      .nth(i)
      .locator(".osquery-table__table-name")
      .innerText();
    const desc = await tables
      .nth(i)
      .locator(".osquery-table__table-description")
      .innerText();

    const tableRightIcons = await tables
      .nth(i)
      .locator(".osquery-table__header--right svg");
    const tableRightIconsCount = await tableRightIcons.count();
    const platforms = [];
    for (let t = 0; t < tableRightIconsCount; t++) {
      const platform = await tableRightIcons.nth(t).textContent();
      platforms.push(platform);
    }

    const table = await tables.nth(i).locator("table");
    const rows = await table.locator("tbody tr");
    const rowCounts = await rows.count();
    const columns = [];
    for (let j = 0; j < rowCounts; j++) {
      const columnName = await rows
        .nth(j)
        .locator("td:nth-child(1)")
        .innerText();
      const columnType = await rows
        .nth(j)
        .locator("td:nth-child(2)")
        .innerText();
      const columnDesc = await rows
        .nth(j)
        .locator("td:nth-child(3)")
        .innerText();
      columns.push({ name: columnName, type: columnType, desc: columnDesc });
    }

    tableNames.push({ title, desc, columns, platforms });
  }
  fs.writeFileSync(
    `os-query-tables-${OS_QUERY_VERSION}.json`,
    JSON.stringify(tableNames)
  );

  process.exit(0);
}

main();
