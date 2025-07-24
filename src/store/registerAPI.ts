// src/utils/registerAPI.ts

let dataDummy: Array<{ name: string; email: string }> = [];

export async function dummyRegister(payload: { name: string; email: string }) {
  await new Promise((res) => setTimeout(res, 500));
  dataDummy.push(payload);
  return true;
}

export function getDummyRegisters() {
  return dataDummy;
}
