<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { authApi } from '@/api/auth'
import { ApiError } from '@/api/http'

const router = useRouter()

const email = ref('')
const error = ref('')
const success = ref('')
const loading = ref(false)

async function submit() {
  error.value = ''
  success.value = ''
  if (!email.value) {
    error.value = 'กรุณากรอกอีเมล'
    return
  }

  loading.value = true
  try {
    const res = await authApi.forgotPassword({ email: email.value })
    success.value = res.message
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'เกิดข้อผิดพลาด'
  } finally {
    loading.value = false
  }
}

function goToReset() {
  router.push({ name: 'reset-password', query: { email: email.value } })
}
</script>

<template>
  <AuthLayout>
    <form class="py-8 px-7 lux-card" @submit.prevent="submit">
      <h2 class="text-[1.35rem] font-light text-(--Text-Color) mb-[0.35rem] tracking-[0.06em]">
        ลืมรหัสผ่าน
      </h2>
      <p class="lux-subtitle mb-7">กรอกอีเมลเพื่อรับรหัสยืนยัน 6 หลัก</p>

      <div class="mb-[1.1rem]">
        <label class="lux-label" for="email">อีเมล</label>
        <input
          id="email"
          v-model="email"
          type="email"
          class="lux-input"
          placeholder="you@email.com"
          :disabled="!!success"
        />
      </div>

      <p v-if="error" class="text-(--Danger-Color) text-[0.85rem] mb-4">{{ error }}</p>
      <p v-if="success" class="text-(--Success-Color, #4ade80) text-[0.85rem] mb-4">
        {{ success }}
      </p>

      <button
        v-if="!success"
        type="submit"
        class="lux-btn lux-btn--gold lux-btn--full"
        :disabled="loading"
      >
        {{ loading ? 'กำลังส่ง...' : 'ส่งรหัสยืนยัน' }}
      </button>

      <button
        v-else
        type="button"
        class="lux-btn lux-btn--gold lux-btn--full"
        @click="goToReset"
      >
        ใส่รหัสยืนยัน
      </button>

      <p class="text-center mt-6 text-[0.85rem] text-(--Muted-Color)">
        <RouterLink to="/login" class="text-(--Primary-Color)">กลับไปเข้าสู่ระบบ</RouterLink>
      </p>
    </form>
  </AuthLayout>
</template>
