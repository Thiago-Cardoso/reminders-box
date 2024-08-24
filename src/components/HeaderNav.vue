<script setup>
import { useMenuStore } from '@/stores/menu';
import { storeToRefs } from 'pinia';

const { selected } = storeToRefs(useMenuStore());
</script>

<template>

<header>
  <nav class="menu">
    <ul @click="selected = 0">
      <li>
        <img v-if="selected === 0" src="../assets/r2.png" class="active img2" />
        <img v-if="selected === 1" src="../assets/r1.png" class="img2" />
      </li>
    </ul>
    <ul @click="selected = 1">
      <li style="padding-top: 15px;">
        <img v-if="selected === 1" src="../assets/e2.png" class="active img2" />
        <img v-if="selected === 0" src="../assets/e1.png" class="img2" />
      </li>
    </ul>
  </nav>
</header>

</template>

<style scoped>
header {
  line-height: 1.5;
}

.img2 {
  padding: 12px 10px 8px 10px;
}

.active {
  filter: blur(0);
}

.menu {
  display: flex;
  margin-bottom: 10px;
}
.menu ul {
  list-style-type: none;
  display: flex;
  padding: 0;
  border: 1px solid #000;
  border-radius: 25px;
  margin-top: -104px;
  margin-left: 20px;
  background: white;
}
.menu img {
  width: 100px;
  cursor: pointer;
  filter: blur(2px);
}
.menu img:hover {
  filter: blur(0px);
}
.menu .active {
  filter: blur(0px);
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
