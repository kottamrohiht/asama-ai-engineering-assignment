import os from "node:os";
import fs from "node:fs/promises";
import { execFile } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const simulatedSnapshot = {
  source: "simulated",
  platform: "Linux",
  hostname: "demo-linux-host",
  cpu: { model: "Intel Xeon (simulated)", cores: 4 },
  memory: { totalBytes: 8 * 1024 ** 3, freeBytes: 3 * 1024 ** 3 },
  storage: [{ device: "/dev/sda", size: "80G", mountpoint: "/" }],
  note: "Hosted demo data is simulated; local mode reads the current Linux host."
};

async function readLinuxMemory() {
  const memoryInfo = await fs.readFile("/proc/meminfo", "utf8");
  const values = Object.fromEntries(
    memoryInfo.split("\n").flatMap((line) => {
      const match = line.match(/^(MemTotal|MemAvailable):\s+(\d+)\s+kB$/);
      return match ? [[match[1], Number(match[2]) * 1024]] : [];
    })
  );
  return { totalBytes: values.MemTotal, freeBytes: values.MemAvailable };
}

async function readLinuxStorage() {
  const { stdout } = await execFileAsync("df", ["-P", "-B1"]);
  return stdout.trim().split("\n").slice(1).map((line) => {
    const columns = line.trim().split(/\s+/);
    return { device: columns[0], sizeBytes: Number(columns[1]), mountpoint: columns.at(-1) };
  });
}

export async function getHardwareSnapshot({ mode = "auto" } = {}) {
  if (mode === "simulated" || process.platform !== "linux") return simulatedSnapshot;
  const [memory, storage] = await Promise.all([readLinuxMemory(), readLinuxStorage()]);
  return {
    source: "local-linux",
    platform: process.platform,
    hostname: os.hostname(),
    cpu: { model: os.cpus()[0]?.model || "unknown", cores: os.cpus().length },
    memory,
    storage,
    note: "Collected with read-only local inspection commands."
  };
}
