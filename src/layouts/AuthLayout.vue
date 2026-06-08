<template>
  <div class="min-h-screen flex items-center justify-center py-4 px-5 relative overflow-hidden">
    <div
      class="bg-[radial-gradient(ellipse,rgba(201,169,110,0.12)_0%,transparent_70%)] translate-x-[-50%] absolute top-[-20%] left-[50%] w-[120%] h-[50%] pointer-events-none"
    />
    <div class="max-w-[400px] w-full relative z-10">
      <div class="text-center mb-10">
        <span class="text-[2.5rem] font-light tracking-wider text-(--Primary-Color) ml-[0.35rem]"
          >NIX</span
        >
        <p class="text-[rgba(245,240,232,0.4)] text-sm tracking-[3px] mt-2 uppercase">
          Private Ledger
        </p>
      </div>
      <slot />
    </div>
  </div>
</template>
