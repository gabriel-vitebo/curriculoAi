<template>
  <header class="flex items-center justify-between gap-4 border-b-2 border-[#2f2923] px-7 py-5 max-md:flex-col max-md:items-start max-md:px-[18px]">
    <NuxtLink class="inline-flex items-center gap-3 text-[1.75rem] font-bold tracking-[0.04em]" to="/">
      <span class="grid h-[42px] w-[42px] place-items-center border-2 border-[#2f2923] bg-[linear-gradient(135deg,#fff_0%,#d9e6f2_100%)]" aria-hidden="true">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
          <path
            d="M4 5.5h16v13H4z"
            stroke="currentColor"
            stroke-width="1.8"
          />
          <path
            d="m4.8 15.8 4.7-3.7 3.2 2.3 6.5-5"
            stroke="currentColor"
            stroke-width="1.8"
            stroke-linecap="round"
            stroke-linejoin="round"
          />
        </svg>
      </span>
      <span>CurriculoAI</span>
    </NuxtLink>

    <nav aria-label="Navegacao principal">
      <span class="inline-flex items-center gap-[10px] border border-[#2f2923] bg-[rgba(255,255,255,0.54)] px-[14px] py-[6px] text-[0.76rem] uppercase tracking-[0.14em]">Nuxt 4 + OpenAI</span>
    </nav>
  </header>
</template>
