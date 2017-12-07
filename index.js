import Gif from 'gif-encoder'
import Canvas from 'canvas'
import http from 'http'
import rancol from 'rancol'
import { EventEmitter } from 'events'
import utils from 'util'

const canvasEvent = new EventEmitter()
const width = 240
const height = 240
const delay = 500

const canvas = new Canvas(width, height)
const image = canvas.getContext('2d')

setInterval(() => {
  image.fillStyle = rancol.hex()
  image.fillRect(0, 0, width, height)
  image.fillStyle = "#FFFFFF"
  image.fillText("Hello", 10, 100)
  image.fillText(new Date(), 10, 200)
  canvasEvent.emit('data', image.getImageData(0, 0, width, height).data)
}, delay)

function Emitter () {
  const self = this

  canvasEvent.on('data', (data) => {
    self.emit('data', data)
  })
}

utils.inherits(Emitter, EventEmitter)

http.createServer((req, res) => {
  const gif = new Gif(width, height)
  const emitter = new Emitter()
  gif.setRepeat(-1)
  gif.setDelay(delay)
  gif.writeHeader()
  gif.addFrame(image.getImageData(0, 0, width, height).data)
  const buff = gif.read()

  res.writeHead(200, {'Content-Type': 'image/gif'})
  res.write(buff)

  const addFrame = (data) => {
    gif.addFrame(data)
  }

  const writeData = (data) => {
    res.write(data)
  }

  emitter.on('data', addFrame)
  gif.on('data', writeData)

  res.on('close', () => {
    emitter.removeListener('data', addFrame)
    gif.removeListener('data', writeData)
    gif.finish()
  })
}).listen(process.env.PORT || 3000, () => {
  console.log(`Running on port ${process.env.PORT || 3000}`)
})
