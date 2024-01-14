const axios = require('axios')
const fs = require('fs')
const path = require('path')

const CDN_URL = 'https://cdn.croc.io'

const DATA_PATH = path.join(__dirname, '..', 'data')

if (!fs.existsSync(DATA_PATH)) {
    fs.mkdirSync(DATA_PATH)
}

async function downloadAdultTerms() {
    try {
        const response = await axios.get(`${CDN_URL}/data/adult_terms.json`, {
            headers: {
                'Content-Type': 'application/json'
            }
        })
        
        const terms = response.data
        const filePath = path.join(DATA_PATH, 'adult_terms.json')
        fs.writeFileSync(filePath, JSON.stringify(terms))

        console.log(`Successfully downloaded adult_terms.json (${terms.length})`)
    } catch (error) {
        console.error("Could not retrieve list of adult terms.")
    }
}

(async () => {
    await downloadAdultTerms()
})()