<template>
  <div class="ramulator p-4">
    <h2 class="title">C语言指针与内存模型模拟器</h2>

    <div class="container">
      <!-- 操作面板 -->
      <div class="controls">
        <div class="control-group">
          <label for="varName">1. 定义内存变量 (栈分配)</label>
          <input id="varName" type="text" v-model="form.varName" placeholder="变量名 (如: age)" aria-label="变量名" />
          <label for="varType">选择类型</label>
          <select id="varType" v-model="form.varType">
            <option value="1">char (1 Byte)</option>
            <option value="2">short (2 Byte)</option>
            <option value="4">int (4 Byte)</option>
            <option value="8">long (8 Byte)</option>
          </select>
          <label for="varVal">初始值</label>
          <input id="varVal" type="number" v-model="form.varVal" placeholder="初始值" aria-label="初始值" />
          <button @click="allocVariable">分配内存</button>
        </div>

        <div class="control-group">
          <label for="ptrName">2. 定义指针变量 (Pointer)</label>
          <input
            id="ptrName"
            type="text"
            v-model="form.ptrName"
            placeholder="指针名 (如: age_ptr)"
            aria-label="指针名"
          />
          <label for="targetVar">指向的变量名</label>
          <input
            id="targetVar"
            type="text"
            v-model="form.targetVar"
            placeholder="指向的变量名"
            aria-label="指向的变量名"
          />
          <button @click="allocPointer" style="background: #4caf50">分配指针 (8 Bytes)</button>
        </div>

        <div class="control-group">
          <label for="derefName">3. 解引用操作 (*ptr)</label>
          <input
            id="derefName"
            type="text"
            v-model="form.derefName"
            placeholder="输入指针变量名"
            aria-label="输入指针变量名"
          />
          <label for="newVal">通过指针修改值</label>
          <input
            id="newVal"
            type="number"
            v-model="form.newVal"
            placeholder="通过指针修改值"
            aria-label="通过指针修改值"
          />
          <button @click="dereferenceGet" style="background: #ff9800; width: 48%">获取值</button>
          <button @click="dereferenceSet" style="background: #f44336; width: 48%">修改值</button>
        </div>

        <div class="log" ref="logEl" v-html="logHtml"></div>
      </div>

      <!-- 内存空间 -->
      <div class="memory-grid">
        <div
          v-for="(cell, index) in memory"
          :key="index"
          class="cell"
          :class="{ occupied: cell.isOccupied, pointer: cell.type === 'ptr' }"
        >
          <span class="addr">{{ cell.addr }}</span>
          <span class="var-name">{{ cell.varName }}</span
          ><br />
          <span class="val-display">{{ cell.value }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, reactive, ref, watch } from "vue";

const MEM_SIZE = 256;

interface MemoryCell {
  addr: string;
  varName: string;
  value: string;
  isOccupied: boolean;
  head: boolean; // 是否是变量的起始位置
  type: string;
}

interface VariableMeta {
  addr: number;
  size: number;
  type: string;
  target?: string;
}

const memory = ref<MemoryCell[]>(
  Array(MEM_SIZE)
    .fill(null)
    .map((_, i) => ({
      addr: "0x" + i.toString(16).toUpperCase().padStart(2, "0"),
      varName: "",
      value: "",
      isOccupied: false,
      head: false,
      type: "",
    })),
);

const variables = reactive<Record<string, VariableMeta>>({}); // 存储变量元数据 { name: { addr, size, type } }

const form = reactive({
  varName: "",
  varType: "1",
  varVal: "",
  ptrName: "",
  targetVar: "",
  derefName: "",
  newVal: "",
});

const logEl = ref<HTMLElement | null>(null);
const logLines = ref<string[]>(["系统就绪... 准备模拟 128 字节内存。"]);
const logHtml = computed(() => logLines.value.join("<br>"));

watch(
  logLines,
  () => {
    nextTick(() => {
      if (logEl.value) logEl.value.scrollTop = logEl.value.scrollHeight;
    });
  },
  { deep: true },
);

