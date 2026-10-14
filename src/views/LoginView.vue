<script setup>
import { ref, onMounted, onUnmounted } from 'vue' 
import { useRouter } from 'vue-router'
import { useDataStore } from '../stores/useDataStore'
import LightButton from '../components/LightButton.vue'
import DarkButton from '../components/DarkButton.vue'
import BaseInput from '../components/BaseInput.vue'

const router = useRouter()
const store = useDataStore()

const email = ref('')
const senha = ref('')

// Referências para o Canvas 3D
const pyramidCanvasDesktop = ref(null)
const pyramidCanvasMobile = ref(null)

let animationFrameId = null

// Função para desenhar e animar a pirâmide 3D no Canvas
function initPyramidCanvas(canvas) {
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  
  let angleY = 0
  const angleX = -0.28 

  const baseSize = 65
  const height = 160

  const vertices = [
    { x: -baseSize, y: height / 2, z: -baseSize }, 
    { x: baseSize, y: height / 2, z: -baseSize },  
    { x: baseSize, y: height / 2, z: baseSize },   
    { x: -baseSize, y: height / 2, z: baseSize },  
    { x: 0, y: -height / 2, z: 0 }                  
  ]

  const baseEdges = [[0, 1], [1, 2], [2, 3], [3, 0]]
  const sideEdges = [[0, 4], [1, 4], [2, 4], [3, 4]]

  function project(p) {
    let x = p.x * Math.cos(angleY) - p.z * Math.sin(angleY)
    let z = p.x * Math.sin(angleY) + p.z * Math.cos(angleY)
    let y = p.y

    let yRot = y * Math.cos(angleX) - z * Math.sin(angleX)
    let zRot = y * Math.sin(angleX) + z * Math.cos(angleX)

    const fov = 320
    const scale = fov / (fov + zRot + 120)

    return {
      x: canvas.width / 2 + x * scale,
      y: canvas.height / 2 + yRot * scale
    }
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    angleY += 0.012

    const projected = vertices.map(project)

    ctx.fillStyle = 'rgba(255, 255, 255, 0.03)'
    ctx.beginPath()
    ctx.moveTo(projected[0].x, projected[0].y)
    ctx.lineTo(projected[1].x, projected[1].y)
    ctx.lineTo(projected[4].x, projected[4].y)
    ctx.closePath()
    ctx.fill()

    ctx.setLineDash([])
    ctx.lineWidth = 2.8
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.95)'
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    baseEdges.forEach(([i, j]) => {
      ctx.beginPath()
      ctx.moveTo(projected[i].x, projected[i].y)
      ctx.lineTo(projected[j].x, projected[j].y)
      ctx.stroke()
    })

    sideEdges.forEach(([i, j]) => {
      ctx.beginPath()
      ctx.moveTo(projected[i].x, projected[i].y)
      ctx.lineTo(projected[j].x, projected[j].y)
      ctx.stroke()
    })

    animationFrameId = requestAnimationFrame(render)
  }

  render()
}

onMounted(() => {
  if (pyramidCanvasDesktop.value) initPyramidCanvas(pyramidCanvasDesktop.value)
  if (pyramidCanvasMobile.value) initPyramidCanvas(pyramidCanvasMobile.value)
})

onUnmounted(() => {
  if (animationFrameId) cancelAnimationFrame(animationFrameId)
})

async function realizarLogin() {
  const sucesso = await store.login(email.value, senha.value)
  if (sucesso) {
    if (store.isStaff || store.isSuperuser) {
      router.push('/hubadmin')
    } else {
      router.push('/usuario-hub') 
    }
  } else {
    alert('Falha no login. Verifique suas credenciais.')
  }
}

function irParaCadastro() {
  router.push('/cadastro')
}
</script>

