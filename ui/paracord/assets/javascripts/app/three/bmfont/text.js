define(function(require, exports, module) {
  'use strict';
  var createLayout = require('./layout-bmfont-text')
  var inherits = require('./inherits')
  var createIndices = require('./quad-indices')
  var utils = require('./utils')

  var Base = THREE.BufferGeometry

  module.exports = function(opt) {
    return new TextMesh(opt)
  }

  function TextMesh(opt) {
    Base.call(this)
    var multipage = opt && opt.multipage
    this.layout = null

    this._positions = new THREE.BufferAttribute(null, 2)
    this._uvs = new THREE.BufferAttribute(null, 2)
    if (multipage) 
      this._pages = new THREE.BufferAttribute(null, 1)
    this._indices = new THREE.BufferAttribute(null, 1)

    if (opt) 
      this.update(opt)

    this.addAttribute('position', this._positions)
    this.addAttribute('uv', this._uvs)
    if (multipage) 
      this.addAttribute('page', this._pages)
    this.setIndex(this._indices)
  }

  inherits(TextMesh, Base)

  TextMesh.prototype.update = function(opt) {
    opt = opt||{}
    this.layout = createLayout(opt)

    //don't allow a deferred creation of multipage
    //since it requires different buffer layout
    if (opt.multipage && !this._pages) {
      throw new Error('must specify multipage: true in constructor')
    }

    var font = opt.font

    //determine texture size from font file  
    var texWidth = font.common.scaleW
    var texHeight = font.common.scaleH

    //get visible glyphs
    var glyphs = this.layout.glyphs.filter(function(glyph) {
      var bitmap = glyph.data
      return bitmap.width * bitmap.height > 0
    })
    
    //provide visible glyphs for convenience
    this.visibleGlyphs = glyphs;

    //get vec2 quad positions 
    var positions = getQuadPositions(glyphs, this.layout)

    //get vec2 texcoords
    var flipY = opt.flipY !== false
    var uvs = getQuadUVs(glyphs, texWidth, texHeight, flipY)
      
    if (opt.multipage) {
      var pages = getQuadPages(glyphs)
      this._pages.array = pages
      this._pages.needsUpdate = true  
    }

    //get indices
    var quadCount = glyphs.length
    var indices = createIndices({ clockwise: true, count: quadCount })

    this._uvs.array = uvs
    this._uvs.needsUpdate = true

    this._indices.array = indices
    this._indices.needsUpdate = true

    this._positions.array = positions
    this._positions.needsUpdate = true
  }

  TextMesh.prototype.computeBoundingSphere = function() {
      if (this.boundingSphere === null) 
        this.boundingSphere = new THREE.Sphere()

    var positions = this.attributes.position.array
    var itemSize = this.attributes.position.itemSize
    if (!positions || !itemSize || positions.length < 2) {
      this.boundingSphere.radius = 0
      this.boundingSphere.center.set(0, 0, 0)
      return
    }
    utils.computeSphere(positions, this.boundingSphere)
    if (isNaN(this.boundingSphere.radius))
      console.error('THREE.BufferGeometry.computeBoundingSphere(): '
          + 'Computed radius is NaN. The '
          + '"position" attribute is likely to have NaN values.')
  }

  TextMesh.prototype.computeBoundingBox = function() {
      if (this.boundingBox === null) 
        this.boundingBox = new THREE.Box3()

    var bbox = this.boundingBox
    var positions = this.attributes.position.array
    var itemSize = this.attributes.position.itemSize
    if (!positions || !itemSize || positions.length < 2) {
      bbox.makeEmpty()
      return
    }
    utils.computeBox(positions, bbox)
  }

  function getQuadPages(glyphs) {
    var pages = new Float32Array(glyphs.length * 4 * 1)
    var i = 0
    glyphs.forEach(function(glyph) {
      var id = glyph.data.page || 0
      pages[i++] = id
      pages[i++] = id
      pages[i++] = id
      pages[i++] = id
    })
    return pages
  }

  function getQuadUVs(glyphs, texWidth, texHeight, flipY) {
    var uvs = new Float32Array(glyphs.length * 4 * 2)
    var i = 0

    glyphs.forEach(function(glyph) {
      var bitmap = glyph.data
      var bw = (bitmap.x+bitmap.width)
      var bh = (bitmap.y+bitmap.height)

      //top left position
      var u0 = bitmap.x / texWidth
      var v1 = bitmap.y / texHeight
      var u1 = bw / texWidth
      var v0 = bh / texHeight

      if (flipY) {
        v1 = (texHeight-bitmap.y) / texHeight
        v0 = (texHeight-bh) / texHeight
      }

      //BL
      uvs[i++] = u0 
      uvs[i++] = v1
      //TL
      uvs[i++] = u0
      uvs[i++] = v0
      //TR
      uvs[i++] = u1
      uvs[i++] = v0
      //BR
      uvs[i++] = u1
      uvs[i++] = v1
    })
    return uvs
  }

  function getQuadPositions(glyphs, layout) {
    var positions = new Float32Array(glyphs.length * 4 * 2)
    var i = 0

    glyphs.forEach(function(glyph) {
      var bitmap = glyph.data

      //bottom left position
      var x = glyph.position[0] + bitmap.xoffset
      var y = glyph.position[1] + bitmap.yoffset

      //quad size
      var w = bitmap.width
      var h = bitmap.height

      //BL
      positions[i++] = x 
      positions[i++] = y
      //TL
      positions[i++] = x
      positions[i++] = y + h
      //TR
      positions[i++] = x + w
      positions[i++] = y + h
      //BR
      positions[i++] = x + w
      positions[i++] = y
    })
    return positions
  }
});