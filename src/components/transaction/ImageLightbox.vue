<script setup lang="ts">
import { X } from '@lucide/vue'
import { onUnmounted, watch } from 'vue'

const open = defineModel<boolean>({ default: false })

defineProps<{
  src: string
  alt?: string
}>()

function close() {
  open.value = false
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') close()
}

watch(open, (visible) => {
  if (visible) {
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeydown)
  } else {
    document.body.style.overflow = ''
    window.removeEventListener('keydown', onKeydown)
  }
})

onUnmounted(() => {
  document.body.style.overflow = ''
  window.removeEventListener('keydown', onKeydown)
})
</script>

<template>
  <Teleport to="body">
    <Transition name="lightbox">
      <div v-if="open" class="lightbox" role="dialog" aria-modal="true" @click="close">
        <button type="button" class="lightbox__close" aria-label="ปิด" @click.stop="close">
          <X :size="22" :stroke-width="1.75" aria-hidden="true" />
        </button>
        <img class="lightbox__img" :src="src" :alt="alt ?? 'รูปแนบ'" @click.stop />
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped lang="scss">
.lightbox {
  position: fixed;
  inset: 0;
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.92);
  backdrop-filter: blur(8px);
  cursor: zoom-out;
}

.lightbox__img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  border-radius: 0.5rem;
  box-shadow: 0 8px 48px rgba(0, 0, 0, 0.6);
  cursor: default;
}

.lightbox__close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  width: 2.75rem;
  height: 2.75rem;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.6);
  color: #fff;
  cursor: pointer;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;

  &:hover {
    border-color: var(--Primary-Color);
    color: var(--Primary-Color);
  }
}

.lightbox-enter-active,
.lightbox-leave-active {
  transition: opacity 0.25s ease;
}

.lightbox-enter-active .lightbox__img,
.lightbox-leave-active .lightbox__img {
  transition: transform 0.25s ease;
}

.lightbox-enter-from,
.lightbox-leave-to {
  opacity: 0;
}

.lightbox-enter-from .lightbox__img,
.lightbox-leave-to .lightbox__img {
  transform: scale(0.92);
}
</style>
