console.log("🚀 SIMPLE INSTALLATION PROCESS")
console.log("=".repeat(40))

// Step 1: Check Node.js version
console.log("1. Checking Node.js version...")
const nodeVersion = process.version
console.log(`   Node.js version: ${nodeVersion}`)

if (nodeVersion.startsWith("v18") || nodeVersion.startsWith("v20")) {
  console.log("   ✅ Node.js version is compatible")
} else {
  console.log("   ⚠️  Recommended: Node.js 18 or 20")
}

// Step 2: Installation commands
console.log("\n2. Installation Commands:")
console.log("   npm install")
console.log("   npm run dev")

// Step 3: Environment setup
console.log("\n3. Environment Variables:")
console.log("   Create .env.local file")
console.log("   Add DATABASE_URL=your-neon-connection-string")

// Step 4: Success message
console.log("\n✅ INSTALLATION READY!")
console.log("Run these commands in your terminal:")
console.log("1. npm install")
console.log("2. npm run dev")
console.log("3. Open http://localhost:3000")

console.log("\n🎯 If you get errors:")
console.log("- Delete node_modules folder")
console.log("- Delete package-lock.json")
console.log("- Run npm install again")