function log(msg: string) {
  logLines.value.push(`> ${msg}`);
}

// 寻找连续空闲内存
function findFreeSpace(size: number): number {
  for (let i = 0; i <= MEM_SIZE - size; i++) {
    let space = true;
    for (let j = 0; j < size; j++) {
      if (memory.value[i + j].isOccupied) {
        space = false;
        break;
      }
    }
    if (space) return i;
  }
  return -1;
}

// 分配普通变量
function allocVariable() {
  const name = form.varName;
  const size = parseInt(form.varType);
  const val = form.varVal;

  if (!name || variables[name]) return alert("无效或重复的变量名");

  const startIndex = findFreeSpace(size);
  if (startIndex === -1) return alert("内存不足");

  variables[name] = { addr: startIndex, size: size, type: "int" };

  for (let i = 0; i < size; i++) {
    memory.value[startIndex + i].isOccupied = true;
    memory.value[startIndex + i].varName = i === 0 ? name : "";
    memory.value[startIndex + i].value = i === 0 ? val : "..";
    memory.value[startIndex + i].head = i === 0;
  }

  log(`分配变量 ${name}: 地址 ${memory.value[startIndex].addr}, 长度 ${size} 字节`);
}

// 分配指针
function allocPointer() {
  const pName = form.ptrName;
  const targetName = form.targetVar;
  const size = 8; // 模拟 64 位系统的指针长度

  if (!variables[targetName]) return alert("目标变量不存在");

  const startIndex = findFreeSpace(size);
  if (startIndex === -1) return alert("内存不足");

  const targetAddr = memory.value[variables[targetName].addr].addr;
  variables[pName] = {
    addr: startIndex,
    size: size,
    type: "ptr",
    target: targetName,
  };

  for (let i = 0; i < size; i++) {
    memory.value[startIndex + i].isOccupied = true;
    memory.value[startIndex + i].type = "ptr";
    memory.value[startIndex + i].varName = i === 0 ? pName : "";
    memory.value[startIndex + i].value = i === 0 ? targetAddr : "..";
  }

  log(`分配指针 ${pName} -> ${targetName}: 存储地址值 ${targetAddr}`);
}

// 解引用获取值
function dereferenceGet() {
  const pName = form.derefName;
  const ptr = variables[pName];
  if (!ptr || ptr.type !== "ptr") return alert("非法的指针变量");

  const targetVar = variables[ptr.target!];
  const val = memory.value[targetVar.addr].value;
  log(`解引用 *${pName}: 访问地址 ${memory.value[targetVar.addr].addr} 得到值 ${val}`);
}

// 解引用设置值
function dereferenceSet() {
  const pName = form.derefName;
  const newVal = form.newVal;
  const ptr = variables[pName];

  if (!ptr || ptr.type !== "ptr") return alert("非法的指针变量");

  const targetVar = variables[ptr.target!];
  memory.value[targetVar.addr].value = newVal;

  log(`解引用 *${pName} = ${newVal}: 已修改地址 ${memory.value[targetVar.addr].addr} 的内容`);
}
</script>

<style scoped>
.ramulator {
  --cell-bg: #f0f0f0;
  --cell-active: #e1f5fe;
  --cell-border: #ccc;
  --brand: #2196f3;
  --brand-dark: #1976d2;
  --field-border: #d0d7de;
  --field-border-hover: #b6c2cf;
  --field-focus-ring: rgba(33, 150, 243, 0.18);
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
  background: #fafafa;
}

.ramulator :deep(.container) {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  flex-wrap: wrap;
}

/* 控制面板样式 */
.ramulator :deep(.controls) {
  flex: 1;
  min-width: 280px;
  background: #fff;
  padding: 20px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(16, 24, 40, 0.06);
  height: fit-content;
}

.ramulator :deep(.control-group) {
  margin-bottom: 15px;
  padding-bottom: 15px;
  border-bottom: 1px dotted #d4d8dd;
}

