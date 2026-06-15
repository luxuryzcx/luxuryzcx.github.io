const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function typeText(node, text, delay = 42) {
  node.textContent = "";
  for (const char of text) {
    node.textContent += char;
    await sleep(delay);
  }
}

async function runTerminalAnimation(root) {
  const typeNodes = Array.from(root.querySelectorAll("[data-type]"));
  const outputNodes = Array.from(root.querySelectorAll(".term-output[data-output]"));
  const cursors = Array.from(root.querySelectorAll(".term-cursor"));

  for (let index = 0; index < typeNodes.length; index += 1) {
    const typeNode = typeNodes[index];
    const cursor = cursors[index];
    const outputNode = outputNodes[index];
    const typeValue = typeNode.dataset.type || "";

    if (cursor) {
      cursor.classList.remove("is-hidden");
    }

    await typeText(typeNode, typeValue);
    await sleep(220);

    if (outputNode) {
      const outputValue = outputNode.dataset.output || "";
      const outputClass = outputNode.dataset.outputClass || "";
      outputNode.textContent = "";
      outputNode.classList.remove("term-output--accent");
      if (outputClass === "accent") {
        outputNode.classList.add("term-output--accent");
      }
      outputNode.classList.add("is-visible");
      await typeText(outputNode, outputValue, 26);
    }

    if (cursor && index < cursors.length - 1) {
      cursor.classList.add("is-hidden");
    }

    await sleep(320);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const terminal = document.querySelector("[data-terminal]");
  if (!terminal) {
    return;
  }

  runTerminalAnimation(terminal);
});
