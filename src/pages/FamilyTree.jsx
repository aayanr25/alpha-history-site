import { useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { hierarchy, tree } from 'd3-hierarchy'
import { TransformWrapper, TransformComponent, useControls } from 'react-zoom-pan-pinch'
import { useBrothers } from '../hooks/useBrothers'
import './FamilyTree.css'

const NODE_W = 190
const NODE_H = 64
const NODE_RX = 2

function linkPath(sx, sy, tx, ty) {
  const midX = (sx + NODE_W / 2 + tx - NODE_W / 2) / 2
  return `M${sx + NODE_W / 2},${sy} C${midX},${sy} ${midX},${ty} ${tx - NODE_W / 2},${ty}`
}

function TreeControls() {
  const { zoomIn, zoomOut, resetTransform } = useControls()
  return (
    <div className="tree-controls">
      <button className="tree-ctrl-btn" onClick={() => zoomIn()}>+</button>
      <button className="tree-ctrl-btn" onClick={() => zoomOut()}>−</button>
      <button className="tree-ctrl-btn tree-ctrl-reset" onClick={() => resetTransform()}>
        Reset
      </button>
    </div>
  )
}

function TreeGraph({ brothers, navigate }) {
  const childrenMap = useMemo(() => {
    const map = {}
    brothers.forEach(b => {
      if (b.bigBrotherId) {
        if (!map[b.bigBrotherId]) map[b.bigBrotherId] = []
        map[b.bigBrotherId].push(b)
      }
    })
    return map
  }, [brothers])

  const founders = useMemo(() => brothers.filter(b => !b.bigBrotherId), [brothers])

  const { nodes, links, svgWidth, svgHeight, offsetX, offsetY } = useMemo(() => {
    const virtualRoot = { id: '__root__', firstName: '', lastName: '' }

    const getChildren = node => {
      if (node.id === '__root__') return founders
      return childrenMap[node.id] || null
    }

    const root = hierarchy(virtualRoot, getChildren)
    const layout = tree().nodeSize([NODE_H + 40, NODE_W + 80])
    layout(root)

    const allNodes = root.descendants().filter(d => d.data.id !== '__root__')
    const allLinks = root.links().filter(l => l.source.data.id !== '__root__')

    const xs = allNodes.map(n => n.y)
    const ys = allNodes.map(n => n.x)

    const pad = 48
    const minX = Math.min(...xs) - NODE_W / 2 - pad
    const maxX = Math.max(...xs) + NODE_W / 2 + pad
    const minY = Math.min(...ys) - NODE_H / 2 - pad
    const maxY = Math.max(...ys) + NODE_H / 2 + pad

    return {
      nodes: allNodes,
      links: allLinks,
      svgWidth: maxX - minX,
      svgHeight: maxY - minY,
      offsetX: -minX,
      offsetY: -minY,
    }
  }, [childrenMap, founders])

  return (
    <TransformWrapper
      initialScale={0.85}
      minScale={0.25}
      maxScale={2.5}
      limitToBounds={false}
      centerOnInit
    >
      <>
        <TreeControls />
        <TransformComponent
          wrapperStyle={{ width: '100%', height: '100%' }}
          contentStyle={{ width: svgWidth, height: svgHeight }}
        >
          <svg
            width={svgWidth}
            height={svgHeight}
            style={{ display: 'block', overflow: 'visible' }}
          >
            <g>
              {links.map((link, i) => {
                const sx = link.source.y + offsetX
                const sy = link.source.x + offsetY
                const tx = link.target.y + offsetX
                const ty = link.target.x + offsetY
                return (
                  <path
                    key={i}
                    d={linkPath(sx, sy, tx, ty)}
                    fill="none"
                    stroke="var(--purple)"
                    strokeOpacity={0.3}
                    strokeWidth={2}
                  />
                )
              })}
            </g>
            <g>
              {nodes.map(node => {
                const cx = node.y + offsetX
                const cy = node.x + offsetY
                const x = cx - NODE_W / 2
                const y = cy - NODE_H / 2
                const isFounder = !node.data.bigBrotherId

                return (
                  <g
                    key={node.data.id}
                    onClick={() => navigate(`/brothers/${node.data.id}`)}
                    className="tree-node"
                    role="button"
                    tabIndex={0}
                    onKeyDown={e => e.key === 'Enter' && navigate(`/brothers/${node.data.id}`)}
                  >
                    <rect
                      x={x + 4} y={y + 4}
                      width={NODE_W} height={NODE_H}
                      rx={NODE_RX}
                      fill="var(--purple)" opacity={0.2}
                    />
                    <rect
                      x={x} y={y}
                      width={NODE_W} height={NODE_H}
                      rx={NODE_RX}
                      fill={isFounder ? 'var(--purple)' : 'var(--cream)'}
                      stroke="var(--purple)"
                      strokeWidth={2}
                    />
                    {isFounder && (
                      <rect
                        x={x} y={y}
                        width={NODE_W} height={6}
                        rx={NODE_RX}
                        fill="var(--gold)"
                      />
                    )}
                    <text
                      x={cx} y={y + (isFounder ? 30 : 24)}
                      textAnchor="middle"
                      fontFamily="'VT323', monospace"
                      fontSize="17"
                      fill={isFounder ? 'var(--gold)' : 'var(--purple)'}
                    >
                      {node.data.firstName} {node.data.lastName}
                    </text>
                    <text
                      x={cx} y={y + (isFounder ? 48 : 42)}
                      textAnchor="middle"
                      fontFamily="'VT323', monospace"
                      fontSize="13"
                      fill={isFounder ? 'var(--gold-light)' : 'var(--purple-light)'}
                    >
                      {node.data.pledgeClass}
                    </text>
                    <text
                      x={x + NODE_W - 8} y={y + 14}
                      textAnchor="end"
                      fontFamily="'VT323', monospace"
                      fontSize="11"
                      fill={isFounder ? 'var(--gold-dark)' : 'var(--purple-light)'}
                      opacity={0.7}
                    >
                      #{node.data.initiationNumber}
                    </text>
                  </g>
                )
              })}
            </g>
          </svg>
        </TransformComponent>
      </>
    </TransformWrapper>
  )
}

export default function FamilyTree() {
  const navigate = useNavigate()
  const { brothers, loading, error } = useBrothers()
  const wrapRef = useRef(null)

  // Only show brothers who have at least one little
  const brothersWithLittles = useMemo(() => {
    const hasLittles = new Set(brothers.map(b => b.bigBrotherId).filter(Boolean))
    return brothers.filter(b => b.bigBrotherId || hasLittles.has(b.id))
  }, [brothers])

  return (
    <div className="family-tree-page">
      <div className="tree-header">
        <h1 className="tree-title">Family Tree</h1>
        <p className="tree-subtitle">
          Drag to pan · Scroll to zoom · Click any box to view profile
        </p>
      </div>

      <div className="tree-canvas-wrap" ref={wrapRef}>
        {loading && (
          <div className="tree-state-msg">
            <p>Loading...</p>
          </div>
        )}
        {error && (
          <div className="tree-state-msg tree-state-error">
            <p>Failed to load family tree: {error}</p>
          </div>
        )}
        {!loading && !error && brothers.length > 0 && (
          <TreeGraph brothers={brothersWithLittles} navigate={navigate} />
        )}
      </div>
    </div>
  )
}
