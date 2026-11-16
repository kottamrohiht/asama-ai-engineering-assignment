export function answerHardwareQuestion(question, snapshot) {
  const q = question.trim().toLowerCase(); let answer = "I can inspect CPU, memory, storage, and host details. Try one of the suggested hardware questions."; let supported = false;
  if (/cpu|processor|core/.test(q)) { supported = true; answer = `This host has ${snapshot.cpu.cores} CPU core(s). The reported model is ${snapshot.cpu.model}.`; }
  else if (/memory|ram|available/.test(q)) { supported = true; answer = `Memory total is ${Math.round(snapshot.memory.totalBytes / 1024 ** 3)} GB, with approximately ${Math.round(snapshot.memory.freeBytes / 1024 ** 3)} GB available.`; }
  else if (/disk|storage|drive|space/.test(q)) { supported = true; answer = `I found ${snapshot.storage.length} storage mount(s): ${snapshot.storage.map((item) => `${item.device} mounted at ${item.mountpoint}`).join(", ")}.`; }
  else if (/host|machine|system|name|operating system|hardware summary/.test(q)) { supported = true; answer = `The host is ${snapshot.hostname} running on ${snapshot.platform}.`; }
  return { answer, supported, source: snapshot.source, data: snapshot };
}
