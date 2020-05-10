/**
 * @author Henrik Fredriksson
 */

export default function sketch (s) {
  const width = 400
  const height = 400
  const resolution = 16
  let iter = 0

  const cols = s.floor(width / resolution)
  const rows = s.floor(height / resolution)

  const percolation = new Percolation(cols * rows)

  s.setup = () => {
    s.createCanvas(width, height)
    s.background(255)
    percolation.setup(resolution)
  }

  s.draw = () => {
    percolation.draw()

    if (percolation.done()) {
      console.log(iter / (cols * rows))
      s.noLoop()
    }
    percolation.openTile()
    percolation.flatten()
  }

  function Percolation (n) {
    const index = (i, j) => {
      if (i < 0 || j < 0 || i > cols - 1 || j > rows - 1) {
        return -1
      }

      return i + j * cols + 2
    }

    this.grid = []

    /**
     * Setup and initialization
     */
    this.setup = () => {
      // Add top virtual node
      this.grid.push({
        x: -1,
        y: -1,
        id: 0,
        open: true
      })

      // Add bottom virtual node
      this.grid.push({
        x: -1,
        y: -1,
        id: 1,
        open: true
      })

      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          this.grid.push({
            x: i,
            y: j,
            id: index(i, j),
            open: false
          })
        }
      }

      // Connect top row to top virtual node 0
      this.grid
        .filter(tile => tile.y === 0)
        .map(t => {
          t.id = 0
        })

      // Connect bottom row to bottom virtual node 1
      this.grid
        .filter(tile => tile.y === rows - 1)
        .map(t => {
          t.id = 1
        })
    }

    /**
     * Check if system percolates
     *
     * @returns {boolean} True if system percolates, otherwise false
     */
    this.done = () => {
      return this.connected(0, 1)
    }

    /**
     * Check if top virtual node is connected to bottom virtual node
     *
     * @returns {boolean} True if top node is connected to bottom node, otherwise false
     */
    this.connected = (p, q) => {
      return this.grid[p].id === this.grid[q].id
    }

    /**
     * Update the ID of each node to flatten tree
     */
    this.flatten = () => {
      this.grid.forEach(g => {
        g.id = this.root(g.id)
      })
    }

    /**
     * Unblock a random node and perform union command to connect it to adjacent open nodes components
     */
    this.openTile = function (t = -1) {
      let tile = s.random(this.grid)

      if (t !== -1) {
        tile = this.grid[t]
      }

      if (tile.open) return

      iter = iter + 1
      tile.open = true

      // Check if surrounding node are open and connected to newly open (union command)
      const x = tile.x
      const y = tile.y

      let k = index(x, y - 1)
      if (this.grid[k] && this.grid[k].open) {
        this.union(tile.id, k)
      }

      k = index(x + 1, y)
      if (this.grid[k] && this.grid[k].open) {
        this.union(tile.id, k)
      }

      k = index(x, y + 1)
      if (this.grid[k] && this.grid[k].open) {
        this.union(tile.id, k)
      }

      k = index(x - 1, y)
      if (this.grid[k] && this.grid[k].open) {
        this.union(tile.id, k)
      }
    }

    /**
     * Get the root of node i
     * @param  {Number} i node
     * @return {Number} the root of node i
     */
    this.root = i => {
      while (i !== this.grid[i].id) {
        i = this.grid[i].id
      }

      return i
    }

    /**
     * Union command. Connects to components of node p and node q
     * @param  {Number} p node id
     * @param  {Number} q node id
     */
    this.union = (p, q) => {
      const i = this.root(p)
      const j = this.root(q)

      if (i === j) return

      if (i < j) {
        this.grid[j].id = i
      } else if (i > j) {
        this.grid[i].id = j
      }
    }

    /**
     * Draw the grid
     */
    this.draw = () => {
      this.grid.forEach(tile => {
        const x = tile.x * resolution
        const y = tile.y * resolution
        s.fill(0)
        s.stroke(255)
        if (tile.open) {
          s.fill(255)

          if (tile.id === 0) {
            s.noStroke()
            s.fill('lightblue')
          }
        }

        s.rect(x, y, resolution, resolution)
      })
    }
  }
}
