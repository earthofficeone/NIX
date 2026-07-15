<script setup lang="ts">
import type { Note } from '@/types'
import { formatDate } from '@/utils/format'

defineProps<{
  note: Note
  title: string
  preview: string
}>()
</script>

<template>
  <article class="note-card lux-card">
    <div class="note-card__col note-card__col--title">
      <h3 class="note-card__title">{{ title }}</h3>
      <time class="note-card__created" :datetime="note.createdAt">
        สร้าง {{ formatDate(note.createdAt) }}
      </time>
    </div>
    <div class="note-card__col note-card__col--detail">
      <p class="note-card__preview">{{ preview }}</p>
    </div>
  </article>
</template>

<style scoped lang="scss">
.note-card {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  gap: 0.75rem;
  padding: 0.85rem 1rem;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    border-color 0.2s ease;

  &:hover {
    transform: translateY(-1px);
    border-color: var(--Primary-Color);
  }

  &__col {
    min-width: 0;

    &--title {
      border-right: 1px solid var(--Card-Border);
      padding-right: 0.75rem;
    }

    &--detail {
      padding-left: 0.1rem;
    }
  }

  &__title {
    margin: 0 0 0.35rem;
    font-size: 0.92rem;
    font-weight: 600;
    color: var(--Text-Color);
    line-height: 1.4;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  &__created {
    display: block;
    font-size: 0.62rem;
    letter-spacing: 0.04em;
    color: var(--Faint-Color);
  }

  &__preview {
    margin: 0;
    font-size: 0.78rem;
    color: var(--Muted-Color);
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-height: 1.45;
  }
}
</style>