<template>
  <div class="container">
    <div class="left">
      <div class="left-content">
        <!-- Pirâmide bem maior e posicionada mais acima -->
        <div class="pyramid-container">
          <canvas ref="pyramidCanvasDesktop" width="600" height="600" class="canvas-piramide"></canvas>
        </div>

        <div class="left-text">
          <h1>Não tem uma conta?</h1>
          <p>Cadastre-se.</p>
        </div>

        <LightButton label="Cadastro" @click="irParaCadastro" />
      </div>
    </div>

    <!-- LADO DIREITO -->
    <div class="right">
      <div class="right-content">
        <div class="right-text">
          <h1>Bem-vindo de volta!</h1>
          <p>Acesse sua conta agora mesmo.</p>
        </div>

        <div class="inputs">
          <BaseInput v-model="email" type="email" placeholder="Email" />
          <BaseInput v-model="senha" type="password" placeholder="Senha" />
        </div>

        <DarkButton label="Entrar" @click="realizarLogin" />
      </div>
    </div>
  </div>

  <div class="mobile">
    <div class="top">
      <div class="pyramid-container">
        <canvas ref="pyramidCanvasMobile" width="500" height="500" class="canvas-piramide"></canvas>
      </div>
    </div>

    <div class="mobile-content">
      <div class="right-text">
        <h1>Bem-vindo de volta!</h1>
        <p>Acesse sua conta agora mesmo.</p>
      </div>

      <div class="inputs">
        <BaseInput placeholder="Nome" />
        <BaseInput type="email" placeholder="Email" />
        <BaseInput type="password" placeholder="Senha" />
      </div>

      <DarkButton label="Entrar" />
      <p class="mobile-link">
        <span @click="irParaCadastro"> Não tem uma conta? Cadastre-se.</span>
      </p>
    </div>
  </div>
</template>

<style scoped>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.container {
  display: flex;
  height: 100vh;
  width: 100%;
}

.pyramid-container {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: -45px; /* Desloca significativamente para cima */
}

/* Tamanho de exibição aumentado para 340px com alta definição interna */
.canvas-piramide {
  width: 340px;
  height: 340px;
}

.container .left {
  background-color: var(--color-dark);
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 40%;
  color: var(--color-light);
  justify-content: center;
}

.left h1 {
  margin: 0;
  font-weight: bold;
  line-height: 2.6rem;
  font-size: 2.4rem;
}

.left p {
  font-size: 1.1rem;
  color: var(--color-light);
}

.left-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 25px;
  height: 100%;
  padding: 30px 20px;
  width: 75%;
  max-width: 480px;
}

.left-content .left-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
}

.container .right {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 60%;
  background-color: var(--color-light);
  color: var(--color-dark);
}

.right-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  width: 60%;
  padding: 100px 0;
}

.right-text {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  text-align: center;
}

.right h1 {
  font-weight: bold;
  line-height: 3rem;
  font-size: 3rem;
}

.right p {
  font-size: 1.2rem;
  color: var(--color-dark);
}

.right .inputs {
  display: flex;
  flex-direction: column;
  gap: 20px;
  width: 100%;
}

@media (min-width: 1440px) {
  .container {
    max-width: 2000px;
    margin: 0 auto;
  }

  .left-content,
  .right-content {
    padding: 140px 0;
    max-width: 700px;
  }

  .left h1,
  .right h1 {
    font-size: 3.2rem;
  }

  .right p,
  .left p {
    font-size: 1.4rem;
  }

  .right input {
    margin-top: 20px;
    padding: 14px 18px;
    font-size: 16px;
  }
}

@media (max-width: 768px) {
  .container {
    flex-direction: column;
    height: auto;
  }

  .left {
    display: none;
  }

  .right {
    width: 100%;
    min-height: 100vh;
  }

  .right-content {
    width: 90%;
    padding: 40px 0;
    gap: 30px;
  }

  .right h1 {
    font-size: 2rem;
    text-align: center;
  }

  .right p {
    font-size: 1rem;
    text-align: center;
  }

  .right input {
    padding: 14px;
    font-size: 16px;
  }
}

.mobile {
  display: none;
}

@media (max-width: 768px) {
  .container {
    display: none;
  }

  .mobile {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
    background: #e9e9e9;
  }

  .mobile .right-text {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }

  .mobile .right-text h1 {
    font-size: 2rem;
    text-align: center;
  }

  .mobile .right-text p {
    font-size: 1rem;
    text-align: center;
    font-weight: 500;
  }

  .top {
    height: 180px;
    background: var(--color-dark);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .mobile-content {
    flex: 1;
    padding: 45px 20px;
    display: flex;
    flex-direction: column;
    gap: 45px;
  }

  .mobile .right-text {
    margin-bottom: 10px;
  }

  .mobile .inputs {
    display: flex;
    flex-direction: column;
    gap: 25px;
  }

  .mobile input {
    background: #dcdcdc;
    border: 2px solid var(--color-input-bg);
    border-radius: 20px;
    padding: 16px 14px;
    width: 100%;
  } 

  .mobile input:focus {
    border-color: var(--color-dark);
    outline: none;
    color: var(--color-dark);
  }

  .mobile-link {
    margin-top: auto;
    text-align: center;
    font-size: 1rem;
  }

  .mobile-link span {
    text-decoration: underline;
    cursor: pointer;
  }
}
</style>