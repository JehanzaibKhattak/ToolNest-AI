import { test, expect } from "@playwright/test";
test("home and registration load", async ({ page }) => {
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: /One workspace/ }),
  ).toBeVisible();
  await page.getByRole("link", { name: /Start with 20/ }).click();
  await expect(page).toHaveURL(/register/);
});
test("protected dashboard redirects", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/login/);
});
test("tool validates required input", async ({ page }) => {
  await page.goto("/tools/prompt-improver");
  await page.getByRole("button", { name: "Generate" }).click();
  await expect(page.getByText("This field is required")).toBeVisible();
});
test("mocked generation displays a result", async ({ page }) => {
  await page.route("**/api/tools/prompt-improver", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          improvedPrompt: "Act as an editor and return three concise options.",
          explanation: "Added a role and output constraint.",
          variables: ["topic"],
        },
      }),
    }),
  );
  await page.goto("/tools/prompt-improver");
  await page
    .getByLabel("Basic prompt")
    .fill("Help me write better marketing copy");
  await page.getByLabel("Platform or purpose").selectOption("Marketing prompt");
  await page.getByLabel("Detail level").selectOption("balanced");
  await page.getByRole("button", { name: "Generate" }).click();
  await expect(page.getByText(/Act as an editor/)).toBeVisible();
});
test("insufficient credits are handled", async ({ page }) => {
  await page.route("**/api/tools/prompt-improver", (route) =>
    route.fulfill({
      status: 402,
      contentType: "application/json",
      body: JSON.stringify({ error: "You do not have enough credits." }),
    }),
  );
  await page.goto("/tools/prompt-improver");
  await page
    .getByLabel("Basic prompt")
    .fill("Help me write better marketing copy");
  await page.getByLabel("Platform or purpose").selectOption("Marketing prompt");
  await page.getByLabel("Detail level").selectOption("balanced");
  await page.getByRole("button", { name: "Generate" }).click();
  await expect(
    page.getByText("You do not have enough credits.", { exact: true }),
  ).toBeVisible();
});
test("PDF assistant renders structured analysis", async ({ page }) => {
  await page.route("**/api/tools/pdf-assistant", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        data: {
          title: "Project brief",
          summary: "The document proposes a phased product launch.",
          keyPoints: ["Launch in two phases"],
          actionItems: ["Confirm the launch date"],
          importantTerms: [],
          sourceNotes: ["Launch plan section"],
          caveat: "Based only on extracted text.",
        },
      }),
    }),
  );
  await page.goto("/tools/pdf-assistant");
  await page
    .getByLabel("Extracted document text")
    .fill("Project brief content ".repeat(10));
  await page
    .getByLabel("What should the assistant do?")
    .selectOption("summarize");
  await page.getByLabel("Detail level").selectOption("balanced");
  await page.getByRole("button", { name: "Generate" }).click();
  await expect(page.getByText(/phased product launch/)).toBeVisible();
});
