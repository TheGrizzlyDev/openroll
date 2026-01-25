#!/usr/bin/env node
/* eslint-env node */
/* global process */
// @ts-check
import { readFile, writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'
import { createRequire } from 'module'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const OUTPUT_DIR = path.resolve(__dirname, '..', 'src', 'data', 'morkborg')
const BASE_URL = 'https://raw.githubusercontent.com/jkrayer/scvmgrinder/main/src/morkborg/data'

/**
 * Transform dice array notation to OML dice block format
 * @param {any[]} diceArray - Dice array like [1, 'd', 6] or [2, 'd', 4, '+', 1]
 * @returns {string|any} - OML format like [dice "1D6" 1D6] or original array
 */
function transformDiceToOML(diceArray) {
  if (!Array.isArray(diceArray) || diceArray.length < 3) {
    return diceArray
  }

  const [count, d, sides, ...modifiers] = diceArray
  
  if (d !== 'd' || typeof count !== 'number' || typeof sides !== 'number') {
    return diceArray
  }

  let diceNotation = `${count}D${sides}`
  
  // Handle modifiers
  for (let i = 0; i < modifiers.length; i += 2) {
    if (i + 1 < modifiers.length) {
      const operator = modifiers[i]
      const value = modifiers[i + 1]
      if (typeof operator === 'string' && typeof value === 'number') {
        diceNotation += `${operator}${value}`
      }
    }
  }

  return `[dice "${diceNotation}" ${diceNotation}]`
}

/**
 * Recursively transform dice notation in an object
 * @param {any} obj - Object to transform
 * @returns {any} - Transformed object
 */
function transformObject(obj) {
  if (Array.isArray(obj)) {
    // Check if this is a dice array
    if (obj.length >= 3 && obj[1] === 'd') {
      return transformDiceToOML(obj)
    }
    // Recursively process other arrays
    return obj.map(item => transformObject(item))
  } else if (obj && typeof obj === 'object') {
    const transformed = {}
    for (const [key, value] of Object.entries(obj)) {
      transformed[key] = transformObject(value)
    }
    return transformed
  }
  return obj
}

/**
 * Create a temporary ES module file and import it dynamically
 * @param {string} content - Module content
 * @param {string} tempPath - Temporary file path
 * @returns {Promise<any>} - Exported data
 */
async function createAndImportModule(content, tempPath) {
  try {
    // Write the temporary ES module
    await writeFile(tempPath, content, 'utf8')
    
    // Convert file URL to import URL
    const fileUrl = `file://${tempPath}`
    
    // Import the module dynamically
    const module = await import(fileUrl)
    
    // Clean up the temporary file
    try {
      await writeFile(tempPath, '', 'utf8') // Clear first
      await require('fs').promises.unlink(tempPath)
    } catch (cleanupError) {
      // Ignore cleanup errors
    }
    
    return module.default || module
  } catch (error) {
    // Clean up the temporary file on error
    try {
      await require('fs').promises.unlink(tempPath)
    } catch (cleanupError) {
      // Ignore cleanup errors
    }
    throw error
  }
}

/**
 * Download and parse a JavaScript/TypeScript file using simple extraction
 * @param {string} url - URL to fetch
 * @returns {Promise<any>} - Parsed data
 */
async function fetchAndParseFile(url) {
  try {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch ${url}: ${response.status} ${response.statusText}`)
    }
    
    const content = await response.text()
    
    // Simple approach: find the array/object between the first [ and last ] or { and }
    let dataStr = ''
    
    // Look for array pattern first
    const arrayMatch = content.match(/\[[\s\S]*\]\s*(?:;|$)/)
    if (arrayMatch) {
      dataStr = arrayMatch[0].replace(/;?\s*$/, '')
    } else {
      // Look for object pattern
      const objectMatch = content.match(/\{[\s\S]*\}\s*(?:;|$)/)
      if (objectMatch) {
        dataStr = objectMatch[0].replace(/;?\s*$/, '')
      } else {
        throw new Error('Could not find data array or object in file')
      }
    }
    
    // Clean up common issues while preserving structure
    // Be very careful not to break string literals
    dataStr = dataStr
      .replace(/export\s+default\s+/, '') // Remove export default first
      .replace(/export\s+{[^}]*}/g, '') // Remove export statements
      .replace(/import\s+.*?from\s+['"][^'"]*['"];?\s*/g, '') // Remove imports
      .replace(/interface\s+\w+\s*{[^}]*}/g, '') // Remove interfaces
    
    // More careful type annotation removal that preserves strings
    dataStr = dataStr.replace(/const\s+\w+\s*:\s*[^=]*=\s*/g, '') // Remove const declarations with types
    dataStr = dataStr.replace(/:\s*Array<[^>]+>/g, '') // Remove Array<T> types
    dataStr = dataStr.replace(/<[^>]*>/g, '') // Remove generics
    
    // Remove comments very carefully
    dataStr = dataStr.replace(/\/\/.*$/gm, '') // Remove line comments
    dataStr = dataStr.replace(/\/\*[\s\S]*?\*\//g, '') // Remove block comments
    
    try {
      return eval(`(${dataStr})`)
    } catch (evalError) {
      console.warn(`Failed to parse ${url}: ${evalError instanceof Error ? evalError.message : String(evalError)}`)
      return null
    }
  } catch (error) {
    console.error(`Error fetching ${url}: ${error instanceof Error ? error.message : String(error)}`)
    return null
  }
}

/**
 * Main function to fetch all data and save transformed versions
 */
async function main() {
  console.log('Starting Mörk Borg data import...')
  
  // Create output directory
  await mkdir(OUTPUT_DIR, { recursive: true })
  
  // List of files to fetch
  const files = [
    'all-weapons.js',
    'armor.ts', 
    'characters.ts',
    'equipment.js',
    'followers.ts',
    'scrolls_sacred.ts',
    'scrolls_unclean.ts'
  ]
  
  // Table files
  const tableFiles = [
    'tables/armor.ts',
    'tables/bad-habits.ts',
    'tables/broken-bodies.ts',
    'tables/one.ts',
    'tables/terrible-traits.ts',
    'tables/three.ts',
    'tables/two.ts',
    'tables/weapons.ts'
  ]
  
  const allFiles = [...files, ...tableFiles]
  const results = {}
  
  for (const file of allFiles) {
    console.log(`Processing ${file}...`)
    const url = `${BASE_URL}/${file}`
    const data = await fetchAndParseFile(url)
    
    if (data) {
      const transformedData = transformObject(data)
      const fileName = path.basename(file, path.extname(file))
      results[fileName] = transformedData
      
      // Save individual file
      const outputPath = path.join(OUTPUT_DIR, `${fileName}.json`)
      await writeFile(outputPath, JSON.stringify(transformedData, null, 2), 'utf8')
      console.log(`✓ Saved ${fileName}.json`)
    } else {
      console.log(`✗ Failed to process ${file}`)
    }
  }
  
  // Save combined dataset
  const combinedPath = path.join(OUTPUT_DIR, 'morkborg-dataset.json')
  await writeFile(combinedPath, JSON.stringify(results, null, 2), 'utf8')
  console.log(`✓ Saved combined dataset to morkborg-dataset.json`)
  
  console.log('\nImport complete!')
  console.log(`Files saved to: ${OUTPUT_DIR}`)
  console.log('Individual files:', Object.keys(results).join(', '))
}

// Handle command line arguments
const [,, cmd] = process.argv

if (cmd === 'help' || cmd === '--help' || cmd === '-h') {
  console.log(`
Mörk Borg Data Importer

Usage:
  node morkborg-data-importer.js [command]

Commands:
  (no command)  - Run the full import process
  help, --help, -h - Show this help message

The script will:
1. Fetch data from https://github.com/jkrayer/scvmgrinder/tree/main/src/morkborg/data
2. Transform dice notation (e.g., [1, 'd', 6] → [dice "1D6" 1D6])
3. Save individual JSON files and a combined dataset
`)
  process.exit(0)
}

// Run the main function
main().catch(error => {
  console.error('Import failed:', error)
  process.exit(1)
})
