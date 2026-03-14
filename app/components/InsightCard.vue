<template>
  <section class="min-h-[220px] border-2 border-[#2f2923] bg-[#fffaf2]">
    <header class="border-b-2 border-[#2f2923] px-[22px] py-[18px]">
      <h3 class="m-0 text-[1.6rem]">{{ title }}</h3>
    </header>

    <ul class="m-0 grid gap-[18px] px-[30px] pb-[30px] pt-6">
      <li v-for="item in items" :key="item">
        {{ item }}
      </li>
    </ul>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  items: string[]
}>()
</script>
