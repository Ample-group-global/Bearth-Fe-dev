import { test, expect } from "@playwright/test";

const pages = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
  { name: "Contact", path: "/contact" },
  { name: "Mindmap", path: "/mindmap" },
  { name: "Mint", path: "/mint" },
];

for (const { name, path } of pages) {
  test(`${name} page loads without errors`, async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    const response = await page.goto(path);

    expect(response?.status()).toBeLessThan(400);
    expect(errors, `Console errors on ${path}: ${errors.join(", ")}`).toHaveLength(0);
    await expect(page).not.toHaveTitle(/404|not found/i);
  });
}

test("browser is Chrome, not Edge", async ({ page, browserName }) => {
  await page.goto("/");
  const userAgent: string = await page.evaluate(() => navigator.userAgent);
  expect(browserName).toBe("chromium");
  expect(userAgent).not.toMatch(/Edg\//i);
});
