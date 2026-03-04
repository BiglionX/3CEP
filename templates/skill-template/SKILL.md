{
"name": "procyc-template-skill",
"description": "ProCyc Skill Template - Replace this with your skill description",
"version": "1.0.0",
"author": "Your Name <your.email@example.com>",
"license": "MIT",
"homepage": "https://github.com/procyc-skills/your-skill#readme",
"repository": {
"type": "git",
"url": "https://github.com/procyc-skills/your-skill.git"
},
"bugs": {
"url": "https://github.com/procyc-skills/your-skill/issues"
},
"keywords": [
"procyc",
"skill",
"3c",
"repair",
"template"
],
"categories": [
"DIAGNOSIS",
"LOCATION",
"PARTS",
"ESTIMATION"
],
"tags": [
"template",
"starter",
"example"
],
"pricing": {
"model": "free",
"currency": "FCX",
"pricePerCall": 0,
"monthlySubscription": null
},
"input": {
"type": "object",
"required": [],
"properties": {}
},
"output": {
"type": "object",
"properties": {
"success": {
"type": "boolean",
"description": "Whether the skill execution was successful"
},
"data": {
"type": "object",
"description": "The result data"
},
"error": {
"type": "object",
"description": "Error details if failed"
}
}
},
"env": {
"required": [],
"variables": {}
},
"engines": {
"node": ">=18.0.0"
},
"main": "src/index.ts",
"scripts": {
"build": "tsc",
"test": "jest",
"lint": "eslint . --ext .ts",
"validate": "procyc-skill validate"
}
}
