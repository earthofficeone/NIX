<template>
  <div class="auth-layout">
    <div class="auth-layout__glow" />
    <div class="auth-layout__content">
      <div class="auth-layout__brand">
        <span class="auth-layout__logo">NIX</span>
        <p class="auth-layout__tagline">Private Ledger</p>
      </div>
      <slot />
    </div>
  </div>
</template>

<style scoped lang="scss">
.auth-layout {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1.25rem;
  position: relative;
  overflow: hidden;
}

.auth-layout__glow {
  position: absolute;
  top: -20%;
  left: 50%;
  transform: translateX(-50%);
  width: 120%;
  height: 50%;
  background: radial-gradient(ellipse, rgba(201, 169, 110, 0.12) 0%, transparent 70%);
  pointer-events: none;
}

.auth-layout__content {
  width: 100%;
  max-width: 400px;
  position: relative;
  z-index: 1;
}

.auth-layout__brand {
  text-align: center;
  margin-bottom: 2.5rem;
}

.auth-layout__logo {
  font-size: 2.5rem;
  font-weight: 300;
  letter-spacing: 0.35em;
  color: var(--Primary-Color);
  margin-left: 0.35em;
}

.auth-layout__tagline {
  margin-top: 0.5rem;
  font-size: 0.7rem;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: rgba(245, 240, 232, 0.4);
}
</style>
