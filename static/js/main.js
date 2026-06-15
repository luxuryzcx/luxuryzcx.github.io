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

function initCodeBlocks() {
  const blocks = document.querySelectorAll(".content-body pre");
  for (const block of blocks) {
    if (block.parentElement?.classList.contains("code-block")) {
      continue;
    }

    const wrapper = document.createElement("div");
    wrapper.className = "code-block";

    const toolbar = document.createElement("div");
    toolbar.className = "code-block__toolbar";

    const code = block.querySelector("code");
    const lang = (code?.dataset.lang || code?.className || "")
      .replace("language-", "")
      .trim();

    const label = document.createElement("span");
    label.className = "code-block__lang";
    label.textContent = lang || "code";

    const button = document.createElement("button");
    button.type = "button";
    button.className = "code-block__copy";
    button.textContent = "Copy";

    button.addEventListener("click", async () => {
      const text = code?.innerText || block.innerText || "";
      try {
        await navigator.clipboard.writeText(text);
        button.textContent = "Copied";
      } catch {
        button.textContent = "Failed";
      }

      window.setTimeout(() => {
        button.textContent = "Copy";
      }, 1400);
    });

    toolbar.append(label, button);
    block.parentNode.insertBefore(wrapper, block);
    wrapper.append(toolbar, block);
  }
}

window.addEventListener("DOMContentLoaded", () => {
  const terminal = document.querySelector("[data-terminal]");
  if (terminal) {
    runTerminalAnimation(terminal);
  }
  initCodeBlocks();
});
