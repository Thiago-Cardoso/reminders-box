<script setup>
import { useMenuStore } from '@/stores/menu';
import { onMounted, ref } from 'vue';

const { getUsername } = useMenuStore();
const showModal = ref(false);
const showModalNewReminder = ref(false);
const items = ref([]);
const draft = ref();
const loadingModal = ref(false);
const loadingReminders = ref(false);
const loadingSend = ref(false);

async function callAgent(q) {
  const response = await fetch(`https://reminder.cloudflareai.workers.dev/?q=${q}`, {headers: {'Accept': '*'}});
  let json;
  try {
    json = await response.json();
  } catch(e) {}
  return json || response.status;
}

async function remove(key) {
  loadingReminders.value = true;
  await callAgent(`I want to delete e-mail remind with this key '${key}'`);
  await listAll();
}

async function createReminder() {
  const fields = {'personName': 'Person Name', 'relationshipBond': 'Relationship Bond', 'emailReason': 'Email Reason', 'date': 'Date'};
  let senddata = '';
  for (const k in fields) {
    const value = document.querySelector(`#${k}`).value;
    if (!value) return;
    senddata += `${fields[k]}: ${value}. `;
  }

  loadingModal.value = true;
  await callAgent(`please save this data to database: '${senddata}'`);
  loadingModal.value = false;
  showModalNewReminder.value = false;
  await listAll();
}

async function getDraft(key) {
  loadingModal.value = true;
  draft.value = await callAgent(`I want to get data to write a draft message with this key '${key}' my username is: ${getUsername()}`);
  loadingModal.value = false;
}

async function listAll() {
  loadingReminders.value = true;
  items.value = [...await callAgent('list all email reminders from db')];
  loadingReminders.value = false;
}

function clearFields() {
  document.querySelectorAll('input,textarea').forEach(el => el.value = '');
}

onMounted(() => {
  listAll();
})

function keyToDate(key) {
  return new Date(key.slice(0, 16)).toUTCString();
}

async function sendEmail() {
  const fields = ['email', 'subject', 'body'];
  let senddata = {};
  for (const k of fields) {
    const value = document.querySelector(`#${k}`).value;
    if (!value) return;
    senddata[k] = value;
  }
  senddata.body = nl2br(senddata.body);

  loadingSend.value = true;
  const sendResponse = await fetch('/nylas/send-email', {
    method: 'POST',
    body: JSON.stringify(senddata),
    headers: {'Content-Type': 'application/json'}
  });

  if (sendResponse.status == 200) {
    await remove(draft.value.data.key);
    clearFields();
    showModal.value = false;
  }
  loadingSend.value = false;
}

function nl2br(input) {
  return input.replaceAll("\n", "<br/>");
}

function openModalNewReminder() {
  showModalNewReminder.value = true;
  setTimeout(() => clearFields(), 0);
}
</script>

<template>
  <div style="display: flex">
    <h2>Reminders</h2>
    <div class="button-wrapper">
      <button class="super-button" @click="openModalNewReminder()">+ new reminder</button>
    </div>
  </div>

  <div v-if="loadingReminders">
    <div class="loader"></div>
  </div>
  <template v-else>
    <div v-if="!items.length">
      No items yet.
    </div>
    <div v-for="item of items" class="item">
      <div class="main-content">
        <div class="info">
          <div style="display: flex;align-items: center;">
            <button class="super-button" style="margin-right: 10px" @click="showModal = true;getDraft(item.key)">send <br/> email <br/> now</button>
            <div class="from" v-html="keyToDate(item.key) + '<br/>' + item.data.replaceAll('. ', '<br/>')"></div>
          </div>
          <div>
            <button class="super-button" @click="remove(item.key)">remove x</button>
          </div>
        </div>
        <h1>{{ item.title }}</h1>
      </div>
    </div>
  </template>

  <div v-if="showModal" class="overlay">
    <div class="modal">
      <div style="display: flex; justify-content: space-between;">
        <h2>Send Email </h2>
        <div class="button-close" @click="showModal = false;clearFields()">&times;</div>
      </div>
      <section style="padding: 10px 20px;">

        <h2 style="padding: 0">Agent Draft 💎</h2>
        <div v-if="loadingModal">
          <div class="loader"></div>
        </div>
        <div v-else class="advice" v-html="draft.response.replaceAll('\n', '<br>')"></div>

        <h2 style="padding: 0">Message 📬</h2>

        <div class="form send">
          <div>
            <label for="subject">Subject:</label>
            <input id="subject" name="subject" />
          </div>
          <div>
            <label for="email">E-mail:</label>
            <input id="email" name="email" />
          </div>
          <div>
            <label for="body">Body:</label>
            <textarea id="body" name="body" spellcheck="false"></textarea>
          </div>
        </div>

        <div style="display: flex;justify-content: flex-end;">
          <div v-if="loadingSend">
            <div class="loader"></div>
          </div>
          <button v-else class="super-button2" @click="sendEmail()">send ▶️</button>
        </div>
      </section>
    </div>
  </div>

  <div v-if="showModalNewReminder" class="overlay">
    <div class="modal">
      <div style="display: flex; justify-content: space-between;">
        <h2>New Reminder 📬</h2>
        <div class="button-close" @click="showModalNewReminder = false;">&times;</div>
      </div>
      <div v-if="loadingModal">
        <div class="loader"></div>
      </div>
      <div v-else class="form">
        <div>
          <label for="personName">Person Name:</label>
          <input id="personName" name="personName" />
        </div>
        <div>
          <label for="relationshipBond">Relationship Bond:</label>
          <input id="relationshipBond" name="relationshipBond" />
        </div>
        <div>
          <label for="emailReason">Email Reason:</label>
          <input id="emailReason" name="emailReason" />
        </div>
        <div>
          <label for="date">Date:</label>
          <input id="date" name="date" type="datetime-local" />
        </div>
        <div>
          <button class="super-button" @click="createReminder()">save</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.overlay {
  width: 100vw;height: 100vh;position: absolute;top: 0;left: 0;background: radial-gradient(#0b4273, transparent);
}
.modal {
  width: calc(100% - 80px);max-width: 1024px;margin: 40px auto; background: white;border-radius: 10px;padding: 20px;
}
.button-wrapper {
  width: 100%; display: flex; justify-content: flex-end; margin: 20px 0
}
.button-close {
  font-size: 40px;padding-right: 20px; cursor: pointer;margin-top: -6px;
}

.form.send {
  padding: 0;
}
.form.send label {
  width: 10%;
}
.form.send input {
  width: 80%;
}
.form.send textarea {
  width: 80%;
}

.form button {
  width: 200px;
  margin-right: 10%;
  margin-top: 20px;
  float: right;
  padding: 8px;
  font-weight: bold;
  font-size: 16px;
}
.list {
  display: flex;
  justify-content: space-evenly;
  width: 100%;
  flex-wrap: wrap;
}
.list div {
  max-width: 300px;
  width: 33.333%;
  padding: 6px;
  box-sizing: content-box;
  cursor: pointer;
}
.list p:first-child {
  margin-bottom: -50px;
  width: 100%;
  color: white;
  backdrop-filter: brightness(0.5);
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}
.list p:last-child{
  margin-top: -56px;
  width: 100%;
  color: white;
  backdrop-filter: brightness(0.5);
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}

.original {
  max-height: 200px;
  overflow-y: auto;
  display: block;
}
.advice {
  max-height: 260px;
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
</style>