.ramulator :deep(.control-group) > label {
  display: block;
  margin: 8px 0 2px;
  font-size: 13px;
  font-weight: 600;
  color: #374151;
}

.ramulator :deep(.control-group) > label:first-child {
  margin-top: 0;
}

/* 表单控件：输入框 / 选择框 */
.ramulator :deep(input),
.ramulator :deep(select) {
  padding: 9px 12px;
  margin: 5px 0;
  width: 100%;
  box-sizing: border-box;
  border: 1px solid var(--field-border);
  border-radius: 6px;
  background: #fff;
  color: #1f2328;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
  outline: none;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}

.ramulator :deep(input::placeholder) {
  color: #9aa7b4;
}

.ramulator :deep(select) {
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' fill='none' stroke='%236b7280' stroke-width='1.6' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 32px;
  cursor: pointer;
}

.ramulator :deep(input:hover),
.ramulator :deep(select:hover) {
  border-color: var(--field-border-hover);
}

/* 键盘或鼠标聚焦状态：2px 边框强调 + 柔和光环（WCAG 可见焦点） */
.ramulator :deep(input:focus),
.ramulator :deep(select:focus),
.ramulator :deep(input:focus-visible),
.ramulator :deep(select:focus-visible) {
  border-color: var(--brand);
  box-shadow: 0 0 0 3px var(--field-focus-ring);
}

/* 按钮 */
.ramulator :deep(button) {
  padding: 9px 12px;
  margin: 6px 0;
  width: 100%;
  box-sizing: border-box;
  background: #2196f3;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  font-size: 14px;
  line-height: 1.5;
  transition:
    background 0.15s ease,
    transform 0.05s ease;
}

.ramulator :deep(button):hover {
  background: #1976d2;
}

.ramulator :deep(button):active {
  transform: translateY(1px);
}

.ramulator :deep(button:focus-visible) {
  outline: 2px solid var(--brand-dark);
  outline-offset: 2px;
}

/* 日志终端 */
.ramulator :deep(.log) {
  background: #15181e;
  color: #4ade80;
  padding: 12px;
  border-radius: 8px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  height: 150px;
  overflow-y: auto;
  font-size: 12px;
  line-height: 1.6;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.25);
}

/* 内存网格样式 */
.ramulator :deep(.memory-grid) {
  display: grid;
  grid-template-columns: repeat(16, 1fr);
  gap: 4px;
  width: 1200px;
  max-width: 100%;
  background: #fff;
  padding: 10px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(16, 24, 40, 0.06);
}

.ramulator :deep(.cell) {
  border: 1px solid var(--cell-border);
  border-radius: 4px;
  padding: 5px;
  font-size: 11px;
  min-height: 50px;
  background: var(--cell-bg);
  transition: all 0.3s;
  overflow: hidden;
}

.ramulator :deep(.cell.occupied) {
  background: #bbdefb;
  border-color: #2196f3;
  box-shadow: inset 0 0 0 1px rgba(33, 150, 243, 0.35);
}

.ramulator :deep(.cell.pointer) {
  background: #c8e6c9;
  border-color: #4caf50;
  box-shadow: inset 0 0 0 1px rgba(76, 175, 80, 0.35);
}

.ramulator :deep(.addr) {
  color: #888;
  font-weight: bold;
  display: block;
  border-bottom: 1px solid #eee;
  margin-bottom: 3px;
  font-size: 10px;
}

.ramulator :deep(.var-name) {
  color: #d32f2f;
  font-weight: bold;
}

.ramulator :deep(.val-display) {
  color: #1976d2;
  word-break: break-all;
}

.ramulator :deep(.title) {
  padding-bottom: 16px;
  font-size: 16px;
  font-style: bold;
}

/* 窄屏适配：面板与内存网格改为纵向堆叠 */
@media (max-width: 960px) {
  .ramulator :deep(.container) {
    flex-direction: column;
  }

  .ramulator :deep(.memory-grid) {
    grid-template-columns: repeat(8, 1fr);
  }
}
</style>
