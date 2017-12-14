const fileParser = require('../.utils/file-parser')
const unidata = require('./lookup-table/unidata')
const catdata = require('./lookup-table/categories')
const unicodeRange = require('unicode-range')
const path = require('path')

const toDescription = name => catdata[name]

fileParser({
    source: path.join(__dirname, './resources/glyphlist.txt'),
    output: path.join(__dirname, './lookup-table/glyphlist.js'),
    iteratee: (line, props) => {
        let fields = line.split(';'),
            data = unidata[fields[1]]

        if (data != null) {
            let block = unicodeRange(fields[1])
            return JSON.stringify({
                value: fields[1],
                name: data.name.toLowerCase(),
                symbol: escapeSymbol(fields[1]),
                category: getIndex(props.categories, data.category),
                block: getIndex(props.blocks, block)
            })
        }
    },
    props: {
        categories: [],
        blocks: []
    },
    separator: ',',
    before: 'module.exports={glyphs:[',
    after: (props) => {
        let c = JSON.stringify(props.categories.map(toDescription)),
            b = JSON.stringify(props.blocks)
        return `],categories:${c},blocks:${b}}`
    }
})

function getIndex(array, name) {
    let index = array.indexOf(name)
    if (index > -1) {
        return index
    }
    array.push(name)
    return array.length - 1
}

function escapeSymbol(code) {
    return String.fromCharCode(parseInt(code, 16))
}