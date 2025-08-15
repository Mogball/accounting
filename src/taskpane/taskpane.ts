/* global Office, Excel */

function setStatus(message: string): void {
  const el = document.getElementById('status');
  if (el) el.textContent = message;
}

Office.onReady(() => {
  const runButton = document.getElementById('run');
  if (runButton) {
    runButton.addEventListener('click', () => {
      writeHello().catch((error) => setStatus(`Error: ${error instanceof Error ? error.message : String(error)}`));
    });
  }
});

async function writeHello(): Promise<void> {
  await Excel.run(async (context) => {
    const range = context.workbook.getSelectedRange();
    range.load(['address']);
    range.values = [["Hello from Accounting Add-in!"]];
    await context.sync();
    setStatus(`Wrote to ${range.address}`);
  });
}


