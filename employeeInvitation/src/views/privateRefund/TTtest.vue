<template>
  <div class="protocol-specification-page">
    <div class="content-area">
      <div class="pdf-title">參加計劃申請單</div>
      <div class="pdf-iframe-wrapper">
        <div class="pdf-toolbar">
          <button @click="zoomOut">缩小</button>
          <button @click="zoomIn">放大</button>
        </div>
        <canvas ref="pdfCanvas"></canvas>
        <div class="pdf-pagination">
          <button @click="prevPage" :disabled="pageNum <= 1">上一页</button>
          <span>{{ pageNum }} / {{ pageCount }}</span>
          <button @click="nextPage" :disabled="pageNum >= pageCount">下一页</button>
        </div>
      </div>
    </div>
    <div class="btn-group">
      <van-button class="btn-back" type="default" round block >返回</van-button>
      <van-button class="btn-next" type="success" round block >簽字</van-button>
    </div>
  </div>
</template>

<script>
import { Button } from 'vant'
import * as pdfjsLib from 'pdfjs-dist'
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker

export default {
  name: 'ProtocolSpecification',
  components: { [Button.name]: Button },
  data() {
    return {
      pdfUrl: '/static/12.pdf',
      pdfDoc: null,
      pageNum: 1,
      pageCount: 0,
      scale: 1,
      baseWidth: 595 // A4标准宽度，单位px
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.setAutoScale()
      this.loadPDF()
      window.addEventListener('resize', this.setAutoScale)
    })
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.setAutoScale)
  },
  methods: {
    setAutoScale() {
      const container = this.$el.querySelector('.pdf-iframe-wrapper')
      if (container) {
        const containerWidth = container.clientWidth
        this.scale = containerWidth / this.baseWidth
        // 若已加载PDF，重新渲染当前页
        if (this.pdfDoc) {
          this.renderPDF(this.pageNum)
        }
      }
    },
    async loadPDF() {
      try {
        const loadingTask = pdfjsLib.getDocument(this.pdfUrl)
        this.pdfDoc = await loadingTask.promise
        this.pageCount = this.pdfDoc.numPages
        this.renderPDF(1)
      } catch (e) {
        this.$toast('PDF加载失败')
      }
    },
    async renderPDF(pageNum = 1) {
      if (!this.pdfDoc) return
      try {
        const page = await this.pdfDoc.getPage(pageNum)
        const viewport = page.getViewport({ scale: this.scale })
        const canvas = this.$refs.pdfCanvas
        const context = canvas.getContext('2d')
        canvas.height = viewport.height
        canvas.width = viewport.width
        const renderContext = {
          canvasContext: context,
          viewport: viewport
        }
        await page.render(renderContext).promise
        this.pageNum = pageNum
      } catch (e) {
        this.$toast('PDF渲染失败')
      }
    },
    async prevPage() {
      if (this.pageNum > 1) {
        await this.renderPDF(this.pageNum - 1)
      }
    },
    async nextPage() {
      if (this.pageNum < this.pageCount) {
        await this.renderPDF(this.pageNum + 1)
      }
    },
    zoomIn() {
      this.scale = Math.min(this.scale + 0.2, 3)
      this.renderPDF(this.pageNum)
    },
    zoomOut() {
      this.scale = Math.max(this.scale - 0.2, 0.5)
      this.renderPDF(this.pageNum)
    },
    onDisagree() {
      this.$toast('您已选择不同意')
    },
    onAgree() {
      this.$toast('您已同意协议')
    }
  }
}
</script>

<style lang="scss" scoped>
.protocol-specification-page {
  min-height: 100vh;
  background: #fff;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}
.content-area {
  flex: 1;
  padding: 32px 24px 0 24px;
}
.pdf-title {
  font-size: 18px;
  color: #333;
  margin-bottom: 16px;
  text-align: center;
}
.pdf-iframe-wrapper {
  width: 100%;
  height: 500px;
  border: 1px solid #eee;
  background: #fff;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.pdf-toolbar {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin: 8px 0 8px 0;
}
.pdf-toolbar button {
  padding: 4px 16px;
  border: 1px solid #269488;
  background: #fff;
  color: #269488;
  border-radius: 4px;
  cursor: pointer;
}
.pdf-toolbar button:disabled {
  color: #aaa;
  border-color: #eee;
  cursor: not-allowed;
}
.pdf-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 12px;
  gap: 16px;
}
.pdf-pagination button {
  padding: 4px 16px;
  border: 1px solid #269488;
  background: #fff;
  color: #269488;
  border-radius: 4px;
  cursor: pointer;
}
.pdf-pagination button:disabled {
  color: #aaa;
  border-color: #eee;
  cursor: not-allowed;
}

.btn-group {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  padding: 20px 18px 60px 18px;
  background: #fff;
}

.btn-back {
  flex: 1;
  background: #fff;
  color: #269488;
  font-size: 18px;
  font-weight: 600;
  border: 2px solid #269488;
  height: 48px;
  border-radius: 24px;
  margin-right: 0;
  box-shadow: none;
  letter-spacing: 2px;
}

.btn-next {
  flex: 1;
  background: #269488;
  color: #fff;
  font-size: 18px;
  font-weight: 600;
  border: none;
  height: 48px;
  border-radius: 24px;
  margin-left: 0;
  box-shadow: none;
  letter-spacing: 2px;
}
</style>
