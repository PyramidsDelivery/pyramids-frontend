<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'

const props = defineProps({
  // Largura do canvas em px (a pirâmide se ajusta proporcionalmente)
  size: { type: Number, default: 240 },
  // Cor das linhas no formato "R, G, B"
  color: { type: String, default: '255, 255, 255' },
  // Velocidade da rotação
  speed: { type: Number, default: 0.012 }
})

const canvasRef = ref(null)
const canvasHeight = computed(() => Math.round(props.size * 0.8))

let animationFrameId = null

function iniciar() {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  const S = props.size
  const W = S
  const H = canvasHeight.value

  // Deixa o desenho nítido em telas retina
  const dpr = window.devicePixelRatio || 1
  canvas.width = W * dpr
  canvas.height = H * dpr
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

  // Centro do desenho (levemente acima para equilibrar a pirâmide)
  const cx = W / 2
  const cy = H / 2 - S * 0.06

  // Geometria proporcional ao tamanho
  const baseSize = S * 0.24
  const height = S * 0.56
  const fov = S * 2.5

  let angleY = 0
  const angleX = -0.28

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
    const x = p.x * Math.cos(angleY) - p.z * Math.sin(angleY)
    const z = p.x * Math.sin(angleY) + p.z * Math.cos(angleY)
    const y = p.y

    const yRot = y * Math.cos(angleX) - z * Math.sin(angleX)
    const zRot = y * Math.sin(angleX) + z * Math.cos(angleX)

    const scale = fov / (fov + zRot)

    return {
      x: cx + x * scale,
      y: cy + yRot * scale
    }
  }

  function desenharArestas(edges, projected) {
    edges.forEach(([i, j]) => {
      ctx.beginPath()
      ctx.moveTo(projected[i].x, projected[i].y)
      ctx.lineTo(projected[j].x, projected[j].y)
      ctx.stroke()
    })
  }

  function render() {
    ctx.clearRect(0, 0, W, H)
    angleY += props.speed

    const projected = vertices.map(project)

    // Face com preenchimento leve
    ctx.fillStyle = `rgba(${props.color}, 0.03)`
    ctx.beginPath()
    ctx.moveTo(projected[0].x, projected[0].y)
    ctx.lineTo(projected[1].x, projected[1].y)
    ctx.lineTo(projected[4].x, projected[4].y)
    ctx.closePath()
    ctx.fill()

    ctx.setLineDash([])
    ctx.lineWidth = 2.8
    ctx.strokeStyle = `rgba(${props.color}, 0.95)`
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'

    desenharArestas(baseEdges, projected)
    desenharArestas(sideEdges, projected)

    animationFrameId = requestAnimationFrame(render)
  }

  render()
}

onMounted(iniciar)

onBeforeUnmount(() => {
  if (animationFrameId) cancelAnimationFrame(animationFrameId)
})
</script>

<template>
  <canvas
    ref="canvasRef"
    class="piramide-animada"
    :style="{ width: size + 'px', height: canvasHeight + 'px' }"
  ></canvas>
</template>

<style scoped>
.piramide-animada {
  display: block;
}
</style>