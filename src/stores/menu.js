import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useMenuStore = defineStore('menu', () => {
  const selected = ref(0);

  function select(idx) {
    selected.value = idx;
  }

  function getUsername() {
    return localStorage.getItem('username');
  }

  return { selected, select, getUsername };
});
