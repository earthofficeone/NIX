<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { authApi } from '@/api/auth'
import { ApiError } from '@/api/http'

const route = useRoute()
const router = useRouter()

const email = ref('')
const code = ref('')
const password = ref('')
const confirm = ref('')
const error = ref('')
const loading = ref(false)

onMounted(() => {
  const q = route.query.email
  if (typeof q === 'string') {
    email.value = q
  }
})

async function submit() {
  error.value = ''
  if (!email.value || !code.value || !password.value) {
    error.value = 'กรุณากรอกข้อมูลให้ครบ'
    return
  }
  if (code.value.length !== 6) {
    error.value = 'รหัสยืนยันต้องมี 6 หลัก'
    return
  }
  if (password.value.length < 4) {
    error.value = 'รหัสผ่านต้องมีอย่างน้อย 4 ตัวอักษร'
    return
  }
  if (password.value !== confirm.value) {
    error.value = 'รหัสผ่านไม่ตรงกัน'
    return
  }

  loading.value = true
  try {
    await authApi.resetPassword({
      email: email.value,
      code: code.value,
      password: password.value,
    })
    router.push({ name: 'login' })
  } catch (e) {
    error.value = e instanceof ApiError ? e.message : 'เกิดข้อผิดพลาด'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <AuthLayout>
    <form class="py-8 px-7 lux-card" @submit.prevent="submit">
      <h2 class="text-[1.35rem] font-light text-(--Text-Color) mb-[0.35rem] tracking-[0.06em]">
        ตั้งรหัสผ่านใหม่
      </h2>
      <p class="lux-subtitle mb-7">ใส่รหัสยืนยันจากอีเมลและรหัสผ่านใหม่</p>

      <div class="mb-[1.1rem]">
        <label class="lux-label" for="email">อีเมล</label>
        <input
          id="email"
          v-model="email"
          type="email"
          class="lux-input"
          placeholder="you@email.com"
        />
      </div>
      <div class="mb-[1.1rem]">
        <label class="lux-label" for="code">รหัสยืนยัน</label>
        <input
          id="code"
          v-model="code"
          type="text"
          inputmode="numeric"
          maxlength="6"
          class="lux-input tracking-[0.3em] text-center"
          placeholder="000000"
        />
      </div>
      <div class="mb-[1.1rem]">
        <label class="lux-label" for="password">รหัสผ่านใหม่</label>
        <input
          id="password"
          v-model="password"
          type="password"
          class="lux-input"
          placeholder="••••••••"
        />
      </div>
      <div class="mb-[1.1rem]">
        <label class="lux-label" for="confirm">ยืนยันรหัสผ่าน</label>
        <input
          id="confirm"
          v-model="confirm"
          type="password"
          class="lux-input"
          placeholder="••••••••"
        />
      </div>

      <p v-if="error" class="text-(--Danger-Color) text-[0.85rem] mb-4">{{ error }}</p>

      <button type="submit" class="lux-btn lux-btn--gold lux-btn--full" :disabled="loading">
        {{ loading ? 'กำลังบันทึก...' : 'ตั้งรหัสผ่านใหม่' }}
      </button>

      <p class="text-center mt-6 text-[0.85rem] text-(--Muted-Color)">
        <RouterLink to="/forgot-password" class="text-(--Primary-Color) mr-3"
          >ขอรหัสใหม่</RouterLink
        >
        <RouterLink to="/login" class="text-(--Primary-Color)">เข้าสู่ระบบ</RouterLink>
      </p>
    </form>
  </AuthLayout>
</template>
