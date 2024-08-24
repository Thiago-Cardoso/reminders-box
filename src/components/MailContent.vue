<script setup>
import { ref } from 'vue';

const itemExpanded = ref();
const loading = ref(false);
const items = ref([]);

async function listAppEmails() {
  loading.value = true;
  const response = await fetch(`/nylas/app-emails`, {headers: {'Accept': '*'}});
  loading.value = false;
  items.value = (await response.json()).data;
}

listAppEmails();

function expand(idx) {
  itemExpanded.value = itemExpanded.value === idx ? null : idx;
}
</script>

<template>
  <h2 style="margin-bottom: 20px;">Emails sent</h2>
  <div v-if="loading" class="loader"></div>
  <div v-else-if="!items.length">
      No items yet.
  </div>
  <template v-for="(item, idx) in items">
    <div class="item">
      <div class="main-content">
        <div class="info">
          <div>
            <div class="from">{{ new Date(item.date * 1000).toUTCString() }}</div>
            <div class="from">{{ item.to.email }}</div>
          </div>
          <div>
            <button class="super-button" @click="expand(idx)">{{ itemExpanded === idx ? 'contract ↑' : 'expand ↓'}}</button>
          </div>
        </div>
        <h1>{{ item.subject }}</h1>
        <p v-html="item.body" :class="{expanded: itemExpanded === idx}"></p>
      </div>
    </div>
  </template>
</template>

<style scoped>
textarea {
  width: 100%;
  border-radius: 12px;
  border-color: #ccc;
  height: 140px;
  margin-top: 4px;

  font-size: 14px;
  padding: 10px;
  font-family: Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif;
}
.advice {
  max-height: 150px;
  overflow-y: auto;
}
.item {
  display: flex;
  padding: 16px 0px;
  border-bottom: 1px solid #ccc;
}
.item:last-child {
  border-bottom: none;
}
.main-content {
  width: 100%;
}
.info {
  display: flex;
  align-items: center;
  margin-left: -5px;
  justify-content: space-between;
}
.from {
  background: #afd9ff29;
  display: inline-block;
  padding: 0px 7px;
  border-radius: 10px;
  margin-right: 6px;
}
h1 {
  font-size: 18px;
  font-weight: bold;
}
h2 {
  padding-left: 20px;
  padding-top: 10px;
  font-weight: bold;
}
p {
  text-overflow: ellipsis;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  line-clamp: 3;
  -webkit-box-orient: vertical;
  max-height: 140px;
}
p.expanded {
  display: block;
  max-height: none;
}
</style>
