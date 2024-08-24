<script setup>
import { ref } from 'vue';
import HeaderNav from './components/HeaderNav.vue';
import MailContent from './components/MailContent.vue';
import Remainders from './components/Remainders.vue';

import { useMenuStore } from '@/stores/menu';
import { storeToRefs } from 'pinia';

const { selected } = storeToRefs(useMenuStore());
const username = ref(useMenuStore().getUsername());

function saveUsername() {
  username.value = document.querySelector('#username').value;
  if (!username.value) return;
  localStorage.setItem('username', username.value);
}
</script>

<template>
  <div style="display: inherit; margin-top: -130px;padding-bottom: 70px;width: 100%;justify-content: flex-end;filter: opacity(0.5);">
    <img src="./assets/nylas.png" style="width: 50px;">
    <span style="font-size: 16px;padding-top: 12px;padding-left: 4px;">reminders box</span></div>
  <HeaderNav />

  <main style="padding-bottom: 20px;">
    <div v-if="!username" class="form">
      Please enter your name
      <div>
        <input id="username" type="text" />
        <button class="super-button2" @click="saveUsername">save</button>
      </div>
    </div>
    <template v-else>
      <Remainders v-if="selected === 0"/>
      <MailContent v-if="selected === 1"/>
    </template>
  </main>
</template>

<style scoped>

</style>
