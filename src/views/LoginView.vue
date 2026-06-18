<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import AuthLayout from '@/layouts/AuthLayout.vue'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const router = useRouter()

const email = ref('')
const password = ref('')
const error = ref('')

const remember = ref(false)

onMounted(() => {
  remember.value = localStorage.getItem('remember') === 'true'
  if (remember.value) {
    email.value = localStorage.getItem('email') || ''
    password.value = localStorage.getItem('password') || ''
  }

  if (auth.isAuthenticated) {
    router.replace({ name: 'dashboard' })
  }
})

function rememberChange(event: Event) {
  const checkbox = event.target as HTMLInputElement
  remember.value = checkbox.checked
  localStorage.setItem('remember', remember.value.toString())
}

async function submit() {
  error.value = ''
  if (!email.value || !password.value) {
    error.value = 'กรุณากรอกอีเมลและรหัสผ่าน'
    return
  }
  const err = await auth.login(email.value, password.value)
  if (err) {
    error.value = err
    return
  }

  if (remember.value === true) {
    localStorage.setItem('email', email.value)
    localStorage.setItem('password', password.value)
  } else {
    localStorage.removeItem('email')
    localStorage.removeItem('password')
  }

  router.push({ name: 'dashboard' })
}
</script>

<template>
  <AuthLayout>
    <form class="py-8 px-7 lux-card" @submit.prevent="submit">
      <h2 class="text-[1.35rem] font-light text-(--Text-Color) mb-[0.35rem] tracking-[0.06em]">
        เข้าสู่ระบบ
      </h2>
      <p class="lux-subtitle mb-7">จัดการรายรับรายจ่ายอย่างมีระดับ</p>

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
        <label class="lux-label" for="password">รหัสผ่าน</label>
        <input
          id="password"
          v-model="password"
          type="password"
          class="lux-input"
          placeholder="••••••••"
        />
      </div>

      <p class="text-right mt-[-6px] mb-4">
        <RouterLink to="/forgot-password" class="text-[0.8rem] text-(--Primary-Color)">
          ลืมรหัสผ่าน?
        </RouterLink>
      </p>

      <p v-if="error" class="text-(--Danger-Color) text-[0.85rem] mb-4">{{ error }}</p>

      <div class="mb-7 flex items-center gap-2 justify-end mt-[-10px]">
        <input
          type="checkbox"
          id="remember"
          v-model="remember"
          class="w-4 h-4 accent-(--Primary-Color) cursor-pointer"
          @change="rememberChange"
        />
        <label for="remember" class="cursor-pointer text-sm">จดจำฉัน</label>
      </div>

      <button type="submit" class="lux-btn lux-btn--gold lux-btn--full" :disabled="auth.loading">
        {{ auth.loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ' }}
      </button>

      <p class="text-center mt-6 text-[0.85rem] text-(--Muted-Color)">
        ยังไม่มีบัญชี?
        <RouterLink to="/register" class="text-(--Primary-Color) ml-1">สมัครสมาชิก</RouterLink>
      </p>
    </form>
  </AuthLayout>
</template>
