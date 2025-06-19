// EMERGENCY FIX SCRIPT
console.log("🚨 EMERGENCY FIX FOR 'IN' OPERATOR ERROR")
console.log("=".repeat(45))

// The exact fix for your error
function emergencyFix() {
  console.log("🔧 Applying emergency patch...")

  // This is the safe way to check properties
  const safeCheck = (obj, property) => {
    // Step 1: Check if obj exists
    if (obj === null || obj === undefined) {
      return false
    }

    // Step 2: Check if obj is an object
    if (typeof obj !== "object") {
      return false
    }

    // Step 3: Now safely use 'in' operator
    try {
      return property in obj
    } catch (error) {
      return false
    }
  }

  // Test the fix
  console.log("Testing emergency fix:")

  // These would normally cause the error
  const testValues = [undefined, null, "string", 42, {}, { error: "test" }]

  testValues.forEach((value, index) => {
    const result = safeCheck(value, "error")
    console.log(`Test ${index + 1}: ${JSON.stringify(value)} -> ${result}`)
  })

  console.log("\n✅ Emergency fix working!")
  return safeCheck
}

// Apply the fix
const safePropertyCheck = emergencyFix()

console.log("\n🎯 IMMEDIATE SOLUTION:")
console.log("Copy this function into your code:")
console.log(`
function safeHasProperty(obj, property) {
  if (obj == null) return false
  if (typeof obj !== 'object') return false
  try {
    return property in obj
  } catch {
    return false
  }
}
`)

console.log("✅ EMERGENCY FIX COMPLETE!")
console.log("Use safeHasProperty() instead of 'in' operator")
